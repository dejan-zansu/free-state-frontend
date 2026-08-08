import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { SonnendachBuilding, RoofSegment } from '@/types/sonnendach'
import {
  calculatorFlowV2Enabled,
  mapStep,
  totalSteps as flowTotalSteps,
} from '@/lib/calculator-flow'
import {
  SCREEN4_REFERENCE_PANEL_M2,
  SCREEN4_REFERENCE_PANEL_W,
} from '@/lib/calculator-reference-panel'
import {
  CH_FALLBACK_FIXED_ANNUAL_CHF,
  CH_FALLBACK_VARIABLE_CHF_KWH,
  CONSUMPTION_MAX_KWH,
  CONSUMPTION_MIN_KWH,
  MAX_PLAUSIBLE_FIXED_ANNUAL_CHF,
  type BillPeriod,
} from '@/lib/consumption-cost'
import {
  residentialCalculatorService,
  type ManualCheckSource,
} from '@/services/residential-calculator.service'
import { getAttribution } from '@/lib/analytics/funnel-events'
import { setAccessToken } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'
import { electricityPriceService } from '@/services/electricity-price.service'
import { subsidyService } from '@/services/subsidy.service'

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

export type ConsumptionInputMode = 'kwh' | 'chf'
export type SolarModel = 'solar-free' | 'solar-direct' | 'solar-abo'
export type SolarAboPackage = 'home' | 'multi'
export type BuildingType = 'single_family' | 'apartment' | 'trade' | 'office'
export type HouseholdSize = 1 | 2 | 3 | 4 | 5
export type RoofCoveringType = 'tiled' | 'tin' | 'slate' | 'fiber_cement' | 'gravel' | 'substrate' | 'bitumen' | 'membrane' | 'other'
export type RoofType = 'flat' | 'pitched'
export type Salutation = 'mr' | 'woman' | 'family'
export type ContactCountry = 'CH' | 'LI'
export type SubmissionErrorCode = 'rate_limited' | 'network' | 'server'

export interface ParsedAddressFields {
  street: string
  streetNumber: string
  postalCode: string
  city: string
  canton: string
}

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
  canton: string
  street: string
  streetNumber: string
  addressAdditional: string
  isPropertyOwner: boolean | null
}

export interface Consents {
  dataProcessing: boolean
  marketing: boolean
}

// ElCom 2026 average residential tariff (Rp./kWh → CHF/kWh)
// Source: ElCom tariff data, swissinfo.ch
const ELECTRICITY_PRICE = 0.277

// Swiss consumer electricity mix (production + imports), VSE 2021
// Source: strom.ch "CO2-Gehalt des Strommix Schweiz"
const CO2_FACTOR = 0.128

export const DEFAULT_PPA_DISCOUNT_PCT = 30
export const ABO_UPLIFT_FACTOR = 1.35
export const ABO_TERM_MONTHS = 300

const FLAT_TILT_THRESHOLD_DEG = 10

const COVERAGE_FLAT = 0.45

const COVERAGE_PITCHED_SOUTH = 0.80
const COVERAGE_PITCHED_SIDE = 0.75
const COVERAGE_PITCHED_NORTH = 0.50

function segmentCoverageFraction(tiltDeg: number, azimuthDeg: number): number {
  if (tiltDeg <= FLAT_TILT_THRESHOLD_DEG) return COVERAGE_FLAT
  const normalized = ((azimuthDeg % 360) + 360) % 360
  const deviationFromSouth = normalized > 180 ? 360 - normalized : normalized
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

export function applianceEstimateConsumptionKwh(
  householdSize: HouseholdSize | null,
  devices: HighPowerDevices,
): number {
  const deviceExtra = (Object.keys(devices) as (keyof HighPowerDevices)[])
    .filter(key => devices[key])
    .reduce((sum, key) => sum + DEVICE_CONSUMPTION[key], 0)

  const base = BASE_CONSUMPTION[householdSize || 3] || 3200
  return base + deviceExtra
}

interface SolarAboCalculatorState {
  solarModel: SolarModel | null
  currentStep: number
  totalSteps: number

  buildingType: BuildingType
  householdSize: HouseholdSize | null
  devices: HighPowerDevices
  consumptionOverrideKwh: number | null
  consumptionInputMode: ConsumptionInputMode | null
  consumptionBillChf: number | null
  consumptionBillPeriod: BillPeriod
  heatPumpInterest: boolean
  hasExistingSolar: boolean

  address: string
  selectedLocation: { lat: number; lng: number } | null
  building: SonnendachBuilding | null
  selectedSegmentIds: string[]
  isSearching: boolean
  isFetchingBuilding: boolean

  roofCovering: RoofCoveringType | null
  roofImage: string | null

  contact: ContactDetails
  consents: Consents

  manualCheckRequested: ManualCheckSource | false

  isSubmitting: boolean
  isSubmitted: boolean
  submissionError: string | null
  submissionErrorCode: SubmissionErrorCode | null
  accountCreated: boolean
  pendingVerification: boolean
  serverAnnualSavingsChf: number | null

  createdUserId: string | null
  createdCustomerId: string | null
  createdProjectId: string | null
  selectedPackageId: string | null
  selectedPackageCode: string | null
  selectedPackagePricePerKwp: number | null
  selectedPackagePurchasePriceChf: number | null
  selectedPackageInstallerWarrantyYears: number | null
  selectedPackageElectricitySavingsPercent: number | null
  selectedPackageContractTermYears: number | null
  selectedPanelWattageW: number | null
  selectedPanelAreaM2: number | null
  selectedPanelFirstYearDegradationPercent: number | null
  selectedPanelAnnualDegradationPercent: number | null

  selectedEvChargerId: string | null
  selectedEvChargerPriceChf: number | null
  selectedEvChargerQuantity: number

  electricityPriceChfKwh: number | null
  electricityPricePlz: string | null
  electricityPriceMunicipality: string | null
  electricityPriceLoading: boolean
  electricityPriceFallback: boolean
  electricityVariableChfKwh: number | null
  electricityFixedAnnualChf: number | null
  electricityTariffYear: number | null

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
  setBuildingType: (type: BuildingType) => void
  setDevice: (device: keyof HighPowerDevices, value: boolean) => void
  setHasExistingSolar: (value: boolean) => void
  setConsumptionOverride: (kwh: number | null) => void
  setConsumptionInputMode: (mode: ConsumptionInputMode | null) => void
  setConsumptionBill: (chf: number | null, period: BillPeriod) => void
  setHeatPumpInterest: (value: boolean) => void
  setAddress: (address: string) => void
  setSelectedLocation: (location: { lat: number; lng: number } | null) => void
  setParsedAddress: (fields: ParsedAddressFields) => void
  setManualCheckRequested: (source: ManualCheckSource | false) => void
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
  getUsableRoofAreaM2: () => number
  getEstimatedConsumption: () => number
  getAnnualProduction: () => number
  getSystemSizeKwp: () => number
  getEstimatedPanelCount: () => number
  getSelfConsumptionRate: () => number
  getAnnualSavings: () => number
  getAnnualPpaSavings: () => number
  getCo2Savings: () => number
  getRecommendedPackage: () => SolarAboPackage
  setSelectedEvCharger: (id: string, priceChf: number) => void
  clearEvCharger: () => void
  getSubsidyAmount: () => number
  createAccount: () => Promise<void>
  reset: () => void

  getElectricityPriceChfKwh: () => number
  getVariableChfKwh: () => number
  getFixedAnnualChf: () => number
  fetchElectricityPriceForAddress: () => Promise<void>

  fetchSubsidyRate: () => Promise<void>

  getFeedInTariffChfKwh: () => number | null
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
  canton: '',
  street: '',
  streetNumber: '',
  addressAdditional: '',
  isPropertyOwner: null,
}

const initialConsents: Consents = {
  dataProcessing: false,
  marketing: false,
}

const initialState: SolarAboCalculatorState = {
  solarModel: null,
  currentStep: 1,
  totalSteps: flowTotalSteps,

  buildingType: 'single_family',
  householdSize: null,
  consumptionOverrideKwh: null,
  consumptionInputMode: null,
  consumptionBillChf: null,
  consumptionBillPeriod: 'month',
  heatPumpInterest: false,
  hasExistingSolar: false,
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

  manualCheckRequested: false,

  isSubmitting: false,
  isSubmitted: false,
  submissionError: null,
  submissionErrorCode: null,
  accountCreated: false,
  pendingVerification: false,
  serverAnnualSavingsChf: null,

  createdUserId: null,
  createdCustomerId: null,
  createdProjectId: null,
  selectedPackageId: null,
  selectedPackageCode: null,
  selectedPackagePricePerKwp: null,
  selectedPackagePurchasePriceChf: null,
  selectedPackageInstallerWarrantyYears: null,
  selectedPackageElectricitySavingsPercent: null,
  selectedPackageContractTermYears: null,
  selectedPanelWattageW: null,
  selectedPanelAreaM2: null,
  selectedPanelFirstYearDegradationPercent: null,
  selectedPanelAnnualDegradationPercent: null,

  selectedEvChargerId: null,
  selectedEvChargerPriceChf: null,
  selectedEvChargerQuantity: 1,

  electricityPriceChfKwh: null,
  electricityPricePlz: null,
  electricityPriceMunicipality: null,
  electricityPriceLoading: false,
  electricityPriceFallback: false,
  electricityVariableChfKwh: null,
  electricityFixedAnnualChf: null,
  electricityTariffYear: null,

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
        set({ solarModel: model })
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps) {
          if (calculatorFlowV2Enabled && currentStep === mapStep) {
            set({
              currentStep: currentStep + 1,
              selectedPanelAreaM2: SCREEN4_REFERENCE_PANEL_M2,
              selectedPanelWattageW: SCREEN4_REFERENCE_PANEL_W,
            })
            return
          }
          set({ currentStep: currentStep + 1 })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },

      goToStep: (step: number) => {
        const { totalSteps } = get()
        if (step >= 1 && step <= totalSteps) {
          set({ currentStep: step })
        }
      },


      setHouseholdSize: (size: HouseholdSize) => {
        set({ householdSize: size })
      },

      setBuildingType: (type: BuildingType) => {
        set({ buildingType: type })
      },

      setHasExistingSolar: (value: boolean) => {
        set({ hasExistingSolar: value })
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

      setConsumptionOverride: (kwh: number | null) => {
        if (kwh == null) {
          set({ consumptionOverrideKwh: null })
          return
        }
        if (!Number.isFinite(kwh) || kwh <= 0) return
        const clamped = Math.max(
          CONSUMPTION_MIN_KWH,
          Math.min(CONSUMPTION_MAX_KWH, Math.round(kwh)),
        )
        set({ consumptionOverrideKwh: clamped })
      },

      setConsumptionInputMode: (mode: ConsumptionInputMode | null) => {
        set({ consumptionInputMode: mode })
      },

      setConsumptionBill: (chf: number | null, period: BillPeriod) => {
        if (chf == null) {
          set({ consumptionBillChf: null, consumptionBillPeriod: period })
          return
        }
        if (!Number.isFinite(chf) || chf <= 0) {
          set({ consumptionBillPeriod: period })
          return
        }
        set({ consumptionBillChf: chf, consumptionBillPeriod: period })
      },

      setHeatPumpInterest: (value: boolean) => {
        set({ heatPumpInterest: value })
      },

      setAddress: (address: string) => {
        const { address: currentAddress, createdProjectId } = get()
        if (createdProjectId && address !== currentAddress) {
          set({
            address,
            createdProjectId: null,
            accountCreated: false,
            pendingVerification: false,
            isSubmitted: false,
          })
          return
        }
        set({ address })
      },

      setSelectedLocation: (location: { lat: number; lng: number } | null) => {
        const current = get().selectedLocation
        const moved =
          location &&
          current &&
          (location.lat !== current.lat || location.lng !== current.lng)
        if (moved || (location && !current && get().building)) {
          set({ selectedLocation: location, building: null, selectedSegmentIds: [] })
          return
        }
        set({ selectedLocation: location })
      },

      setParsedAddress: (fields: ParsedAddressFields) => {
        const { contact } = get()
        set({ contact: { ...contact, ...fields } })
      },

      setManualCheckRequested: (source: ManualCheckSource | false) => {
        set({ manualCheckRequested: source })
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
        if (!building?.roofSegments) return []
        return building.roofSegments.filter(s => selectedSegmentIds.includes(s.id))
      },

      getSelectedArea: () => {
        const { building, selectedSegmentIds } = get()
        if (!building?.roofSegments) return 0
        return building.roofSegments
          .filter(s => selectedSegmentIds.includes(s.id))
          .reduce((sum, s) => sum + s.area, 0)
      },

      getUsableRoofAreaM2: () => {
        const segments = get().getSelectedSegments()
        return segments.reduce(
          (sum, s) => sum + s.area * segmentCoverageFraction(s.tilt, s.azimuth),
          0,
        )
      },

      getEstimatedConsumption: () => {
        const override = get().consumptionOverrideKwh
        if (typeof override === 'number' && override > 0) return override

        const { householdSize, devices } = get()
        return applianceEstimateConsumptionKwh(householdSize, devices)
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

        return Math.min(rate, 0.55)
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

      getRecommendedPackage: (): SolarAboPackage => {
        const code = get().selectedPackageCode
        if (code === 'multi') return 'multi'
        return 'home'
      },

      setSelectedEvCharger: (id: string, priceChf: number) => {
        set({
          selectedEvChargerId: id,
          selectedEvChargerPriceChf: priceChf,
          selectedEvChargerQuantity: 1,
        })
      },

      clearEvCharger: () => {
        set({
          selectedEvChargerId: null,
          selectedEvChargerPriceChf: null,
          selectedEvChargerQuantity: 1,
        })
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

      createAccount: async () => {
        const state = get()
        set({ isSubmitting: true, submissionError: null, submissionErrorCode: null })

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
              remarks: state.hasExistingSolar
                ? 'Hat bereits eine Solaranlage.'
                : state.contact.remarks,
              country: state.contact.country,
              postalCode: state.contact.postalCode,
              city: state.contact.city,
              street: state.contact.street,
              streetNumber: state.contact.streetNumber,
              canton: state.contact.canton || undefined,
              addressAdditional: state.contact.addressAdditional,
              isPropertyOwner: state.contact.isPropertyOwner ?? undefined,
            },
            calculation: {
              address: state.address,
              lat: state.selectedLocation?.lat ?? state.building?.center.lat ?? 0,
              lng: state.selectedLocation?.lng ?? state.building?.center.lng ?? 0,
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
              heatPumpInterest: state.heatPumpInterest,
              selectedPackageId: state.selectedPackageId ?? undefined,
              consumptionOverrideKwh: state.consumptionOverrideKwh ?? undefined,
              roofImage: state.roofImage ?? undefined,
              evCharger: state.selectedEvChargerId
                ? {
                    evChargerId: state.selectedEvChargerId,
                    quantity: state.selectedEvChargerQuantity ?? 1,
                  }
                : undefined,
            },
            consents: state.consents,
            attribution: getAttribution(),
          })
          if (response.data.status === 'pending_verification') {
            set({
              isSubmitting: false,
              isSubmitted: true,
              pendingVerification: true,
              serverAnnualSavingsChf: response.data.annualSavingsChf ?? null,
            })
            return
          }

          setAccessToken(response.data.accessToken as string)
          await useAuthStore.getState().checkAuth()
          set({
            isSubmitting: false,
            isSubmitted: true,
            accountCreated: true,
            serverAnnualSavingsChf: response.data.annualSavingsChf ?? null,
            createdUserId: response.data.userId ?? null,
            createdCustomerId: response.data.customerId ?? null,
            createdProjectId: response.data.projectId ?? null,
          })
        } catch (error: unknown) {
          const axiosError = error as {
            response?: {
              status?: number
              data?: { error?: { message?: string } }
            }
          }
          const status = axiosError?.response?.status
          const submissionErrorCode: SubmissionErrorCode =
            status === 429 ? 'rate_limited' : status ? 'server' : 'network'
          set({
            isSubmitting: false,
            submissionError: axiosError?.response?.data?.error?.message || 'Submission failed',
            submissionErrorCode,
          })
        }
      },

      reset: () => {
        set(initialState)
      },

      getElectricityPriceChfKwh: () => {
        const price = get().electricityPriceChfKwh
        return typeof price === 'number' && price > 0 ? price : ELECTRICITY_PRICE
      },

      getVariableChfKwh: () => {
        const variable = get().electricityVariableChfKwh
        return typeof variable === 'number' &&
          Number.isFinite(variable) &&
          variable > 0
          ? variable
          : CH_FALLBACK_VARIABLE_CHF_KWH
      },

      getFixedAnnualChf: () => {
        const fixed = get().electricityFixedAnnualChf
        return typeof fixed === 'number' &&
          Number.isFinite(fixed) &&
          fixed >= 0 &&
          fixed <= MAX_PLAUSIBLE_FIXED_ANNUAL_CHF
          ? fixed
          : CH_FALLBACK_FIXED_ANNUAL_CHF
      },

      fetchElectricityPriceForAddress: async () => {
        const state = get()
        const contactPlz = state.contact.postalCode.trim()
        const plz = /^\d{4}$/.test(contactPlz)
          ? contactPlz
          : (state.address.match(/\b(\d{4})\b/)?.[1] ?? null)
        if (!plz) return

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
            electricityVariableChfKwh: data.variableChfKwh,
            electricityFixedAnnualChf: data.fixedAnnualChf,
            electricityTariffYear: data.tariffYear,
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
    }),
    {
      name: 'solar-free-calculator',
      storage: createJSONStorage(() => sessionStorage),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SolarAboCalculatorState>
        const hasValidBuilding =
          !!p.building && Array.isArray((p.building as SonnendachBuilding).roofSegments)
        return {
          ...current,
          ...p,
          building: hasValidBuilding ? p.building! : null,
          selectedSegmentIds: hasValidBuilding ? p.selectedSegmentIds ?? [] : [],
        }
      },
      partialize: (state) => ({
        solarModel: state.solarModel,
        buildingType: state.buildingType,
        householdSize: state.householdSize,
        devices: state.devices,
        consumptionOverrideKwh: state.consumptionOverrideKwh,
        consumptionInputMode: state.consumptionInputMode,
        consumptionBillChf: state.consumptionBillChf,
        consumptionBillPeriod: state.consumptionBillPeriod,
        heatPumpInterest: state.heatPumpInterest,
        hasExistingSolar: state.hasExistingSolar,
        address: state.address,
        selectedLocation: state.selectedLocation,
        building: state.building,
        selectedSegmentIds: state.selectedSegmentIds,
        roofCovering: state.roofCovering,
        roofImage: state.roofImage,
        contact: state.contact,
        consents: state.consents,
        manualCheckRequested: state.manualCheckRequested,
        accountCreated: state.accountCreated,
        pendingVerification: state.pendingVerification,
        createdUserId: state.createdUserId,
        createdCustomerId: state.createdCustomerId,
        createdProjectId: state.createdProjectId,
        selectedPackageId: state.selectedPackageId,
        selectedPackageCode: state.selectedPackageCode,
        selectedPackagePricePerKwp: state.selectedPackagePricePerKwp,
        selectedPackagePurchasePriceChf: state.selectedPackagePurchasePriceChf,
        selectedPackageInstallerWarrantyYears: state.selectedPackageInstallerWarrantyYears,
        selectedPackageElectricitySavingsPercent: state.selectedPackageElectricitySavingsPercent,
        selectedPackageContractTermYears: state.selectedPackageContractTermYears,
        selectedPanelWattageW: state.selectedPanelWattageW,
        selectedPanelAreaM2: state.selectedPanelAreaM2,
        selectedPanelFirstYearDegradationPercent: state.selectedPanelFirstYearDegradationPercent,
        selectedPanelAnnualDegradationPercent: state.selectedPanelAnnualDegradationPercent,
        selectedEvChargerId: state.selectedEvChargerId,
        selectedEvChargerPriceChf: state.selectedEvChargerPriceChf,
        selectedEvChargerQuantity: state.selectedEvChargerQuantity,
        electricityPriceChfKwh: state.electricityPriceChfKwh,
        electricityPricePlz: state.electricityPricePlz,
        electricityPriceMunicipality: state.electricityPriceMunicipality,
        electricityPriceFallback: state.electricityPriceFallback,
        electricityVariableChfKwh: state.electricityVariableChfKwh,
        electricityFixedAnnualChf: state.electricityFixedAnnualChf,
        electricityTariffYear: state.electricityTariffYear,
        subsidyRate: state.subsidyRate,
        feedInTariffRate: state.feedInTariffRate,
      }),
    }
  )
)
