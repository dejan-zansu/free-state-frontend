import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface RoofPolygon {
  coordinates: Array<{ lat: number; lng: number }>
  area: number // in m²
}

export interface BuildingDetails {
  roofType: 'flat' | 'gable' | 'hip' | 'shed'
  buildingHeight: number // in meters
  floors?: number
  roofPitch?: number // degrees for sloped roofs
}

export interface SolarPanel {
  id: string
  name: string
  power: number // Watts
  width: number // meters
  height: number // meters
  efficiency: number // percentage
  manufacturer: string
  price: number // CHF
}

export interface PanelPlacementConfig {
  orientation: number // degrees (azimuth: 0=north, 90=east, 180=south, 270=west)
  tilt: number // degrees
  ridgeDistance: number // meters
  gableEndDistance: number // meters
  eavesDistance: number // meters
  obstacleClearance: number // meters
  moduleOrientation: 'horizontal' | 'vertical'
  moduleRotation: number // degrees
}

export interface Inverter {
  id: string
  name: string
  power: number // kW
  manufacturer: string
  efficiency: number // percentage
  price: number // CHF
}

export interface AdditionalParams {
  vatPayable: boolean
  chargingStation: boolean
  hotWaterHeatPump: boolean
  heatingHeatPump: boolean
  electricitySupplier: string
  electricityConsumption: number // kWh/year
  electricityTariff: number // CHF/kWh (0 for automatic)
  feedInTariff: number // CHF/kWh (0 for automatic)
}

export interface PVGISResult {
  yearlyProduction: number // kWh
  monthlyProduction: number[] // kWh per month
  dailyAverage: number // kWh
  peakSunHours: number // hours
  systemLoss: number // percentage
  co2Reduction: number // kg/year
}

export interface HorizonDataPoint {
  A: number // Azimuth angle (degrees, 0=North)
  H_hor: number // Horizon height (degrees above horizontal)
}

interface PVGISCalculatorState {
  // Navigation
  currentStep: number
  totalSteps: number

  // Step 1: Address
  address: string
  latitude: number | null
  longitude: number | null

  // Step 2: Roof polygon
  roofPolygon: RoofPolygon | null

  // Step 2.5: Horizon data (shading analysis)
  horizonData: HorizonDataPoint[] | null

  // Step 3: Building details
  buildingDetails: BuildingDetails | null

  // Step 4: Panel selection
  selectedPanel: SolarPanel | null
  panelCount: number
  maxPanelCount: number

  // Step 5: Panel placement
  panelPlacement: PanelPlacementConfig

  // Step 6: Inverter
  selectedInverter: Inverter | null

  // Step 7: Additional parameters
  additionalParams: AdditionalParams

  // Results
  pvgisResult: PVGISResult | null

  // UI State
  isLoading: boolean
  error: string | null
}

interface PVGISCalculatorActions {
  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Step 1
  setLocation: (address: string, lat: number, lng: number) => void

  // Step 2
  setRoofPolygon: (polygon: RoofPolygon) => void

  // Step 2.5
  setHorizonData: (data: HorizonDataPoint[]) => void

  // Step 3
  setBuildingDetails: (details: BuildingDetails) => void

  // Step 4
  selectPanel: (panel: SolarPanel) => void
  setPanelCount: (count: number) => void
  setMaxPanelCount: (count: number) => void

  // Step 5
  updatePanelPlacement: (config: Partial<PanelPlacementConfig>) => void

  // Step 6
  selectInverter: (inverter: Inverter) => void

  // Step 7
  updateAdditionalParams: (params: Partial<AdditionalParams>) => void

  // Results
  calculatePVGISResults: () => Promise<void>
  setPVGISResult: (result: PVGISResult) => void

  // Utilities
  reset: () => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

type PVGISCalculatorStore = PVGISCalculatorState & PVGISCalculatorActions

const initialState: PVGISCalculatorState = {
  currentStep: 1,
  totalSteps: 9, // 8 input steps (including shading analysis) + 1 results step

  address: '',
  latitude: null,
  longitude: null,

  roofPolygon: null,
  horizonData: null,
  buildingDetails: null,

  selectedPanel: null,
  panelCount: 0,
  maxPanelCount: 0,

  panelPlacement: {
    orientation: 180, // South by default
    tilt: 30, // Default tilt
    ridgeDistance: 0,
    gableEndDistance: 0,
    eavesDistance: 0,
    obstacleClearance: 0.5,
    moduleOrientation: 'horizontal',
    moduleRotation: 0,
  },

  selectedInverter: null,

  additionalParams: {
    vatPayable: true,
    chargingStation: false,
    hotWaterHeatPump: false,
    heatingHeatPump: false,
    electricitySupplier: '',
    electricityConsumption: 4500, // Average Swiss household
    electricityTariff: 0, // Automatic
    feedInTariff: 0, // Automatic
  },

  pvgisResult: null,

  isLoading: false,
  error: null,
}

export const usePVGISCalculatorStore = create<PVGISCalculatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1, error: null })
        }
      },

      prevStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1, error: null })
        }
      },

      goToStep: (step: number) => {
        const { totalSteps } = get()
        if (step >= 1 && step <= totalSteps) {
          set({ currentStep: step, error: null })
        }
      },

      // Step 1: Address
      setLocation: (address, lat, lng) => {
        set({
          address,
          latitude: lat,
          longitude: lng,
          error: null,
        })
      },

      // Step 2: Roof polygon
      setRoofPolygon: (polygon) => {
        set({ roofPolygon: polygon, error: null })
      },

      // Step 2.5: Horizon data
      setHorizonData: (data) => {
        set({ horizonData: data, error: null })
      },

      // Step 3: Building details
      setBuildingDetails: (details) => {
        set({ buildingDetails: details, error: null })
      },

      // Step 4: Panel selection
      selectPanel: (panel) => {
        set({ selectedPanel: panel, error: null })
      },

      setPanelCount: (count) => {
        set({ panelCount: count })
      },

      setMaxPanelCount: (count) => {
        set({ maxPanelCount: count })
      },

      // Step 5: Panel placement
      updatePanelPlacement: (config) => {
        set((state) => ({
          panelPlacement: { ...state.panelPlacement, ...config },
        }))
      },

      // Step 6: Inverter
      selectInverter: (inverter) => {
        set({ selectedInverter: inverter, error: null })
      },

      // Step 7: Additional parameters
      updateAdditionalParams: (params) => {
        set((state) => ({
          additionalParams: { ...state.additionalParams, ...params },
        }))
      },

      // Calculate PVGIS results
      calculatePVGISResults: async () => {
        const state = get()
        const { latitude, longitude, roofPolygon, selectedPanel, panelCount, panelPlacement, horizonData } = state

        if (!latitude || !longitude || !selectedPanel || panelCount === 0) {
          set({ error: 'Missing required data for calculation' })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const peakPowerKw = (selectedPanel.power * panelCount) / 1000

          // Calculate roof polygon centroid for more accurate location
          // Use centroid if polygon exists, otherwise fall back to address coordinates
          let actualLat = latitude
          let actualLon = longitude

          if (roofPolygon && roofPolygon.coordinates.length >= 3) {
            // Calculate centroid of polygon
            const centroidLat = roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) / roofPolygon.coordinates.length
            const centroidLng = roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) / roofPolygon.coordinates.length

            actualLat = centroidLat
            actualLon = centroidLng

            console.log('📍 Using roof polygon centroid for PVGIS:', {
              addressLat: latitude,
              addressLng: longitude,
              roofCentroidLat: centroidLat,
              roofCentroidLng: centroidLng,
              distanceMeters: Math.sqrt(
                Math.pow((centroidLat - latitude) * 111320, 2) +
                Math.pow((centroidLng - longitude) * 111320 * Math.cos(latitude * Math.PI / 180), 2)
              ).toFixed(1)
            })
          } else {
            console.log('⚠️ No roof polygon - using address coordinates for PVGIS')
          }

          // Use horizon endpoint if we have horizon data, otherwise use basic calculation
          const apiEndpoint = horizonData
            ? '/api/pvgis/calculate-with-horizon'
            : '/api/pvgis/calculate'

          if (horizonData) {
            console.log('🏔️  Using horizon shading analysis for more accurate results')
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${apiEndpoint}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lat: actualLat,
                lon: actualLon,
                peakpower: peakPowerKw,
                angle: panelPlacement.tilt,
                aspect: panelPlacement.orientation - 180, // Convert to PVGIS format (0=south)
                loss: 14, // Default system loss
                mountingplace: 'building',
                pvtechchoice: 'crystSi',
              }),
            }
          )

          if (!response.ok) {
            throw new Error('Failed to calculate solar production')
          }

          const data = await response.json()

          const yearlyProduction = data.outputs?.totals?.fixed?.E_y || 0
          const monthlyData = data.outputs?.monthly?.fixed || []

          const result: PVGISResult = {
            yearlyProduction,
            monthlyProduction: monthlyData.map((m: any) => m.E_m),
            dailyAverage: data.outputs?.totals?.fixed?.E_d || 0,
            peakSunHours: data.outputs?.totals?.fixed?.H_sun || 0,
            systemLoss: data.outputs?.totals?.fixed?.l_total || 0,
            co2Reduction: yearlyProduction * 0.438, // kg CO2 per kWh (Swiss grid average)
          }

          set({ pvgisResult: result, isLoading: false })
        } catch (error) {
          console.error('Error calculating PVGIS results:', error)
          set({
            error: error instanceof Error ? error.message : 'Failed to calculate solar production',
            isLoading: false,
          })
        }
      },

      setPVGISResult: (result) => {
        set({ pvgisResult: result })
      },

      // Utilities
      reset: () => {
        set(initialState)
      },

      setError: (error) => {
        set({ error })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'pvgis-calculator',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        address: state.address,
        latitude: state.latitude,
        longitude: state.longitude,
        currentStep: state.currentStep,
        roofPolygon: state.roofPolygon,
        buildingDetails: state.buildingDetails,
        selectedPanel: state.selectedPanel,
        panelCount: state.panelCount,
        panelPlacement: state.panelPlacement,
        selectedInverter: state.selectedInverter,
        additionalParams: state.additionalParams,
      }),
    }
  )
)
