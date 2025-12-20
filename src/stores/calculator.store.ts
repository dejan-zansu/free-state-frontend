import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { solarService } from '@/services/solar.service'
import { getBuildingId, deduplicateBuildings } from '@/lib/utils'
import type {
  BuildingInsightsResponse,
  DataLayersResponse,
  SolarCalculationResult,
} from '@/types/solar'

interface CalculatorState {
  // Step 1: Location
  address: string
  latitude: number | null
  longitude: number | null
  postalCode: string
  administrativeArea: string

  // Step 2: Building Insights
  buildingInsights: BuildingInsightsResponse | null
  dataLayers: DataLayersResponse | null
  nearbyBuildings: BuildingInsightsResponse[]
  selectedBuildingId: string | null
  isFetchingNearby: boolean
  nearbyFetchError: string | null
  selectedRoofSegments: number[] // Array of segment indices

  // Step 3: Configuration
  panelCount: number
  panelCapacityWatts: number
  selectedConfigIndex: number
  showPanels: boolean

  // Step 4: Energy Profile
  annualConsumptionKwh: number
  purchaseRateRp: number
  feedInRateRp: number
  electricitySupplier: string

  // Results
  calculation: SolarCalculationResult | null

  // UI State
  currentStep: number
  totalSteps: number
  isLoading: boolean
  error: string | null
}

interface CalculatorActions {
  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Step 1: Set location
  setLocation: (
    address: string,
    lat: number,
    lng: number,
    postalCode?: string,
    administrativeArea?: string
  ) => void

  // Step 2: Fetch building insights
  fetchBuildingInsights: () => Promise<void>
  fetchDataLayers: () => Promise<void>
  fetchNearbyBuildings: () => Promise<void>
  selectBuilding: (buildingId: string) => void
  clearNearbyBuildings: () => void
  toggleRoofSegment: (segmentIndex: number) => void
  selectAllRoofSegments: () => void
  clearRoofSegments: () => void

  // Step 3: Configuration
  setPanelCount: (count: number) => void
  setPanelCapacityWatts: (watts: number) => void
  setSelectedConfigIndex: (index: number) => void
  setShowPanels: (show: boolean) => void

  // Step 4: Energy profile
  setAnnualConsumptionKwh: (kwh: number) => void
  setPurchaseRateRp: (rate: number) => void
  setFeedInRateRp: (rate: number) => void
  setElectricitySupplier: (supplier: string) => void

  // Calculate
  calculateSolarPotential: () => Promise<void>

  // Reset
  reset: () => void
  clearError: () => void
}

type CalculatorStore = CalculatorState & CalculatorActions

const initialState: CalculatorState = {
  // Step 1
  address: '',
  latitude: null,
  longitude: null,
  postalCode: '',
  administrativeArea: '',

  // Step 2
  buildingInsights: null,
  dataLayers: null,
  nearbyBuildings: [],
  selectedBuildingId: null,
  isFetchingNearby: false,
  nearbyFetchError: null,
  selectedRoofSegments: [],

  // Step 3
  panelCount: 0,
  panelCapacityWatts: 400,
  selectedConfigIndex: 0,
  showPanels: true,

  // Step 4
  annualConsumptionKwh: 4500, // Average Swiss household
  purchaseRateRp: 25, // Rappen per kWh
  feedInRateRp: 12, // Rappen per kWh
  electricitySupplier: 'Standard',

  // Results
  calculation: null,

  // UI
  currentStep: 1,
  totalSteps: 4,
  isLoading: false,
  error: null,
}

export const useCalculatorStore = create<CalculatorStore>()(
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

      setLocation: (address, lat, lng, postalCode = '', administrativeArea = '') => {
        set({
          address,
          latitude: lat,
          longitude: lng,
          postalCode,
          administrativeArea,
          // Reset downstream data when location changes
          buildingInsights: null,
          dataLayers: null,
          calculation: null,
          error: null,
        })
      },

      fetchBuildingInsights: async () => {
        const { latitude, longitude } = get()
        if (!latitude || !longitude) {
          set({ error: 'Location not set' })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const buildingInsights = await solarService.getBuildingInsights(latitude, longitude)

          // Set initial panel count to optimal or max
          const maxPanels = buildingInsights.solarPotential.maxArrayPanelsCount
          const optimalIndex = Math.min(
            Math.floor(buildingInsights.solarPotential.solarPanelConfigs.length * 0.7),
            buildingInsights.solarPotential.solarPanelConfigs.length - 1
          )
          const optimalPanelCount =
            buildingInsights.solarPotential.solarPanelConfigs[optimalIndex]?.panelsCount ||
            maxPanels

          set({
            buildingInsights,
            panelCount: optimalPanelCount,
            selectedConfigIndex: optimalIndex,
            postalCode: buildingInsights.postalCode || get().postalCode,
            administrativeArea: buildingInsights.administrativeArea || get().administrativeArea,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch building data',
            isLoading: false,
          })
        }
      },

      fetchDataLayers: async () => {
        const { latitude, longitude } = get()
        if (!latitude || !longitude) return

        try {
          const dataLayers = await solarService.getDataLayers(latitude, longitude, 50)
          set({ dataLayers })
        } catch (error) {
          console.error('Failed to fetch data layers:', error)
          // Non-critical error, don't set error state
        }
      },

      fetchNearbyBuildings: async () => {
        const { latitude, longitude, buildingInsights } = get()
        if (!latitude || !longitude || !buildingInsights) {
          console.warn('Cannot fetch nearby buildings: missing location or building insights')
          return
        }

        set({ isFetchingNearby: true, nearbyFetchError: null })

        try {
          const radiusMeters = 50
          const bearings = [0, 45, 90, 135, 180, 225, 270, 315] // 8 directions (N, NE, E, SE, S, SW, W, NW)

          // Generate coordinates to fetch using Google Maps geometry
          // Note: This requires google.maps to be loaded
          if (typeof google === 'undefined' || !google.maps?.geometry) {
            throw new Error('Google Maps not loaded')
          }

          const coordinatesToFetch = bearings.map((bearing) => {
            const offset = google.maps.geometry.spherical.computeOffset(
              new google.maps.LatLng(latitude, longitude),
              radiusMeters,
              bearing
            )
            return { lat: offset.lat(), lng: offset.lng() }
          })

          // Fetch all buildings in parallel
          const fetchPromises = coordinatesToFetch.map((coord) =>
            solarService
              .getBuildingInsights(coord.lat, coord.lng)
              .catch((err) => {
                console.warn(`Failed to fetch building at ${coord.lat}, ${coord.lng}:`, err)
                return null // Don't fail entire operation
              })
          )

          const results = await Promise.all(fetchPromises)

          // Filter out nulls and deduplicate
          const validBuildings = results.filter((b) => b !== null) as BuildingInsightsResponse[]
          const uniqueBuildings = deduplicateBuildings([buildingInsights, ...validBuildings])

          set({
            nearbyBuildings: uniqueBuildings,
            selectedBuildingId: getBuildingId(buildingInsights),
            isFetchingNearby: false,
          })
        } catch (error) {
          set({
            nearbyFetchError:
              error instanceof Error ? error.message : 'Failed to fetch nearby buildings',
            isFetchingNearby: false,
            nearbyBuildings: buildingInsights ? [buildingInsights] : [], // Fallback to just main building
            selectedBuildingId: buildingInsights ? getBuildingId(buildingInsights) : null,
          })
        }
      },

      selectBuilding: (buildingId: string) => {
        const { nearbyBuildings } = get()
        const selectedBuilding = nearbyBuildings.find((b) => getBuildingId(b) === buildingId)

        if (selectedBuilding) {
          // Update building insights to the selected building
          const maxPanels = selectedBuilding.solarPotential.maxArrayPanelsCount
          const optimalIndex = Math.min(
            Math.floor(selectedBuilding.solarPotential.solarPanelConfigs.length * 0.7),
            selectedBuilding.solarPotential.solarPanelConfigs.length - 1
          )
          const optimalPanelCount =
            selectedBuilding.solarPotential.solarPanelConfigs[optimalIndex]?.panelsCount ||
            maxPanels

          set({
            selectedBuildingId: buildingId,
            buildingInsights: selectedBuilding,
            panelCount: optimalPanelCount,
            selectedConfigIndex: optimalIndex,
            calculation: null, // Reset calculation when building changes
          })
        }
      },

      clearNearbyBuildings: () => {
        set({
          nearbyBuildings: [],
          selectedBuildingId: null,
          isFetchingNearby: false,
          nearbyFetchError: null,
        })
      },

      toggleRoofSegment: (segmentIndex: number) => {
        const { selectedRoofSegments } = get()
        const isSelected = selectedRoofSegments.includes(segmentIndex)

        if (isSelected) {
          // Remove segment
          set({
            selectedRoofSegments: selectedRoofSegments.filter((idx) => idx !== segmentIndex),
            calculation: null, // Reset calculation when segments change
          })
        } else {
          // Add segment
          set({
            selectedRoofSegments: [...selectedRoofSegments, segmentIndex],
            calculation: null,
          })
        }
      },

      selectAllRoofSegments: () => {
        const { buildingInsights } = get()
        if (!buildingInsights) return

        const allSegmentIndices = buildingInsights.solarPotential.roofSegmentStats.map((_, idx) => idx)
        set({
          selectedRoofSegments: allSegmentIndices,
          calculation: null,
        })
      },

      clearRoofSegments: () => {
        set({
          selectedRoofSegments: [],
          calculation: null,
        })
      },

      setPanelCount: (count: number) => {
        const { buildingInsights } = get()
        if (!buildingInsights) return

        // Find closest config index
        const configs = buildingInsights.solarPotential.solarPanelConfigs
        const configIndex = configs.findIndex((c) => c.panelsCount >= count)
        const finalIndex = configIndex >= 0 ? configIndex : configs.length - 1

        set({
          panelCount: count,
          selectedConfigIndex: finalIndex,
          calculation: null, // Reset calculation when config changes
        })
      },

      setPanelCapacityWatts: (watts: number) => {
        set({ panelCapacityWatts: watts, calculation: null })
      },

      setSelectedConfigIndex: (index: number) => {
        const { buildingInsights } = get()
        if (!buildingInsights) return

        const config = buildingInsights.solarPotential.solarPanelConfigs[index]
        if (config) {
          set({
            selectedConfigIndex: index,
            panelCount: config.panelsCount,
            calculation: null,
          })
        }
      },

      setShowPanels: (show: boolean) => {
        set({ showPanels: show })
      },

      setAnnualConsumptionKwh: (kwh: number) => {
        set({ annualConsumptionKwh: kwh, calculation: null })
      },

      setPurchaseRateRp: (rate: number) => {
        set({ purchaseRateRp: rate, calculation: null })
      },

      setFeedInRateRp: (rate: number) => {
        set({ feedInRateRp: rate, calculation: null })
      },

      setElectricitySupplier: (supplier: string) => {
        set({ electricitySupplier: supplier })
      },

      calculateSolarPotential: async () => {
        const {
          latitude,
          longitude,
          panelCount,
          panelCapacityWatts,
          annualConsumptionKwh,
          purchaseRateRp,
          feedInRateRp,
        } = get()

        if (!latitude || !longitude) {
          set({ error: 'Location not set' })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const result = await solarService.calculate({
            latitude,
            longitude,
            panelCount,
            panelCapacityWatts,
            annualConsumptionKwh,
            purchaseRateRp,
            feedInRateRp,
          })

          set({
            buildingInsights: result.buildingInsights,
            calculation: result.calculation,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to calculate solar potential',
            isLoading: false,
          })
        }
      },

      reset: () => {
        set(initialState)
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'solar-calculator',
      storage: createJSONStorage(() => sessionStorage), // Use session storage for calculator
      partialize: (state) => ({
        // Only persist these fields
        address: state.address,
        latitude: state.latitude,
        longitude: state.longitude,
        panelCount: state.panelCount,
        panelCapacityWatts: state.panelCapacityWatts,
        annualConsumptionKwh: state.annualConsumptionKwh,
        purchaseRateRp: state.purchaseRateRp,
        feedInRateRp: state.feedInRateRp,
        currentStep: state.currentStep,
        nearbyBuildings: state.nearbyBuildings,
        selectedBuildingId: state.selectedBuildingId,
      }),
    }
  )
)

// Selector hooks
export const useCalculatorStep = () => useCalculatorStore((state) => state.currentStep)
export const useCalculatorLoading = () => useCalculatorStore((state) => state.isLoading)
export const useCalculatorError = () => useCalculatorStore((state) => state.error)
export const useBuildingInsights = () => useCalculatorStore((state) => state.buildingInsights)
export const useCalculation = () => useCalculatorStore((state) => state.calculation)

