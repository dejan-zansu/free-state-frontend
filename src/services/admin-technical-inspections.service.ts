import api from '@/lib/api'

export type InspectionStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export interface AdminInspectionRow {
  id: string
  leadId: string
  status: InspectionStatus
  scheduledAt: string
  completedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  inspectorId: string | null
  verifiedSystemSizeKwp: number | null
  verifiedAnnualProductionKwh: number | null
  verifiedAnnualConsumptionKwh: number | null
  verifiedPanelCount: number | null
  shadingNotes: string | null
  accessNotes: string | null
  roofConditionNotes: string | null
  inspectionNotes: string | null
  photoUrls: string[]
  offerGeneratedAt: string | null
  offerPdfUrl: string | null
  createdAt: string
  updatedAt: string

  lead: {
    id: string
    propertyAddress: string
    status: string
    customer: {
      user: {
        firstName: string
        lastName: string
        email: string
        phone: string | null
      }
    }
    project: {
      solarCalculation: {
        totalSystemCapacityKw: number | null
        annualProductionKwh: number | null
        annualConsumptionKwh: number | null
      } | null
    } | null
  }
  inspector: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
}

export interface AdminInspectionListResponse {
  success: boolean
  rows: AdminInspectionRow[]
  total: number
  page: number
  pageSize: number
}

export type AdminInspectionDetail = AdminInspectionRow

export const adminInspectionsService = {
  async list(params: {
    status?: InspectionStatus
    inspectorId?: string
    search?: string
    page?: number
    pageSize?: number
  } = {}): Promise<AdminInspectionListResponse> {
    const response = await api.get<AdminInspectionListResponse>(
      '/admin/inspections',
      { params },
    )
    return response.data
  },

  async get(id: string): Promise<AdminInspectionDetail> {
    const response = await api.get<{ success: boolean; data: AdminInspectionDetail }>(
      `/admin/inspections/${id}`,
    )
    return response.data.data
  },

  async create(payload: {
    leadId: string
    scheduledAt: string
    inspectorId?: string | null
  }) {
    const response = await api.post(`/admin/inspections`, payload)
    return response.data.data as AdminInspectionRow
  },

  async update(id: string, payload: Partial<{
    scheduledAt: string
    inspectorId: string | null
    verifiedSystemSizeKwp: number | null
    verifiedAnnualProductionKwh: number | null
    verifiedAnnualConsumptionKwh: number | null
    verifiedPanelCount: number | null
    shadingNotes: string | null
    accessNotes: string | null
    roofConditionNotes: string | null
    inspectionNotes: string | null
    photoUrls: string[]
  }>) {
    const response = await api.patch(`/admin/inspections/${id}`, payload)
    return response.data.data as AdminInspectionRow
  },

  async complete(id: string, payload: {
    verifiedSystemSizeKwp: number
    verifiedAnnualProductionKwh: number
    verifiedAnnualConsumptionKwh?: number | null
    verifiedPanelCount?: number | null
    shadingNotes?: string | null
    accessNotes?: string | null
    roofConditionNotes?: string | null
    inspectionNotes?: string | null
    photoUrls?: string[]
  }) {
    const response = await api.post(`/admin/inspections/${id}/complete`, payload)
    return response.data.data as AdminInspectionRow
  },

  async cancel(id: string, reason: string) {
    const response = await api.post(`/admin/inspections/${id}/cancel`, { reason })
    return response.data.data as AdminInspectionRow
  },
}
