import api from '@/lib/api'

export interface FeedInTariffResponse {
  id: string
  source: string
  publishedAt: string
  validFrom: string
  validTo: string | null
  operatorName: string | null
  bfsNumber: number | null
  cantonCode: string | null
  chfPerKwh: number
  notes: string | null
}

export interface FeedInTariffLookupParams {
  asOf?: Date
  operatorName?: string
  bfsNumber?: number
  cantonCode?: string
}

export const feedInTariffService = {
  async getCurrent(
    params: FeedInTariffLookupParams = {},
  ): Promise<FeedInTariffResponse> {
    const queryParams: Record<string, string> = {}
    if (params.asOf) queryParams.asOf = params.asOf.toISOString()
    if (params.operatorName) queryParams.operatorName = params.operatorName
    if (params.bfsNumber != null)
      queryParams.bfsNumber = String(params.bfsNumber)
    if (params.cantonCode) queryParams.cantonCode = params.cantonCode

    const res = await api.get<{ data: FeedInTariffResponse }>(
      '/feed-in-tariffs/current',
      { params: queryParams },
    )
    return res.data.data
  },
}
