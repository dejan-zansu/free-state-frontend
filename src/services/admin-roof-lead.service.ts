import api from '@/lib/api'
import type { ListQuery, PaginatedResponse } from '@/types/admin'
import type {
  RoofLeadDetail,
  RoofLeadListItem,
  RoofLeadSummary,
  RoofRequestListItem,
  RoofRequestPromotion,
  UpdateRoofLeadPayload,
} from '@/types/roof-lead'

const BASE = '/admin/roof-leads'

class AdminRoofLeadService {
  async list(
    query: ListQuery = {}
  ): Promise<PaginatedResponse<RoofLeadListItem>> {
    const response = await api.get<PaginatedResponse<RoofLeadListItem>>(BASE, {
      params: query,
    })
    return response.data
  }

  async summary(): Promise<RoofLeadSummary> {
    const response = await api.get<{ success: boolean; data: RoofLeadSummary }>(
      `${BASE}/summary`
    )
    return response.data.data
  }

  async get(id: string): Promise<RoofLeadDetail> {
    const response = await api.get<{ success: boolean; data: RoofLeadDetail }>(
      `${BASE}/${id}`
    )
    return response.data.data
  }

  async update(
    id: string,
    payload: UpdateRoofLeadPayload
  ): Promise<RoofLeadDetail> {
    const response = await api.patch<{
      success: boolean
      data: RoofLeadDetail
    }>(`${BASE}/${id}`, payload)
    return response.data.data
  }

  async listRequests(
    query: ListQuery = {}
  ): Promise<PaginatedResponse<RoofRequestListItem>> {
    const response = await api.get<PaginatedResponse<RoofRequestListItem>>(
      `${BASE}/requests`,
      { params: query }
    )
    return response.data
  }

  async promoteRequest(id: string): Promise<RoofRequestPromotion> {
    const response = await api.post<{
      success: boolean
      data: RoofRequestPromotion
    }>(`${BASE}/requests/${id}/promote`)
    return response.data.data
  }

  async downloadCsv(query: ListQuery = {}): Promise<void> {
    const response = await api.get(`${BASE}/export.csv`, {
      params: query,
      responseType: 'blob',
      timeout: 60000,
    })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `roof-leads-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const adminRoofLeadService = new AdminRoofLeadService()
