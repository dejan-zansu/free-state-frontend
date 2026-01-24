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

  // Step 3: Configuration (for future use)
  panelType: string
  installationCostPerKwp: number

  // Results (calculated from selected segments)
  selectedArea: number           // m²
  selectedPotentialKwh: number   // kWh/year
  estimatedPanelCount: number

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

  // Reset
  reset: () => void
  clearError: () => void
}

type SonnendachCalculatorStore = SonnendachCalculatorState & SonnendachCalculatorActions

const initialState: SonnendachCalculatorState = {
  // Navigation
  currentStep: 1,
  totalSteps: 3,

  // Step 1
  address: '',
  selectedLocation: null,
  searchResults: [],
  isSearching: false,

  // Step 2
  building: null,
  selectedSegmentIds: [],
  isFetchingBuilding: false,

  // Step 3
  panelType: 'standard',
  installationCostPerKwp: 2200,

  // Results
  selectedArea: 0,
  selectedPotentialKwh: 0,
  estimatedPanelCount: 0,

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
