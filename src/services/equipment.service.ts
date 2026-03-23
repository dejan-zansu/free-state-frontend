import api from '@/lib/api'
import type {
  SolarPanelItem,
  InverterItem,
  BatteryItem,
  MountingSystemItem,
  EmsItem,
  HeatPumpItem,
  QuoteRequestItem,
  EquipmentQuote,
} from '@/types/equipment'

interface ApiResponse<T> {
  success: boolean
  data: T
}

class EquipmentService {
  async getSolarPanels(lang: string = 'en', country: string = 'CH'): Promise<SolarPanelItem[]> {
    const res = await api.get<ApiResponse<SolarPanelItem[]>>(`/equipment/solar-panels?lang=${lang}&country=${country}`)
    return res.data.data
  }

  async getInverters(lang: string = 'en', country: string = 'CH'): Promise<InverterItem[]> {
    const res = await api.get<ApiResponse<InverterItem[]>>(`/equipment/inverters?lang=${lang}&country=${country}`)
    return res.data.data
  }

  async getBatteries(lang: string = 'en', country: string = 'CH'): Promise<BatteryItem[]> {
    const res = await api.get<ApiResponse<BatteryItem[]>>(`/equipment/batteries?lang=${lang}&country=${country}`)
    return res.data.data
  }

  async getMountingSystems(lang: string = 'en', country: string = 'CH', roofType?: string): Promise<MountingSystemItem[]> {
    let url = `/equipment/mounting-systems?lang=${lang}&country=${country}`
    if (roofType) url += `&roofType=${roofType}`
    const res = await api.get<ApiResponse<MountingSystemItem[]>>(url)
    return res.data.data
  }

  async getEms(lang: string = 'en', country: string = 'CH'): Promise<EmsItem[]> {
    const res = await api.get<ApiResponse<EmsItem[]>>(`/equipment/ems?lang=${lang}&country=${country}`)
    return res.data.data
  }

  async getHeatPumps(lang: string = 'en', country: string = 'CH'): Promise<HeatPumpItem[]> {
    const res = await api.get<ApiResponse<HeatPumpItem[]>>(`/equipment/heat-pumps?lang=${lang}&country=${country}`)
    return res.data.data
  }

  async getQuote(items: QuoteRequestItem[], lang: string = 'en', country: string = 'CH'): Promise<EquipmentQuote> {
    const res = await api.post<ApiResponse<EquipmentQuote>>(`/equipment/quote?lang=${lang}&country=${country}`, { items })
    return res.data.data
  }
}

export const equipmentService = new EquipmentService()
