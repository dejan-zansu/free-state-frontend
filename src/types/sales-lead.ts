import type {
  AdminLeadFinancials,
  AdminLeadProject,
  AdminProjectAttribution,
} from '@/types/admin'
import type { Milestone } from '@/types/milestone'

export type SalesLeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'ON_HOLD'

export type SalesLeadSource =
  | 'WEBSITE'
  | 'REFERRAL'
  | 'ADVERTISEMENT'
  | 'COLD_CALL'
  | 'TRADE_SHOW'
  | 'PARTNER'
  | 'OTHER'

export type SalesLeadActivityType =
  | 'STATUS_CHANGED'
  | 'NOTE'
  | 'CONSULT_BOOKED'
  | 'OFFER_SENT'
  | 'WON'
  | 'LOST'

export type SalesLeadNoteKind = 'CALL' | 'EMAIL' | 'MEETING'

export type SalesLeadSort = 'newest' | 'oldest' | 'followUp' | 'updated'

export interface SalesLeadPerson {
  id: string
  firstName: string
  lastName: string
}

export interface SalesLeadTeamMember extends SalesLeadPerson {
  role: 'ADMIN' | 'SALES_REP'
}

export interface SalesLeadActivity {
  id: string
  type: SalesLeadActivityType
  fromValue: string | null
  toValue: string | null
  createdAt: string
  actor: SalesLeadPerson | null
}

export interface SalesLeadListItem {
  id: string
  status: SalesLeadStatus
  source: SalesLeadSource
  propertyAddress: string
  interestedPackage: string | null
  estimatedBudget: number | null
  nextFollowUp: string | null
  offerCount: number
  offerSentAt: string | null
  createdAt: string
  updatedAt: string
  consultationBooked: boolean
  isPropertyOwner: boolean
  customer: {
    id: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string | null
      preferredLanguage: string | null
    }
  }
  assignedTo: SalesLeadPerson | null
  project: {
    id: string
    selectedPackage: string | null
    solarModel: string | null
    systemKwp: number | null
    annualProductionKwh: number | null
    annualSavingsChf: number | null
  } | null
  lastActivity: SalesLeadActivity | null
}

export interface SalesLeadSummary {
  total: number
  byStatus: Record<SalesLeadStatus, number>
  mine: number
  unassigned: number
  followUpDue: number
}

export interface SalesLeadListMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SalesLeadListResponse {
  success: boolean
  data: SalesLeadListItem[]
  meta: SalesLeadListMeta
  summary: SalesLeadSummary
}

export interface SalesLeadListQuery {
  page?: number
  limit?: number
  search?: string
  status?: string
  source?: SalesLeadSource
  assignee?: 'me' | 'unassigned' | string
  followUp?: 'due'
  offerRequested?: 'true'
  includeInternal?: 'true'
  sort?: SalesLeadSort
}

export interface SalesLeadInspection {
  status: string
  scheduledAt: string
  completedAt: string | null
}

export interface SalesLeadDetail {
  id: string
  status: SalesLeadStatus
  source: SalesLeadSource
  propertyAddress: string
  propertyLat: number | null
  propertyLng: number | null
  interestedPackage: string | null
  estimatedBudget: number | null
  nextFollowUp: string | null
  notes: string | null
  offerSentAt: string | null
  offerCount: number
  wonAmountChf: number | null
  lostReason: string | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    isPropertyOwner: boolean
    propertyOwnerName: string | null
    propertyOwnerEmail: string | null
    propertyOwnerPhone: string | null
    notes: string | null
    addressAdditional: string | null
    alternatePhone: string | null
    alternateEmail: string | null
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string | null
      preferredLanguage: string | null
      lastLoginAt: string | null
    }
  }
  assignedTo: (SalesLeadPerson & { email: string }) | null
  project: AdminLeadProject | null
  financials: AdminLeadFinancials | null
  attribution: AdminProjectAttribution | null
  inspection: SalesLeadInspection | null
  milestones: Milestone[]
  consultationBookedAt: string | null
  activities: SalesLeadActivity[]
}

export interface SalesLeadUpdateInput {
  status?: SalesLeadStatus
  wonAmountChf?: number | null
  lostReason?: string | null
  assignedToId?: string | null
  nextFollowUp?: string | null
  note?: string
}

export interface SalesLeadNoteInput {
  body: string
  kind?: SalesLeadNoteKind
}

export interface SalesLeadMilestoneInput {
  status?: 'PENDING' | 'ACTIVE' | 'DONE'
  scheduledAt?: string | null
  note?: string | null
}
