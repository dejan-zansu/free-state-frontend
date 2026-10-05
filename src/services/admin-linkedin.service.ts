import api from '@/lib/api'
import type {
  LinkedinAgentLogItem,
  LinkedinEngagementOverview,
  LinkedinMessage,
  LinkedinOverview,
  LinkedinPostList,
  LinkedinProspectCard,
  LinkedinQueue,
  LinkedinReplyOutcome,
  LinkedinSenderInput,
  LinkedinSenderRow,
  LinkedinTouchSummary,
} from '@/types/admin-outreach'

type Envelope<T> = { success: boolean; data: T }

const BASE = '/admin/outreach/linkedin'

const acting = (senderId?: string) =>
  senderId ? { params: { senderId } } : undefined

class AdminLinkedinService {
  async getQueue(senderId?: string): Promise<LinkedinQueue> {
    const response = await api.get<Envelope<LinkedinQueue>>(
      `${BASE}/queue`,
      acting(senderId)
    )
    return response.data.data
  }

  async getOverview(): Promise<LinkedinOverview> {
    const response = await api.get<Envelope<LinkedinOverview>>(
      `${BASE}/overview`
    )
    return response.data.data
  }

  async listReview(): Promise<LinkedinProspectCard[]> {
    const response = await api.get<Envelope<LinkedinProspectCard[]>>(
      `${BASE}/review`
    )
    return response.data.data
  }

  async recordRequest(prospectId: string, senderId?: string): Promise<void> {
    await api.post(
      `${BASE}/prospects/${prospectId}/request`,
      undefined,
      acting(senderId)
    )
  }

  async review(
    prospectId: string,
    decision: 'confirm' | 'reject'
  ): Promise<void> {
    await api.post(`${BASE}/prospects/${prospectId}/review`, { decision })
  }

  async setProfile(
    prospectId: string,
    input: {
      profileUrl: string | null
      personName?: string
      personRole?: string
    }
  ): Promise<void> {
    await api.put(`${BASE}/prospects/${prospectId}/profile`, input)
  }

  async getProspectTouch(
    prospectId: string
  ): Promise<LinkedinTouchSummary | null> {
    const response = await api.get<Envelope<LinkedinTouchSummary | null>>(
      `${BASE}/prospects/${prospectId}/touch`
    )
    return response.data.data
  }

  async markAccepted(touchId: string, senderId?: string): Promise<void> {
    await api.post(
      `${BASE}/touches/${touchId}/accepted`,
      undefined,
      acting(senderId)
    )
  }

  async markWithdrawn(touchId: string, senderId?: string): Promise<void> {
    await api.post(
      `${BASE}/touches/${touchId}/withdrawn`,
      undefined,
      acting(senderId)
    )
  }

  async getMessage(
    touchId: string,
    senderId?: string
  ): Promise<LinkedinMessage> {
    const response = await api.get<Envelope<LinkedinMessage>>(
      `${BASE}/touches/${touchId}/message`,
      acting(senderId)
    )
    return response.data.data
  }

  async markMessaged(
    touchId: string,
    templateId?: string,
    senderId?: string
  ): Promise<void> {
    await api.post(
      `${BASE}/touches/${touchId}/messaged`,
      templateId ? { templateId } : {},
      acting(senderId)
    )
  }

  async markReplied(
    touchId: string,
    outcome: LinkedinReplyOutcome,
    note?: string,
    senderId?: string
  ): Promise<void> {
    await api.post(
      `${BASE}/touches/${touchId}/replied`,
      note ? { outcome, note } : { outcome },
      acting(senderId)
    )
  }

  async listSenders(): Promise<LinkedinSenderRow[]> {
    const response = await api.get<Envelope<LinkedinSenderRow[]>>(
      `${BASE}/senders`
    )
    return response.data.data
  }

  async createSender(input: LinkedinSenderInput): Promise<void> {
    await api.post(`${BASE}/senders`, input)
  }

  async updateSender(id: string, input: LinkedinSenderInput): Promise<void> {
    await api.patch(`${BASE}/senders/${id}`, input)
  }

  async createAgentKey(senderId: string): Promise<{ key: string }> {
    const response = await api.post<Envelope<{ key: string }>>(
      `${BASE}/senders/${senderId}/agent-key`
    )
    return response.data.data
  }

  async revokeAgentKey(senderId: string): Promise<void> {
    await api.delete(`${BASE}/senders/${senderId}/agent-key`)
  }

  async resumeSender(senderId: string): Promise<void> {
    await api.post(`${BASE}/senders/${senderId}/resume`)
  }

  async getAgentLog(senderId?: string): Promise<LinkedinAgentLogItem[]> {
    const response = await api.get<Envelope<LinkedinAgentLogItem[]>>(
      `${BASE}/agent-log`,
      acting(senderId)
    )
    return response.data.data
  }

  async listPosts(senderId?: string): Promise<LinkedinPostList> {
    const response = await api.get<Envelope<LinkedinPostList>>(
      `${BASE}/posts`,
      acting(senderId)
    )
    return response.data.data
  }

  async cancelPost(postId: string, senderId?: string): Promise<void> {
    await api.post(
      `${BASE}/posts/${postId}/cancel`,
      undefined,
      acting(senderId)
    )
  }

  async getEngagement(senderId?: string): Promise<LinkedinEngagementOverview> {
    const response = await api.get<Envelope<LinkedinEngagementOverview>>(
      `${BASE}/engagement`,
      acting(senderId)
    )
    return response.data.data
  }
}

export const adminLinkedinService = new AdminLinkedinService()
