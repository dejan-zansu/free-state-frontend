import api from '@/lib/api'

export interface SwissTariffOperator {
  operatorName: string
  productCode: string
  totalRpKwh: number
  totalChfKwh: number
}

export interface SwissTariffResponse {
  plz: string
  year: number
  category: string
  municipalityName: string
  bfsNumber: number
  cantonCode: string | null
  averageRpKwh: number
  averageChfKwh: number
  minRpKwh: number
  maxRpKwh: number
  operators: SwissTariffOperator[]
  fallback: boolean
  fallbackReason: string | null
}

export const electricityPriceService = {
  async getSwissTariff(
    plz: string,
    year: number = new Date().getFullYear(),
    category: string = 'H4',
  ): Promise<SwissTariffResponse> {
    const res = await api.get<{ data: SwissTariffResponse }>(
      '/electricity-prices/swiss',
      { params: { plz, year, category } },
    )
    return res.data.data
  },
}
