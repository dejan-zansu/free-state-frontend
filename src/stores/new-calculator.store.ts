import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { findClosestBuilding } from '@/lib/google-solar-api'
import type { BuildingInsightsResponse } from '@/lib/google-solar-api'
import { calculatePolygonArea } from '@/lib/polygon-utils'

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

      calculateCustomPolygonData: async (polygon: Array<{ lat: number; lng: number }>) => {
        console.log('📐 calculateCustomPolygonData called with polygon:', polygon)
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.error('❌ Google Maps API key not configured')
          set({ error: 'Google Maps API key not configured' })
          return
        }

        set({ isLoading: true, error: null })

        try {
          // Calculate polygon area
          const areaM2 = calculatePolygonArea(polygon)
          console.log('📏 Calculated area (m²):', areaM2)

          // Calculate polygon centroid (center point)
          const centerLat = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length
          const centerLng = polygon.reduce((sum, p) => sum + p.lng, 0) / polygon.length
          console.log('📍 Polygon center:', { lat: centerLat, lng: centerLng })

          // Calculate bounding box
          const minLat = Math.min(...polygon.map((p) => p.lat))
          const maxLat = Math.max(...polygon.map((p) => p.lat))
          const minLng = Math.min(...polygon.map((p) => p.lng))
          const maxLng = Math.max(...polygon.map((p) => p.lng))

          // Calculate radius to furthest polygon point from center (in meters)
          // We need this for the Data Layers API request
          let maxDistanceMeters = 0
          for (const point of polygon) {
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(centerLat, centerLng),
              new google.maps.LatLng(point.lat, point.lng)
            )
            if (distance > maxDistanceMeters) {
              maxDistanceMeters = distance
            }
          }
          // Add 20% buffer to ensure we cover the entire polygon
          const radiusMeters = Math.ceil(maxDistanceMeters * 1.2)
          console.log('📏 Calculated radius:', radiusMeters, 'meters')

          // Fetch GeoTIFF data from Google Solar API
          console.log('📡 Fetching GeoTIFF data from Google Solar API...')
          const { getDataLayers } = await import('@/lib/google-solar-api')
          const dataLayers = await getDataLayers(centerLat, centerLng, radiusMeters, apiKey)
          console.log('✅ Data layers received:', dataLayers)

          // Fetch and parse the annual flux GeoTIFF
          console.log('📥 Fetching annual flux GeoTIFF from:', dataLayers.annualFluxUrl)
          const { fetchGeoTiff, pixelToLatLng, getPixelValue } = await import('@/lib/geotiff')
          const fluxGeoTiff = await fetchGeoTiff(dataLayers.annualFluxUrl)
          console.log('✅ GeoTIFF loaded:', {
            width: fluxGeoTiff.width,
            height: fluxGeoTiff.height,
            bounds: fluxGeoTiff.bounds,
          })

          // Helper function to check if a point is inside the polygon using ray casting algorithm
          function isPointInPolygon(lat: number, lng: number): boolean {
            let inside = false
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
              const xi = polygon[i].lng
              const yi = polygon[i].lat
              const xj = polygon[j].lng
              const yj = polygon[j].lat

              const intersect =
                yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

              if (intersect) inside = !inside
            }
            return inside
          }

          // Scan the GeoTIFF and collect flux data for pixels inside the polygon
          console.log('🔍 Scanning GeoTIFF pixels inside polygon...')
          const pixelsInPolygon: Array<{
            x: number
            y: number
            lat: number
            lng: number
            flux: number
          }> = []

          for (let y = 0; y < fluxGeoTiff.height; y++) {
            for (let x = 0; x < fluxGeoTiff.width; x++) {
              const { lat, lng } = pixelToLatLng(x, y, fluxGeoTiff)

              // Check if this pixel is inside the custom polygon
              if (isPointInPolygon(lat, lng)) {
                const flux = getPixelValue(x, y, fluxGeoTiff, 0)
                if (flux > 0) {
                  // Only include pixels with solar flux data
                  pixelsInPolygon.push({ x, y, lat, lng, flux })
                }
              }
            }
          }

          console.log(`✅ Found ${pixelsInPolygon.length} pixels with solar data inside polygon`)

          if (pixelsInPolygon.length === 0) {
            throw new Error('No solar data found for the selected area. Please try a different location.')
          }

          // Calculate total annual energy from flux data
          // Flux is in kWh/kW/year (annual irradiance)
          const totalFlux = pixelsInPolygon.reduce((sum, p) => sum + p.flux, 0)
          const avgFlux = totalFlux / pixelsInPolygon.length
          console.log('☀️ Average solar flux:', avgFlux.toFixed(2), 'kWh/kW/year')

          // Estimate panel count based on area
          // Standard panel: 400W, 1.7m x 1.0m = 1.7m²
          // Account for spacing, orientation, obstructions: use 60% of available area
          const panelAreaM2 = 1.7
          const usableArea = areaM2 * 0.6
          const maxPanelCount = Math.floor(usableArea / panelAreaM2)
          console.log('🔢 Estimated max panel count:', maxPanelCount)

          // Generate solar panel positions based on real flux data
          // Place panels at the locations with highest solar flux
          console.log('🔆 Generating panel positions from real flux data...')

          // Sort pixels by flux (highest first)
          const sortedPixels = [...pixelsInPolygon].sort((a, b) => b.flux - a.flux)

          // Panel standard specs (from Google Solar API)
          const panelCapacityWatts = 400
          const panelHeightMeters = 1.0
          const panelWidthMeters = 1.7

          // Calculate panel spacing in lat/lng degrees
          // This is approximate but good enough for visualization
          const metersPerDegreeLatitude = 111320 // ~111km per degree at equator
          const metersPerDegreeLongitude =
            111320 * Math.cos((centerLat * Math.PI) / 180)
          const panelSpacingLat = panelWidthMeters / metersPerDegreeLatitude
          const panelSpacingLng = panelWidthMeters / metersPerDegreeLongitude

          // Place panels at high-flux locations, ensuring no overlap
          const panels: Array<{
            center: { latitude: number; longitude: number }
            orientation: 'LANDSCAPE' | 'PORTRAIT'
            segmentIndex: number
            yearlyEnergyDcKwh: number
          }> = []

          const placedPositions = new Set<string>()

          for (const pixel of sortedPixels) {
            if (panels.length >= maxPanelCount) break

            // Round position to grid to avoid overlap
            const gridLat = Math.round(pixel.lat / panelSpacingLat) * panelSpacingLat
            const gridLng = Math.round(pixel.lng / panelSpacingLng) * panelSpacingLng
            const posKey = `${gridLat.toFixed(6)},${gridLng.toFixed(6)}`

            if (placedPositions.has(posKey)) continue

            // Calculate energy for this panel
            // yearlyEnergyDcKwh = panelCapacity (kW) * flux (kWh/kW/year)
            const panelCapacityKw = panelCapacityWatts / 1000
            const yearlyEnergyDcKwh = panelCapacityKw * pixel.flux

            panels.push({
              center: {
                latitude: gridLat,
                longitude: gridLng,
              },
              orientation: 'LANDSCAPE',
              segmentIndex: 0,
              yearlyEnergyDcKwh,
            })

            placedPositions.add(posKey)
          }

          console.log(`✅ Placed ${panels.length} solar panels based on real flux data`)

          // Calculate total energy production
          const totalEnergyKwh = panels.reduce((sum, p) => sum + p.yearlyEnergyDcKwh, 0)
          console.log('⚡ Total annual energy production:', totalEnergyKwh.toFixed(2), 'kWh')

          // Calculate roof orientation (azimuth) based on polygon geometry
          // Find the longest edge to determine the primary roof direction
          let maxEdgeLength = 0
          let azimuthDegrees = 180 // Default to south-facing

          for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i]
            const p2 = polygon[(i + 1) % polygon.length]

            // Calculate edge length and bearing
            const dLat = p2.lat - p1.lat
            const dLng = p2.lng - p1.lng
            const edgeLength = Math.sqrt(dLat * dLat + dLng * dLng)

            if (edgeLength > maxEdgeLength) {
              maxEdgeLength = edgeLength
              // Calculate bearing (azimuth) of this edge
              // Convert to degrees (0 = North, 90 = East, 180 = South, 270 = West)
              const bearing = Math.atan2(dLng, dLat) * (180 / Math.PI)
              azimuthDegrees = (bearing + 360) % 360
            }
          }

          console.log('📐 Calculated roof azimuth:', azimuthDegrees, 'degrees')

          // Create BuildingInsightsResponse with REAL data from GeoTIFF
          const buildingInsights: BuildingInsightsResponse = {
            name: 'Custom Area',
            center: {
              latitude: centerLat,
              longitude: centerLng,
            },
            boundingBox: {
              sw: {
                latitude: minLat,
                longitude: minLng,
              },
              ne: {
                latitude: maxLat,
                longitude: maxLng,
              },
            },
            imageryDate: dataLayers.imageryDate,
            imageryProcessedDate: dataLayers.imageryProcessedDate,
            postalCode: '',
            administrativeArea: '',
            statisticalArea: '',
            regionCode: 'CH',
            imageryQuality: dataLayers.imageryQuality,
            solarPotential: {
              maxArrayPanelsCount: panels.length,
              panelCapacityWatts,
              panelHeightMeters,
              panelWidthMeters,
              panelLifetimeYears: 25,
              maxArrayAreaMeters2: areaM2,
              maxSunshineHoursPerYear: avgFlux,
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
              roofSegmentStats: [
                {
                  pitchDegrees: 0, // We don't have pitch data from custom polygon
                  azimuthDegrees,
                  stats: {
                    areaMeters2: areaM2,
                    sunshineQuantiles: [],
                    groundAreaMeters2: areaM2,
                  },
                  center: {
                    latitude: centerLat,
                    longitude: centerLng,
                  },
                  boundingBox: {
                    sw: { latitude: minLat, longitude: minLng },
                    ne: { latitude: maxLat, longitude: maxLng },
                  },
                  planeHeightAtCenterMeters: 0,
                },
              ],
              solarPanels: panels,
              solarPanelConfigs: [
                {
                  panelsCount: panels.length,
                  yearlyEnergyDcKwh: totalEnergyKwh,
                  roofSegmentSummaries: [
                    {
                      pitchDegrees: 0,
                      azimuthDegrees,
                      panelsCount: panels.length,
                      yearlyEnergyDcKwh: totalEnergyKwh,
                      segmentIndex: 0,
                    },
                  ],
                },
              ],
            },
          }

          console.log('✅ Building insights created from real GeoTIFF data:', buildingInsights)
          set({
            buildingInsights,
            selectedPanelCount: panels.length,
            isLoading: false,
          })
          console.log('✅ Store updated with real solar data')
        } catch (error) {
          console.error('❌ Error calculating polygon data:', error)
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to calculate solar potential for custom area'
          set({
            error: errorMessage,
            isLoading: false,
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
