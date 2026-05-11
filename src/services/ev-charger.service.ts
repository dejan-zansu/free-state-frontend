import api from '@/lib/api'

export interface PublicEvCharger {
  id: string
  manufacturerCode: string
  manufacturerName: string
  modelNumber: string
  series: string | null
  imageUrl: string | null
  type: string
  ratedPowerKw: number
  maxPowerKw: number | null
  connectorTypes: string | null
  numberOfOutlets: number
  hasRfid: boolean
  hasAppControl: boolean
  hasLoadBalancing: boolean
  warrantyYears: number | null
  priceChf: number
  displayName: string
  description: string | null
  keyFeatures: string[] | null
}

interface ListResponse {
  success: boolean
  data: PublicEvCharger[]
}

class EvChargerService {
  async listPublic(language: string = 'de'): Promise<PublicEvCharger[]> {
    const res = await api.get<ListResponse>(`/equipment/ev-chargers?lang=${encodeURIComponent(language)}`)
    return res.data.data
  }
}

export const evChargerService = new EvChargerService()
