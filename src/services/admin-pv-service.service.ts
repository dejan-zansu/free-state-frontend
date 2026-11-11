import api from '@/lib/api'
import type { ListQuery, PaginatedResponse } from '@/types/admin'
import type {
  PvServiceRequest,
  PvServiceRequestListItem,
  PvServiceRequestListResponse,
  UpdatePvServiceRequestPayload,
} from '@/types/pv-service'

const BASE = '/admin/pv-service/requests'

class AdminPvServiceService {
  async list(
    query: ListQuery = {}
  ): Promise<PaginatedResponse<PvServiceRequestListItem>> {
    const params: Record<string, string | number> = {}
    if (query.page) params.page = query.page
    if (query.limit) params.pageSize = query.limit
    if (query.search) params.q = query.search
    if (query.status) params.status = query.status
    const response = await api.get<PvServiceRequestListResponse>(BASE, {
      params,
    })
    const { success, data, meta } = response.data
    return {
      success,
      data,
      meta: {
        total: meta.total,
        page: meta.page,
        limit: meta.pageSize,
        totalPages: meta.totalPages,
      },
    }
  }

  async get(id: string): Promise<PvServiceRequest> {
    const response = await api.get<{
      success: boolean
      data: PvServiceRequest
    }>(`${BASE}/${encodeURIComponent(id)}`)
    return response.data.data
  }

  async update(
    id: string,
    payload: UpdatePvServiceRequestPayload
  ): Promise<PvServiceRequest> {
    const response = await api.patch<{
      success: boolean
      data: PvServiceRequest
    }>(`${BASE}/${encodeURIComponent(id)}`, payload)
    return response.data.data
  }
}

export const adminPvServiceService = new AdminPvServiceService()
