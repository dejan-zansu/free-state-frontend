import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { SonnendachLocation, SonnendachBuilding, RoofSegment } from '@/types/sonnendach'
import { residentialCalculatorService } from '@/services/residential-calculator.service'

export type SignatureStatus = 'idle' | 'initiating' | 'pending' | 'signed' | 'expired' | 'failed'

export type SolarModel = 'solar-abo' | 'solar-direct'
export type MultiPlanningType = 'my-needs' | 'all-parties'
export type SolarAboPackage = 'home' | 'multi'
export type BuildingType = 'single_family' | 'apartment' | 'trade' | 'office'
export type HouseholdSize = 1 | 2 | 3 | 4 | 5
export type RoofCoveringType = 'tiled' | 'tin' | 'other'
export type Salutation = 'mr' | 'woman' | 'family'

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
  remarks: string
}

// ElCom 2026 average residential tariff (Rp./kWh → CHF/kWh)
// Source: ElCom tariff data, swissinfo.ch
const ELECTRICITY_PRICE = 0.277

// Swiss consumer electricity mix (production + imports), VSE 2021
// Source: strom.ch "CO2-Gehalt des Strommix Schweiz"
const CO2_FACTOR = 0.128

// Swiss national average specific yield (IEA-PVPS 2013-2022: 954 kWh/kWp)
// Rounded to 1000 for Swiss Plateau with typical (not optimal) orientations
// Source: IEA-PVPS National Survey Report Switzerland 2024
const SPECIFIC_YIELD = 1000

// Standard residential panel ~425W (2025 industry average, TOPCon mainstream)
// Source: Clean Energy Reviews, SolarTechOnline 2025 surveys
const AVG_PANEL_POWER = 0.425

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

// Monthly solar production distribution for Swiss Plateau (Bern, 46.95N)
// PVGIS ERA5 data (2005-2023 averages), 30-degree tilt, south-facing
// Source: EU Joint Research Centre PVGIS v5.3
const MONTHLY_FACTORS = [0.047, 0.062, 0.091, 0.104, 0.105, 0.113, 0.117, 0.108, 0.095, 0.074, 0.047, 0.037]

interface SolarAboCalculatorState {
  solarModel: SolarModel | null
  currentStep: number
  totalSteps: number

  buildingType: BuildingType | null
  multiPlanningType: MultiPlanningType | null
  showMultiInterstitial: boolean
  apartmentCount: number
  householdSize: HouseholdSize | null
  devices: HighPowerDevices

  address: string
  selectedLocation: SonnendachLocation | null
  building: SonnendachBuilding | null
  selectedSegmentIds: string[]
  isSearching: boolean
  isFetchingBuilding: boolean

  roofCovering: RoofCoveringType | null

  contact: ContactDetails

  isSubmitting: boolean
  isSubmitted: boolean
  submissionError: string | null

  createdProjectId: string | null
  createdContractId: string | null
  contractNumber: string | null
  contractPdfUrl: string | null
  acknowledgments: string[]
  signatureStatus: SignatureStatus
  signatureProcessId: string | null
  signingUrl: string | null
  signedPdfUrl: string | null
}

interface SolarAboCalculatorActions {
  setSolarModel: (model: SolarModel | null) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setBuildingType: (type: BuildingType) => void
  setMultiPlanningType: (type: MultiPlanningType) => void
  setShowMultiInterstitial: (show: boolean) => void
  setApartmentCount: (count: number) => void
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
  setContact: (contact: Partial<ContactDetails>) => void
  getSelectedSegments: () => RoofSegment[]
  getSelectedArea: () => number
  getEstimatedConsumption: () => number
  getAnnualProduction: () => number
  getSystemSizeKwp: () => number
  getEstimatedPanelCount: () => number
  getSelfConsumptionRate: () => number
  getAnnualSavings: () => number
  getCo2Savings: () => number
  getMonthlyProduction: () => number[]
  getRecommendedPackage: () => SolarAboPackage
  submitCalculation: () => Promise<void>
  addAcknowledgment: (type: string) => void
  removeAcknowledgment: (type: string) => void
  createContract: () => Promise<void>
  setSignatureRequestData: (data: { processId: string; signingUrl: string }) => void
  setSignatureStatus: (status: SignatureStatus) => void
  setSignedPdfUrl: (url: string) => void
  resetSignature: () => void
  reset: () => void
}

const initialContact: ContactDetails = {
  salutation: null,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  remarks: '',
}

const initialState: SolarAboCalculatorState = {
  solarModel: null,
  currentStep: 1,
  totalSteps: 9,

  buildingType: null,
  multiPlanningType: null,
  showMultiInterstitial: false,
  apartmentCount: 2,
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

  contact: initialContact,

  isSubmitting: false,
  isSubmitted: false,
  submissionError: null,

  createdProjectId: null,
  createdContractId: null,
  contractNumber: null,
  contractPdfUrl: null,
  acknowledgments: [],
  signatureStatus: 'idle',
  signatureProcessId: null,
  signingUrl: null,
  signedPdfUrl: null,
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

      setBuildingType: (type: BuildingType) => {
        set({ buildingType: type })
      },

      setMultiPlanningType: (type: MultiPlanningType) => {
        set({ multiPlanningType: type })
      },

      setShowMultiInterstitial: (show: boolean) => {
        set({ showMultiInterstitial: show })
      },

      setApartmentCount: (count: number) => {
        set({ apartmentCount: Math.max(2, count) })
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

      setContact: (contact: Partial<ContactDetails>) => {
        const { contact: currentContact } = get()
        set({
          contact: {
            ...currentContact,
            ...contact,
          },
        })
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
        const { householdSize, devices, buildingType, multiPlanningType, apartmentCount } = get()
        const deviceExtra = (Object.keys(devices) as (keyof HighPowerDevices)[])
          .filter(key => devices[key])
          .reduce((sum, key) => sum + DEVICE_CONSUMPTION[key], 0)

        if (buildingType === 'apartment' && multiPlanningType === 'all-parties') {
          const perApartment = BASE_CONSUMPTION[3] || 4400
          return perApartment * apartmentCount + deviceExtra
        }

        const base = BASE_CONSUMPTION[householdSize || 3] || 3200
        return base + deviceExtra
      },

      getAnnualProduction: () => {
        const segments = get().getSelectedSegments()
        return segments.reduce((sum, s) => sum + s.electricityYield, 0)
      },

      getSystemSizeKwp: () => {
        const production = get().getAnnualProduction()
        if (production === 0) return 0
        return production / SPECIFIC_YIELD
      },

      getEstimatedPanelCount: () => {
        const kwp = get().getSystemSizeKwp()
        if (kwp === 0) return 0
        return Math.ceil(kwp / AVG_PANEL_POWER)
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

        // Without battery, practical maximum is ~55% (PV-Calor field data)
        // With all devices optimized, theoretical max ~55% achievable
        return Math.min(rate, 0.55)
      },

      getAnnualSavings: () => {
        const production = get().getAnnualProduction()
        const selfConsumptionRate = get().getSelfConsumptionRate()
        const selfConsumedKwh = production * selfConsumptionRate
        return selfConsumedKwh * ELECTRICITY_PRICE
      },

      getCo2Savings: () => {
        const production = get().getAnnualProduction()
        return production * CO2_FACTOR
      },

      getMonthlyProduction: () => {
        const annual = get().getAnnualProduction()
        return MONTHLY_FACTORS.map(f => annual * f)
      },

      getRecommendedPackage: (): SolarAboPackage => {
        const { buildingType } = get()
        return buildingType === 'single_family' ? 'home' : 'multi'
      },

      submitCalculation: async () => {
        const state = get()
        set({ isSubmitting: true, submissionError: null })

        try {
          const response = await residentialCalculatorService.submit({
            contact: {
              salutation: state.contact.salutation || 'mr',
              firstName: state.contact.firstName,
              lastName: state.contact.lastName,
              email: state.contact.email,
              phone: state.contact.phoneNumber,
              remarks: state.contact.remarks,
            },
            calculation: {
              address: state.address,
              lat: state.building?.center.lat || 0,
              lng: state.building?.center.lng || 0,
              selectedSegments: state.getSelectedSegments(),
              selectedArea: state.getSelectedArea(),
              buildingType: state.buildingType || 'single_family',
              householdSize: state.householdSize || 3,
              devices: state.devices,
              roofCovering: state.roofCovering || 'tiled',
              estimatedProduction: state.getAnnualProduction(),
              estimatedConsumption: state.getEstimatedConsumption(),
              selfConsumptionRate: state.getSelfConsumptionRate(),
              annualSavings: state.getAnnualSavings(),
              co2Savings: state.getCo2Savings(),
              systemSizeKwp: state.getSystemSizeKwp(),
              recommendedPackage: state.getRecommendedPackage(),
            },
          })
          set({
            isSubmitting: false,
            isSubmitted: true,
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
          const response = await residentialCalculatorService.createContract({
            projectId: state.createdProjectId,
            acknowledgments: state.acknowledgments,
            language: 'de',
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
    }),
    {
      name: 'solar-abo-calculator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        solarModel: state.solarModel,
        currentStep: state.currentStep,
        buildingType: state.buildingType,
        multiPlanningType: state.multiPlanningType,
        apartmentCount: state.apartmentCount,
        householdSize: state.householdSize,
        devices: state.devices,
        address: state.address,
        selectedLocation: state.selectedLocation,
        building: state.building,
        selectedSegmentIds: state.selectedSegmentIds,
        roofCovering: state.roofCovering,
        contact: state.contact,
        createdProjectId: state.createdProjectId,
        createdContractId: state.createdContractId,
        contractNumber: state.contractNumber,
        contractPdfUrl: state.contractPdfUrl,
        acknowledgments: state.acknowledgments,
      }),
    }
  )
)
