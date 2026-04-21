import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { sonnendachService } from '@/services/sonnendach.service'
import type {
  CommercialLegalForm,
  CommercialIndustry,
  CommercialEmployeeBracket,
  CommercialContactRole,
  CommercialPreferredChannel,
  CommercialTimeline,
  CommercialMotivation,
  CommercialFinancingPreference,
  CommercialBudgetBracket,
  CommercialExistingPv,
  CommercialPropertyRelation,
} from '@/types/commercial-lead'
import type {
  SonnendachLocation,
  SonnendachBuilding,
  RoofSegment,
} from '@/types/sonnendach'

export interface SolarPanel {
  id: string
  name: string
  power: number
  width: number
  height: number
  efficiency: number
  manufacturer: string
  price: number
}

export interface Inverter {
  id: string
  name: string
  power: number
  manufacturer: string
  efficiency: number
  price: number
}

export type RoofType = 'flat' | 'low_slope' | 'medium' | 'steep'
export type RoofMaterial = 'bitumen' | 'gravel' | 'green_roof' | 'granulate' | 'tiles' | 'metal' | 'unknown'

export interface RoofProperties {
  roofType: RoofType
  buildingFloors: number
  roofMaterial: RoofMaterial
}

export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'agricultural'

export interface Address {
  street: string
  streetNumber?: string
  postalCode: string
  city: string
  canton: string
  country: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  preferredLanguage: 'de' | 'fr' | 'it' | 'en'
}

export interface PropertyOwnership {
  isPropertyOwner: boolean
  propertyOwnerName?: string
  propertyOwnerEmail?: string
  propertyOwnerPhone?: string
}

export interface Consents {
  terms: boolean
  privacy: boolean
  marketing: boolean
}

export interface ConsumptionData {
  propertyType: PropertyType
  isNewBuilding: boolean
  evChargingStations: number
  heatPumpHotWater: boolean
  heatPumpHeating: boolean
  electricityProvider: string

  residents: number
  annualElectricityCost: number
  annualConsumptionKwh: number

  electricityTariffAuto: boolean
  electricityTariff: number
  feedInTariffAuto: boolean
  feedInTariff: number
}

export interface RestrictedArea {
  id: string
  coordinates: number[][]
  area: number
  label?: string
}

export interface CompanyDetails {
  companyName: string
  legalForm: CommercialLegalForm | ''
  uidNumber: string
  industry: CommercialIndustry | ''
  employeeBracket: CommercialEmployeeBracket
  website: string
  numberOfSites: number
}

export interface ContactDetails {
  firstName: string
  lastName: string
  role: CommercialContactRole | ''
  email: string
  phone: string
  isDecisionMaker: boolean
  preferredChannel: CommercialPreferredChannel
  preferredTime: string
}

export interface ProjectIntent {
  timeline: CommercialTimeline | ''
  motivations: CommercialMotivation[]
  financingPreferences: CommercialFinancingPreference[]
  budgetBracket: CommercialBudgetBracket
  existingPv: CommercialExistingPv
  comments: string
}

export interface SubmissionResult {
  id: string
  reference: string
  uploadToken: string
  uploadTokenExpiresAt: string
}

export interface CommercialCalculatorState {
  currentStep: number
  totalSteps: number

  address: string
  selectedLocation: SonnendachLocation | null
  searchResults: SonnendachLocation[]
  isSearching: boolean

  building: SonnendachBuilding | null
  selectedSegmentIds: string[]
  isFetchingBuilding: boolean

  roofProperties: RoofProperties
  restrictedAreas: RestrictedArea[]

  selectedPanel: SolarPanel | null
  selectedInverter: Inverter | null
  panelCount: number
  maxPanelCount: number

  consumption: ConsumptionData

  selectedArea: number
  selectedPotentialKwh: number
  estimatedPanelCount: number

  personalInfo: PersonalInfo
  installationAddress: Address
  billingAddress: Address
  sameAsInstallation: boolean
  propertyOwnership: PropertyOwnership
  consents: Consents

  companyDetails: CompanyDetails
  contactDetails: ContactDetails
  projectIntent: ProjectIntent
  propertyRelation: CommercialPropertyRelation | ''
  ownerContact: { name: string; email: string; phone: string }
  submissionResult: SubmissionResult | null
  isSubmitting: boolean
  submitError: string | null

  isLoading: boolean
  error: string | null
}

interface CommercialCalculatorActions {
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  setAddress: (address: string) => void
  searchAddresses: (query: string) => Promise<void>
  selectLocation: (location: SonnendachLocation) => void
  clearSearchResults: () => void

  fetchBuildingData: () => Promise<void>
  fetchBuildingDataAtPoint: (x: number, y: number) => Promise<void>
  toggleSegmentSelection: (segmentId: string) => void
  selectAllSegments: () => void
  clearSegmentSelection: () => void
  selectSegmentsByMinSuitability: (minClass: number) => void

  getSelectedSegments: () => RoofSegment[]
  calculateTotals: () => void

  setSelectedSegmentsData: (segments: RoofSegment[], allBuildingSegments?: RoofSegment[]) => void

  setRoofProperties: (properties: Partial<RoofProperties>) => void
  addRestrictedArea: (area: RestrictedArea) => void
  removeRestrictedArea: (id: string) => void
  clearRestrictedAreas: () => void
  getUsableArea: () => number
  getTotalRestrictedArea: () => number
  getEffectiveRestrictedArea: () => number
  getRestrictedAreasInNonSelectedSegments: () => RestrictedArea[]

  selectPanel: (panel: SolarPanel) => void
  selectInverter: (inverter: Inverter) => void
  setPanelCount: (count: number) => void
  setMaxPanelCount: (count: number) => void

  setConsumption: (data: Partial<ConsumptionData>) => void

  setPersonalInfo: (data: Partial<PersonalInfo>) => void
  setInstallationAddress: (address: Address) => void
  setBillingAddress: (address: Address) => void
  setSameAsInstallation: (same: boolean) => void
  setPropertyOwnership: (data: Partial<PropertyOwnership>) => void
  setConsents: (data: Partial<Consents>) => void

  setCompanyDetails: (data: Partial<CompanyDetails>) => void
  setContactDetails: (data: Partial<ContactDetails>) => void
  setProjectIntent: (data: Partial<ProjectIntent>) => void
  setPropertyRelation: (v: CommercialPropertyRelation | '') => void
  setOwnerContact: (data: Partial<{ name: string; email: string; phone: string }>) => void
  setSubmissionResult: (r: SubmissionResult | null) => void
  setSubmitting: (v: boolean) => void
  setSubmitError: (e: string | null) => void

  getSystemSizeKwp: () => number
  getEstimatedProductionKwh: () => number
  getTotalInvestment: () => number
  getSubsidies: () => number
  getNetInvestment: () => number
  getAnnualSavings: () => number
  getPaybackYears: () => number
  getCo2Savings: () => number

  reset: () => void
  clearError: () => void
}

type CommercialCalculatorStore = CommercialCalculatorState & CommercialCalculatorActions

const initialState: CommercialCalculatorState = {
  currentStep: 1,
  totalSteps: 7,

  address: '',
  selectedLocation: null,
  searchResults: [],
  isSearching: false,

  building: null,
  selectedSegmentIds: [],
  isFetchingBuilding: false,

  roofProperties: {
    roofType: 'flat',
    buildingFloors: 1,
    roofMaterial: 'unknown',
  },
  restrictedAreas: [],

  selectedPanel: null,
  selectedInverter: null,
  panelCount: 0,
  maxPanelCount: 0,

  consumption: {
    propertyType: 'residential',
    isNewBuilding: false,
    evChargingStations: 0,
    heatPumpHotWater: false,
    heatPumpHeating: false,
    electricityProvider: 'standard',
    residents: 2,
    annualElectricityCost: 0,
    annualConsumptionKwh: 0,
    electricityTariffAuto: true,
    electricityTariff: 25,
    feedInTariffAuto: true,
    feedInTariff: 12,
  },

  selectedArea: 0,
  selectedPotentialKwh: 0,
  estimatedPanelCount: 0,

  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    preferredLanguage: 'de',
  },
  installationAddress: {
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    canton: '',
    country: 'CH',
  },
  billingAddress: {
    street: '',
    streetNumber: '',
    postalCode: '',
    city: '',
    canton: '',
    country: 'CH',
  },
  sameAsInstallation: true,
  propertyOwnership: {
    isPropertyOwner: true,
    propertyOwnerName: '',
    propertyOwnerEmail: '',
    propertyOwnerPhone: '',
  },
  consents: {
    terms: false,
    privacy: false,
    marketing: false,
  },

  companyDetails: {
    companyName: '', legalForm: '', uidNumber: '', industry: '',
    employeeBracket: 'UNKNOWN', website: '', numberOfSites: 1,
  },
  contactDetails: {
    firstName: '', lastName: '', role: '',
    email: '', phone: '',
    isDecisionMaker: true, preferredChannel: 'EMAIL', preferredTime: '',
  },
  projectIntent: {
    timeline: '', motivations: [], financingPreferences: [],
    budgetBracket: 'UNSPECIFIED', existingPv: 'NONE', comments: '',
  },
  propertyRelation: '',
  ownerContact: { name: '', email: '', phone: '' },
  submissionResult: null,
  isSubmitting: false,
  submitError: null,

  isLoading: false,
  error: null,
}

export const useCommercialCalculatorStore = create<CommercialCalculatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

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

      setAddress: (address: string) => {
        set({ address })
      },

      searchAddresses: async (query: string) => {
        if (!query || query.length < 3) {
          set({ searchResults: [] })
          return
        }

        set({ isSearching: true, error: null })

        try {
          const results = await sonnendachService.searchAddress(query)
          set({ searchResults: results, isSearching: false })
        } catch (error) {
          console.error('Address search failed:', error)
          set({
            error: error instanceof Error ? error.message : 'Address search failed',
            isSearching: false,
            searchResults: [],
          })
        }
      },

      selectLocation: (location: SonnendachLocation) => {
        set({
          selectedLocation: location,
          address: location.attrs.label,
          searchResults: [],
          building: null,
          selectedSegmentIds: [],
          selectedArea: 0,
          selectedPotentialKwh: 0,
          estimatedPanelCount: 0,
        })
      },

      clearSearchResults: () => {
        set({ searchResults: [] })
      },

      fetchBuildingData: async () => {
        const { selectedLocation } = get()
        if (!selectedLocation) {
          set({ error: 'No location selected' })
          return
        }

        const { x, y } = selectedLocation.attrs
        await get().fetchBuildingDataAtPoint(x, y)
      },

      fetchBuildingDataAtPoint: async (x: number, y: number) => {
        set({ isFetchingBuilding: true, error: null })

        try {
          const building = await sonnendachService.getBuildingData(x, y)

          const goodSegmentIds = building.roofSegments
            .filter((s) => s.suitability.class >= 3)
            .map((s) => s.id)

          set({
            building,
            selectedSegmentIds: goodSegmentIds,
            isFetchingBuilding: false,
          })

          get().calculateTotals()
        } catch (error) {
          console.error('Failed to fetch building data:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to load building data',
            isFetchingBuilding: false,
          })
        }
      },

      toggleSegmentSelection: (segmentId: string) => {
        const { selectedSegmentIds } = get()
        const isSelected = selectedSegmentIds.includes(segmentId)

        if (isSelected) {
          set({
            selectedSegmentIds: selectedSegmentIds.filter((id) => id !== segmentId),
          })
        } else {
          set({
            selectedSegmentIds: [...selectedSegmentIds, segmentId],
          })
        }

        get().calculateTotals()
      },

      selectAllSegments: () => {
        const { building } = get()
        if (!building) return

        set({
          selectedSegmentIds: building.roofSegments.map((s) => s.id),
        })

        get().calculateTotals()
      },

      clearSegmentSelection: () => {
        set({
          selectedSegmentIds: [],
          selectedArea: 0,
          selectedPotentialKwh: 0,
          estimatedPanelCount: 0,
        })
      },

      selectSegmentsByMinSuitability: (minClass: number) => {
        const { building } = get()
        if (!building) return

        const segmentIds = building.roofSegments
          .filter((s) => s.suitability.class >= minClass)
          .map((s) => s.id)

        set({ selectedSegmentIds: segmentIds })
        get().calculateTotals()
      },

      getSelectedSegments: () => {
        const { building, selectedSegmentIds } = get()
        if (!building) return []

        return building.roofSegments.filter((s) => selectedSegmentIds.includes(s.id))
      },

      calculateTotals: () => {
        const selectedSegments = get().getSelectedSegments()

        const selectedArea = selectedSegments.reduce((sum, s) => sum + s.area, 0)
        const selectedPotentialKwh = selectedSegments.reduce(
          (sum, s) => sum + s.electricityYield,
          0
        )
        const estimatedPanelCount = selectedSegments.reduce(
          (sum, s) => sum + (s.estimatedPanels || 0),
          0
        )

        set({
          selectedArea: Math.round(selectedArea * 10) / 10,
          selectedPotentialKwh: Math.round(selectedPotentialKwh),
          estimatedPanelCount,
        })
      },

      setSelectedSegmentsData: (segments: RoofSegment[], allBuildingSegments?: RoofSegment[]) => {
        const totalArea = segments.reduce((sum, s) => sum + s.area, 0)
        const totalPotentialKwh = segments.reduce((sum, s) => sum + s.electricityYield, 0)
        const estimatedPanelCount = segments.reduce((sum, s) => sum + (s.estimatedPanels || 0), 0)

        const bestSuitability = segments.length > 0
          ? Math.max(...segments.map((s) => s.suitability.class))
          : 1

        const allSegments = allBuildingSegments && allBuildingSegments.length > 0
          ? allBuildingSegments
          : segments

        set({
          building: {
            buildingId: 0,
            center: { lat: 0, lng: 0, x: 0, y: 0 },
            roofSegments: allSegments,
            totalArea: Math.round(totalArea * 10) / 10,
            totalPotentialKwh: Math.round(totalPotentialKwh),
            suitabilityClass: bestSuitability,
            suitabilityLabel: '',
          },
          selectedSegmentIds: segments.map((s) => s.id),
          selectedArea: Math.round(totalArea * 10) / 10,
          selectedPotentialKwh: Math.round(totalPotentialKwh),
          estimatedPanelCount,
        })
      },

      setRoofProperties: (properties: Partial<RoofProperties>) => {
        const { roofProperties } = get()
        set({ roofProperties: { ...roofProperties, ...properties } })
      },

      addRestrictedArea: (area: RestrictedArea) => {
        const { restrictedAreas } = get()
        set({ restrictedAreas: [...restrictedAreas, area] })
      },

      removeRestrictedArea: (id: string) => {
        const { restrictedAreas } = get()
        set({ restrictedAreas: restrictedAreas.filter((a) => a.id !== id) })
      },

      clearRestrictedAreas: () => {
        set({ restrictedAreas: [] })
      },

      getUsableArea: () => {
        const { selectedArea } = get()
        const effectiveRestricted = get().getEffectiveRestrictedArea()
        return Math.max(0, selectedArea - effectiveRestricted)
      },

      getEffectiveRestrictedArea: () => {
        const { building, selectedSegmentIds, restrictedAreas } = get()
        if (!building || restrictedAreas.length === 0) return 0

        const nonSelectedSegments = building.roofSegments.filter(
          s => !selectedSegmentIds.includes(s.id)
        )

        if (nonSelectedSegments.length === 0) {
          return restrictedAreas.reduce((sum, a) => sum + a.area, 0)
        }

        let effectiveArea = 0

        for (const restricted of restrictedAreas) {
          const restrictedCoords = restricted.coordinates
          if (restrictedCoords.length < 3) continue

          const centerLng = restrictedCoords.reduce((sum, c) => sum + c[0], 0) / restrictedCoords.length
          const centerLat = restrictedCoords.reduce((sum, c) => sum + c[1], 0) / restrictedCoords.length

          let isInsideNonSelected = false
          for (const segment of nonSelectedSegments) {
            const segmentCoords = segment.geometry.coordinatesWGS84?.[0] || []
            if (segmentCoords.length < 3) continue

            let inside = false
            for (let i = 0, j = segmentCoords.length - 1; i < segmentCoords.length; j = i++) {
              const xi = segmentCoords[i][0], yi = segmentCoords[i][1]
              const xj = segmentCoords[j][0], yj = segmentCoords[j][1]
              const intersect = yi > centerLat !== yj > centerLat &&
                centerLng < ((xj - xi) * (centerLat - yi)) / (yj - yi) + xi
              if (intersect) inside = !inside
            }

            if (inside) {
              isInsideNonSelected = true
              break
            }
          }

          if (!isInsideNonSelected) {
            effectiveArea += restricted.area
          }
        }

        return effectiveArea
      },

      getRestrictedAreasInNonSelectedSegments: () => {
        const { building, selectedSegmentIds, restrictedAreas } = get()
        if (!building || restrictedAreas.length === 0) return []

        const nonSelectedSegments = building.roofSegments.filter(
          s => !selectedSegmentIds.includes(s.id)
        )

        if (nonSelectedSegments.length === 0) return []

        const overlappingAreas: RestrictedArea[] = []

        for (const restricted of restrictedAreas) {
          const restrictedCoords = restricted.coordinates
          if (restrictedCoords.length < 3) continue

          const centerLng = restrictedCoords.reduce((sum, c) => sum + c[0], 0) / restrictedCoords.length
          const centerLat = restrictedCoords.reduce((sum, c) => sum + c[1], 0) / restrictedCoords.length

          for (const segment of nonSelectedSegments) {
            const segmentCoords = segment.geometry.coordinatesWGS84?.[0] || []
            if (segmentCoords.length < 3) continue

            let inside = false
            for (let i = 0, j = segmentCoords.length - 1; i < segmentCoords.length; j = i++) {
              const xi = segmentCoords[i][0], yi = segmentCoords[i][1]
              const xj = segmentCoords[j][0], yj = segmentCoords[j][1]
              const intersect = yi > centerLat !== yj > centerLat &&
                centerLng < ((xj - xi) * (centerLat - yi)) / (yj - yi) + xi
              if (intersect) inside = !inside
            }

            if (inside) {
              overlappingAreas.push(restricted)
              break
            }
          }
        }

        return overlappingAreas
      },

      getTotalRestrictedArea: () => {
        const { restrictedAreas } = get()
        return restrictedAreas.reduce((sum, a) => sum + a.area, 0)
      },

      selectPanel: (panel: SolarPanel) => {
        set({ selectedPanel: panel })
      },

      selectInverter: (inverter: Inverter) => {
        set({ selectedInverter: inverter })
      },

      setPanelCount: (count: number) => {
        const { maxPanelCount } = get()
        set({ panelCount: Math.min(count, maxPanelCount) })
      },

      setMaxPanelCount: (count: number) => {
        set({ maxPanelCount: count })
      },

      setConsumption: (data: Partial<ConsumptionData>) => {
        const { consumption } = get()
        set({ consumption: { ...consumption, ...data } })
      },

      setPersonalInfo: (data: Partial<PersonalInfo>) => {
        const { personalInfo } = get()
        set({ personalInfo: { ...personalInfo, ...data } })
      },

      setInstallationAddress: (address: Address) => {
        set({ installationAddress: address })
      },

      setBillingAddress: (address: Address) => {
        set({ billingAddress: address })
      },

      setSameAsInstallation: (same: boolean) => {
        set({ sameAsInstallation: same })
      },

      setPropertyOwnership: (data: Partial<PropertyOwnership>) => {
        const { propertyOwnership } = get()
        set({ propertyOwnership: { ...propertyOwnership, ...data } })
      },

      setConsents: (data: Partial<Consents>) => {
        const { consents } = get()
        set({ consents: { ...consents, ...data } })
      },

      setCompanyDetails: (data: Partial<CompanyDetails>) => set((s) => ({ companyDetails: { ...s.companyDetails, ...data } })),
      setContactDetails: (data: Partial<ContactDetails>) => set((s) => ({ contactDetails: { ...s.contactDetails, ...data } })),
      setProjectIntent: (data: Partial<ProjectIntent>) => set((s) => ({ projectIntent: { ...s.projectIntent, ...data } })),
      setPropertyRelation: (v: CommercialPropertyRelation | '') => set({ propertyRelation: v }),
      setOwnerContact: (data: Partial<{ name: string; email: string; phone: string }>) => set((s) => ({ ownerContact: { ...s.ownerContact, ...data } })),
      setSubmissionResult: (r: SubmissionResult | null) => set({ submissionResult: r }),
      setSubmitting: (v: boolean) => set({ isSubmitting: v }),
      setSubmitError: (e: string | null) => set({ submitError: e }),

      getSystemSizeKwp: () => {
        const { selectedPanel, panelCount } = get()
        if (!selectedPanel) return 0
        return (selectedPanel.power * panelCount) / 1000
      },

      getEstimatedProductionKwh: () => {
        const { selectedPotentialKwh, panelCount, estimatedPanelCount } = get()
        if (!estimatedPanelCount) return selectedPotentialKwh
        return Math.round(selectedPotentialKwh * (panelCount / estimatedPanelCount))
      },

      getTotalInvestment: () => {
        const { selectedPanel, selectedInverter, panelCount } = get()
        if (!selectedPanel || !selectedInverter) return 0
        const panelCost = selectedPanel.price * panelCount
        const inverterCost = selectedInverter.price
        const installationCost = get().getSystemSizeKwp() * 800
        return Math.round(panelCost + inverterCost + installationCost)
      },

      getSubsidies: () => {
        const kWp = get().getSystemSizeKwp()
        const tier1 = Math.min(kWp, 30) * 360
        const tier2 = Math.max(0, Math.min(kWp - 30, 70)) * 300
        return Math.round(tier1 + tier2)
      },

      getNetInvestment: () => {
        return get().getTotalInvestment() - get().getSubsidies()
      },

      getAnnualSavings: () => {
        const { consumption } = get()
        const production = get().getEstimatedProductionKwh()

        let selfConsumptionRate = 0.30
        if (consumption.heatPumpHotWater) selfConsumptionRate += 0.05
        if (consumption.heatPumpHeating) selfConsumptionRate += 0.10
        if (consumption.evChargingStations > 0) selfConsumptionRate += 0.05
        selfConsumptionRate = Math.min(selfConsumptionRate, 0.50)

        const selfConsumed = production * selfConsumptionRate
        const exported = production * (1 - selfConsumptionRate)

        const electricityTariffChf = consumption.electricityTariff / 100
        const feedInTariffChf = consumption.feedInTariff / 100

        const selfConsumptionSavings = selfConsumed * electricityTariffChf
        const exportRevenue = exported * feedInTariffChf

        return Math.round(selfConsumptionSavings + exportRevenue)
      },

      getPaybackYears: () => {
        const netInvestment = get().getNetInvestment()
        const annualSavings = get().getAnnualSavings()
        if (annualSavings <= 0) return 99
        return Math.round((netInvestment / annualSavings) * 10) / 10
      },

      getCo2Savings: () => {
        const production = get().getEstimatedProductionKwh()
        return Math.round(production * 0.3)
      },

      reset: () => {
        set(initialState)
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'commercial-calculator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        address: state.address,
        selectedLocation: state.selectedLocation,
        currentStep: state.currentStep,
        building: state.building,
        selectedSegmentIds: state.selectedSegmentIds,
        roofProperties: state.roofProperties,
        restrictedAreas: state.restrictedAreas,
        selectedPanel: state.selectedPanel,
        selectedInverter: state.selectedInverter,
        panelCount: state.panelCount,
        consumption: state.consumption,
        personalInfo: state.personalInfo,
        installationAddress: state.installationAddress,
        billingAddress: state.billingAddress,
        sameAsInstallation: state.sameAsInstallation,
        propertyOwnership: state.propertyOwnership,
        consents: state.consents,
        companyDetails: state.companyDetails,
        contactDetails: state.contactDetails,
        projectIntent: state.projectIntent,
        propertyRelation: state.propertyRelation,
        ownerContact: state.ownerContact,
        submissionResult: state.submissionResult,
      }),
    }
  )
)

export const useCommercialCalculatorStep = () =>
  useCommercialCalculatorStore((state) => state.currentStep)
export const useCommercialCalculatorBuilding = () =>
  useCommercialCalculatorStore((state) => state.building)
export const useCommercialCalculatorSelectedSegments = () =>
  useCommercialCalculatorStore((state) => state.getSelectedSegments())
export const useCommercialCalculatorError = () =>
  useCommercialCalculatorStore((state) => state.error)
export const useCommercialCalculatorLoading = () =>
  useCommercialCalculatorStore((state) => state.isLoading || state.isFetchingBuilding)
