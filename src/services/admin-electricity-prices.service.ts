import api from '@/lib/api'

export interface AdminSwissTariffRow {
  bfsNumber: number
  municipalityName: string
  cantonCode: string | null
  year: number
  category: string
  operatorName: string
  productCode: string
  totalRpKwh: number
  energyRpKwh: number
  gridusageRpKwh: number
  aidfeeRpKwh: number
  chargeRpKwh: number
  fixcostsChf: number | null
}

export interface AdminSwissTariffListResponse {
  success: boolean
  rows: AdminSwissTariffRow[]
  total: number
  page: number
  pageSize: number
  summary: {
    years: number[]
    categories: string[]
    cantons: string[]
    avgRpKwh: number
    minRpKwh: number
    maxRpKwh: number
  }
}

export const adminElectricityPricesService = {
  async list(params: {
    year?: number
    category?: string
    search?: string
    cantonCode?: string
    page?: number
    pageSize?: number
  }): Promise<AdminSwissTariffListResponse> {
    const response = await api.get<AdminSwissTariffListResponse>(
      '/admin/electricity-prices/swiss',
      { params },
    )
    return response.data
  },
}
