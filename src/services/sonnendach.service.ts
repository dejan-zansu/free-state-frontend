/**
 * Sonnendach Service
 * Frontend API client for Swiss solar roof data
 */

import type {
  SonnendachSearchResponse,
  SonnendachBuildingResponse,
  SonnendachConvertResponse,
  SonnendachLocation,
  SonnendachBuilding,
} from '@/types/sonnendach'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const REQUEST_TIMEOUT_MS = 8000

export type BuildingMissReason = 'no_building' | 'no_segments'

export interface BuildingLookupResult {
  building: SonnendachBuilding | null
  reason: BuildingMissReason | null
}

export class SonnendachRequestError extends Error {
  readonly reason = 'error' as const

  constructor(message: string) {
    super(message)
    this.name = 'SonnendachRequestError'
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    throw new SonnendachRequestError(
      error instanceof Error ? error.message : 'Request failed'
    )
  } finally {
    clearTimeout(timer)
  }
}

class SonnendachService {
  /**
   * Search for Swiss addresses
   */
  async searchAddress(address: string, limit: number = 10): Promise<SonnendachLocation[]> {
    const params = new URLSearchParams({
      address,
      limit: limit.toString(),
    })

    const response = await fetchWithTimeout(`${API_URL}/api/sonnendach/search?${params}`)
    const data: SonnendachSearchResponse = await response.json()

    if (!data.success || !data.data) {
      throw new SonnendachRequestError(data.error || 'Address search failed')
    }

    return data.data
  }

  /**
   * Get building data at a point (Swiss LV95 coordinates)
   */
  async getBuildingData(x: number, y: number): Promise<BuildingLookupResult> {
    const params = new URLSearchParams({
      x: x.toString(),
      y: y.toString(),
    })

    const response = await fetchWithTimeout(
      `${API_URL}/api/sonnendach/building-data?${params}`
    )

    if (response.status === 404) {
      return { building: null, reason: 'no_building' }
    }

    let data: SonnendachBuildingResponse & { reason?: BuildingMissReason }
    try {
      data = await response.json()
    } catch {
      throw new SonnendachRequestError('Invalid building data response')
    }

    if (data.success && !data.data) {
      return { building: null, reason: data.reason ?? 'no_building' }
    }

    if (!data.success || !data.data) {
      throw new SonnendachRequestError(data.error || 'Failed to get building data')
    }

    return { building: data.data, reason: null }
  }

  /**
   * Convert WGS84 coordinates to Swiss LV95
   */
  async convertToLV95(lat: number, lng: number): Promise<{ x: number; y: number }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    })

    const response = await fetchWithTimeout(`${API_URL}/api/sonnendach/convert?${params}`)
    const data: SonnendachConvertResponse = await response.json()

    if (!data.success || !data.data) {
      throw new SonnendachRequestError(data.error || 'Coordinate conversion failed')
    }

    return data.data
  }

  /**
   * Get building data from WGS84 coordinates (convenience method)
   */
  async getBuildingDataFromWGS84(lat: number, lng: number): Promise<BuildingLookupResult> {
    const lv95 = await this.convertToLV95(lat, lng)
    return this.getBuildingData(lv95.x, lv95.y)
  }
}

export const sonnendachService = new SonnendachService()
