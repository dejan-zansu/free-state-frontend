// Letters and letter targets (backend src/controllers/outbound-letters.controller.ts
// and src/services/outbound/letter.service.ts, build contract 4.11 and 4.13).
// Shared enum unions live in ./owner-first.

import type {
  LetterTargetKind,
  LetterTargetStatus,
  OutboundLetterKind,
  OutboundLetterStatus,
} from './owner-first'

export interface LetterListQuery {
  status?: OutboundLetterStatus
  kind?: OutboundLetterKind
  limit?: number
}

export interface LetterRow {
  id: string
  kind: OutboundLetterKind
  status: OutboundLetterStatus
  templateKey: string
  templateVersion: number | null
  recipientName: string
  recipientLine2: string | null
  recipientStreet: string
  recipientPostalCode: string
  recipientCity: string
  recipientCountry: string
  hasPdf: boolean
  qrUrl: string | null
  provider: string
  providerLetterId: string | null
  providerStatus: string | null
  costChf: number | null
  submittedAt: string | null
  sentAt: string | null
  deliveredAt: string | null
  returnedAt: string | null
  failedReason: string | null
  callDueAt: string | null
  createdAt: string
  ownerSignalId: string | null
  prospect: { id: string; reference: string; companyName: string } | null
  letterTarget: {
    id: string
    kind: LetterTargetKind
    addressStreet: string | null
    addressNumber: string | null
    addressPostalCode: string | null
    addressCity: string | null
  } | null
}

export interface LetterSettings {
  lettersEnabled: boolean
  autosubmit: boolean
  dailyMax: number
  submittedToday: number
  unknownOwnerEnabled: boolean
  weeklyMax: number
  unknownOwnerThisWeek: number
  pingenConfigured: boolean
  pingenEnv: 'staging' | 'production'
  onePagerBaseSet: boolean
}

export interface LettersResponse {
  items: LetterRow[]
  counts: {
    byStatus: Partial<Record<OutboundLetterStatus, number>>
    byKind: Partial<Record<OutboundLetterKind, number>>
  }
  settings: LetterSettings
}

export interface LetterTargetQuery {
  kind?: LetterTargetKind
  status?: LetterTargetStatus
  limit?: number
}

export interface LetterTargetRow {
  id: string
  kind: LetterTargetKind
  status: LetterTargetStatus
  egid: string
  buildingClass: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressPostalCode: string | null
  addressCity: string | null
  addressCanton: string | null
  municipalityBfs: number | null
  roofAreaM2: number | null
  roofKwhYear: number | null
  pvVerdict: string
  pvCheckedAt: string | null
  dwellings: number | null
  excludeReason: string | null
  respondedAt: string | null
  createdAt: string
  lastLetter: {
    id: string
    status: OutboundLetterStatus
    sentAt: string | null
  } | null
}

export interface LetterTargetsResponse {
  items: LetterTargetRow[]
  counts: {
    byStatus: Partial<Record<LetterTargetStatus, number>>
    byKind: Partial<Record<LetterTargetKind, number>>
  }
}

export interface SubmitDueRequest {
  dryRun: boolean
  max?: number
}

export interface SubmitDueResponse {
  dryRun: boolean
  submitted: number
  skipped: number
}

export interface CancelLetterResponse {
  id: string
  status: OutboundLetterStatus
}

// GET /letters/preview?prospectId: the letter a prospect would get, for the
// manual print page.
export interface ProspectLetterPreview {
  prospectId: string
  kind: OutboundLetterKind
  templateKey: string | null
  templateState: 'active' | 'inactive' | 'builtin' | null
  recipientLines: string[]
  recipientSource: 'postal' | 'building' | null
  date: string
  subject: string | null
  paragraphs: string[]
  roofKwhYear: number | null
  qrUrl: string | null
  displayUrl: string | null
  qrSvg: string | null
  imageUrl: string | null
  imageCredit: string
  blockers: string[]
}
