import api from '@/lib/api'
import type { ListQuery, PaginatedResponse } from '@/types/admin'

class AdminEquipmentService {
  private async list<T>(endpoint: string, query: ListQuery = {}): Promise<PaginatedResponse<T>> {
    const response = await api.get<PaginatedResponse<T>>(`/admin/equipment/${endpoint}`, { params: query })
    return response.data
  }

  private async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await api.get<{ success: boolean; data: T }>(`/admin/equipment/${endpoint}/${id}`)
    return response.data.data
  }

  private async create<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await api.post<{ success: boolean; data: T }>(`/admin/equipment/${endpoint}`, data)
    return response.data.data
  }

  private async update<T>(endpoint: string, id: string, data: Record<string, unknown>): Promise<T> {
    const response = await api.patch<{ success: boolean; data: T }>(`/admin/equipment/${endpoint}/${id}`, data)
    return response.data.data
  }

  private async remove(endpoint: string, id: string): Promise<void> {
    await api.delete(`/admin/equipment/${endpoint}/${id}`)
  }

  listManufacturers(query?: ListQuery) { return this.list('manufacturers', query) }
  getManufacturer(id: string) { return this.getById('manufacturers', id) }
  createManufacturer(data: Record<string, unknown>) { return this.create('manufacturers', data) }
  updateManufacturer(id: string, data: Record<string, unknown>) { return this.update('manufacturers', id, data) }
  deleteManufacturer(id: string) { return this.remove('manufacturers', id) }

  listSolarPanelSeries(query?: ListQuery) { return this.list('solar-panel-series', query) }
  getSolarPanelSeries(id: string) { return this.getById('solar-panel-series', id) }
  createSolarPanelSeries(data: Record<string, unknown>) { return this.create('solar-panel-series', data) }
  updateSolarPanelSeries(id: string, data: Record<string, unknown>) { return this.update('solar-panel-series', id, data) }
  deleteSolarPanelSeries(id: string) { return this.remove('solar-panel-series', id) }

  listSolarPanels(query?: ListQuery) { return this.list('solar-panels', query) }
  getSolarPanel(id: string) { return this.getById('solar-panels', id) }
  createSolarPanel(data: Record<string, unknown>) { return this.create('solar-panels', data) }
  updateSolarPanel(id: string, data: Record<string, unknown>) { return this.update('solar-panels', id, data) }
  deleteSolarPanel(id: string) { return this.remove('solar-panels', id) }

  listInverters(query?: ListQuery) { return this.list('inverters', query) }
  getInverter(id: string) { return this.getById('inverters', id) }
  createInverter(data: Record<string, unknown>) { return this.create('inverters', data) }
  updateInverter(id: string, data: Record<string, unknown>) { return this.update('inverters', id, data) }
  deleteInverter(id: string) { return this.remove('inverters', id) }

  listBatteries(query?: ListQuery) { return this.list('batteries', query) }
  getBattery(id: string) { return this.getById('batteries', id) }
  createBattery(data: Record<string, unknown>) { return this.create('batteries', data) }
  updateBattery(id: string, data: Record<string, unknown>) { return this.update('batteries', id, data) }
  deleteBattery(id: string) { return this.remove('batteries', id) }

  listMountingSystems(query?: ListQuery) { return this.list('mounting-systems', query) }
  getMountingSystem(id: string) { return this.getById('mounting-systems', id) }
  createMountingSystem(data: Record<string, unknown>) { return this.create('mounting-systems', data) }
  updateMountingSystem(id: string, data: Record<string, unknown>) { return this.update('mounting-systems', id, data) }
  deleteMountingSystem(id: string) { return this.remove('mounting-systems', id) }

  listEms(query?: ListQuery) { return this.list('ems', query) }
  getEms(id: string) { return this.getById('ems', id) }
  createEms(data: Record<string, unknown>) { return this.create('ems', data) }
  updateEms(id: string, data: Record<string, unknown>) { return this.update('ems', id, data) }
  deleteEms(id: string) { return this.remove('ems', id) }

  listHeatPumps(query?: ListQuery) { return this.list('heat-pumps', query) }
  getHeatPump(id: string) { return this.getById('heat-pumps', id) }
  createHeatPump(data: Record<string, unknown>) { return this.create('heat-pumps', data) }
  updateHeatPump(id: string, data: Record<string, unknown>) { return this.update('heat-pumps', id, data) }
  deleteHeatPump(id: string) { return this.remove('heat-pumps', id) }

  listPackages(query?: ListQuery) { return this.list('packages', query) }
  getPackage(id: string) { return this.getById('packages', id) }
  createPackage(data: Record<string, unknown>) { return this.create('packages', data) }
  updatePackage(id: string, data: Record<string, unknown>) { return this.update('packages', id, data) }
  deletePackage(id: string) { return this.remove('packages', id) }

  async listPricing(equipmentType: string, equipmentId: string) {
    const response = await api.get(`/admin/equipment/pricing/${equipmentType}/${equipmentId}`)
    return response.data.data
  }

  async createPricing(data: Record<string, unknown>) {
    const response = await api.post('/admin/equipment/pricing', data)
    return response.data.data
  }

  async updatePricing(id: string, data: Record<string, unknown>) {
    const response = await api.patch(`/admin/equipment/pricing/${id}`, data)
    return response.data.data
  }

  async deletePricing(id: string) {
    await api.delete(`/admin/equipment/pricing/${id}`)
  }
}

export const adminEquipmentService = new AdminEquipmentService()
