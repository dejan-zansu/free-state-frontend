import type { OutboundProspectStatus } from '../admin-outreach'
import type {
  LeadAssigneeFilter,
  LeadCrmLink,
  LeadManualChannel,
  LeadOwnerInfo,
  LeadWork,
  LeadWorkState,
  OutboundLeadAssignee,
} from './kpi'

export const INBOX_TABS = [
  'waiting',
  'new',
  'followUp',
  'withThem',
  'leads',
  'closed',
  'all',
] as const

export type InboxTab = (typeof INBOX_TABS)[number]

export const INBOX_SOURCES = [
  'OUTBOUND',
  'EXPLEE',
  'ROOF_PAGE',
  'LINKEDIN',
  'PHONE',
  'LETTER',
  'OTHER',
  'CUSTOMER',
] as const

export type InboxSource = (typeof INBOX_SOURCES)[number]

export interface InboxItem {
  key: string
  kind: 'prospect' | 'customer'
  title: string
  person: string | null
  email: string | null
  place: string | null
  source: InboxSource | null
  excerpt: string | null
  at: string | null
  isLead: boolean
  late: boolean
  isNew: boolean
  assignedTo: OutboundLeadAssignee | null
  prospect: {
    id: string
    reference: string
    status: OutboundProspectStatus
    work: LeadWork
    owner: LeadOwnerInfo | null
    crmLead: LeadCrmLink | null
    hasLead: boolean
  } | null
}

export interface InboxBadge {
  waiting: number
  late: number
}

export interface InboxListQuery {
  tab: InboxTab
  source?: InboxSource
  assignee?: LeadAssigneeFilter
  search?: string
  page?: number
  limit?: number
}

export interface InboxListResponse {
  items: InboxItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    byTab: Record<InboxTab, number>
    bySource: Partial<Record<InboxSource, number>>
    byState: Partial<Record<LeadWorkState, number>>
    badge: InboxBadge
  }
}

export interface InboxSeenInput {
  key: string
  upTo?: string
}

export interface InboxSeenResult {
  key: string
  seenAt: string
}

export const INBOX_ANSWERS = [
  'INTERESTED',
  'QUESTION',
  'NOT_NOW',
  'NOT_INTERESTED',
  'UNSUBSCRIBE',
] as const

export type InboxAnswer = (typeof INBOX_ANSWERS)[number]

export type InboxSuppressionReason =
  | 'OPT_OUT'
  | 'HARD_BOUNCE'
  | 'MANUAL'
  | 'COMPLAINT'
  | 'NEWSLETTER_UNSUB'
  | 'PRIOR_CONTACT'

export interface InboxSuppression {
  key: string
  reason: InboxSuppressionReason
  note: string | null
  createdAt: string
}

export interface InboxEntryMatchQuery {
  email?: string
  website?: string
  companyName?: string
  postalCode?: string
}

export interface InboxEntryHit {
  prospectId: string
  reference: string
  companyName: string
  status: OutboundProspectStatus
  person: string | null
  email: string | null
  city: string | null
  assignedTo: OutboundLeadAssignee | null
  match: 'email' | 'sender' | 'company' | 'domain'
  withSales: boolean
  terminal: boolean
}

export interface InboxEntryMatches {
  hits: InboxEntryHit[]
  newAllowed: boolean
  suppression: InboxSuppression | null
}

export interface InboxEntryInput {
  entryId: string
  channel: LeadManualChannel
  prospectId?: string
  companyName?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  receivedAt: string
  text: string
  answer: InboxAnswer
  until?: string
  addressStreet?: string
  addressNumber?: string
  addressPostalCode?: string
  addressCity?: string
  note?: string
}

export interface InboxEntryResult {
  key: string
  prospectId: string
  reference: string
  emailId: string
  created: boolean
  repeated: boolean
  statusChanged: boolean
  decision: 'none' | 'applied' | 'skipped_with_sales' | 'skipped_closed'
  stopped: string[]
}
