import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  detectCountryFromCoordinates,
  type CountryConfig,
} from '@/config/countries'

// Types
export interface RoofPolygon {
  coordinates: Array<{ lat: number; lng: number }>
  area: number // in m²
}

export interface BuildingDetails {
  roofType?: 'flat' | 'gable' | 'hip' | 'shed'
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
  countryCode: string // ISO 3166-1 alpha-2
  countryConfig: CountryConfig | null // Fetched from backend

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
  setCountryCode: (code: string) => void
  fetchCountryConfig: (countryCode: string) => Promise<void>
  getCountryConfig: () => CountryConfig | null

  // Step 2
  setRoofPolygon: (polygon: RoofPolygon) => void

  // Step 2.5
  setHorizonData: (data: HorizonDataPoint[]) => void

  // Step 3
  setBuildingDetails: (details: Partial<BuildingDetails>) => void

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
  totalSteps: 5,

  address: '',
  latitude: null,
  longitude: null,
  countryCode: 'CH', // Default Switzerland
  countryConfig: null, // Will be fetched from backend

  roofPolygon: null,
  horizonData: null,
  buildingDetails: null,

  selectedPanel: null,
  panelCount: 0,
  maxPanelCount: 0,

  panelPlacement: {
    orientation: 180,
    tilt: 30,
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
        // Detect country from coordinates (only Switzerland supported currently)
        const detectedCountry = detectCountryFromCoordinates(lat, lng)

        if (!detectedCountry) {
          set({
            error:
              'Location is outside supported area. Currently only Switzerland is supported.',
          })
          return
        }

        set({
          address,
          latitude: lat,
          longitude: lng,
          countryCode: detectedCountry,
          error: null,
        })

        // Fetch country config from backend
        get().fetchCountryConfig(detectedCountry)
      },

      setCountryCode: (code) => {
        set({ countryCode: code })
        get().fetchCountryConfig(code)
      },

      fetchCountryConfig: async (countryCode: string) => {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

        try {
          const response = await fetch(
            `${apiUrl}/api/electricity-prices/${countryCode}`
          )
          const data = await response.json()

          if (data.success && data.data) {
            const config: CountryConfig = {
              code: countryCode,
              name: countryCode === 'CH' ? 'Switzerland' : countryCode,
              currency: data.data.currency || 'CHF',
              currencySymbol: data.data.currency || 'CHF',
              electricityPrice: data.data.electricityPrice,
              feedInTariff: data.data.feedInTariff,
              vatRate: data.data.vatRate,
              subsidyBase: data.data.subsidyBase || 0,
              subsidyPerKw: data.data.subsidyPerKw || 0,
              subsidyCapKw: data.data.subsidyCapKw || 0,
              co2FactorKgPerKwh: data.data.co2FactorKgPerKwh,
              optimalTilt: 35, // Swiss latitude optimal
              averageHouseholdConsumption: 4500, // Swiss average
              installationCostPerKwp: 1500, // Swiss market average (1500-2500 CHF/kWp)
            }

            set({
              countryConfig: config,
              // Update dependent values
              panelPlacement: {
                ...get().panelPlacement,
                tilt: config.optimalTilt,
              },
              additionalParams: {
                ...get().additionalParams,
                electricityConsumption: config.averageHouseholdConsumption,
              },
            })

            console.log(`✅ Loaded config for ${countryCode}:`, config)
          } else {
            throw new Error(data.error || 'Failed to fetch country config')
          }
        } catch (err) {
          console.error(`❌ Failed to fetch config for ${countryCode}:`, err)
          set({
            error: `Failed to load configuration for ${countryCode}. Please try again.`,
          })
        }
      },

      getCountryConfig: () => {
        return get().countryConfig
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
        set((state) => ({
          buildingDetails: { ...state.buildingDetails, ...details },
          error: null,
        }))
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
        const {
          latitude,
          longitude,
          roofPolygon,
          selectedPanel,
          panelCount,
          panelPlacement,
          horizonData,
        } = state

        if (!latitude || !longitude || !selectedPanel || panelCount === 0) {
          set({ error: 'Missing required data for calculation' })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const peakPowerKw = (selectedPanel.power * panelCount) / 1000

          // Default PVGIS system loss (14% is standard)
          const totalSystemLoss = 14

          // Calculate roof polygon centroid for more accurate location
          // Use centroid if polygon exists, otherwise fall back to address coordinates
          let actualLat = latitude
          let actualLon = longitude

          if (roofPolygon && roofPolygon.coordinates.length >= 3) {
            // Calculate centroid of polygon
            const centroidLat =
              roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) /
              roofPolygon.coordinates.length
            const centroidLng =
              roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) /
              roofPolygon.coordinates.length

            actualLat = centroidLat
            actualLon = centroidLng

            console.log('📍 Using roof polygon centroid for PVGIS:', {
              addressLat: latitude,
              addressLng: longitude,
              roofCentroidLat: centroidLat,
              roofCentroidLng: centroidLng,
              distanceMeters: Math.sqrt(
                Math.pow((centroidLat - latitude) * 111320, 2) +
                  Math.pow(
                    (centroidLng - longitude) *
                      111320 *
                      Math.cos((latitude * Math.PI) / 180),
                    2
                  )
              ).toFixed(1),
            })
          } else {
            console.log(
              '⚠️ No roof polygon - using address coordinates for PVGIS'
            )
          }

          // Use horizon endpoint if we have horizon data, otherwise use basic calculation
          const apiEndpoint = horizonData
            ? '/api/pvgis/calculate-with-horizon'
            : '/api/pvgis/calculate'

          if (horizonData) {
            console.log(
              '🏔️  Using horizon shading analysis for more accurate results'
            )
          }

          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
            }${apiEndpoint}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lat: actualLat,
                lon: actualLon,
                peakpower: peakPowerKw,
                angle: panelPlacement.tilt,
                aspect: panelPlacement.orientation - 180, // Convert to PVGIS format (0=south)
                loss: totalSystemLoss, // Sum of cable, inverter, soiling, shading, mismatch losses
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

          // Get CO2 factor from country config
          const config = get().countryConfig
          const co2Factor = config?.co2FactorKgPerKwh || 0.128 // Swiss grid default

          const result: PVGISResult = {
            yearlyProduction,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            monthlyProduction: monthlyData.map((m: any) => m.E_m),
            dailyAverage: data.outputs?.totals?.fixed?.E_d || 0,
            peakSunHours: data.outputs?.totals?.fixed?.H_sun || 0,
            systemLoss: data.outputs?.totals?.fixed?.l_total || 0,
            co2Reduction: yearlyProduction * co2Factor,
          }

          set({ pvgisResult: result, isLoading: false })
        } catch (error) {
          console.error('Error calculating PVGIS results:', error)
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to calculate solar production',
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
        countryCode: state.countryCode,
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
