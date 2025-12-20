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
  isDrawingMode: boolean
  customRoofPolygon: Array<{ lat: number; lng: number }> | null

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
  addBuildingFromClick: (lat: number, lng: number) => Promise<void>
  clearNearbyBuildings: () => void
  toggleRoofSegment: (segmentIndex: number) => void
  selectAllRoofSegments: () => void
  clearRoofSegments: () => void
  setDrawingMode: (enabled: boolean) => void
  setCustomRoofPolygon: (polygon: Array<{ lat: number; lng: number }> | null) => void
  clearCustomPolygon: () => void

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
  isDrawingMode: false,
  customRoofPolygon: null,

  // Step 3
  panelCount: 0,
  panelCapacityWatts: 400,
  selectedConfigIndex: 0,
  showPanels: false, // Start with panels hidden - user must select building first

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
            nearbyBuildings: [buildingInsights], // Add initial building to nearby buildings
            selectedBuildingId: getBuildingId(buildingInsights), // Mark it as selected
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
          // Create a GRID of points to fetch - this will cover much more area
          // Grid: 7x7 = 49 points, spacing 25m apart = covers ~150m x 150m area
          const gridSize = 7 // 7x7 grid (more coverage)
          const spacing = 25 // meters between grid points

          if (typeof google === 'undefined' || !google.maps?.geometry) {
            throw new Error('Google Maps not loaded')
          }

          const coordinatesToFetch: Array<{ lat: number; lng: number }> = []
          const center = new google.maps.LatLng(latitude, longitude)

          // Generate grid points
          for (let x = -(gridSize - 1) / 2; x <= (gridSize - 1) / 2; x++) {
            for (let y = -(gridSize - 1) / 2; y <= (gridSize - 1) / 2; y++) {
              // Calculate offset in meters
              const offsetNorth = y * spacing
              const offsetEast = x * spacing

              // First offset north/south
              let point = google.maps.geometry.spherical.computeOffset(center, Math.abs(offsetNorth), offsetNorth >= 0 ? 0 : 180)
              // Then offset east/west
              point = google.maps.geometry.spherical.computeOffset(point, Math.abs(offsetEast), offsetEast >= 0 ? 90 : 270)

              coordinatesToFetch.push({ lat: point.lat(), lng: point.lng() })
            }
          }

          // Also include the 8 compass directions at 50m for edge coverage
          const bearings = [0, 45, 90, 135, 180, 225, 270, 315]
          bearings.forEach((bearing) => {
            const offset = google.maps.geometry.spherical.computeOffset(center, 50, bearing)
            coordinatesToFetch.push({ lat: offset.lat(), lng: offset.lng() })
          })

          console.log(`Fetching ${coordinatesToFetch.length} building locations...`)

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
          console.log(`✅ Successfully fetched ${validBuildings.length} out of ${coordinatesToFetch.length} buildings`)

          const uniqueBuildings = deduplicateBuildings([buildingInsights, ...validBuildings])
          console.log(`📍 After deduplication: ${uniqueBuildings.length} unique buildings`)

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
            showPanels: true, // Show panels when user selects a building
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

      addBuildingFromClick: async (lat: number, lng: number) => {
        set({ isLoading: true, error: null })

        try {
          const newBuilding = await solarService.getBuildingInsights(lat, lng)
          const buildingId = getBuildingId(newBuilding)
          const { nearbyBuildings } = get()

          // Check if building already exists
          const exists = nearbyBuildings.some((b) => getBuildingId(b) === buildingId)

          if (!exists) {
            set({
              nearbyBuildings: [...nearbyBuildings, newBuilding],
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }

          // Select the building (whether new or existing)
          get().selectBuilding(buildingId)
        } catch {
          set({
            isLoading: false,
            error: 'No building found at this location. Try clicking on a visible roof.',
          })
          // Clear error after 3 seconds
          setTimeout(() => set({ error: null }), 3000)
        }
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

      setDrawingMode: (enabled: boolean) => {
        set({
          isDrawingMode: enabled,
          // Clear roof segments when entering drawing mode
          selectedRoofSegments: enabled ? [] : get().selectedRoofSegments,
        })
      },

      setCustomRoofPolygon: (polygon: Array<{ lat: number; lng: number }> | null) => {
        set({
          customRoofPolygon: polygon,
          calculation: null,
        })
      },

      clearCustomPolygon: () => {
        set({
          customRoofPolygon: null,
          isDrawingMode: false,
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

