import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { findClosestBuilding } from '@/lib/google-solar-api'
import type { BuildingInsightsResponse } from '@/lib/google-solar-api'
import {
  calculatePolygonArea,
  estimatePanelCount,
  estimateEnergyProduction,
} from '@/lib/polygon-utils'

interface CalculatorState {
  // Step 1: Location
  address: string
  latitude: number | null
  longitude: number | null

  // Step 2: Building
  buildingInsights: BuildingInsightsResponse | null
  selectedPanelCount: number
  selectionMode: 'auto' | 'custom' // Auto-detect building or custom polygon
  customPolygon: Array<{ lat: number; lng: number }> | null
  isDrawing: boolean

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
  setLocation: (address: string, lat: number, lng: number) => void

  // Step 2: Fetch building insights
  fetchBuildingInsights: (lat: number, lng: number) => Promise<void>
  calculateCustomPolygonData: (polygon: Array<{ lat: number; lng: number }>) => void
  setPanelCount: (count: number) => void
  setSelectionMode: (mode: 'auto' | 'custom') => void
  setCustomPolygon: (polygon: Array<{ lat: number; lng: number }> | null) => void
  setIsDrawing: (isDrawing: boolean) => void
  clearCustomPolygon: () => void

  // Utilities
  reset: () => void
  clearError: () => void
}

type CalculatorStore = CalculatorState & CalculatorActions

const initialState: CalculatorState = {
  // Step 1
  address: '',
  latitude: null,
  longitude: null,

  // Step 2
  buildingInsights: null,
  selectedPanelCount: 0,
  selectionMode: 'auto',
  customPolygon: null,
  isDrawing: false,

  // UI
  currentStep: 1,
  totalSteps: 2, // For now, just 2 steps
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

      setLocation: (address, lat, lng) => {
        set({
          address,
          latitude: lat,
          longitude: lng,
          // Reset downstream data when location changes
          buildingInsights: null,
          error: null,
        })
      },

      fetchBuildingInsights: async (lat: number, lng: number) => {
        console.log('🔍 fetchBuildingInsights called with:', { lat, lng })
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.error('❌ Google Maps API key not configured')
          set({ error: 'Google Maps API key not configured' })
          return
        }

        console.log('⏳ Setting loading state...')
        set({ isLoading: true, error: null })

        try {
          console.log('📡 Calling Google Solar API...')
          const buildingInsights = await findClosestBuilding(lat, lng, apiKey)
          console.log('✅ Building insights received:', buildingInsights)

          // Set initial panel count to maximum available
          const maxPanels = buildingInsights.solarPotential.maxArrayPanelsCount
          console.log('📊 Max panels:', maxPanels)

          set({
            buildingInsights,
            selectedPanelCount: maxPanels,
            isLoading: false,
          })
          console.log('✅ Store updated with building insights')
        } catch (err) {
          console.error('❌ Error fetching building insights:', err)
          const error = err as { error?: { message?: string } }
          const errorMessage =
            error?.error?.message || 'Failed to fetch building data. Please try clicking on a building roof.'
          set({
            error: errorMessage,
            isLoading: false,
          })
        }
      },

      calculateCustomPolygonData: (polygon: Array<{ lat: number; lng: number }>) => {
        console.log('📐 calculateCustomPolygonData called with polygon:', polygon)
        try {
          // Calculate polygon area
          const areaM2 = calculatePolygonArea(polygon)
          console.log('📏 Calculated area (m²):', areaM2)

          // Estimate panel count based on area
          const estimatedPanelCount = estimatePanelCount(areaM2)
          console.log('🔢 Estimated panel count:', estimatedPanelCount)

          // Estimate energy production
          const estimatedEnergyKwh = estimateEnergyProduction(estimatedPanelCount)
          console.log('⚡ Estimated energy production (kWh):', estimatedEnergyKwh)

          // Create a mock BuildingInsightsResponse for custom polygon
          // This allows us to reuse the existing UI components
          const mockBuildingInsights: BuildingInsightsResponse = {
            name: 'Custom Area',
            center: {
              latitude: polygon[0].lat,
              longitude: polygon[0].lng,
            },
            boundingBox: {
              sw: {
                latitude: Math.min(...polygon.map((p) => p.lat)),
                longitude: Math.min(...polygon.map((p) => p.lng)),
              },
              ne: {
                latitude: Math.max(...polygon.map((p) => p.lat)),
                longitude: Math.max(...polygon.map((p) => p.lng)),
              },
            },
            imageryDate: { year: 2024, month: 1, day: 1 },
            imageryProcessedDate: { year: 2024, month: 1, day: 1 },
            postalCode: '',
            administrativeArea: '',
            statisticalArea: '',
            regionCode: 'CH',
            imageryQuality: 'BASE',
            solarPotential: {
              maxArrayPanelsCount: estimatedPanelCount,
              panelCapacityWatts: 400,
              panelHeightMeters: 1.0,
              panelWidthMeters: 1.7,
              panelLifetimeYears: 25,
              maxArrayAreaMeters2: areaM2,
              maxSunshineHoursPerYear: 1500, // Average for Central Europe
              carbonOffsetFactorKgPerMwh: 400,
              wholeRoofStats: {
                areaMeters2: areaM2,
                sunshineQuantiles: [],
                groundAreaMeters2: areaM2,
              },
              buildingStats: {
                areaMeters2: areaM2,
                sunshineQuantiles: [],
                groundAreaMeters2: areaM2,
              },
              roofSegmentStats: [],
              solarPanels: [],
              solarPanelConfigs: [
                {
                  panelsCount: estimatedPanelCount,
                  yearlyEnergyDcKwh: estimatedEnergyKwh,
                  roofSegmentSummaries: [],
                },
              ],
            },
          }

          console.log('✅ Mock building insights created:', mockBuildingInsights)
          set({
            buildingInsights: mockBuildingInsights,
            selectedPanelCount: estimatedPanelCount,
          })
          console.log('✅ Store updated with custom polygon data')
        } catch (error) {
          console.error('❌ Error calculating polygon data:', error)
          set({
            error: 'Failed to calculate solar potential for custom area',
          })
        }
      },

      setPanelCount: (count: number) => {
        set({ selectedPanelCount: count })
      },

      setSelectionMode: (mode: 'auto' | 'custom') => {
        set({
          selectionMode: mode,
          // Clear data when switching modes
          buildingInsights: null,
          customPolygon: null,
          isDrawing: false,
          error: null,
        })
      },

      setCustomPolygon: (polygon: Array<{ lat: number; lng: number }> | null) => {
        set({ customPolygon: polygon })
      },

      setIsDrawing: (isDrawing: boolean) => {
        set({ isDrawing })
      },

      clearCustomPolygon: () => {
        set({
          customPolygon: null,
        })
      },

      reset: () => {
        set(initialState)
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'solar-calculator-v2',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist these fields
        address: state.address,
        latitude: state.latitude,
        longitude: state.longitude,
        currentStep: state.currentStep,
        selectedPanelCount: state.selectedPanelCount,
        selectionMode: state.selectionMode,
        customPolygon: state.customPolygon,
      }),
    }
  )
)

// Selector hooks for convenience
export const useCalculatorStep = () => useCalculatorStore((state) => state.currentStep)
export const useCalculatorLoading = () => useCalculatorStore((state) => state.isLoading)
export const useCalculatorError = () => useCalculatorStore((state) => state.error)
export const useBuildingInsights = () => useCalculatorStore((state) => state.buildingInsights)
