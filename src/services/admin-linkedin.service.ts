import api from '@/lib/api'
import type {
  LinkedinMessage,
  LinkedinOverview,
  LinkedinProspectCard,
  LinkedinQueue,
  LinkedinReplyOutcome,
  LinkedinSenderInput,
  LinkedinSenderRow,
  LinkedinTouchSummary,
} from '@/types/admin-outreach'

type Envelope<T> = { success: boolean; data: T }

const BASE = '/admin/outreach/linkedin'

class AdminLinkedinService {
  async getQueue(): Promise<LinkedinQueue> {
    const response = await api.get<Envelope<LinkedinQueue>>(`${BASE}/queue`)
    return response.data.data
  }

  async getOverview(): Promise<LinkedinOverview> {
    const response = await api.get<Envelope<LinkedinOverview>>(`${BASE}/overview`)
    return response.data.data
  }

  async listReview(): Promise<LinkedinProspectCard[]> {
    const response = await api.get<Envelope<LinkedinProspectCard[]>>(`${BASE}/review`)
    return response.data.data
  }

  async recordRequest(prospectId: string): Promise<void> {
    await api.post(`${BASE}/prospects/${prospectId}/request`)
  }

  async review(prospectId: string, decision: 'confirm' | 'reject'): Promise<void> {
    await api.post(`${BASE}/prospects/${prospectId}/review`, { decision })
  }

  async setProfile(
    prospectId: string,
    input: { profileUrl: string | null; personName?: string; personRole?: string },
  ): Promise<void> {
    await api.put(`${BASE}/prospects/${prospectId}/profile`, input)
  }

  async getProspectTouch(prospectId: string): Promise<LinkedinTouchSummary | null> {
    const response = await api.get<Envelope<LinkedinTouchSummary | null>>(`${BASE}/prospects/${prospectId}/touch`)
    return response.data.data
  }

  async markAccepted(touchId: string): Promise<void> {
    await api.post(`${BASE}/touches/${touchId}/accepted`)
  }

  async markWithdrawn(touchId: string): Promise<void> {
    await api.post(`${BASE}/touches/${touchId}/withdrawn`)
  }

  async getMessage(touchId: string): Promise<LinkedinMessage> {
    const response = await api.get<Envelope<LinkedinMessage>>(`${BASE}/touches/${touchId}/message`)
    return response.data.data
  }

  async markMessaged(touchId: string, templateId?: string): Promise<void> {
    await api.post(`${BASE}/touches/${touchId}/messaged`, templateId ? { templateId } : {})
  }

  async markReplied(touchId: string, outcome: LinkedinReplyOutcome, note?: string): Promise<void> {
    await api.post(`${BASE}/touches/${touchId}/replied`, note ? { outcome, note } : { outcome })
  }

  async listSenders(): Promise<LinkedinSenderRow[]> {
    const response = await api.get<Envelope<LinkedinSenderRow[]>>(`${BASE}/senders`)
    return response.data.data
  }

  async createSender(input: LinkedinSenderInput): Promise<void> {
    await api.post(`${BASE}/senders`, input)
  }

  async updateSender(id: string, input: LinkedinSenderInput): Promise<void> {
    await api.patch(`${BASE}/senders/${id}`, input)
  }
}

export const adminLinkedinService = new AdminLinkedinService()
