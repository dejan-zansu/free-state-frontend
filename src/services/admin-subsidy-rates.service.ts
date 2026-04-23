import api from '@/lib/api'

export interface AdminSubsidyRateRow {
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

export interface AdminSubsidyRatesListResponse {
  success: boolean
  rows: AdminSubsidyRateRow[]
}

export const adminSubsidyRatesService = {
  async list(): Promise<AdminSubsidyRatesListResponse> {
    const response = await api.get<AdminSubsidyRatesListResponse>(
      '/admin/subsidy-rates',
    )
    return response.data
  },
}
