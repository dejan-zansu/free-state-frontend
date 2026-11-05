// KPI line, QRL leads and call outcomes of the owner-first build (backend
// docs/outbound-owner-first-build.md 4.11 and 4.12). Mirrors
// backend src/controllers/outbound-kpi.controller.ts and
// src/services/outbound/qrl.service.ts.

import type {
  OutboundActivity,
  OutboundProspectStatus,
  OutboundReplyClassification,
  PvVerdict,
} from '../admin-outreach'
import type { CommercialLeadStatus } from '../commercial-lead'
import type {
  OutboundChannel,
  OutboundLeadCriterion,
  OutboundLeadKind,
  OutboundLetterKind,
  OutboundLetterStatus,
  OutboundSegment,
  OwnerLookupStatus,
  OwnerPartyType,
  OwnershipConfidence,
  ProspectPartyRole,
} from './owner-first'

// Doc 69 §10 KPI line of one Europe/Zurich day. Rates are percent (1.8 means
// 1.8%), newRecipientsBySegment is keyed by segment letter A to F.
export interface KpiLine {
  day: string
  newRecipientsBySegment: Record<string, number>
  letters: number
  dials: number
  humanReplies: number
  tenantReplies: number
  hasPvReplies: number
  ownerHints: number
  qrl: number
  qrl7d: number
  qrl20d: number
  warmOpenOver4h: number
  medianWarmAnswerHours: number | null
  meetingsHeld: number
  offersSent: number
  bounceRate7d: number
  bounceRate7dByMailbox: Record<string, number>
  mailboxFillPct: number | null
}

export interface KpiDay extends KpiLine {
  line: string
}

// GET /kpi/daily?from&to
export interface KpiDailyQuery {
  from?: string
  to?: string
}

export interface KpiDailyResponse {
  from: string
  to: string
  qrlPromotionConfigured: boolean
  days: KpiDay[]
}

// GET /kpi/warm-open
export interface WarmOpenItem {
  emailId: string
  prospectId: string
  receivedAt: string
  ageWorkingHours: number
  signal: string | null
  reference: string | null
  companyName: string | null
  prospectStatus: OutboundProspectStatus | null
  fromAddress: string | null
  subject: string | null
  humanRequired: boolean
}

export interface WarmOpenResponse {
  items: WarmOpenItem[]
}

export type LeadPromotion =
  | 'promoted'
  | 'not_qrl'
  | 'no_assignee'
  | `refused:${string}`

// GET /leads?from&to
export interface OutboundLeadRow {
  id: string
  kind: OutboundLeadKind
  criterion: OutboundLeadCriterion
  channel: OutboundChannel
  buildingKey: string
  segment: OutboundSegment | null
  qualifiedAt: string
  recordedBy: string
  note: string | null
  commercialLeadId: string | null
  residentialLeadId: string | null
  promotionNote: string | null
  letterTargetId: string | null
  prospect: {
    id: string
    reference: string
    companyName: string
    status: OutboundProspectStatus
  } | null
  commercialLead: { id: string; reference: string; status: string } | null
}

export interface LeadsResponse {
  from: string
  to: string
  qrlPromotionConfigured: boolean
  items: OutboundLeadRow[]
  summary: {
    total: number
    byKind: Record<string, number>
    byChannel: Record<string, number>
  }
}

export type OutboundLeadState = 'open' | 'in_crm' | 'closed'

export type LeadWorkState =
  | 'ANTWORT_OFFEN'
  | 'ENTWURF_PRUEFEN'
  | 'NACHFASSEN_FAELLIG'
  | 'EIGENTUEMER_KONTAKTIEREN'
  | 'ABGESAGT'
  | 'BEENDET'
  | 'IM_VERKAUF'
  | 'ZURUECKGESTELLT'
  | 'EIGENTUEMER_ANGESCHRIEBEN'
  | 'WARTET_AUF_ANTWORT'

export type LeadWorkTurn =
  | 'US'
  | 'CUSTOMER'
  | 'OWNER'
  | 'PAUSED'
  | 'SALES'
  | 'CLOSED'

export type LeadWorkTab = 'us' | 'customer' | 'sales' | 'closed'

export type LeadWorkTabFilter = LeadWorkTab | 'all'

export type LeadAssigneeFilter = 'me' | 'unassigned'

export type LeadNextStep =
  | 'REVIEW_DRAFT'
  | 'CALL'
  | 'REPLY'
  | 'FOLLOW_UP'
  | 'OPEN_OWNER'
  | 'CAPTURE_OWNER'
  | 'OPEN_CRM'

export type LeadOwnerStep =
  | 'CAPTURE'
  | 'OPEN_ROW'
  | 'CONTACTED'
  | 'REPLIED'
  | 'CLOSED'

export type LeadReason =
  | 'OFFER_REQUEST'
  | 'MEETING_DATED'
  | 'BUILDING_DATA'
  | 'OWNER_NAMED'
  | 'INTERESTED_OWNERSHIP_OPEN'
  | 'HINT'
  | 'NOT_INTERESTED'
  | 'OPTED_OUT'
  | 'CALCULATOR_START'
  | 'CONTACT_REQUEST'

export type LeadInterest =
  | 'OFFER_REQUEST'
  | 'MEETING_REQUEST'
  | 'BUILDING_DATA'
  | 'INTERESTED'

export type LeadClosedReason =
  | 'NOT_INTERESTED'
  | 'OPTED_OUT'
  | 'BOUNCED'
  | 'EXPIRED'
  | 'SCREENED_OUT'
  | 'HINT_DONE'
  | 'OWNER_ROW_CLOSED'

export type LeadTouchSource = 'EMAIL' | 'ROOF_PAGE' | 'LINKEDIN' | 'LEAD'

export type LeadAnswerSource = 'EMAIL' | 'CALL' | 'MEETING' | 'OFFER'

export interface LeadCustomerTouch {
  at: string
  source: LeadTouchSource
  excerpt: string | null
  classification: OutboundReplyClassification | null
  emailId: string | null
  strong: boolean
}

export interface LeadOpenRequest {
  at: string
  criterion: 'OFFER_REQUEST' | 'MEETING_DATED'
}

export interface LeadOurAnswer {
  at: string
  source: LeadAnswerSource
  automatic: boolean
}

export interface LeadWorkDraft {
  id: string
  createdAt: string
  subject: string
  holdReason: 'human_required' | 'reply_not_approved'
  stale: boolean
  answersEmailId: string | null
}

export interface LeadFollowUp {
  at: string | null
  source: 'PROSPECT' | 'CRM' | 'CALCULATOR'
  active: boolean
  due: boolean
}

export interface LeadWorkCounts {
  mailsFromUs: number
  automaticMails: number
  replies: number
  calls: number
  reachedCalls: number
}

export interface LeadWork {
  state: LeadWorkState
  turn: LeadWorkTurn
  tab: LeadWorkTab
  since: string | null
  sinceDays: number | null
  late: boolean
  pausedUntil: string | null
  nextStep: LeadNextStep | null
  ownerStep: LeadOwnerStep | null
  kind: OutboundLeadKind | null
  reason: LeadReason | null
  interest: LeadInterest | null
  lastCustomerTouch: LeadCustomerTouch | null
  openTouch: LeadCustomerTouch | null
  openRequest: LeadOpenRequest | null
  lastOurAnswer: LeadOurAnswer | null
  firstContactAt: string | null
  draft: LeadWorkDraft | null
  draftWaiting: boolean
  followUp: LeadFollowUp
  followUpDue: boolean
  counts: LeadWorkCounts
  closedReason: LeadClosedReason | null
  closedDetail: string | null
  reopened: boolean
  doNotContact: boolean
  readOnly: boolean
}

export interface LeadOwnerRow {
  id: string
  reference: string
  companyName: string
  status: OutboundProspectStatus
  closed: boolean
  contacted: boolean
  mailsSent: number
  reachedCalls: number
  hasDraft: boolean
  lastContactAt: string | null
  openTouchAt: string | null
}

export interface LeadOwnerLookup {
  id: string
  status: OwnerLookupStatus
  tier: string
  createdAt: string
}

export interface LeadOwnerInfo {
  name: string | null
  step: LeadOwnerStep
  partyType: OwnerPartyType | null
  row: LeadOwnerRow | null
  lookup: LeadOwnerLookup | null
}

export interface OutboundLeadListQuery {
  page?: number
  limit?: number
  search?: string
  kind?: OutboundLeadKind
  criterion?: OutboundLeadCriterion
  channel?: OutboundChannel
  state?: OutboundLeadState
  tab?: LeadWorkTabFilter
  assignee?: LeadAssigneeFilter
  draftWaiting?: boolean
  followUpDue?: boolean
}

export interface OutboundLeadAssignee {
  id: string
  firstName: string
  lastName: string
}

export interface LeadCrmLink {
  id: string
  reference: string
  status: CommercialLeadStatus
  nextFollowUpAt: string | null
  assignedTo: OutboundLeadAssignee | null
}

export interface OutboundLeadListItem {
  id: string
  kind: OutboundLeadKind
  criterion: OutboundLeadCriterion
  channel: OutboundChannel
  segment: OutboundSegment | null
  buildingKey: string
  qualifiedAt: string
  recordedBy: string
  note: string | null
  promotionNote: string | null
  state: OutboundLeadState
  prospect: {
    id: string
    reference: string
    companyName: string
    status: OutboundProspectStatus
    addressStreet: string | null
    addressNumber: string | null
    addressPostalCode: string | null
    addressCity: string | null
    addressCanton: string | null
    contactName: string | null
    contactRole: string | null
    contactEmail: string | null
    contactPhone: string | null
    nextActionAt: string | null
    followUpAt: string | null
    assignedTo: OutboundLeadAssignee | null
    roofAreaM2: number | null
    roofKwhYear: number | null
    pvVerdict: PvVerdict
    imageryVerdict: string | null
    buildingYear: number | null
    partyRole: ProspectPartyRole
    ownershipConfidence: OwnershipConfidence
    ownerName: string | null
  } | null
  commercialLead: LeadCrmLink | null
  residentialLead: {
    id: string
    status: string
    nextFollowUp: string | null
    assignedTo: OutboundLeadAssignee | null
    contactName: string | null
    contactEmail: string
    contactPhone: string | null
  } | null
  letterTarget: {
    id: string
    addressStreet: string | null
    addressNumber: string | null
    addressPostalCode: string | null
    addressCity: string | null
  } | null
  work: LeadWork
  owner: LeadOwnerInfo | null
  assignedTo: OutboundLeadAssignee | null
}

export interface OutboundLeadListResponse {
  qrlPromotionConfigured: boolean
  items: OutboundLeadListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary: {
    total: number
    byKind: Partial<Record<OutboundLeadKind, number>>
    byState: Record<OutboundLeadState, number>
    byTab: Record<LeadWorkTabFilter, number>
    toggles: {
      me: number
      unassigned: number
      draftWaiting: number
      followUpDue: number
    }
    byWorkState: Partial<Record<LeadWorkState, number>>
    headline: {
      waitingForAnswer: number
      withUs: number
      withUsUnassigned: number
    }
  }
}

export interface LeadWorkSnapshot {
  work: LeadWork
  owner: LeadOwnerInfo | null
  assignedTo: OutboundLeadAssignee | null
  crmLead: LeadCrmLink | null
}

export interface LeadWorkPatch {
  assignedToId?: string | null
  followUpAt?: string | null
}

export type LeadDecisionInput =
  | { outcome: 'NOT_INTERESTED'; note?: string }
  | { outcome: 'NOT_NOW'; until: string; note?: string }
  | { outcome: 'HINT_DONE'; note?: string }

export type LeadDecisionOutcome = LeadDecisionInput['outcome']

export interface LeadDecisionResult extends LeadWorkSnapshot {
  outcome: LeadDecisionOutcome
  status: OutboundProspectStatus
  statusChanged: boolean
  suppressed: string | null
  draftsFailed: number
  draftsHeld: number
  siblingsStopped: string[]
  snoozedUntil: string | null
}

export interface LeadNamedOwnerInput {
  name: string
  role?: 'OWNER' | 'MANAGER' | 'UNKNOWN'
  email?: string
  tenantConsent?: boolean
  channel?: OutboundChannel
  note?: string
}

export type LeadNamedOwnerOutcome =
  | 'owner_prospect'
  | 'duplicate'
  | 'lookup_queued'
  | 'blocked'

export interface LeadNamedOwnerResult extends LeadWorkSnapshot {
  outcome: LeadNamedOwnerOutcome
  reason: string | null
  ownerProspectId: string | null
  lookupId: string | null
  lead: { id: string; kind: OutboundLeadKind; created: boolean } | null
}

// POST /prospects/:id/leads
export interface RecordLeadRequest {
  kind?: 'QRL' | 'EIGENTUEMER_HINWEIS'
  criterion: OutboundLeadCriterion
  channel: OutboundChannel
  sourceEmailId?: string
  sourceActivityId?: string
  note?: string
  qualifiedAt?: string
}

export interface RecordLeadResponse {
  id: string
  created: boolean
  kind: OutboundLeadKind
  commercialLeadId: string | null
  promotion: LeadPromotion
}

// POST /prospects/:id/activities answers a call with an outcome with the
// activity plus what recordCallOutcome did.
export interface CallOutcomeResult {
  activityId: string
  leadId?: string
  ownerProspectId?: string
  lookupId?: string
}

export type OutboundActivityWithCallOutcome = OutboundActivity & {
  callOutcome?: CallOutcomeResult
}

// GET /call-queue/letters?listedOnly=true
export interface CallDueLetter {
  id: string
  kind: OutboundLetterKind
  status: OutboundLetterStatus
  templateKey: string
  recipientName: string
  submittedAt: string | null
  sentAt: string | null
  deliveredAt: string | null
  callDueAt: string | null
  createdAt: string
  lastCallAt: string | null
  prospect: {
    id: string
    reference: string
    companyName: string
    status: OutboundProspectStatus
    addressStreet: string | null
    addressNumber: string | null
    addressPostalCode: string | null
    addressCity: string | null
    contactPhone: string | null
    directoryListedNoStar: boolean | null
  }
}

export interface CallDueLettersResponse {
  items: CallDueLetter[]
}
