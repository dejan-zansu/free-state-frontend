/**
 * Sonnendach.ch Types for Frontend
 * Swiss Federal Solar Roof Data
 */

// Address search result
export interface SonnendachLocation {
  id: number
  weight: number
  attrs: {
    origin: string
    lon: number
    lat: number
    detail: string
    label: string
    x: number // Swiss LV95 X coordinate
    y: number // Swiss LV95 Y coordinate
    plz?: number
  }
}

// Suitability class info
export interface SuitabilityInfo {
  class: number // 1-5
  label: string // low, medium, good, very good, excellent
  labelDe: string // gering, mittel, gut, sehr gut, hervorragend
  color: string // Hex color
}

// Processed roof segment (from backend)
export interface RoofSegment {
  id: string
  featureId: string
  area: number // m²
  tilt: number // degrees
  azimuth: number // degrees (0=N, 90=E, 180=S, 270=W)
  azimuthCardinal: string // N, NE, E, SE, S, SW, W, NW
  electricityYield: number // kWh/year
  heatYield: number // kWh/year
  solarRadiation: number // kWh/m²/year
  suitability: {
    class: number
    label: string
    color: string
  }
  geometry: {
    type: string
    coordinates: number[][][]
    coordinatesWGS84?: number[][][] // WGS84 for map display
  }
  estimatedPanels?: number
}

// Building data (from backend)
export interface SonnendachBuilding {
  buildingId: number
  clickedSegmentId?: string // ID of the segment that was clicked
  address?: string
  center: {
    lat: number
    lng: number
    x: number // Swiss LV95
    y: number // Swiss LV95
  }
  roofSegments: RoofSegment[]
  totalArea: number
  totalPotentialKwh: number
  suitabilityClass: number
  suitabilityLabel: string
}

// API responses
export interface SonnendachSearchResponse {
  success: boolean
  data?: SonnendachLocation[]
  error?: string
}

export interface SonnendachBuildingResponse {
  success: boolean
  data?: SonnendachBuilding
  error?: string
}

export interface SonnendachConvertResponse {
  success: boolean
  data?: { x: number; y: number }
  error?: string
}

// Suitability class mapping
export const SUITABILITY_CLASSES: Record<number, SuitabilityInfo> = {
  1: { class: 1, label: 'low', labelDe: 'gering', color: '#3B82F6' }, // Blue
  2: { class: 2, label: 'medium', labelDe: 'mittel', color: '#22C55E' }, // Green
  3: { class: 3, label: 'good', labelDe: 'gut', color: '#EAB308' }, // Yellow
  4: { class: 4, label: 'very good', labelDe: 'sehr gut', color: '#F97316' }, // Orange
  5: {
    class: 5,
    label: 'excellent',
    labelDe: 'hervorragend',
    color: '#EF4444',
  }, // Red
}
