// Request and response types of the owner-lookup endpoints (backend
// src/routes/owner-lookup.routes.ts, controllers/owner-lookup.controller.ts,
// services/outbound/owner-lookup-queue.service.ts and
// owner-resolution.service.ts). Keep in step with those files.

import type {
  LookupTier,
  OwnerLookupSource,
  OwnerLookupStatus,
  OwnerPartyType,
  OwnerResolution,
  OwnershipConfidence,
  ProspectPartyRole,
} from './owner-first'

export type ClaimSource = 'TERRAVIS_UI' | 'CANTONAL_PORTAL'
export type ExtractPartyRole = 'OWNER' | 'CORRESPONDENCE' | 'MANAGER'

export interface CantonRegistryView {
  canton: string
  portalName: string | null
  portalUrl: string | null
  landRegistryOffice: {
    name: string
    phone: string | null
    email: string | null
    address: string | null
  } | null
  extractFeeChf: number | null
  manualPortalDailyCap: number | null
  directory: {
    finderUrl: string | null
    note: string
    offices: Array<{ name: string; phone: string | null }>
  } | null
}

export interface LookupProspectSummary {
  id: string
  reference: string
  companyName: string
  uid: string | null
  status: string
  ownershipConfidence: OwnershipConfidence
  partyRole: ProspectPartyRole
  egid: string | null
  egrid: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressPostalCode: string | null
  addressCity: string | null
  roofKwhYear: number | null
  companiesAtEgid: number
  dwellings: number | null
  contactEmail: string | null
}

export interface LookupScorePart {
  label: string
  points: number
}

export interface OwnerLookupItem {
  id: string
  status: OwnerLookupStatus
  tier: LookupTier
  priority: number
  priorityReasons: {
    tier?: string
    reason?: string
    parts?: LookupScorePart[]
  } | null
  source: OwnerLookupSource
  canton: string
  egrid: string
  municipalityBfs: number | null
  parcelNumber: string | null
  losCode: string | null
  landRegistryDistrict: number | null
  egids: string[]
  claimedById: string | null
  claimedAt: string | null
  queriedAt: string | null
  billed: boolean
  feeChf: number | null
  resolution: OwnerResolution | null
  resolvedProspectIds: string[]
  note: string | null
  triggerProspectId: string | null
  captureMethod: string | null
  extractPdfKey: string | null
  durationSec: number | null
  createdAt: string
  losQuarter: string | null
  municipalityName: string | null
  trigger: LookupProspectSummary | null
  prospects: LookupProspectSummary[]
  replyExcerpt: string | null
  deepLink: string | null
  registry: CantonRegistryView | null
  claimedByName: string | null
}

export interface OwnerLookupParty {
  id: string
  role: ExtractPartyRole
  position: number
  rawLine: string
  name: string
  partyType: OwnerPartyType
  uid: string | null
  seat: string | null
  share: string | null
  street: string | null
  houseNumber: string | null
  postalCode: string | null
  city: string | null
  zefixUid: string | null
  zefixMatch: string | null
  prospectId: string | null
}

export interface OwnerLookupDetail extends OwnerLookupItem {
  parties: OwnerLookupParty[]
}

export interface CantonCard {
  canton: string
  registry: CantonRegistryView | null
  terravisTarget: number
  terravisUsed: number
  chfToday: number
  portalTarget: number
  portalUsed: number
  queued: number
  queuedByTier: Record<string, number>
  claimedByMe: number
}

export interface OwnerLookupQueueView {
  operator: {
    id: string
    terravisUserLabel: string
    dailyTargets: Record<string, number>
    portalTargets: Record<string, number>
    active: boolean
  } | null
  cards: CantonCard[]
  claimed: OwnerLookupItem[]
  doneToday: OwnerLookupItem[]
  queuePreview: OwnerLookupItem[]
  gbix: string
  isAdmin: boolean
}

export interface ClaimRequest {
  canton: string
  source: ClaimSource
  count?: number
}

export interface ClaimResponse {
  claimedIds: string[]
  cap: number
  used: number
  open: number
  capacity: number
}

// The extract as the capture form holds it (backend TerravisExtract).
export interface ExtractParty {
  role: ExtractPartyRole
  rawLine: string
  name: string
  uid: string | null
  egbpid: string | null
  seat: string | null
  share: string | null
  ownershipForm: string | null
  acquisitionType: string | null
  acquisitionDate: string | null
  documentNumber: string | null
  street: string | null
  houseNumber: string | null
  postalCode: string | null
  city: string | null
  country: string | null
}

export interface TerravisExtract {
  egrid: string | null
  parcelNumber: string | null
  municipality: string | null
  dataAsOf: string | null
  parcelKind: string | null
  parcelDescription: string | null
  ownershipForm: string | null
  stockwerkeigentum: boolean
  parties: ExtractParty[]
}

export interface CaptureRequest {
  text?: string
  extract?: TerravisExtract
  stockwerkeigentum?: boolean
  picks?: Record<string, string>
  familyOccupantId?: string | null
}

export interface ResultRequest extends CaptureRequest {
  captureMethod?: 'paste' | 'pdf' | 'form'
}

export interface ZefixCandidate {
  companyUri: string
  uid: string | null
  legalName: string
  legalFormCode: string | null
  street: string | null
  houseNumber: string | null
  postalCode: string | null
  locality: string | null
  canton: string | null
  purposeText: string | null
}

export interface PartyPlan {
  position: number
  role: ExtractPartyRole
  name: string
  partyType: OwnerPartyType
  uid: string | null
  zefixMatch: 'UID_EXACT' | 'NAME_UNIQUE' | 'NAME_PICKED' | 'NONE'
  zefix: ZefixCandidate | null
  candidates: ZefixCandidate[]
  needsPick: boolean
}

export interface OccupantPlan {
  id: string
  reference: string
  companyName: string
  uid: string | null
  status: string
  ownershipConfidence: OwnershipConfidence
  tenantReply: boolean
  implies: 'CONFIRMED_OWNER' | 'CONFIRMED_TENANT' | null
  unsentColdDrafts: number
}

export interface PostalAddress {
  name: string
  street: string | null
  number: string | null
  postalCode: string | null
  city: string | null
  country: string
  source: string
}

export interface ResolutionPlan {
  lookupId: string
  lookupEgrid: string
  extractEgrid: string | null
  egridMismatch: boolean
  extract: TerravisExtract
  parties: PartyPlan[]
  decision: {
    resolution: OwnerResolution
    primaryPosition: number | null
    ownerOccupantId: string | null
    familyCandidateIds: string[]
    managerPosition: number | null
    excludedReason: 'do_not_pitch' | 'in_liquidation' | 'prior_contact' | null
    heldForHuman: 'canton_or_federal_owner' | null
    flags: Array<{
      kind: 'register_contradicts_tenant_reply'
      prospectId: string
    }>
    occupantImplies: Record<string, 'CONFIRMED_OWNER' | 'CONFIRMED_TENANT'>
    reasons: string[]
  }
  occupants: OccupantPlan[]
  ownerRow: {
    action: 'create' | 'held'
    partyRole: 'OWNER' | 'MANAGER'
    partyPosition: number | null
    companyName: string
    ownerUid: string | null
    ownerPartyType: OwnerPartyType
    entityClass: string | null
    postal: PostalAddress | null
    contactEmail: string | null
    contactName: string | null
    implies: 'CONFIRMED_OWNER' | 'MANAGER'
  } | null
  letter: {
    templateKey: string
    recipient: {
      name: string
      street: string
      postalCode: string
      city: string
      country: string
    } | null
  } | null
  evidenceSource: string
  warnings: string[]
}

export interface ParsedSummary {
  warnings: string[]
  municipalityBfs: number | null
  canton: string | null
  buildingEgids: string[]
  areaM2: number | null
}

export interface PreviewResponse {
  plan: ResolutionPlan
  parsed: ParsedSummary | null
}

export interface PdfResponse extends PreviewResponse {
  text: string
  stored: boolean
  storageError: string | null
}

export interface ResultResponse {
  result: {
    resolution: OwnerResolution
    touchedProspectIds: string[]
    ownerProspectId?: string
  }
  item: OwnerLookupItem
}

export interface NotFoundRequest {
  reason: 'not_found' | 'not_digitised'
  note?: string | null
}

export interface VoidRequest {
  note?: string | null
  text?: string
}

export type EnqueueSkip =
  | 'no_egrid'
  | 'excluded_bfs'
  | 'recent_done'
  | 'recent_not_found'
  | 'already_queued'
  | 'confirmed_owner'

export interface EnqueueResponse {
  lookupId: string | null
  skipped?: EnqueueSkip
}

export interface LookupStats {
  days: number
  gbix: string
  byCanton: Array<{
    canton: string
    queued: number
    claimed: number
    billedToday: number
    chfToday: number
    chfPeriod: number
    done: number
    notFound: number
    void: number
    outcomes: Record<string, number>
    medianMinutes: number | null
  }>
  operatorsToday: Array<{
    userId: string
    name: string
    canton: string
    billed: number
    portal: number
  }>
}

export interface OwnerLookupOperatorRow {
  id: string
  userId: string
  terravisUserLabel: string
  dailyTargets: Record<string, number>
  portalTargets: Record<string, number>
  active: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export interface OperatorsResponse {
  operators: OwnerLookupOperatorRow[]
  eligibleUsers: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
  }>
  terravisCap: number
  portalCaps: Record<string, number | null>
}

export interface OperatorInput {
  userId?: string
  terravisUserLabel?: string
  dailyTargets?: Record<string, number>
  portalTargets?: Record<string, number> | null
  active?: boolean
}
