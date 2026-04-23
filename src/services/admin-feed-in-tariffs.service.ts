import api from '@/lib/api'

export interface AdminFeedInTariffRow {
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

export interface AdminFeedInTariffsListResponse {
  success: boolean
  rows: AdminFeedInTariffRow[]
}

export const adminFeedInTariffsService = {
  async list(): Promise<AdminFeedInTariffsListResponse> {
    const response = await api.get<AdminFeedInTariffsListResponse>(
      '/admin/feed-in-tariffs',
    )
    return response.data
  },
}
