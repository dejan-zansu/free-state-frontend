import api from '@/lib/api'
import type {
  CommercialLeadDetail, CommercialLeadListResponse, CommercialLeadStatus,
  CommercialLeadNote, CommercialLeadAttachment, CommercialLeadActivity,
  CommercialAttachmentType, CommercialIndustry, CommercialTimeline,
  CommercialFinancingPreference, CommercialLegalForm, CommercialEmployeeBracket,
  CommercialBudgetBracket, CommercialExistingPv,
} from '@/types/commercial-lead'

export interface ListQuery {
  page?: number
  limit?: number
  search?: string
  status?: CommercialLeadStatus[]
  industry?: CommercialIndustry[]
  canton?: string[]
  timeline?: CommercialTimeline[]
  financing?: CommercialFinancingPreference[]
  assignedToId?: string
  unassigned?: boolean
  overdueFollowUp?: boolean
  dateFrom?: string
  dateTo?: string
  sort?: string
}

export interface UpdatePayload {
  status?: CommercialLeadStatus
  assignedToId?: string | null
  nextFollowUpAt?: string | null
  lostReason?: string | null
  wonAmountChf?: number | null
  industry?: CommercialIndustry
  legalForm?: CommercialLegalForm
  employeeBracket?: CommercialEmployeeBracket
  timeline?: CommercialTimeline
  financingPreferences?: CommercialFinancingPreference[]
  budgetBracket?: CommercialBudgetBracket
  existingPv?: CommercialExistingPv
  currentSupplier?: string | null
  contractEndDate?: string | null
  annualElectricityCostChf?: number | null
  annualConsumptionKwh?: number | null
  uidNumber?: string | null
  website?: string | null
  numberOfSites?: number
}

class AdminCommercialLeadService {
  async list(q: ListQuery = {}): Promise<CommercialLeadListResponse> {
    const res = await api.get<CommercialLeadListResponse>('/admin/commercial-leads', { params: q })
    return res.data
  }

  async get(id: string): Promise<CommercialLeadDetail> {
    const res = await api.get<{ success: true; data: CommercialLeadDetail }>(`/admin/commercial-leads/${id}`)
    return res.data.data
  }

  async update(id: string, payload: UpdatePayload): Promise<CommercialLeadDetail> {
    const res = await api.patch<{ success: true; data: CommercialLeadDetail }>(
      `/admin/commercial-leads/${id}`, payload,
    )
    return res.data.data
  }

  async addNote(id: string, body: string): Promise<CommercialLeadNote> {
    const res = await api.post<{ success: true; data: CommercialLeadNote }>(
      `/admin/commercial-leads/${id}/notes`, { body },
    )
    return res.data.data
  }

  async updateNote(id: string, noteId: string, body: string): Promise<CommercialLeadNote> {
    const res = await api.patch<{ success: true; data: CommercialLeadNote }>(
      `/admin/commercial-leads/${id}/notes/${noteId}`, { body },
    )
    return res.data.data
  }

  async deleteNote(id: string, noteId: string): Promise<void> {
    await api.delete(`/admin/commercial-leads/${id}/notes/${noteId}`)
  }

  async logActivity(
    id: string,
    type: 'CALL_LOGGED' | 'MEETING_SCHEDULED' | 'QUOTE_SENT' | 'EMAIL_SENT',
    payload?: Record<string, unknown>,
  ): Promise<CommercialLeadActivity> {
    const res = await api.post<{ success: true; data: CommercialLeadActivity }>(
      `/admin/commercial-leads/${id}/activities`, { type, payload },
    )
    return res.data.data
  }

  async uploadAttachment(id: string, type: CommercialAttachmentType, file: File): Promise<CommercialLeadAttachment> {
    const form = new FormData()
    form.append('type', type); form.append('file', file)
    const res = await api.post<{ success: true; data: CommercialLeadAttachment }>(
      `/admin/commercial-leads/${id}/attachments`, form,
    )
    return res.data.data
  }

  async deleteAttachment(id: string, attachmentId: string): Promise<void> {
    await api.delete(`/admin/commercial-leads/${id}/attachments/${attachmentId}`)
  }

  async stats(windowDays = 90) {
    const res = await api.get(`/admin/commercial-leads/stats`, { params: { window: windowDays } })
    return res.data.data
  }

  exportCsvUrl(q: ListQuery = {}) {
    const params = new URLSearchParams()
    Object.entries(q).forEach(([k, v]) => {
      if (v == null) return
      if (Array.isArray(v)) v.forEach((x) => params.append(k, String(x)))
      else params.append(k, String(v))
    })
    return `/api/admin/commercial-leads/export.csv?${params.toString()}`
  }
}

export const adminCommercialLeadService = new AdminCommercialLeadService()
