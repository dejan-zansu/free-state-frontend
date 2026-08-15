import api from '@/lib/api'
import type {
  OutboundActivity,
  OutboundAssignee,
  OutboundCallQueue,
  OutboundConnectorName,
  OutboundContactPatch,
  OutboundEmail,
  OutboundEmailPatch,
  OutboundEmailPreview,
  OutboundLeadThread,
  OutboundManualActivityInput,
  OutboundManualReplyInput,
  OutboundPromoteInput,
  OutboundPromoteResult,
  OutboundSendResult,
  OutboundProspectCreateInput,
  OutboundProspectDetail,
  OutboundRunRow,
  OutboundTemplateRow,
  OutreachListQuery,
  OutreachProspectList,
  OutreachStats,
} from '@/types/admin-outreach'

class AdminOutreachService {
  async listCallQueue(): Promise<OutboundCallQueue> {
    const response = await api.get<{ success: boolean; data: OutboundCallQueue }>('/admin/outreach/call-queue')
    return response.data.data
  }

  async listProspects(q: OutreachListQuery = {}): Promise<OutreachProspectList> {
    const response = await api.get<{ success: boolean; data: OutreachProspectList }>('/admin/outreach/prospects', {
      params: { ...q, status: q.status?.join(',') || undefined },
    })
    return response.data.data
  }

  async getProspect(id: string): Promise<OutboundProspectDetail> {
    const response = await api.get<{ success: boolean; data: OutboundProspectDetail }>(`/admin/outreach/prospects/${id}`)
    return response.data.data
  }

  async getStats(): Promise<OutreachStats> {
    const response = await api.get<{ success: boolean; data: OutreachStats }>('/admin/outreach/stats')
    return response.data.data
  }

  async getRuns(): Promise<OutboundRunRow[]> {
    const response = await api.get<{ success: boolean; data: OutboundRunRow[] }>('/admin/outreach/runs')
    return response.data.data
  }

  async runConnector(name: OutboundConnectorName): Promise<{ started: boolean }> {
    const response = await api.post<{ success: boolean; data: { started: boolean } }>(`/admin/outreach/sync/${name}/run`)
    return response.data.data
  }

  async updateContact(id: string, patch: OutboundContactPatch): Promise<OutboundProspectDetail> {
    const response = await api.patch<{ success: boolean; data: OutboundProspectDetail }>(`/admin/outreach/prospects/${id}/contact`, patch)
    return response.data.data
  }

  async createProspect(input: OutboundProspectCreateInput): Promise<OutboundProspectDetail> {
    const response = await api.post<{ success: boolean; data: OutboundProspectDetail }>('/admin/outreach/prospects', input)
    return response.data.data
  }

  async updateEmail(id: string, patch: OutboundEmailPatch): Promise<OutboundEmail> {
    const response = await api.patch<{ success: boolean; data: OutboundEmail }>(`/admin/outreach/emails/${id}`, patch)
    return response.data.data
  }

  async rejectEmail(id: string, reason?: string): Promise<{ rejected: boolean }> {
    const response = await api.post<{ success: boolean; data: { rejected: boolean } }>(`/admin/outreach/emails/${id}/reject`, reason ? { reason } : {})
    return response.data.data
  }

  async getEmailPreview(id: string): Promise<OutboundEmailPreview> {
    const response = await api.get<{ success: boolean; data: OutboundEmailPreview }>(`/admin/outreach/emails/${id}/preview`)
    return response.data.data
  }

  async sendEmail(id: string): Promise<OutboundSendResult> {
    const response = await api.post<{ success: boolean; data: OutboundSendResult }>(`/admin/outreach/emails/${id}/send`)
    return response.data.data
  }

  async promoteProspect(id: string, input: OutboundPromoteInput): Promise<OutboundPromoteResult> {
    const response = await api.post<{ success: boolean; data: OutboundPromoteResult }>(`/admin/outreach/prospects/${id}/promote`, input)
    return response.data.data
  }

  async listTemplates(): Promise<OutboundTemplateRow[]> {
    const response = await api.get<{ success: boolean; data: OutboundTemplateRow[] }>('/admin/outreach/templates')
    return response.data.data
  }

  async createManualReply(prospectId: string, input: OutboundManualReplyInput): Promise<OutboundEmail> {
    const response = await api.post<{ success: boolean; data: OutboundEmail }>(`/admin/outreach/prospects/${prospectId}/emails`, input)
    return response.data.data
  }

  async logActivity(prospectId: string, input: OutboundManualActivityInput): Promise<OutboundActivity> {
    const response = await api.post<{ success: boolean; data: OutboundActivity }>(`/admin/outreach/prospects/${prospectId}/activities`, input)
    return response.data.data
  }

  async listAssignees(): Promise<OutboundAssignee[]> {
    const response = await api.get<{ success: boolean; data: OutboundAssignee[] }>('/admin/outreach/assignees')
    return response.data.data
  }

  async attachLead(prospectId: string, leadId: string): Promise<OutboundPromoteResult> {
    const response = await api.post<{ success: boolean; data: OutboundPromoteResult }>(`/admin/outreach/prospects/${prospectId}/attach-lead`, { leadId })
    return response.data.data
  }

  async getByLead(leadId: string): Promise<OutboundLeadThread | null> {
    const response = await api.get<{ success: boolean; data: OutboundLeadThread | null }>(`/admin/outreach/by-lead/${leadId}`)
    return response.data.data
  }
}

export const adminOutreachService = new AdminOutreachService()
