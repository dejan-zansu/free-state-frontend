import api from '@/lib/api'
import type {
  InboxBadge,
  InboxEntryInput,
  InboxEntryMatchQuery,
  InboxEntryMatches,
  InboxEntryResult,
  InboxListQuery,
  InboxListResponse,
  InboxSeenInput,
  InboxSeenResult,
} from '@/types/outreach/inbox'

type Envelope<T> = { success: boolean; data: T }

const BASE = '/admin/outreach/inbox'

class OutreachInboxService {
  async list(query: InboxListQuery): Promise<InboxListResponse> {
    const response = await api.get<Envelope<InboxListResponse>>(BASE, {
      params: {
        tab: query.tab,
        source: query.source,
        assignee: query.assignee,
        search: query.search || undefined,
        page: query.page,
        limit: query.limit,
      },
    })
    return response.data.data
  }

  async summary(): Promise<InboxBadge> {
    const response = await api.get<Envelope<InboxBadge>>(`${BASE}/summary`)
    return response.data.data
  }

  async markSeen(input: InboxSeenInput): Promise<InboxSeenResult> {
    const response = await api.post<Envelope<InboxSeenResult>>(
      `${BASE}/seen`,
      input
    )
    return response.data.data
  }

  async entryMatches(query: InboxEntryMatchQuery): Promise<InboxEntryMatches> {
    const response = await api.get<Envelope<InboxEntryMatches>>(
      `${BASE}/entry-matches`,
      { params: query }
    )
    return response.data.data
  }

  async createEntry(input: InboxEntryInput): Promise<InboxEntryResult> {
    const response = await api.post<Envelope<InboxEntryResult>>(
      `${BASE}/entries`,
      input
    )
    return response.data.data
  }
}

export const outreachInboxService = new OutreachInboxService()
