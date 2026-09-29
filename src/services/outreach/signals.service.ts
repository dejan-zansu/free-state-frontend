// Client for the owner-signal endpoints (backend
// src/routes/owner-signals.routes.ts), typed with @/types/outreach/signals.

import api from '@/lib/api'
import type {
  OwnerSignalIgnoreRequest,
  OwnerSignalIgnoreResponse,
  OwnerSignalListQuery,
  OwnerSignalListResponse,
  OwnerSignalRouteRequest,
  OwnerSignalRouteResponse,
  OwnerSignalStatsResponse,
} from '@/types/outreach/signals'

class OutreachSignalsService {
  async list(q: OwnerSignalListQuery = {}): Promise<OwnerSignalListResponse> {
    const response = await api.get<{
      success: boolean
      data: OwnerSignalListResponse
    }>('/admin/outreach/signals', {
      params: {
        kind: q.kind || undefined,
        status: q.status || undefined,
        q: q.q?.trim() || undefined,
        review: q.review ? 'true' : undefined,
        page: q.page ?? 1,
        pageSize: q.pageSize ?? 50,
      },
    })
    return response.data.data
  }

  async stats(): Promise<OwnerSignalStatsResponse> {
    const response = await api.get<{
      success: boolean
      data: OwnerSignalStatsResponse
    }>('/admin/outreach/signals/stats')
    return response.data.data
  }

  async route(
    id: string,
    input: OwnerSignalRouteRequest = {}
  ): Promise<OwnerSignalRouteResponse> {
    const response = await api.post<{
      success: boolean
      data: OwnerSignalRouteResponse
    }>(`/admin/outreach/signals/${id}/route`, input)
    return response.data.data
  }

  async ignore(
    id: string,
    input: OwnerSignalIgnoreRequest
  ): Promise<OwnerSignalIgnoreResponse> {
    const response = await api.post<{
      success: boolean
      data: OwnerSignalIgnoreResponse
    }>(`/admin/outreach/signals/${id}/ignore`, input)
    return response.data.data
  }
}

export const outreachSignalsService = new OutreachSignalsService()
