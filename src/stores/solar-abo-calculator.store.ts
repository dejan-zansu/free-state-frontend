import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { SonnendachLocation, SonnendachBuilding, RoofSegment } from '@/types/sonnendach'
import type { EquipmentQuote } from '@/types/equipment'
import { residentialCalculatorService } from '@/services/residential-calculator.service'
import { equipmentService } from '@/services/equipment.service'
import { electricityPriceService } from '@/services/electricity-price.service'
import { subsidyService } from '@/services/subsidy.service'
import { feedInTariffService } from '@/services/feed-in-tariff.service'

export interface SubsidyRateSnapshot {
  id: string
  source: string
  publishedAt: string
  validFrom: string
  validTo: string | null
  tier1MaxKwp: number
  tier1ChfPerKwp: number
  tier2MaxKwp: number
  tier2ChfPerKwp: number
  notes: string | null
}

export interface FeedInTariffSnapshot {
  id: string
  source: string
  publishedAt: string
  validFrom: string
  validTo: string | null
  operatorName: string | null
  bfsNumber: number | null
  cantonCode: string | null
  chfPerKwh: number
  notes: string | null
}

export type SignatureStatus = 'idle' | 'initiating' | 'pending' | 'signed' | 'expired' | 'failed'

export type SolarModel = 'solar-free' | 'solar-direct'
export type SolarAboPackage = 'home' | 'multi'
export type BuildingType = 'single_family' | 'apartment' | 'trade' | 'office'
export type HouseholdSize = 1 | 2 | 3 | 4 | 5
export type RoofCoveringType = 'tiled' | 'tin' | 'slate' | 'fiber_cement' | 'gravel' | 'substrate' | 'bitumen' | 'membrane' | 'other'
export type RoofType = 'flat' | 'pitched'
export type Salutation = 'mr' | 'woman' | 'family'
export type ContactCountry = 'CH' | 'LI'

export interface HighPowerDevices {
  heatPumpHeating: boolean
  electricHeating: boolean
  electricBoiler: boolean
  evChargingStation: boolean
  swimmingPoolSauna: boolean
}

export interface ContactDetails {
  salutation: Salutation | null
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  nationality: string
  remarks: string
  country: ContactCountry
  postalCode: string
  city: string
  street: string
  streetNumber: string
  addressAdditional: string
}

export interface Consents {
  dataProcessing: boolean
}

export type ResultsPath = 'download' | 'offer' | 'contract' | null

// ElCom 2026 average residential tariff (Rp./kWh → CHF/kWh)
// Source: ElCom tariff data, swissinfo.ch
const ELECTRICITY_PRICE = 0.277

// Swiss consumer electricity mix (production + imports), VSE 2021
// Source: strom.ch "CO2-Gehalt des Strommix Schweiz"
const CO2_FACTOR = 0.128

export const DEFAULT_PPA_DISCOUNT_PCT = 30

const FLAT_TILT_THRESHOLD_DEG = 10

const COVERAGE_FLAT = 0.45

const COVERAGE_PITCHED_SOUTH = 0.80
const COVERAGE_PITCHED_SIDE = 0.75
const COVERAGE_PITCHED_NORTH = 0.50

function segmentCoverageFraction(tiltDeg: number, azimuthDeg: number): number {
  if (tiltDeg <= FLAT_TILT_THRESHOLD_DEG) return COVERAGE_FLAT
  const normalized = ((azimuthDeg % 360) + 360) % 360
  const deviationFromSouth = Math.abs(normalized - 180)
  if (deviationFromSouth <= 45) return COVERAGE_PITCHED_SOUTH
  if (deviationFromSouth <= 135) return COVERAGE_PITCHED_SIDE
  return COVERAGE_PITCHED_NORTH
}

// BFE/Nipkow study "Typischer Haushalt-Stromverbrauch" (2021), single-family house values
// Excludes electric heating, heat pump, and electric hot water
// Source: pubdb.bfe.admin.ch, homegate.ch, wwz.ch
// 3-person and 5-person values interpolated from 1/2/4-person official data
const BASE_CONSUMPTION: Record<number, number> = {
  1: 2700,
  2: 3550,
  3: 4400,
  4: 5200,
  5: 5600,
}

// Annual device consumption (kWh/year)
// Sources: Viessmann CH (heat pump), 21energy/energie-experten (electric heating),
// BFE/ee-news.ch (boiler ~1000 kWh/person, avg 3-person HH), AXA.ch/Zurich.ch (EV at 15k km/yr),
// Hayward/pv-berechnung.de (pool ~3000) + arrigato.ch (sauna ~350)
const DEVICE_CONSUMPTION: Record<keyof HighPowerDevices, number> = {
  heatPumpHeating: 5000,
  electricHeating: 12000,
  electricBoiler: 3000,
  evChargingStation: 2500,
  swimmingPoolSauna: 3350,
}

// Self-consumption rate increase per device (percentage points)
// Based on PV-Calor field data, Fraunhofer ISE measurements, HTW Berlin studies
// Heat pump: +10-25pp measured, using conservative 10pp (winter mismatch limits benefit)
// EV: +10-20pp with solar-optimized charging, using 12pp (assumes some smart charging)
// Boiler: +5-10pp with PV-controlled timer, using 5pp
// Electric heating: minimal benefit (winter consumption vs summer PV), using 2pp
// Pool/sauna: marginal (seasonal/occasional use), using 2pp
const DEVICE_SELF_CONSUMPTION_BONUS: Record<keyof HighPowerDevices, number> = {
  heatPumpHeating: 0.10,
  electricHeating: 0.02,
  electricBoiler: 0.05,
  evChargingStation: 0.12,
  swimmingPoolSauna: 0.02,
}

// Combined effective income tax rates (federal + cantonal + municipal) by canton
// Source: Transforma AG "Tax Rates Switzerland 2025", married, CHF 100k, capital city
const TAX_RATES_BY_CANTON: Record<string, number> = {
  ZH: 0.1225, BE: 0.1915, LU: 0.1215, UR: 0.1573, SZ: 0.0999,
  OW: 0.1461, NW: 0.1184, GL: 0.1309, ZG: 0.0718, FR: 0.1616,
  SO: 0.1564, BS: 0.2282, BL: 0.1335, SH: 0.1127, AR: 0.1503,
  AI: 0.1069, SG: 0.1418, GR: 0.1221, AG: 0.1178, TG: 0.1289,
  TI: 0.1473, VD: 0.1790, VS: 0.1301, NE: 0.1772, GE: 0.1370,
  JU: 0.1660,
}
const DEFAULT_TAX_RATE = 0.14

const CANTON_FROM_POSTAL: [number, number, string][] = [
  [1000, 1199, 'VD'], [1200, 1299, 'GE'], [1300, 1399, 'VD'], [1400, 1499, 'FR'], [1500, 1599, 'FR'],
  [1600, 1699, 'FR'], [1700, 1799, 'FR'], [1800, 1899, 'VD'], [1900, 1999, 'VS'],
  [2000, 2099, 'NE'], [2100, 2199, 'NE'], [2200, 2299, 'NE'], [2300, 2399, 'NE'],
  [2400, 2499, 'BE'], [2500, 2599, 'BE'], [2600, 2699, 'BE'], [2700, 2799, 'BE'],
  [2800, 2899, 'JU'], [2900, 2999, 'JU'], [3000, 3999, 'BE'], [4000, 4099, 'BS'],
  [4100, 4199, 'BL'], [4200, 4299, 'BL'], [4300, 4399, 'BL'], [4400, 4499, 'SO'],
  [4500, 4599, 'SO'], [4600, 4699, 'SO'], [4700, 4799, 'SO'], [4800, 4899, 'AG'],
  [4900, 4999, 'AG'], [5000, 5499, 'AG'], [5500, 5699, 'AG'], [5700, 5799, 'AG'],
  [5800, 5899, 'AG'], [5900, 5999, 'AG'], [6000, 6099, 'LU'], [6100, 6199, 'LU'],
  [6200, 6299, 'LU'], [6300, 6399, 'ZG'], [6400, 6499, 'SZ'], [6500, 6599, 'TI'],
  [6600, 6699, 'TI'], [6700, 6799, 'TI'], [6800, 6899, 'TI'], [6900, 6999, 'TI'],
  [7000, 7299, 'GR'], [7300, 7599, 'GR'], [7600, 7999, 'GR'], [8000, 8099, 'ZH'],
  [8100, 8199, 'ZH'], [8200, 8299, 'SH'], [8300, 8399, 'ZH'], [8400, 8499, 'ZH'],
  [8500, 8599, 'TG'], [8600, 8699, 'ZH'], [8700, 8799, 'ZH'], [8800, 8899, 'ZH'],
  [8900, 8999, 'AG'], [9000, 9099, 'SG'], [9100, 9199, 'AR'], [9200, 9299, 'SG'],
  [9300, 9399, 'SG'], [9400, 9499, 'SG'], [9500, 9599, 'SG'], [9600, 9699, 'AI'],
  [9700, 9799, 'SG'], [9800, 9899, 'SG'],
]

function getCantonFromAddress(address: string): string | null {
  const match = address.match(/\b(\d{4})\b/)
  if (!match) return null
  const plz = parseInt(match[1], 10)
  const entry = CANTON_FROM_POSTAL.find(([min, max]) => plz >= min && plz <= max)
  return entry ? entry[2] : null
}

// Monthly solar production distribution for Swiss Plateau (Bern, 46.95N)
// PVGIS ERA5 data (2005-2023 averages), 30-degree tilt, south-facing
// Source: EU Joint Research Centre PVGIS v5.3
const MONTHLY_FACTORS = [0.047, 0.062, 0.091, 0.104, 0.105, 0.113, 0.117, 0.108, 0.095, 0.074, 0.047, 0.037]

interface SolarAboCalculatorState {
  solarModel: SolarModel | null
  currentStep: number
  totalSteps: number

  buildingType: BuildingType
  householdSize: HouseholdSize | null
  devices: HighPowerDevices

  address: string
  selectedLocation: SonnendachLocation | null
  building: SonnendachBuilding | null
  selectedSegmentIds: string[]
  isSearching: boolean
  isFetchingBuilding: boolean

  roofCovering: RoofCoveringType | null
  roofImage: string | null

  contact: ContactDetails
  consents: Consents

  isSubmitting: boolean
  isSubmitted: boolean
  submissionError: string | null
  accountCreated: boolean
  resultsPath: ResultsPath

  createdUserId: string | null
  createdCustomerId: string | null
  createdProjectId: string | null
  selectedPackageId: string | null
  selectedPackageCode: string | null
  selectedPackagePricePerKwp: number | null
  selectedPackageElectricitySavingsPercent: number | null
  selectedPackageContractTermYears: number | null
  selectedPanelWattageW: number | null
  selectedPanelAreaM2: number | null
  selectedPanelFirstYearDegradationPercent: number | null
  selectedPanelAnnualDegradationPercent: number | null

  selectedSolarPanelId: string | null
  selectedInverterId: string | null
  selectedBatteryId: string | null
  selectedMountingSystemId: string | null
  selectedEmsId: string | null
  selectedHeatPumpId: string | null
  equipmentQuote: EquipmentQuote | null
  equipmentQuoteLoading: boolean

  createdContractId: string | null
  contractNumber: string | null
  contractPdfUrl: string | null
  acknowledgments: string[]
  signatureStatus: SignatureStatus
  signatureProcessId: string | null
  signingUrl: string | null
  signedPdfUrl: string | null

  electricityPriceChfKwh: number | null
  electricityPricePlz: string | null
  electricityPriceMunicipality: string | null
  electricityPriceLoading: boolean
  electricityPriceFallback: boolean

  subsidyRate: SubsidyRateSnapshot | null
  subsidyRateLoading: boolean

  feedInTariffRate: FeedInTariffSnapshot | null
  feedInTariffLoading: boolean
}

interface SolarAboCalculatorActions {
  setSolarModel: (model: SolarModel | null) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setHouseholdSize: (size: HouseholdSize) => void
  setDevice: (device: keyof HighPowerDevices, value: boolean) => void
  setAddress: (address: string) => void
  setSelectedLocation: (location: SonnendachLocation | null) => void
  setBuilding: (building: SonnendachBuilding | null) => void
  toggleSegment: (segmentId: string) => void
  setSelectedSegmentIds: (ids: string[]) => void
  setIsSearching: (isSearching: boolean) => void
  setIsFetchingBuilding: (isFetching: boolean) => void
  setRoofCovering: (type: RoofCoveringType) => void
  setRoofImage: (image: string | null) => void
  setContact: (contact: Partial<ContactDetails>) => void
  setConsents: (consents: Partial<Consents>) => void
  getRoofType: () => RoofType
  getSelectedSegments: () => RoofSegment[]
  getSelectedArea: () => number
  getEstimatedConsumption: () => number
  getAnnualProduction: () => number
  getSystemSizeKwp: () => number
  getEstimatedPanelCount: () => number
  getSelfConsumptionRate: () => number
  getAnnualSavings: () => number
  getAnnualPpaSavings: () => number
  getCo2Savings: () => number
  getMonthlyProduction: () => number[]
  getProductionFactorForYear: (year: number) => number
  getLifetimeProductionKwh: (years: number) => number
  getLifetimePpaSavings: (years: number) => number
  getRecommendedPackage: () => SolarAboPackage
  setSelectedPackage: (
    id: string,
    code: string,
    pricePerKwp: number | null,
    panelWattageW?: number | null,
    panelAreaM2?: number | null,
    electricitySavingsPercent?: number | null,
    contractTermYears?: number | null,
    firstYearDegradationPercent?: number | null,
    annualDegradationPercent?: number | null,
  ) => void
  setSelectedEquipment: (type: 'solarPanel' | 'inverter' | 'battery' | 'mountingSystem' | 'ems' | 'heatPump', id: string | null, panelWattageW?: number, panelAreaM2?: number) => void
  fetchEquipmentQuote: (locale?: string) => Promise<void>
  getGrossAmount: () => number
  getSubsidyAmount: () => number
  getNetAmount: () => number
  getEstimatedTaxSavings: () => number
  createAccount: () => Promise<void>
  requestOffer: () => Promise<void>
  emailReport: () => Promise<void>
  setResultsPath: (path: ResultsPath) => void
  addAcknowledgment: (type: string) => void
  removeAcknowledgment: (type: string) => void
  createContract: () => Promise<void>
  setSignatureRequestData: (data: { processId: string; signingUrl: string }) => void
  setSignatureStatus: (status: SignatureStatus) => void
  setSignedPdfUrl: (url: string) => void
  resetSignature: () => void
  reset: () => void

  getElectricityPriceChfKwh: () => number
  fetchElectricityPriceForAddress: () => Promise<void>

  fetchSubsidyRate: () => Promise<void>

  getFeedInTariffChfKwh: () => number | null
  fetchFeedInTariff: () => Promise<void>
}

const initialContact: ContactDetails = {
  salutation: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  nationality: '',
  remarks: '',
  country: 'CH',
  postalCode: '',
  city: '',
  street: '',
  streetNumber: '',
  addressAdditional: '',
}

const initialConsents: Consents = {
  dataProcessing: false,
}

const initialState: SolarAboCalculatorState = {
  solarModel: null,
  currentStep: 1,
  totalSteps: 7,

  buildingType: 'single_family',
  householdSize: null,
  devices: {
    heatPumpHeating: false,
    electricHeating: false,
    electricBoiler: false,
    evChargingStation: false,
    swimmingPoolSauna: false,
  },

  address: '',
  selectedLocation: null,
  building: null,
  selectedSegmentIds: [],
  isSearching: false,
  isFetchingBuilding: false,

  roofCovering: null,
  roofImage: null,

  contact: initialContact,
  consents: initialConsents,

  isSubmitting: false,
  isSubmitted: false,
  submissionError: null,
  accountCreated: false,
  resultsPath: null,

  createdUserId: null,
  createdCustomerId: null,
  createdProjectId: null,
  selectedPackageId: null,
  selectedPackageCode: null,
  selectedPackagePricePerKwp: null,
  selectedPackageElectricitySavingsPercent: null,
  selectedPackageContractTermYears: null,
  selectedPanelWattageW: null,
  selectedPanelAreaM2: null,
  selectedPanelFirstYearDegradationPercent: null,
  selectedPanelAnnualDegradationPercent: null,

  selectedSolarPanelId: null,
  selectedInverterId: null,
  selectedBatteryId: null,
  selectedMountingSystemId: null,
  selectedEmsId: null,
  selectedHeatPumpId: null,
  equipmentQuote: null,
  equipmentQuoteLoading: false,

  createdContractId: null,
  contractNumber: null,
  contractPdfUrl: null,
  acknowledgments: [],
  signatureStatus: 'idle',
  signatureProcessId: null,
  signingUrl: null,
  signedPdfUrl: null,

  electricityPriceChfKwh: null,
  electricityPricePlz: null,
  electricityPriceMunicipality: null,
  electricityPriceLoading: false,
  electricityPriceFallback: false,

  subsidyRate: null,
  subsidyRateLoading: false,

  feedInTariffRate: null,
  feedInTariffLoading: false,
}

export const useSolarAboCalculatorStore = create<
  SolarAboCalculatorState & SolarAboCalculatorActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSolarModel: (model: SolarModel | null) => {
        set({
          solarModel: model,
          selectedPackageId: null,
          selectedPackageCode: null,
          selectedPackagePricePerKwp: null,
          selectedPackageElectricitySavingsPercent: null,
          selectedPackageContractTermYears: null,
          selectedPanelWattageW: null,
          selectedPanelAreaM2: null,
          selectedPanelFirstYearDegradationPercent: null,
          selectedPanelAnnualDegradationPercent: null,
          selectedSolarPanelId: null,
          selectedInverterId: null,
          selectedBatteryId: null,
          selectedMountingSystemId: null,
          selectedEmsId: null,
          selectedHeatPumpId: null,
          equipmentQuote: null,
          equipmentQuoteLoading: false,
          isSubmitting: false,
          isSubmitted: false,
          submissionError: null,
          accountCreated: false,
          resultsPath: null,
          createdUserId: null,
          createdCustomerId: null,
          createdProjectId: null,
          createdContractId: null,
          contractNumber: null,
          contractPdfUrl: null,
          acknowledgments: [],
          signatureStatus: 'idle',
          signatureProcessId: null,
          signingUrl: null,
          signedPdfUrl: null,
        })
      },

      nextStep: () => {
        const { currentStep, totalSteps, signatureStatus } = get()
        if (signatureStatus === 'signed') return
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep, signatureStatus } = get()
        if (signatureStatus === 'signed') return
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      goToStep: (step: number) => {
        const { totalSteps, signatureStatus } = get()
        if (signatureStatus === 'signed') return
        if (step >= 1 && step <= totalSteps) {
          set({ currentStep: step })
        }
      },


      setHouseholdSize: (size: HouseholdSize) => {
        set({ householdSize: size })
      },

      setDevice: (device: keyof HighPowerDevices, value: boolean) => {
        const { devices } = get()
        set({
          devices: {
            ...devices,
            [device]: value,
          },
        })
      },

      setAddress: (address: string) => {
        set({ address })
      },

      setSelectedLocation: (location: SonnendachLocation | null) => {
        set({ selectedLocation: location })
      },

      setBuilding: (building: SonnendachBuilding | null) => {
        set({ building, selectedSegmentIds: [] })
      },

      toggleSegment: (segmentId: string) => {
        const { selectedSegmentIds } = get()
        const isSelected = selectedSegmentIds.includes(segmentId)
        if (isSelected) {
          set({ selectedSegmentIds: selectedSegmentIds.filter(id => id !== segmentId) })
        } else {
          set({ selectedSegmentIds: [...selectedSegmentIds, segmentId] })
        }
      },

      setSelectedSegmentIds: (ids: string[]) => {
        set({ selectedSegmentIds: ids })
      },

      setIsSearching: (isSearching: boolean) => {
        set({ isSearching })
      },

      setIsFetchingBuilding: (isFetching: boolean) => {
        set({ isFetchingBuilding: isFetching })
      },

      setRoofCovering: (type: RoofCoveringType) => {
        set({ roofCovering: type })
      },

      setRoofImage: (image: string | null) => {
        set({ roofImage: image })
      },

      setContact: (contact: Partial<ContactDetails>) => {
        const { contact: currentContact } = get()
        set({
          contact: {
            ...currentContact,
            ...contact,
          },
        })
      },

      setConsents: (consents: Partial<Consents>) => {
        const { consents: currentConsents } = get()
        set({
          consents: {
            ...currentConsents,
            ...consents,
          },
        })
      },

      getRoofType: (): RoofType => {
        const segments = get().getSelectedSegments()
        if (segments.length === 0) return 'pitched'
        const avgTilt = segments.reduce((sum, s) => sum + s.tilt, 0) / segments.length
        return avgTilt <= FLAT_TILT_THRESHOLD_DEG ? 'flat' : 'pitched'
      },

      getSelectedSegments: () => {
        const { building, selectedSegmentIds } = get()
        if (!building) return []
        return building.roofSegments.filter(s => selectedSegmentIds.includes(s.id))
      },

      getSelectedArea: () => {
        const { building, selectedSegmentIds } = get()
        if (!building) return 0
        return building.roofSegments
          .filter(s => selectedSegmentIds.includes(s.id))
          .reduce((sum, s) => sum + s.area, 0)
      },

      getEstimatedConsumption: () => {
        const { householdSize, devices } = get()
        const deviceExtra = (Object.keys(devices) as (keyof HighPowerDevices)[])
          .filter(key => devices[key])
          .reduce((sum, key) => sum + DEVICE_CONSUMPTION[key], 0)

        const base = BASE_CONSUMPTION[householdSize || 3] || 3200
        return base + deviceExtra
      },

      getAnnualProduction: () => {
        const segments = get().getSelectedSegments()
        return segments.reduce((total, seg) => {
          const fraction = segmentCoverageFraction(seg.tilt, seg.azimuth)
          return total + seg.electricityYield * fraction
        }, 0)
      },

      getEstimatedPanelCount: () => {
        const segments = get().getSelectedSegments()
        const panelArea = get().selectedPanelAreaM2
        if (segments.length === 0 || !panelArea) return 0
        return segments.reduce((total, seg) => {
          const fraction = segmentCoverageFraction(seg.tilt, seg.azimuth)
          return total + Math.floor((seg.area * fraction) / panelArea)
        }, 0)
      },

      getSystemSizeKwp: () => {
        const panelCount = get().getEstimatedPanelCount()
        const panelWattageW = get().selectedPanelWattageW
        if (panelCount === 0 || !panelWattageW) return 0
        return panelCount * (panelWattageW / 1000)
      },

      getSelfConsumptionRate: () => {
        const consumption = get().getEstimatedConsumption()
        const production = get().getAnnualProduction()
        const { devices } = get()

        if (production === 0) return 0

        // HTW Berlin / PV-Calor model: base self-consumption depends on
        // consumption-to-production ratio. Without optimization, typical
        // residential systems achieve 25-35% (PV-Calor, HTW Berlin studies).
        // Formula calibrated to match: ratio=0.5 → ~30%, ratio=1.0 → ~38%, ratio=2.0 → ~45%
        const ratio = consumption / production
        let rate = 0.25 + 0.15 * Math.min(ratio, 2.0) * (1 - 0.25 * Math.min(ratio, 2.0) / 2.0)

        const deviceBonuses = (Object.keys(devices) as (keyof HighPowerDevices)[])
          .filter(key => devices[key])
          .reduce((sum, key) => sum + DEVICE_SELF_CONSUMPTION_BONUS[key], 0)

        rate += deviceBonuses

        const hasBattery = !!get().selectedBatteryId
        const maxRate = hasBattery ? 0.75 : 0.55
        return Math.min(rate, maxRate)
      },

      getAnnualSavings: () => {
        const production = get().getAnnualProduction()
        const consumption = get().getEstimatedConsumption()
        const selfConsumptionRate = get().getSelfConsumptionRate()
        const price = get().getElectricityPriceChfKwh()
        const feedInTariff = get().feedInTariffRate?.chfPerKwh
        if (feedInTariff == null) return 0
        const selfConsumedKwh = Math.min(
          production * selfConsumptionRate,
          consumption,
        )
        const selfConsumptionSavings = selfConsumedKwh * price
        const exportedKwh = Math.max(0, production - selfConsumedKwh)
        const feedInRevenue = exportedKwh * feedInTariff
        return selfConsumptionSavings + feedInRevenue
      },

      getAnnualPpaSavings: () => {
        const production = get().getAnnualProduction()
        const consumption = get().getEstimatedConsumption()
        const selfConsumptionRate = get().getSelfConsumptionRate()
        const price = get().getElectricityPriceChfKwh()
        const discountPct =
          get().selectedPackageElectricitySavingsPercent ??
          DEFAULT_PPA_DISCOUNT_PCT
        const discountFraction = discountPct / 100
        const selfConsumedKwh = Math.min(
          production * selfConsumptionRate,
          consumption,
        )
        return selfConsumedKwh * price * discountFraction
      },

      getCo2Savings: () => {
        const production = get().getAnnualProduction()
        return production * CO2_FACTOR
      },

      getMonthlyProduction: () => {
        const annual = get().getAnnualProduction()
        return MONTHLY_FACTORS.map(f => annual * f)
      },

      getProductionFactorForYear: (year: number) => {
        if (year <= 0) return 1
        if (year === 1) return 1
        const firstPct = get().selectedPanelFirstYearDegradationPercent
        const annualPct = get().selectedPanelAnnualDegradationPercent
        if (firstPct == null || annualPct == null) return 1
        const afterFirst = 1 - firstPct / 100
        const annualMult = 1 - annualPct / 100
        return afterFirst * Math.pow(annualMult, year - 2)
      },

      getLifetimeProductionKwh: (years: number) => {
        if (years <= 0) return 0
        const annual = get().getAnnualProduction()
        if (annual === 0) return 0
        let total = 0
        for (let y = 1; y <= years; y++) {
          total += annual * get().getProductionFactorForYear(y)
        }
        return total
      },

      getLifetimePpaSavings: (years: number) => {
        if (years <= 0) return 0
        const consumption = get().getEstimatedConsumption()
        const selfConsumptionRate = get().getSelfConsumptionRate()
        const price = get().getElectricityPriceChfKwh()
        const discountPct =
          get().selectedPackageElectricitySavingsPercent ??
          DEFAULT_PPA_DISCOUNT_PCT
        const discountFraction = discountPct / 100
        const annual = get().getAnnualProduction()
        if (annual === 0) return 0
        let total = 0
        for (let y = 1; y <= years; y++) {
          const productionY = annual * get().getProductionFactorForYear(y)
          const selfConsumedY = Math.min(
            productionY * selfConsumptionRate,
            consumption,
          )
          total += selfConsumedY * price * discountFraction
        }
        return total
      },

      getRecommendedPackage: (): SolarAboPackage => {
        const code = get().selectedPackageCode
        if (code === 'multi') return 'multi'
        return 'home'
      },

      setSelectedPackage: (
        id: string,
        code: string,
        pricePerKwp: number | null,
        panelWattageW?: number | null,
        panelAreaM2?: number | null,
        electricitySavingsPercent?: number | null,
        contractTermYears?: number | null,
        firstYearDegradationPercent?: number | null,
        annualDegradationPercent?: number | null,
      ) => {
        set({
          selectedPackageId: id,
          selectedPackageCode: code,
          selectedPackagePricePerKwp: pricePerKwp,
          selectedPanelWattageW: panelWattageW ?? null,
          selectedPanelAreaM2: panelAreaM2 ?? null,
          selectedPackageElectricitySavingsPercent: electricitySavingsPercent ?? null,
          selectedPackageContractTermYears: contractTermYears ?? null,
          selectedPanelFirstYearDegradationPercent: firstYearDegradationPercent ?? null,
          selectedPanelAnnualDegradationPercent: annualDegradationPercent ?? null,
        })
      },

      setSelectedEquipment: (type, id, panelWattageW?, panelAreaM2?) => {
        const fieldMap = {
          solarPanel: 'selectedSolarPanelId',
          inverter: 'selectedInverterId',
          battery: 'selectedBatteryId',
          mountingSystem: 'selectedMountingSystemId',
          ems: 'selectedEmsId',
          heatPump: 'selectedHeatPumpId',
        } as const
        const update: Record<string, unknown> = { [fieldMap[type]]: id }
        if (type === 'solarPanel') {
          update.selectedPanelWattageW = panelWattageW ?? null
          update.selectedPanelAreaM2 = panelAreaM2 ?? null
        }
        set(update as Partial<SolarAboCalculatorState>)
      },

      fetchEquipmentQuote: async (locale = 'en') => {
        const state = get()
        const items: Array<{ equipmentId: string; equipmentType: string; quantity: number }> = []
        const panelCount = state.getEstimatedPanelCount()

        if (state.selectedSolarPanelId && panelCount > 0) {
          items.push({ equipmentId: state.selectedSolarPanelId, equipmentType: 'SOLAR_PANEL', quantity: panelCount })
        }
        if (state.selectedInverterId) {
          items.push({ equipmentId: state.selectedInverterId, equipmentType: 'INVERTER', quantity: 1 })
        }
        if (state.selectedBatteryId) {
          items.push({ equipmentId: state.selectedBatteryId, equipmentType: 'BATTERY', quantity: 1 })
        }
        if (state.selectedMountingSystemId) {
          items.push({ equipmentId: state.selectedMountingSystemId, equipmentType: 'MOUNTING_SYSTEM', quantity: 1 })
        }
        if (state.selectedEmsId) {
          items.push({ equipmentId: state.selectedEmsId, equipmentType: 'ENERGY_MANAGEMENT_SYSTEM', quantity: 1 })
        }
        if (state.selectedHeatPumpId) {
          items.push({ equipmentId: state.selectedHeatPumpId, equipmentType: 'HEAT_PUMP', quantity: 1 })
        }

        if (items.length === 0) {
          set({ equipmentQuote: null, equipmentQuoteLoading: false })
          return
        }

        set({ equipmentQuoteLoading: true })
        try {
          const quote = await equipmentService.getQuote(items, locale)
          set({ equipmentQuote: quote, equipmentQuoteLoading: false })
        } catch {
          set({ equipmentQuoteLoading: false })
        }
      },

      getGrossAmount: () => {
        const { solarModel, equipmentQuote, selectedPackagePricePerKwp } = get()
        if (solarModel === 'solar-direct') {
          return equipmentQuote?.subtotal ?? 0
        }
        const systemSizeKwp = get().getSystemSizeKwp()
        if (selectedPackagePricePerKwp) {
          return selectedPackagePricePerKwp * systemSizeKwp
        }
        return systemSizeKwp * 1500
      },

      getSubsidyAmount: () => {
        const kWp = get().getSystemSizeKwp()
        const rate = get().subsidyRate
        if (!rate || kWp <= 0) return 0
        const tier1Kwp = Math.min(kWp, rate.tier1MaxKwp)
        const tier1Amount = tier1Kwp * rate.tier1ChfPerKwp
        const tier2Span = rate.tier2MaxKwp - rate.tier1MaxKwp
        const tier2Kwp = Math.max(
          0,
          Math.min(kWp - rate.tier1MaxKwp, tier2Span),
        )
        const tier2Amount = tier2Kwp * rate.tier2ChfPerKwp
        return Math.round(tier1Amount + tier2Amount)
      },

      getNetAmount: () => {
        return get().getGrossAmount() - get().getSubsidyAmount()
      },

      getEstimatedTaxSavings: () => {
        const netAmount = get().getNetAmount()
        if (netAmount <= 0) return 0
        const canton = getCantonFromAddress(get().address)
        const rate = canton ? (TAX_RATES_BY_CANTON[canton] || DEFAULT_TAX_RATE) : DEFAULT_TAX_RATE
        return Math.round(netAmount * rate)
      },

      createAccount: async () => {
        const state = get()
        set({ isSubmitting: true, submissionError: null })

        try {
          const isSolarFree = state.solarModel === 'solar-free'
          const annualSavingsForRecord = isSolarFree
            ? state.getAnnualPpaSavings()
            : state.getAnnualSavings()
          const ppaDiscountPercent = isSolarFree
            ? (state.selectedPackageElectricitySavingsPercent ?? DEFAULT_PPA_DISCOUNT_PCT)
            : null

          const response = await residentialCalculatorService.createAccount({
            contact: {
              salutation: state.contact.salutation || 'mr',
              firstName: state.contact.firstName,
              lastName: state.contact.lastName,
              email: state.contact.email,
              phone: state.contact.phoneNumber,
              dateOfBirth: state.contact.dateOfBirth,
              nationality: state.contact.nationality,
              remarks: state.contact.remarks,
              country: state.contact.country,
              postalCode: state.contact.postalCode,
              city: state.contact.city,
              street: state.contact.street,
              streetNumber: state.contact.streetNumber,
              addressAdditional: state.contact.addressAdditional,
            },
            calculation: {
              address: state.address,
              lat: state.building?.center.lat || 0,
              lng: state.building?.center.lng || 0,
              selectedSegments: state.getSelectedSegments(),
              selectedArea: state.getSelectedArea(),
              buildingType: state.buildingType,
              householdSize: state.householdSize || 3,
              devices: state.devices,
              roofCovering: state.roofCovering || 'tiled',
              estimatedProduction: state.getAnnualProduction(),
              estimatedConsumption: state.getEstimatedConsumption(),
              selfConsumptionRate: state.getSelfConsumptionRate(),
              annualSavings: annualSavingsForRecord,
              co2Savings: state.getCo2Savings(),
              systemSizeKwp: state.getSystemSizeKwp(),
              recommendedPackage: state.getRecommendedPackage(),
              solarModel: state.solarModel ?? 'solar-direct',
              ppaDiscountPercent,
            },
            consents: state.consents,
          })
          set({
            isSubmitting: false,
            isSubmitted: true,
            accountCreated: true,
            createdUserId: response.data.userId,
            createdCustomerId: response.data.customerId,
            createdProjectId: response.data.projectId,
          })
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
          set({
            isSubmitting: false,
            submissionError: axiosError?.response?.data?.error?.message || 'Submission failed',
          })
        }
      },

      requestOffer: async () => {
        const state = get()
        if (!state.createdProjectId) return

        try {
          await residentialCalculatorService.requestOffer({
            projectId: state.createdProjectId,
          })
          set({ resultsPath: 'offer' })
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
          throw new Error(axiosError?.response?.data?.error?.message || 'Failed to request offer')
        }
      },

      emailReport: async () => {
        const state = get()
        if (!state.createdProjectId) return

        try {
          await residentialCalculatorService.emailReport({
            projectId: state.createdProjectId,
          })
          set({ resultsPath: 'download' })
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
          throw new Error(axiosError?.response?.data?.error?.message || 'Failed to email report')
        }
      },

      setResultsPath: (path: ResultsPath) => {
        set({ resultsPath: path })
      },

      addAcknowledgment: (type: string) => {
        const { acknowledgments } = get()
        if (!acknowledgments.includes(type)) {
          set({ acknowledgments: [...acknowledgments, type] })
        }
      },

      removeAcknowledgment: (type: string) => {
        const { acknowledgments } = get()
        set({ acknowledgments: acknowledgments.filter((a) => a !== type) })
      },

      createContract: async () => {
        const state = get()
        if (!state.createdProjectId) return

        try {
          const equipmentSelections = state.solarModel === 'solar-direct'
            ? [
                ...(state.selectedSolarPanelId ? [{ equipmentId: state.selectedSolarPanelId, equipmentType: 'SOLAR_PANEL', quantity: state.getEstimatedPanelCount() }] : []),
                ...(state.selectedInverterId ? [{ equipmentId: state.selectedInverterId, equipmentType: 'INVERTER', quantity: 1 }] : []),
                ...(state.selectedBatteryId ? [{ equipmentId: state.selectedBatteryId, equipmentType: 'BATTERY', quantity: 1 }] : []),
                ...(state.selectedMountingSystemId ? [{ equipmentId: state.selectedMountingSystemId, equipmentType: 'MOUNTING_SYSTEM', quantity: 1 }] : []),
                ...(state.selectedEmsId ? [{ equipmentId: state.selectedEmsId, equipmentType: 'ENERGY_MANAGEMENT_SYSTEM', quantity: 1 }] : []),
                ...(state.selectedHeatPumpId ? [{ equipmentId: state.selectedHeatPumpId, equipmentType: 'HEAT_PUMP', quantity: 1 }] : []),
              ]
            : undefined

          const response = await residentialCalculatorService.createContract({
            projectId: state.createdProjectId,
            acknowledgments: state.acknowledgments,
            language: 'de',
            ...(state.selectedPackageId ? { packageId: state.selectedPackageId } : {}),
            ...(state.roofImage ? { roofImage: state.roofImage } : {}),
            ...(state.solarModel ? { solarModel: state.solarModel } : {}),
            ...(equipmentSelections ? { equipmentSelections } : {}),
          })
          set({
            createdContractId: response.data.contractId,
            contractNumber: response.data.contractNumber,
            contractPdfUrl: response.data.pdfUrl,
          })
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
          throw new Error(axiosError?.response?.data?.error?.message || 'Failed to create contract')
        }
      },

      setSignatureRequestData: (data) => {
        set({
          signatureProcessId: data.processId,
          signingUrl: data.signingUrl,
          signatureStatus: 'pending',
        })
      },

      setSignatureStatus: (status: SignatureStatus) => {
        set({ signatureStatus: status })
      },

      setSignedPdfUrl: (url: string) => {
        set({ signedPdfUrl: url, signatureStatus: 'signed' })
      },

      resetSignature: () => {
        set({
          signatureStatus: 'idle',
          signatureProcessId: null,
          signingUrl: null,
        })
      },

      reset: () => {
        set(initialState)
      },

      getElectricityPriceChfKwh: () => {
        const price = get().electricityPriceChfKwh
        return typeof price === 'number' && price > 0 ? price : ELECTRICITY_PRICE
      },

      fetchElectricityPriceForAddress: async () => {
        const address = get().address
        const match = address.match(/\b(\d{4})\b/)
        if (!match) return
        const plz = match[1]

        if (
          get().electricityPricePlz === plz &&
          get().electricityPriceChfKwh !== null
        ) {
          return
        }

        set({ electricityPriceLoading: true })
        try {
          const year = new Date().getFullYear()
          const data = await electricityPriceService.getSwissTariff(plz, year, 'H4')
          set({
            electricityPriceChfKwh: data.averageChfKwh,
            electricityPricePlz: plz,
            electricityPriceMunicipality: data.municipalityName,
            electricityPriceFallback: data.fallback,
            electricityPriceLoading: false,
          })
        } catch (err) {
          console.warn('Failed to fetch electricity price for PLZ', plz, err)
          set({
            electricityPriceLoading: false,
            electricityPriceFallback: true,
          })
        }
      },

      fetchSubsidyRate: async () => {
        if (get().subsidyRate || get().subsidyRateLoading) return
        set({ subsidyRateLoading: true })
        try {
          const data = await subsidyService.getCurrentRate()
          set({ subsidyRate: data, subsidyRateLoading: false })
        } catch (err) {
          console.warn('Failed to fetch subsidy rate', err)
          set({ subsidyRateLoading: false })
        }
      },

      getFeedInTariffChfKwh: () => {
        return get().feedInTariffRate?.chfPerKwh ?? null
      },

      fetchFeedInTariff: async () => {
        if (get().feedInTariffRate || get().feedInTariffLoading) return
        set({ feedInTariffLoading: true })
        try {
          const data = await feedInTariffService.getCurrent()
          set({ feedInTariffRate: data, feedInTariffLoading: false })
        } catch (err) {
          console.warn('Failed to fetch feed-in tariff', err)
          set({ feedInTariffLoading: false })
        }
      },
    }),
    {
      name: 'solar-free-calculator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        solarModel: state.solarModel,
        buildingType: state.buildingType,
        householdSize: state.householdSize,
        devices: state.devices,
        address: state.address,
        selectedLocation: state.selectedLocation,
        building: state.building,
        selectedSegmentIds: state.selectedSegmentIds,
        roofCovering: state.roofCovering,
        contact: state.contact,
        consents: state.consents,
        accountCreated: state.accountCreated,
        resultsPath: state.resultsPath,
        createdUserId: state.createdUserId,
        createdCustomerId: state.createdCustomerId,
        createdProjectId: state.createdProjectId,
        selectedPackageId: state.selectedPackageId,
        selectedPackageCode: state.selectedPackageCode,
        selectedPackagePricePerKwp: state.selectedPackagePricePerKwp,
        selectedPackageElectricitySavingsPercent: state.selectedPackageElectricitySavingsPercent,
        selectedPackageContractTermYears: state.selectedPackageContractTermYears,
        selectedPanelWattageW: state.selectedPanelWattageW,
        selectedPanelAreaM2: state.selectedPanelAreaM2,
        selectedPanelFirstYearDegradationPercent: state.selectedPanelFirstYearDegradationPercent,
        selectedPanelAnnualDegradationPercent: state.selectedPanelAnnualDegradationPercent,
        selectedSolarPanelId: state.selectedSolarPanelId,
        selectedInverterId: state.selectedInverterId,
        selectedBatteryId: state.selectedBatteryId,
        selectedMountingSystemId: state.selectedMountingSystemId,
        selectedEmsId: state.selectedEmsId,
        selectedHeatPumpId: state.selectedHeatPumpId,
        createdContractId: state.createdContractId,
        contractNumber: state.contractNumber,
        contractPdfUrl: state.contractPdfUrl,
        acknowledgments: state.acknowledgments,
      }),
    }
  )
)
