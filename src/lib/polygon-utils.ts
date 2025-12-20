/**
 * Utility functions for polygon calculations
 */

interface LatLng {
  lat: number
  lng: number
}

/**
 * Calculate the area of a polygon in square meters using the Shoelace formula
 * and accounting for Earth's curvature
 */
export function calculatePolygonArea(polygon: LatLng[]): number {
  console.log('📐 calculatePolygonArea called with', polygon.length, 'points')
  if (polygon.length < 3) {
    console.log('⚠️ Not enough points to calculate area')
    return 0
  }

  // Use spherical excess formula for more accurate area calculation
  // For small areas, we can use a simpler approach with google.maps.geometry
  if (typeof google !== 'undefined' && google.maps?.geometry?.spherical) {
    const path = polygon.map((p) => new google.maps.LatLng(p.lat, p.lng))
    const area = google.maps.geometry.spherical.computeArea(path)
    console.log('✅ Area calculated using Google Maps API:', area, 'm²')
    return area
  }

  // Fallback: Simple planar calculation (less accurate but works)
  const R = 6371000 // Earth's radius in meters
  let area = 0

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i]
    const p2 = polygon[(i + 1) % polygon.length]

    const lat1 = (p1.lat * Math.PI) / 180
    const lat2 = (p2.lat * Math.PI) / 180
    const lng1 = (p1.lng * Math.PI) / 180
    const lng2 = (p2.lng * Math.PI) / 180

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }

  area = Math.abs((area * R * R) / 2)
  console.log('✅ Area calculated using fallback method:', area, 'm²')
  return area
}

/**
 * Calculate the centroid (center point) of a polygon
 */
export function calculatePolygonCentroid(polygon: LatLng[]): LatLng {
  if (polygon.length === 0) return { lat: 0, lng: 0 }

  let latSum = 0
  let lngSum = 0

  polygon.forEach((point) => {
    latSum += point.lat
    lngSum += point.lng
  })

  return {
    lat: latSum / polygon.length,
    lng: lngSum / polygon.length,
  }
}

/**
 * Calculate the bounding box of a polygon
 */
export function calculatePolygonBounds(polygon: LatLng[]): {
  north: number
  south: number
  east: number
  west: number
} {
  if (polygon.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 }
  }

  let north = polygon[0].lat
  let south = polygon[0].lat
  let east = polygon[0].lng
  let west = polygon[0].lng

  polygon.forEach((point) => {
    north = Math.max(north, point.lat)
    south = Math.min(south, point.lat)
    east = Math.max(east, point.lng)
    west = Math.min(west, point.lng)
  })

  return { north, south, east, west }
}

/**
 * Calculate radius in meters from center to furthest point
 */
export function calculatePolygonRadius(polygon: LatLng[], center: LatLng): number {
  if (polygon.length === 0) return 0

  let maxDistance = 0

  polygon.forEach((point) => {
    const distance = calculateDistance(center, point)
    maxDistance = Math.max(maxDistance, distance)
  })

  // Add buffer of 20% for safety
  return maxDistance * 1.2
}

/**
 * Calculate distance between two points in meters using Haversine formula
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 6371000 // Earth's radius in meters
  const lat1 = (point1.lat * Math.PI) / 180
  const lat2 = (point2.lat * Math.PI) / 180
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Estimate number of solar panels that can fit in a given area
 * Assumes standard panel size and accounts for spacing
 */
export function estimatePanelCount(areaM2: number, panelWidthM = 1.7, panelHeightM = 1.0): number {
  // Panel area in square meters
  const panelArea = panelWidthM * panelHeightM

  // Account for spacing, mounting, and irregular shapes (use 70% efficiency)
  const usableArea = areaM2 * 0.7

  // Calculate number of panels
  const panelCount = Math.floor(usableArea / panelArea)

  return Math.max(1, panelCount)
}

/**
 * Estimate annual energy production based on area and average solar irradiance
 * This is a simplified calculation - real data would come from GeoTIFF
 */
export function estimateEnergyProduction(
  panelCount: number,
  panelCapacityWatts = 400,
  sunshineHoursPerYear = 1500 // Average for Central Europe
): number {
  // Total system capacity in kW
  const systemCapacityKw = (panelCount * panelCapacityWatts) / 1000

  // Annual production in kWh
  // Formula: System capacity (kW) × sunshine hours × performance ratio (0.75)
  const annualProductionKwh = systemCapacityKw * sunshineHoursPerYear * 0.75

  return Math.round(annualProductionKwh)
}
