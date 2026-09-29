// KPI line, QRL leads and call outcomes of the owner-first build (backend
// docs/outbound-owner-first-build.md 4.11 and 4.12). Mirrors
// backend src/controllers/outbound-kpi.controller.ts and
// src/services/outbound/qrl.service.ts.

import type {
  OutboundActivity,
  OutboundProspectStatus,
} from '../admin-outreach'
import type {
  OutboundChannel,
  OutboundLeadCriterion,
  OutboundLeadKind,
  OutboundLetterKind,
  OutboundLetterStatus,
  OutboundSegment,
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
