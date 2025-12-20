/**
 * Solar Calculator Types
 */

export interface LatLng {
  latitude: number
  longitude: number
}

export interface LatLngBox {
  sw: LatLng
  ne: LatLng
}

export interface SolarDate {
  year: number
  month: number
  day: number
}

export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

// Building Insights Response
export interface BuildingInsightsResponse {
  name: string
  center: LatLng
  boundingBox: LatLngBox
  imageryDate: SolarDate
  imageryProcessedDate: SolarDate
  postalCode: string
  administrativeArea: string
  statisticalArea: string
  regionCode: string
  solarPotential: SolarPotential
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'BASE'
}

export interface SolarPotential {
  maxArrayPanelsCount: number
  panelCapacityWatts: number
  panelHeightMeters: number
  panelWidthMeters: number
  panelLifetimeYears: number
  maxArrayAreaMeters2: number
  maxSunshineHoursPerYear: number
  carbonOffsetFactorKgPerMwh: number
  wholeRoofStats: SizeAndSunshineStats
  buildingStats: SizeAndSunshineStats
  roofSegmentStats: RoofSegmentSizeAndSunshineStats[]
  solarPanels: SolarPanel[]
  solarPanelConfigs: SolarPanelConfig[]
  financialAnalyses: FinancialAnalysis[]
}

export interface SizeAndSunshineStats {
  areaMeters2: number
  sunshineQuantiles: number[]
  groundAreaMeters2: number
}

export interface RoofSegmentSizeAndSunshineStats {
  pitchDegrees: number
  azimuthDegrees: number
  stats: SizeAndSunshineStats
  center: LatLng
  boundingBox: LatLngBox
  planeHeightAtCenterMeters: number
}

export interface SolarPanel {
  center: LatLng
  orientation: 'LANDSCAPE' | 'PORTRAIT'
  segmentIndex: number
  yearlyEnergyDcKwh: number
}

export interface SolarPanelConfig {
  panelsCount: number
  yearlyEnergyDcKwh: number
  roofSegmentSummaries: RoofSegmentSummary[]
}

export interface RoofSegmentSummary {
  pitchDegrees: number
  azimuthDegrees: number
  panelsCount: number
  yearlyEnergyDcKwh: number
  segmentIndex: number
}

export interface FinancialAnalysis {
  monthlyBill?: Money
  defaultBill?: boolean
  averageKwhPerMonth?: number
  panelConfigIndex?: number
}

export interface Money {
  currencyCode: string
  units: string
  nanos: number
}

// Data Layers Response
export interface DataLayersResponse {
  imageryDate: SolarDate
  imageryProcessedDate: SolarDate
  dsmUrl: string
  rgbUrl: string
  maskUrl: string
  annualFluxUrl: string
  monthlyFluxUrl: string
  hourlyShadeUrls: string[]
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'BASE'
}

export type LayerId = 'mask' | 'dsm' | 'rgb' | 'annualFlux' | 'monthlyFlux' | 'hourlyShade'

// GeoTiff data structure
export interface GeoTiff {
  width: number
  height: number
  rasters: Array<number[]>
  bounds: Bounds
}

// Calculator result types
export interface SolarCalculationResult {
  // System specs
  panelCount: number
  systemCapacityKw: number
  roofAreaM2: number

  // Energy production
  yearlyProductionKwh: number
  monthlyProductionKwh: number[]

  // Financial (Swiss market)
  estimatedSystemCostChf: number
  estimatedSubsidiesChf: number
  netCostChf: number
  yearlyElectricitySavingsChf: number
  yearlyFeedInRevenueChf: number
  totalYearlySavingsChf: number
  paybackYears: number

  // Environmental
  yearlyCo2OffsetKg: number

  // Self-consumption estimate
  selfConsumptionPercent: number
  gridFeedInPercent: number
}

// Calculator State
export interface CalculatorState {
  // Step 1: Location
  address: string
  location: google.maps.LatLng | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeDetails: any | null

  // Step 2: Building Insights
  buildingInsights: BuildingInsightsResponse | null
  dataLayers: DataLayersResponse | null

  // Step 3: Configuration
  panelCount: number
  panelCapacityWatts: number
  showPanels: boolean
  selectedConfigIndex: number

  // Step 4: Energy Profile
  annualConsumptionKwh: number
  purchaseRateRp: number
  feedInRateRp: number
  electricitySupplier: string

  // Results
  calculation: SolarCalculationResult | null

  // UI State
  currentStep: number
  isLoading: boolean
  error: string | null
}

// API Response types
export interface SolarApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

export interface CalculateResponse {
  buildingInsights: BuildingInsightsResponse
  calculation: SolarCalculationResult
}

