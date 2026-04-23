import api from '@/lib/api'

export interface AdminReferenceMarketPriceRow {
  id: string
  year: number
  period: string
  technology: string
  priceChfPerMwh: number
  volumeMwh: number | null
  days: number | null
  source: string
  importedAt: string
}

export interface AdminReferenceMarketPricesListResponse {
  success: boolean
  rows: AdminReferenceMarketPriceRow[]
  summary: {
    technologies: string[]
    years: number[]
  }
}

export const adminReferenceMarketPricesService = {
  async list(params: {
    technology?: string
    year?: number
  } = {}): Promise<AdminReferenceMarketPricesListResponse> {
    const response = await api.get<AdminReferenceMarketPricesListResponse>(
      '/admin/reference-market-prices',
      { params },
    )
    return response.data
  },
}
