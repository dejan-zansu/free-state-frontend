import type {
  CallOutcome,
  OutboundChannel,
  OutboundLeadCriterion,
  OutboundLeadKind,
  OutboundLetterKind,
  OutboundLetterStatus,
  OutboundSegment,
  OwnerEntityClass,
  OwnerLookupStatus,
  OwnerPartyType,
  OwnerResolution,
  OwnershipConfidence,
  ProspectPartyRole,
  QrlCriterion,
} from './outreach/owner-first'

export type OutboundProspectStatus =
  | 'DISCOVERED' | 'SCREENED_OUT' | 'ROOF_QUALIFIED' | 'CONTACT_FOUND'
  | 'DRAFTED' | 'CONTACTED' | 'FOLLOW_UP_DUE' | 'REPLIED' | 'ANSWERED' | 'SNOOZED'
  | 'CONVERTED' | 'NOT_INTERESTED' | 'OPTED_OUT' | 'BOUNCED' | 'EXPIRED'

export const OUTBOUND_PROSPECT_STATUSES: OutboundProspectStatus[] = [
  'DISCOVERED', 'SCREENED_OUT', 'ROOF_QUALIFIED', 'CONTACT_FOUND',
  'DRAFTED', 'CONTACTED', 'FOLLOW_UP_DUE', 'REPLIED', 'ANSWERED', 'SNOOZED',
  'CONVERTED', 'NOT_INTERESTED', 'OPTED_OUT', 'BOUNCED', 'EXPIRED',
]

export type PvVerdict = 'REGISTRY_HIT' | 'IMAGERY_HIT' | 'NO_PV' | 'UNCLEAR' | 'UNCHECKED'

export type OutboundActivityType =
  | 'DISCOVERED' | 'SCREENED' | 'CONTACT_EDITED' | 'DRAFT_CREATED'
  | 'DRAFT_REJECTED' | 'EMAIL_SENT' | 'REPLY_RECEIVED' | 'CLASSIFIED'
  | 'STATUS_CHANGED' | 'ASSIGNED' | 'SNOOZED' | 'SUPPRESSED' | 'PROMOTED'
  | 'CALL_LOGGED' | 'LETTER_SENT' | 'MEETING_BOOKED' | 'NOTE' | 'IMPORTED' | 'LINKEDIN'
  // Owner-first build (doc 69)
  | 'OWNER_LOOKUP' | 'OWNERSHIP_CHANGED' | 'OWNER_SIGNAL' | 'QRL_RECORDED' | 'WARM_ALERT'
  | 'LANDING_RESPONSE' | 'MAILBOX_EVENT' | 'DIRECTORY_CHECKED' | 'OFFER_SENT' | 'MEETING_HELD'

export type OutboundEmailDirection = 'OUTBOUND' | 'INBOUND'

export type OutboundEmailStatus = 'DRAFT' | 'SENT' | 'BOUNCED' | 'FAILED'

export type OutboundReplyClassification =
  | 'INTERESTED' | 'QUESTION' | 'NOT_INTERESTED' | 'NOT_NOW'
  | 'WRONG_PERSON' | 'OOO' | 'UNSUBSCRIBE' | 'BOUNCE' | 'UNCLASSIFIED'

export interface OutboundProspectListItem {
  id: string
  reference: string
  status: OutboundProspectStatus
  companyName: string
  uid: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressPostalCode: string | null
  addressCity: string | null
  addressCanton: string | null
  municipalityBfs: number | null
  roofAreaM2: string | null
  roofKwhYear: number | null
  pvVerdict: PvVerdict
  companiesAtEgid: number
  disqualifyReason: string | null
  nextActionAt: string | null
  createdAt: string
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactIsRoleAddress: boolean
  fitScore: number | null
  emailSummary: OutboundEmailSummary
  draftGate: { reason: string; detail: string } | null
  // Owner-first build (doc 69 W2-2, W2-3, W1-9b)
  partyRole: ProspectPartyRole
  ownershipConfidence: OwnershipConfidence
  ownerName: string | null
  ownerUid: string | null
  ownerPartyType: OwnerPartyType | null
  entityClass: OwnerEntityClass | null
  segment: OutboundSegment | null
  segmentReason: string | null
  egrid: string | null
  parcelEgids: string[]
  targetBuildingConfirmed: boolean
  portfolioName: string | null
  portfolioEgids: string[]
  ownerProspectId: string | null
  directoryListedNoStar: boolean | null
  directoryCheckedAt: string | null
  assignedMailboxId: string | null
}

export interface OutboundCallQueue {
  items: OutboundProspectListItem[]
}

export interface OutboundEmailSummary {
  sentSteps: number[]
  sentCount: number
  hasUnsentDraft: boolean
  lastSentAt: string | null
  replyCount: number
  lastReplyAt: string | null
  lastReplyClassification: OutboundReplyClassification | null
}

export interface OutboundActivity {
  id: string
  prospectId: string
  type: OutboundActivityType
  actorId: string | null
  actor?: { id: string; firstName: string; lastName: string } | null
  payload: Record<string, unknown> | null
  createdAt: string
}

export interface OutboundEmail {
  id: string
  prospectId: string
  direction: OutboundEmailDirection
  sequenceStep: number
  status: OutboundEmailStatus
  templateId: string | null
  openerUsed: boolean
  subject: string
  bodyText: string
  editedByHuman: boolean
  messageId: string | null
  inReplyTo: string | null
  referencesHeader: string | null
  sentByUserId: string | null
  sentBy?: { id: string; firstName: string; lastName: string } | null
  sentAt: string | null
  receivedAt: string | null
  fromAddress: string | null
  replyClassification: OutboundReplyClassification | null
  classificationConfidence: number | null
  rawMimeKey: string | null
  createdAt: string
  updatedAt: string
}

export interface OutboundProspectDetail {
  id: string
  reference: string
  status: OutboundProspectStatus
  disqualifyReason: string | null
  nextActionAt: string | null
  createdManually: boolean
  referredFromId: string | null
  companyName: string
  uid: string | null
  legalForm: string | null
  purposeText: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressPostalCode: string | null
  addressCity: string | null
  addressCanton: string | null
  municipalityBfs: number | null
  lat: number | null
  lng: number | null
  lv95E: number | null
  lv95N: number | null
  egid: string | null
  companiesAtEgid: number
  website: string | null
  roofAreaM2: string | null
  buildingClass: string | null
  buildingYear: number | null
  sonnendachJson: unknown
  roofKwhYear: number | null
  pvVerdict: PvVerdict
  pvCheckedAt: string | null
  pvRegistryJson: unknown
  imageryVerdict: string | null
  imageryYear: number | null
  imageryCropKey: string | null
  websiteHtmlKey: string | null
  contactEmail: string | null
  contactName: string | null
  contactRole: string | null
  contactPhone: string | null
  contactIsRoleAddress: boolean
  contactSource: string | null
  contactCollectedAt: string | null
  websiteText: string | null
  extractedEmails: string[] | null
  openerSuggestion: string | null
  linkedinProfileUrl: string | null
  linkedinPersonName: string | null
  linkedinPersonRole: string | null
  linkedinCompanyUrl: string | null
  linkedinSource: string | null
  linkedinConfidence: string | null
  linkedinFoundAt: string | null
  linkedinTouch: LinkedinTouchSummary | null
  publicToken: string | null
  assignedToId: string | null
  commercialLeadId: string | null
  regionRunId: string | null
  createdAt: string
  updatedAt: string
  activities: OutboundActivity[]
  emails: OutboundEmail[]
  draftGate: { reason: string; detail: string } | null
  // Owner-first build (doc 69 W2-2 parcel, W2-3 ownership, W1-9b phone track)
  egrid: string | null
  parcelNumber: string | null
  landRegistryDistrict: number | null
  buildingCanton: string | null
  buildingBfs: number | null
  buildingCategory: number | null
  floors: number | null
  dwellings: number | null
  energyRefAreaM2: number | null
  parcelEgids: string[]
  parcelCompanyCount: number | null
  parcelResolvedAt: string | null
  targetBuildingConfirmed: boolean
  partyRole: ProspectPartyRole
  ownershipConfidence: OwnershipConfidence
  ownershipEvidence: OutboundOwnershipEvidence[] | null
  ownershipUpdatedAt: string | null
  ownerName: string | null
  ownerUid: string | null
  ownerPartyType: OwnerPartyType | null
  ownerProspectId: string | null
  entityClass: OwnerEntityClass | null
  segment: OutboundSegment | null
  segmentReason: string | null
  ownerLookupId: string | null
  postalName: string | null
  postalStreet: string | null
  postalNumber: string | null
  postalPostalCode: string | null
  postalCity: string | null
  postalCountry: string | null
  postalSource: string | null
  portfolioName: string | null
  portfolioEgids: string[]
  directoryListedNoStar: boolean | null
  directoryCheckedAt: string | null
  assignedMailboxId: string | null
  ownerLookup: OutboundProspectOwnerLookup | null
  letters: OutboundProspectLetter[]
  leads: OutboundProspectLead[]
}

// One entry of OutboundProspect.ownershipEvidence (backend ownership.ts).
export interface OutboundOwnershipEvidence {
  source: string
  at: string
  implies: OwnershipConfidence
  weight: number
  ownerName?: string | null
  ownerUid?: string | null
  ownerPartyType?: OwnerPartyType | null
  ref?: { lookupId?: string; signalId?: string; emailId?: string; activityId?: string; url?: string }
  detail?: string
  by: 'system' | 'skill' | 'operator'
}

export interface OutboundProspectOwnerLookup {
  id: string
  status: OwnerLookupStatus
  tier: string
  canton: string
  resolution: OwnerResolution | null
  queriedAt: string | null
}

export interface OutboundProspectLetter {
  id: string
  kind: OutboundLetterKind
  status: OutboundLetterStatus
  templateKey: string
  createdAt: string
  sentAt: string | null
  callDueAt: string | null
}

export interface OutboundProspectLead {
  id: string
  kind: OutboundLeadKind
  criterion: OutboundLeadCriterion
  channel: OutboundChannel
  qualifiedAt: string
  commercialLeadId: string | null
  promotionNote: string | null
}

export type OutreachSort =
  | 'createdAt'
  | 'roofAreaM2'
  | 'roofKwhYear'
  | 'sendOrder'
  | 'lastSentAt'
  | 'lastReplyAt'

export interface OutreachListQuery {
  page?: number
  limit?: number
  status?: OutboundProspectStatus[]
  municipalityBfs?: number
  search?: string
  sort?: OutreachSort
  order?: 'asc' | 'desc'
}

export interface OutreachProspectList {
  items: OutboundProspectListItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
  summary: {
    total: number
    byStatus: Partial<Record<OutboundProspectStatus, number>>
  }
}

export interface OutboundLastRun {
  connector: string
  status: string
  startedAt: string
  finishedAt: string | null
  itemsUpserted: number | null
  error: string | null
}

export interface OutboundRunRow extends OutboundLastRun {
  id: string
}

export interface OutboundQueueStatus {
  sentToday: number
  dailyCap: number
  lastAutosend: {
    startedAt: string
    finishedAt: string | null
    status: 'RUNNING' | 'OK' | 'ERROR'
    itemsUpserted: number | null
    error: string | null
  } | null
  drafts: {
    waiting: number
    gated: number
    replies: number
  }
  repliesOpen: number
}

export interface OutreachSendsPerDayPoint {
  day: string
  sent: number
}

export interface OutreachTemplatePerformance {
  templateId: string
  key: string
  version: number
  sent: number
  replied: number
}

export interface OutreachStats {
  total: number
  byStatus: Partial<Record<OutboundProspectStatus, number>>
  byMunicipality: { municipalityBfs: number; count: number }[]
  lastRuns: OutboundLastRun[]
  sendsPerDay?: OutreachSendsPerDayPoint[]
  replyMix?: Record<string, number>
  perTemplate?: OutreachTemplatePerformance[]
  contactFindRate?: number
  draftsUneditedPct?: number
  medianDraftToSendHours?: number | null
  meetingsBooked?: number
  notInterestedReasons?: Record<string, number>
}

export type OutboundConnectorName = 'outbound-pv-import' | 'outbound-discovery'

export interface OutboundContactPatch {
  contactEmail?: string | null
  contactName?: string | null
  contactRole?: string | null
  contactPhone?: string | null
  contactIsRoleAddress?: boolean
  contactSource?: string | null
}

export interface OutboundProspectCreateInput {
  companyName: string
  addressStreet?: string
  addressNumber?: string
  addressPostalCode?: string
  addressCity?: string
  addressCanton?: string
  website?: string
  uid?: string
  contactEmail?: string
  contactName?: string
  contactRole?: string
  contactPhone?: string
  note?: string
  referredFromId?: string
}

export interface OutboundEmailPatch {
  subject?: string
  bodyText?: string
}

export interface OutboundEmailPreview {
  subject: string
  text: string
  violations: string[]
  capUsedToday: number
  capLimit: number
  suppressed: boolean
  relationshipHit: boolean
  pvRecheckDue: boolean
  withinBusinessHours: boolean
}

export interface OutboundSendResult {
  sent: boolean
  messageId: string
}

export type OutboundSendErrorCode =
  | 'SMTP_NOT_CONFIGURED' | 'SUPPRESSED' | 'EXISTING_RELATIONSHIP'
  | 'DAILY_CAP_REACHED' | 'PV_DETECTED' | 'COMPOSED_INVALID' | 'SMTP_SEND_FAILED'

export interface OutboundPromoteInput {
  assignedToId: string
  nextFollowUpAt?: string
  contactFirstName?: string
  contactLastName?: string
  contactPhone?: string
  contactRole?: string
  industry?: string
  timeline?: string
  note?: string
}

export interface OutboundAssignee {
  id: string
  name: string
  role: string
}

export interface OutboundManualReplyInput {
  bodyText: string
  subject?: string
}

export type OutboundManualActivityType =
  | 'MEETING_BOOKED' | 'CALL_LOGGED' | 'LETTER_SENT' | 'NOTE'
  // Owner-first build (doc 69 W1-8)
  | 'MEETING_HELD' | 'OFFER_SENT'

// POST /prospects/:id/activities (backend outbound.schema.ts, contract 4.12).
// A meeting names its evidence (an inbound mail or a logged call of the same
// prospect), otherwise the backend answers 400 MEETING_NEEDS_EVIDENCE.
export interface OutboundManualActivityInput {
  type: OutboundManualActivityType
  note?: string
  sourceEmailId?: string
  sourceActivityId?: string
  callOutcome?: CallOutcome
  ownerName?: string
  ownerRole?: 'OWNER' | 'MANAGER' | 'UNKNOWN'
  ownerEmail?: string
  tenantConsent?: boolean
  meetingAt?: string
  notNowUntil?: string
  qrlCriterion?: QrlCriterion
}

// PATCH /prospects/:id (W1-9b phone directory check).
export interface OutboundProspectPatch {
  directoryListedNoStar: boolean
}

// GET /call-queue?listedOnly=true keeps numbers listed without the star.
export interface OutboundCallQueueQuery {
  listedOnly?: boolean
}

export interface OutboundLeadThread {
  id: string
  reference: string
  status: OutboundProspectStatus
  companyName: string
  contactEmail: string | null
  emails: OutboundEmail[]
}

export interface OutboundPromoteResult {
  id: string
  reference: string
}

export interface OutboundPromoteDuplicateData {
  existingLeadId: string
  existingReference: string
  matchedOn: string
}

export interface OutboundTemplateRow {
  id: string
  key: string
  version: number
  subject: string
  bodyText: string
  active: boolean
  notes: string | null
}

export type LinkedinTouchStatus =
  | 'REQUESTED' | 'ACCEPTED' | 'MESSAGED' | 'FOLLOWED_UP' | 'REPLIED' | 'WITHDRAWN' | 'CLOSED'

export type LinkedinReplyOutcome = 'interested' | 'not_interested' | 'opt_out' | 'other'

export interface LinkedinTouchSummary {
  id: string
  status: LinkedinTouchStatus
  profileUrl: string
  requestedAt: string
  acceptedAt: string | null
  messagedAt: string | null
  followedUpAt: string | null
  repliedAt: string | null
  replyOutcome: LinkedinReplyOutcome | null
  closedAt: string | null
  closeReason: string | null
  sender: { user: { firstName: string; lastName: string } }
}

export interface LinkedinProspectCard {
  id: string
  reference: string
  status: OutboundProspectStatus
  companyName: string
  addressStreet: string | null
  addressNumber: string | null
  addressCity: string | null
  addressCanton: string | null
  website: string | null
  contactEmail: string | null
  contactName: string | null
  roofKwhYear: number | null
  imageryVerdict: string | null
  fitScore: number | null
  publicToken: string | null
  linkedinProfileUrl: string | null
  linkedinPersonName: string | null
  linkedinPersonRole: string | null
  linkedinCompanyUrl: string | null
  linkedinSource: string | null
  linkedinConfidence: string | null
}

export interface LinkedinRequestItem extends LinkedinProspectCard {
  firstEmailAt: string | null
  emailsSent: number
}

export interface LinkedinTouchItem {
  id: string
  status: LinkedinTouchStatus
  profileUrl: string
  requestedAt: string
  acceptedAt: string | null
  messagedAt: string | null
  followedUpAt: string | null
  prospect: LinkedinProspectCard
  step?: 'message' | 'followup'
  withdrawDue?: boolean
}

export interface LinkedinQueue {
  sender: {
    id: string
    profileUrl: string | null
    dailyLimit: number
    effectiveLimit: number
    warmupStartedAt: string
  } | null
  sentToday?: number
  remaining?: number
  pending?: number
  pendingBlock?: number
  blockedByPending?: boolean
  withinBusinessHours?: boolean
  requests?: LinkedinRequestItem[]
  messages?: LinkedinTouchItem[]
  pendingRequests?: LinkedinTouchItem[]
  waiting?: LinkedinTouchItem[]
}

export interface LinkedinMessage {
  step: 'message' | 'followup'
  templateId: string
  templateVersion: number
  text: string
}

export interface LinkedinOverview {
  withProfile: number
  review: number
  touched: number
  eligibleNow: number
}

export interface LinkedinSenderRow {
  id: string
  user: { id: string; firstName: string; lastName: string; email: string }
  profileUrl: string | null
  dailyLimit: number
  effectiveLimit: number
  warmupStartedAt: string
  active: boolean
  today: number
  stats: {
    requested: number
    pending: number
    accepted: number
    messaged: number
    replied: number
    withdrawn: number
  }
}

export interface LinkedinSenderInput {
  userId?: string
  profileUrl?: string | null
  dailyLimit?: number
  active?: boolean
  warmupStartedAt?: string
}

