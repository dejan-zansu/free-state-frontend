import api from '@/lib/api'

export interface SubsidyRateResponse {
  id: string
  source: string
  publishedAt: string
  validFrom: string
  validTo: string | null
  tier1MaxKwp: number
  tier1ChfPerKwp: number
  tier2MaxKwp: number
  tier2ChfPerKwp: number
  notes: string | null
}

export const subsidyService = {
  async getCurrentRate(asOf?: Date): Promise<SubsidyRateResponse> {
    const params = asOf ? { asOf: asOf.toISOString() } : undefined
    const res = await api.get<{ data: SubsidyRateResponse }>(
      '/subsidies/current',
      { params },
    )
    return res.data.data
  },
}
