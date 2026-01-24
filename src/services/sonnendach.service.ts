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

class SonnendachService {
  /**
   * Search for Swiss addresses
   */
  async searchAddress(address: string, limit: number = 10): Promise<SonnendachLocation[]> {
    const params = new URLSearchParams({
      address,
      limit: limit.toString(),
    })

    const response = await fetch(`${API_URL}/api/sonnendach/search?${params}`)
    const data: SonnendachSearchResponse = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Address search failed')
    }

    return data.data
  }

  /**
   * Get building data at a point (Swiss LV95 coordinates)
   */
  async getBuildingData(x: number, y: number): Promise<SonnendachBuilding> {
    const params = new URLSearchParams({
      x: x.toString(),
      y: y.toString(),
    })

    const response = await fetch(`${API_URL}/api/sonnendach/building-data?${params}`)
    const data: SonnendachBuildingResponse = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to get building data')
    }

    return data.data
  }

  /**
   * Convert WGS84 coordinates to Swiss LV95
   */
  async convertToLV95(lat: number, lng: number): Promise<{ x: number; y: number }> {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
    })

    const response = await fetch(`${API_URL}/api/sonnendach/convert?${params}`)
    const data: SonnendachConvertResponse = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Coordinate conversion failed')
    }

    return data.data
  }

  /**
   * Get building data from WGS84 coordinates (convenience method)
   */
  async getBuildingDataFromWGS84(lat: number, lng: number): Promise<SonnendachBuilding> {
    const lv95 = await this.convertToLV95(lat, lng)
    return this.getBuildingData(lv95.x, lv95.y)
  }
}

export const sonnendachService = new SonnendachService()
