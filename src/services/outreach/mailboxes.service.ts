// Client for the mailbox pool endpoints (backend
// src/routes/outbound-mailboxes.routes.ts), typed with
// @/types/outreach/mailboxes.

import api from '@/lib/api'
import type {
  CreateMailboxRequest,
  MailboxListResponse,
  MailboxOverview,
  MailboxStatsResponse,
  PauseMailboxRequest,
  PauseMailboxResponse,
  UpdateMailboxRequest,
} from '@/types/outreach/mailboxes'

type Envelope<T> = { success: boolean; data: T }

class OutreachMailboxesService {
  async list(): Promise<MailboxListResponse> {
    const response = await api.get<Envelope<MailboxListResponse>>(
      '/admin/outreach/mailboxes'
    )
    return response.data.data
  }

  async create(input: CreateMailboxRequest): Promise<MailboxOverview> {
    const response = await api.post<Envelope<MailboxOverview>>(
      '/admin/outreach/mailboxes',
      input
    )
    return response.data.data
  }

  async update(
    id: string,
    input: UpdateMailboxRequest
  ): Promise<MailboxOverview> {
    const response = await api.patch<Envelope<MailboxOverview>>(
      `/admin/outreach/mailboxes/${id}`,
      input
    )
    return response.data.data
  }

  async pause(
    id: string,
    input: PauseMailboxRequest = {}
  ): Promise<PauseMailboxResponse> {
    const response = await api.post<Envelope<PauseMailboxResponse>>(
      `/admin/outreach/mailboxes/${id}/pause`,
      input
    )
    return response.data.data
  }

  async resume(id: string): Promise<MailboxOverview> {
    const response = await api.post<Envelope<MailboxOverview>>(
      `/admin/outreach/mailboxes/${id}/resume`
    )
    return response.data.data
  }

  async stats(id: string, days = 30): Promise<MailboxStatsResponse> {
    const response = await api.get<Envelope<MailboxStatsResponse>>(
      `/admin/outreach/mailboxes/${id}/stats`,
      { params: { days } }
    )
    return response.data.data
  }
}

export const outreachMailboxesService = new OutreachMailboxesService()
