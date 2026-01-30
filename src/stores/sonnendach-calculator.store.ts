/**
 * Sonnendach Calculator Store
 * State management for the Swiss solar roof calculator
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { sonnendachService } from '@/services/sonnendach.service'
import type {
  SonnendachLocation,
  SonnendachBuilding,
  RoofSegment,
} from '@/types/sonnendach'

// Equipment types
export interface SolarPanel {
  id: string
  name: string
  power: number        // Watts
  width: number        // meters
  height: number       // meters
  efficiency: number   // percent
  manufacturer: string
  price: number        // CHF
}

export interface Inverter {
  id: string
  name: string
  power: number        // kW
  manufacturer: string
  efficiency: number   // percent
  price: number        // CHF
}

// Roof properties types
export type RoofType = 'flat' | 'low_slope' | 'medium' | 'steep'
export type RoofMaterial = 'bitumen' | 'gravel' | 'green_roof' | 'granulate' | 'tiles' | 'metal' | 'unknown'

export interface RoofProperties {
  roofType: RoofType
  buildingFloors: number
  roofMaterial: RoofMaterial
}

// Property and consumption types
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'agricultural'

// Personal info types (Step 6)
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

// Contract types (Step 7-8)
export type SignatureStatus = 'idle' | 'initiating' | 'otp_sent' | 'verifying' | 'signed' | 'failed'

export interface ContractPreview {
  contractId: string
  contractNumber: string
  grossAmount: number
  subsidyAmount: number
  netAmount: number
  pdfUrl: string
}

export interface PackageOption {
  code: string
  name: string
  price: number
  warrantyYears: number
  features: string[]
  isRecommended?: boolean
}

export interface ConsumptionData {
  // Property Info
  propertyType: PropertyType
  isNewBuilding: boolean
  evChargingStations: number
  heatPumpHotWater: boolean
  heatPumpHeating: boolean
  electricityProvider: string

  // Consumption
  residents: number
  annualElectricityCost: number  // CHF
  annualConsumptionKwh: number   // kWh/year

  // Tariffs
  electricityTariffAuto: boolean
  electricityTariff: number      // Rp/kWh
  feedInTariffAuto: boolean
  feedInTariff: number           // Rp/kWh
}

// Restricted area (exclusion zone)
export interface RestrictedArea {
  id: string
  coordinates: number[][]  // WGS84 [lng, lat] pairs
  area: number             // m²
  label?: string           // e.g., "Skylight", "Chimney", "HVAC"
}

// Calculator state
interface SonnendachCalculatorState {
  // Navigation
  currentStep: number
  totalSteps: number

  // Step 1: Address
  address: string
  selectedLocation: SonnendachLocation | null
  searchResults: SonnendachLocation[]
  isSearching: boolean

  // Step 2: Building & Roof Selection
  building: SonnendachBuilding | null
  selectedSegmentIds: string[]  // IDs of selected roof segments
  isFetchingBuilding: boolean

  // Step 2: Usable Area (Nutzfläche)
  roofProperties: RoofProperties
  restrictedAreas: RestrictedArea[]

  // Step 3: Solar System Configuration
  selectedPanel: SolarPanel | null
  selectedInverter: Inverter | null
  panelCount: number
  maxPanelCount: number

  // Step 4: Consumption & Tariffs
  consumption: ConsumptionData

  // Results (calculated from selected segments)
  selectedArea: number           // m²
  selectedPotentialKwh: number   // kWh/year
  estimatedPanelCount: number

  // Step 6: Personal Info
  personalInfo: PersonalInfo
  installationAddress: Address
  billingAddress: Address
  sameAsInstallation: boolean
  propertyOwnership: PropertyOwnership
  consents: Consents

  // Step 7: Contract Review
  selectedPackageCode: string | null
  contractPreview: ContractPreview | null
  acknowledgments: string[]

  // Step 8: Signature
  signatureStatus: SignatureStatus
  signatureRequestId: string | null
  maskedPhone: string | null
  signatureExpiresAt: Date | null
  signedPdfUrl: string | null

  // Created entities (after submission)
  createdUserId: string | null
  createdProjectId: string | null
  createdContractId: string | null

  // UI State
  isLoading: boolean
  error: string | null
}

// Calculator actions
interface SonnendachCalculatorActions {
  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Step 1: Address
  setAddress: (address: string) => void
  searchAddresses: (query: string) => Promise<void>
  selectLocation: (location: SonnendachLocation) => void
  clearSearchResults: () => void

  // Step 2: Building
  fetchBuildingData: () => Promise<void>
  fetchBuildingDataAtPoint: (x: number, y: number) => Promise<void>
  toggleSegmentSelection: (segmentId: string) => void
  selectAllSegments: () => void
  clearSegmentSelection: () => void
  selectSegmentsByMinSuitability: (minClass: number) => void

  // Utilities
  getSelectedSegments: () => RoofSegment[]
  calculateTotals: () => void

  // Direct segment data (for new flow where segments are selected individually)
  setSelectedSegmentsData: (segments: RoofSegment[], allBuildingSegments?: RoofSegment[]) => void

  // Step 2: Usable Area
  setRoofProperties: (properties: Partial<RoofProperties>) => void
  addRestrictedArea: (area: RestrictedArea) => void
  removeRestrictedArea: (id: string) => void
  clearRestrictedAreas: () => void
  getUsableArea: () => number
  getTotalRestrictedArea: () => number
  getEffectiveRestrictedArea: () => number
  getRestrictedAreasInNonSelectedSegments: () => RestrictedArea[]

  // Step 3: Solar System
  selectPanel: (panel: SolarPanel) => void
  selectInverter: (inverter: Inverter) => void
  setPanelCount: (count: number) => void
  setMaxPanelCount: (count: number) => void

  // Step 4: Consumption
  setConsumption: (data: Partial<ConsumptionData>) => void

  // Step 6: Personal Info
  setPersonalInfo: (data: Partial<PersonalInfo>) => void
  setInstallationAddress: (address: Address) => void
  setBillingAddress: (address: Address) => void
  setSameAsInstallation: (same: boolean) => void
  setPropertyOwnership: (data: Partial<PropertyOwnership>) => void
  setConsents: (data: Partial<Consents>) => void

  // Step 7: Contract Review
  selectPackage: (packageCode: string) => void
  setContractPreview: (preview: ContractPreview | null) => void
  addAcknowledgment: (type: string) => void
  removeAcknowledgment: (type: string) => void
  clearAcknowledgments: () => void

  // Step 8: Signature
  setSignatureStatus: (status: SignatureStatus) => void
  setSignatureRequestData: (data: { requestId: string; maskedPhone: string; expiresAt: Date }) => void
  setSignedPdfUrl: (url: string) => void
  resetSignature: () => void

  // Created entities
  setCreatedEntities: (data: { userId?: string; projectId?: string; contractId?: string }) => void

  // Calculation helpers
  getSystemSizeKwp: () => number
  getEstimatedProductionKwh: () => number
  getTotalInvestment: () => number
  getSubsidies: () => number
  getNetInvestment: () => number
  getAnnualSavings: () => number
  getPaybackYears: () => number
  getCo2Savings: () => number

  // Reset
  reset: () => void
  clearError: () => void
}

type SonnendachCalculatorStore = SonnendachCalculatorState & SonnendachCalculatorActions

const initialState: SonnendachCalculatorState = {
  // Navigation
  currentStep: 1,
  totalSteps: 8,

  // Step 1
  address: '',
  selectedLocation: null,
  searchResults: [],
  isSearching: false,

  // Building & Roof Selection
  building: null,
  selectedSegmentIds: [],
  isFetchingBuilding: false,

  // Step 2: Usable Area
  roofProperties: {
    roofType: 'flat',
    buildingFloors: 1,
    roofMaterial: 'unknown',
  },
  restrictedAreas: [],

  // Step 3: Solar System
  selectedPanel: null,
  selectedInverter: null,
  panelCount: 0,
  maxPanelCount: 0,

  // Step 4: Consumption
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

  // Results
  selectedArea: 0,
  selectedPotentialKwh: 0,
  estimatedPanelCount: 0,

  // Step 6: Personal Info
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

  // Step 7: Contract Review
  selectedPackageCode: null,
  contractPreview: null,
  acknowledgments: [],

  // Step 8: Signature
  signatureStatus: 'idle',
  signatureRequestId: null,
  maskedPhone: null,
  signatureExpiresAt: null,
  signedPdfUrl: null,

  // Created entities
  createdUserId: null,
  createdProjectId: null,
  createdContractId: null,

  // UI
  isLoading: false,
  error: null,
}

export const useSonnendachCalculatorStore = create<SonnendachCalculatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
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

      // Step 1: Address
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
          // Reset building data when location changes
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

      // Step 2: Building
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

          // Auto-select all segments with suitability >= 3 (good, very good, excellent)
          const goodSegmentIds = building.roofSegments
            .filter((s) => s.suitability.class >= 3)
            .map((s) => s.id)

          set({
            building,
            selectedSegmentIds: goodSegmentIds,
            isFetchingBuilding: false,
          })

          // Calculate totals for selected segments
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

      // Utilities
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

      // Direct segment data (for new flow)
      // allBuildingSegments: optional array of ALL segments from the building (for inner segment detection)
      setSelectedSegmentsData: (segments: RoofSegment[], allBuildingSegments?: RoofSegment[]) => {
        // Create a pseudo-building from the selected segments
        const totalArea = segments.reduce((sum, s) => sum + s.area, 0)
        const totalPotentialKwh = segments.reduce((sum, s) => sum + s.electricityYield, 0)
        const estimatedPanelCount = segments.reduce((sum, s) => sum + (s.estimatedPanels || 0), 0)

        // Find best suitability class
        const bestSuitability = segments.length > 0
          ? Math.max(...segments.map((s) => s.suitability.class))
          : 1

        // Use all building segments if provided, otherwise just selected segments
        const allSegments = allBuildingSegments && allBuildingSegments.length > 0
          ? allBuildingSegments
          : segments

        set({
          building: {
            buildingId: 0,
            center: { lat: 0, lng: 0, x: 0, y: 0 },
            roofSegments: allSegments,  // Store ALL segments for inner segment detection
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

      // Step 2: Usable Area
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
        // Use getEffectiveRestrictedArea which accounts for overlaps with non-selected segments
        const effectiveRestricted = get().getEffectiveRestrictedArea()
        return Math.max(0, selectedArea - effectiveRestricted)
      },

      // Calculate effective restricted area, excluding overlaps with non-selected segments
      // This helps handle the case where inner segments exist within outer segments
      getEffectiveRestrictedArea: () => {
        const { building, selectedSegmentIds, restrictedAreas } = get()
        if (!building || restrictedAreas.length === 0) return 0

        // Get non-selected segment polygons
        const nonSelectedSegments = building.roofSegments.filter(
          s => !selectedSegmentIds.includes(s.id)
        )

        if (nonSelectedSegments.length === 0) {
          // No non-selected segments, use full restricted area
          return restrictedAreas.reduce((sum, a) => sum + a.area, 0)
        }

        // For each restricted area, check if its center point is inside a non-selected segment
        // This is a simplified check - a full solution would use polygon intersection (e.g., turf.js)
        let effectiveArea = 0

        for (const restricted of restrictedAreas) {
          const restrictedCoords = restricted.coordinates
          if (restrictedCoords.length < 3) continue

          // Calculate center of restricted area
          const centerLng = restrictedCoords.reduce((sum, c) => sum + c[0], 0) / restrictedCoords.length
          const centerLat = restrictedCoords.reduce((sum, c) => sum + c[1], 0) / restrictedCoords.length

          // Check if center is inside any non-selected segment
          let isInsideNonSelected = false
          for (const segment of nonSelectedSegments) {
            const segmentCoords = segment.geometry.coordinatesWGS84?.[0] || []
            if (segmentCoords.length < 3) continue

            // Point-in-polygon check
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

          // Only count restricted area if it's NOT inside a non-selected segment
          if (!isInsideNonSelected) {
            effectiveArea += restricted.area
          }
        }

        return effectiveArea
      },

      // Get restricted areas that overlap with non-selected segments
      // Useful for showing warnings to the user
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

      // Step 3: Solar System
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

      // Step 4: Consumption
      setConsumption: (data: Partial<ConsumptionData>) => {
        const { consumption } = get()
        set({ consumption: { ...consumption, ...data } })
      },

      // Step 6: Personal Info
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

      // Step 7: Contract Review
      selectPackage: (packageCode: string) => {
        set({ selectedPackageCode: packageCode })
      },

      setContractPreview: (preview: ContractPreview | null) => {
        set({ contractPreview: preview })
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

      clearAcknowledgments: () => {
        set({ acknowledgments: [] })
      },

      // Step 8: Signature
      setSignatureStatus: (status: SignatureStatus) => {
        set({ signatureStatus: status })
      },

      setSignatureRequestData: (data: { requestId: string; maskedPhone: string; expiresAt: Date }) => {
        set({
          signatureRequestId: data.requestId,
          maskedPhone: data.maskedPhone,
          signatureExpiresAt: data.expiresAt,
          signatureStatus: 'otp_sent',
        })
      },

      setSignedPdfUrl: (url: string) => {
        set({ signedPdfUrl: url, signatureStatus: 'signed' })
      },

      resetSignature: () => {
        set({
          signatureStatus: 'idle',
          signatureRequestId: null,
          maskedPhone: null,
          signatureExpiresAt: null,
        })
      },

      // Created entities
      setCreatedEntities: (data: { userId?: string; projectId?: string; contractId?: string }) => {
        set({
          createdUserId: data.userId ?? get().createdUserId,
          createdProjectId: data.projectId ?? get().createdProjectId,
          createdContractId: data.contractId ?? get().createdContractId,
        })
      },

      // Calculation helpers
      getSystemSizeKwp: () => {
        const { selectedPanel, panelCount } = get()
        if (!selectedPanel) return 0
        return (selectedPanel.power * panelCount) / 1000
      },

      getEstimatedProductionKwh: () => {
        const { selectedPotentialKwh, panelCount, estimatedPanelCount } = get()
        if (!estimatedPanelCount) return selectedPotentialKwh
        // Scale production based on actual panel count vs estimated
        return Math.round(selectedPotentialKwh * (panelCount / estimatedPanelCount))
      },

      getTotalInvestment: () => {
        const { selectedPanel, selectedInverter, panelCount } = get()
        if (!selectedPanel || !selectedInverter) return 0
        const panelCost = selectedPanel.price * panelCount
        const inverterCost = selectedInverter.price
        const installationCost = get().getSystemSizeKwp() * 800 // ~800 CHF/kWp installation
        return Math.round(panelCost + inverterCost + installationCost)
      },

      getSubsidies: () => {
        // Swiss federal subsidy: 350 CHF/kWp + 600 CHF base
        const systemSize = get().getSystemSizeKwp()
        return Math.round(600 + systemSize * 350)
      },

      getNetInvestment: () => {
        return get().getTotalInvestment() - get().getSubsidies()
      },

      getAnnualSavings: () => {
        const { consumption } = get()
        const production = get().getEstimatedProductionKwh()

        // Self-consumption rate (30% base + 5% for each heat pump, max 50%)
        let selfConsumptionRate = 0.30
        if (consumption.heatPumpHotWater) selfConsumptionRate += 0.05
        if (consumption.heatPumpHeating) selfConsumptionRate += 0.10
        if (consumption.evChargingStations > 0) selfConsumptionRate += 0.05
        selfConsumptionRate = Math.min(selfConsumptionRate, 0.50)

        const selfConsumed = production * selfConsumptionRate
        const exported = production * (1 - selfConsumptionRate)

        // Convert Rp/kWh to CHF/kWh
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
        // Swiss electricity mix: ~0.3 kg CO2/kWh (including imports)
        const production = get().getEstimatedProductionKwh()
        return Math.round(production * 0.3)
      },

      // Reset
      reset: () => {
        set(initialState)
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'sonnendach-calculator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist these fields
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
        // Step 6-8 fields
        personalInfo: state.personalInfo,
        installationAddress: state.installationAddress,
        billingAddress: state.billingAddress,
        sameAsInstallation: state.sameAsInstallation,
        propertyOwnership: state.propertyOwnership,
        consents: state.consents,
        selectedPackageCode: state.selectedPackageCode,
        acknowledgments: state.acknowledgments,
        contractPreview: state.contractPreview,
        createdContractId: state.createdContractId,
        createdProjectId: state.createdProjectId,
        createdUserId: state.createdUserId,
      }),
    }
  )
)

// Selector hooks for convenience
export const useSonnendachStep = () =>
  useSonnendachCalculatorStore((state) => state.currentStep)
export const useSonnendachBuilding = () =>
  useSonnendachCalculatorStore((state) => state.building)
export const useSonnendachSelectedSegments = () =>
  useSonnendachCalculatorStore((state) => state.getSelectedSegments())
export const useSonnendachError = () =>
  useSonnendachCalculatorStore((state) => state.error)
export const useSonnendachLoading = () =>
  useSonnendachCalculatorStore((state) => state.isLoading || state.isFetchingBuilding)
