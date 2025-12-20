import api from '@/lib/api'
import type {
  BuildingInsightsResponse,
  CalculateResponse,
  DataLayersResponse,
  SolarApiResponse,
} from '@/types/solar'

class SolarService {
  /**
   * Get building insights for a location
   */
  async getBuildingInsights(
    latitude: number,
    longitude: number,
    requiredQuality: 'HIGH' | 'MEDIUM' | 'LOW' | 'BASE' = 'LOW'
  ): Promise<BuildingInsightsResponse> {
    const response = await api.post<SolarApiResponse<BuildingInsightsResponse>>(
      '/solar/building-insights',
      {
        latitude,
        longitude,
        requiredQuality,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to get building insights')
    }

    return response.data.data
  }

  /**
   * Get data layers for a location
   */
  async getDataLayers(
    latitude: number,
    longitude: number,
    radiusMeters: number = 50
  ): Promise<DataLayersResponse> {
    const response = await api.post<SolarApiResponse<DataLayersResponse>>(
      '/solar/data-layers',
      {
        latitude,
        longitude,
        radiusMeters,
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to get data layers')
    }

    return response.data.data
  }

  /**
   * Get signed GeoTiff URL
   */
  async getGeoTiffUrl(url: string): Promise<string> {
    const response = await api.post<SolarApiResponse<{ url: string }>>(
      '/solar/geotiff-url',
      { url }
    )

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to get GeoTiff URL')
    }

    return response.data.data.url
  }

  /**
   * Calculate solar potential with Swiss market parameters
   */
  async calculate(params: {
    latitude: number
    longitude: number
    panelCount?: number
    panelCapacityWatts?: number
    annualConsumptionKwh?: number
    purchaseRateRp?: number
    feedInRateRp?: number
  }): Promise<CalculateResponse> {
    const response = await api.post<SolarApiResponse<CalculateResponse>>(
      '/solar/calculate',
      params
    )

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to calculate solar potential')
    }

    return response.data.data
  }
}

export const solarService = new SolarService()

