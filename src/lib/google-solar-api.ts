/**
 * Google Solar API direct client
 * Based on official Google Solar API demo
 * https://developers.google.com/maps/documentation/solar
 */

// API Response Types
export interface BuildingInsightsResponse {
  name: string
  center: LatLng
  boundingBox: LatLngBox
  imageryDate: ImageryDate
  imageryProcessedDate: ImageryDate
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
  financialAnalyses?: unknown
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

export interface LatLng {
  latitude: number
  longitude: number
}

export interface LatLngBox {
  sw: LatLng
  ne: LatLng
}

export interface ImageryDate {
  year: number
  month: number
  day: number
}

export interface RequestError {
  error: {
    code: number
    message: string
    status: string
  }
}

/**
 * Fetches the building insights information from the Solar API.
 * https://developers.google.com/maps/documentation/solar/building-insights
 *
 * @param latitude - Point of interest latitude
 * @param longitude - Point of interest longitude
 * @param apiKey - Google Cloud API key
 * @returns Building Insights response
 */
export async function findClosestBuilding(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<BuildingInsightsResponse> {
  const params = new URLSearchParams({
    'location.latitude': latitude.toFixed(5),
    'location.longitude': longitude.toFixed(5),
    required_quality: 'BASE',
    key: apiKey,
  })

  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`
  console.log('GET buildingInsights', { latitude, longitude })

  const response = await fetch(url)
  const content = await response.json()

  if (response.status !== 200) {
    console.error('findClosestBuilding error:', content)
    throw content as RequestError
  }

  console.log('buildingInsightsResponse:', content)
  return content as BuildingInsightsResponse
}

/**
 * Data Layers API
 * https://developers.google.com/maps/documentation/solar/data-layers
 */
export interface DataLayersResponse {
  imageryDate: ImageryDate
  imageryProcessedDate: ImageryDate
  dsmUrl: string
  rgbUrl: string
  maskUrl: string
  annualFluxUrl: string
  monthlyFluxUrl: string
  hourlyShadeUrls: string[]
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'BASE'
}

/**
 * Fetches the data layers information from the Solar API.
 *
 * @param latitude - Center point latitude
 * @param longitude - Center point longitude
 * @param radiusMeters - Radius of the data layer size in meters
 * @param apiKey - Google Cloud API key
 * @returns Data Layers response
 */
export async function getDataLayers(
  latitude: number,
  longitude: number,
  radiusMeters: number,
  apiKey: string
): Promise<DataLayersResponse> {
  const params = new URLSearchParams({
    'location.latitude': latitude.toFixed(5),
    'location.longitude': longitude.toFixed(5),
    radius_meters: radiusMeters.toString(),
    required_quality: 'BASE',
    key: apiKey,
  })

  const url = `https://solar.googleapis.com/v1/dataLayers:get?${params}`
  console.log('GET dataLayers', { latitude, longitude, radiusMeters })

  const response = await fetch(url)
  const content = await response.json()

  if (response.status !== 200) {
    console.error('getDataLayers error:', content)
    throw content as RequestError
  }

  console.log('dataLayersResponse:', content)
  return content as DataLayersResponse
}

/**
 * Utility functions
 */
export function formatLatLng(point: LatLng): string {
  return `(${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`
}

export function formatDate(date: ImageryDate): string {
  return `${date.month}/${date.day}/${date.year}`
}
