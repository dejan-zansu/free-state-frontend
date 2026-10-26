import api from '@/lib/api'
import type { Milestone, MilestoneStage } from '@/types/milestone'
import type {
  SalesLeadActivity,
  SalesLeadDetail,
  SalesLeadListQuery,
  SalesLeadListResponse,
  SalesLeadMilestoneInput,
  SalesLeadNoteInput,
  SalesLeadTeamMember,
  SalesLeadUpdateInput,
} from '@/types/sales-lead'

const BASE = '/admin/sales-leads'

class SalesLeadService {
  async list(query: SalesLeadListQuery = {}): Promise<SalesLeadListResponse> {
    const response = await api.get<SalesLeadListResponse>(BASE, {
      params: query,
    })
    return response.data
  }

  async get(id: string): Promise<SalesLeadDetail> {
    const response = await api.get<{ success: boolean; data: SalesLeadDetail }>(
      `${BASE}/${id}`
    )
    return response.data.data
  }

  async update(
    id: string,
    data: SalesLeadUpdateInput
  ): Promise<SalesLeadDetail> {
    const response = await api.patch<{
      success: boolean
      data: SalesLeadDetail
    }>(`${BASE}/${id}`, data)
    return response.data.data
  }

  async addNote(
    id: string,
    data: SalesLeadNoteInput
  ): Promise<SalesLeadActivity> {
    const response = await api.post<{
      success: boolean
      data: SalesLeadActivity
    }>(`${BASE}/${id}/notes`, data)
    return response.data.data
  }

  async markConsultationBooked(id: string): Promise<SalesLeadDetail> {
    const response = await api.post<{
      success: boolean
      data: SalesLeadDetail
    }>(`${BASE}/${id}/consultation-booked`)
    return response.data.data
  }

  async updateMilestone(
    id: string,
    stage: MilestoneStage,
    data: SalesLeadMilestoneInput
  ): Promise<Milestone> {
    const response = await api.patch<{
      success: boolean
      data: { milestone: Milestone }
    }>(`${BASE}/${id}/milestones/${stage}`, data)
    return response.data.data.milestone
  }

  async team(): Promise<SalesLeadTeamMember[]> {
    const response = await api.get<{
      success: boolean
      data: SalesLeadTeamMember[]
    }>(`${BASE}/team`)
    return response.data.data
  }

  async downloadReport(id: string, fallbackAddress?: string): Promise<void> {
    const response = await api.get(`${BASE}/${id}/report`, {
      responseType: 'blob',
      timeout: 60000,
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const contentDisposition = response.headers['content-disposition']
    let filename = 'Lead_Report.pdf'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match) filename = match[1]
    } else if (fallbackAddress) {
      const sanitized = fallbackAddress
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 30)
      filename = `Lead_Report_${sanitized}.pdf`
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const salesLeadService = new SalesLeadService()
