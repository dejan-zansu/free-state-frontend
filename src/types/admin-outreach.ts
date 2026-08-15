export type OutboundProspectStatus =
  | 'DISCOVERED' | 'SCREENED_OUT' | 'ROOF_QUALIFIED' | 'CONTACT_FOUND'
  | 'DRAFTED' | 'CONTACTED' | 'FOLLOW_UP_DUE' | 'REPLIED' | 'SNOOZED'
  | 'CONVERTED' | 'NOT_INTERESTED' | 'OPTED_OUT' | 'BOUNCED' | 'EXPIRED'

export const OUTBOUND_PROSPECT_STATUSES: OutboundProspectStatus[] = [
  'DISCOVERED', 'SCREENED_OUT', 'ROOF_QUALIFIED', 'CONTACT_FOUND',
  'DRAFTED', 'CONTACTED', 'FOLLOW_UP_DUE', 'REPLIED', 'SNOOZED',
  'CONVERTED', 'NOT_INTERESTED', 'OPTED_OUT', 'BOUNCED', 'EXPIRED',
]

export type PvVerdict = 'REGISTRY_HIT' | 'IMAGERY_HIT' | 'NO_PV' | 'UNCLEAR' | 'UNCHECKED'

export type OutboundActivityType =
  | 'DISCOVERED' | 'SCREENED' | 'CONTACT_EDITED' | 'DRAFT_CREATED'
  | 'DRAFT_REJECTED' | 'EMAIL_SENT' | 'REPLY_RECEIVED' | 'CLASSIFIED'
  | 'STATUS_CHANGED' | 'ASSIGNED' | 'SNOOZED' | 'SUPPRESSED' | 'PROMOTED'
  | 'CALL_LOGGED' | 'LETTER_SENT' | 'MEETING_BOOKED' | 'NOTE' | 'IMPORTED'

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
  contactIsRoleAddress: boolean
  emailSummary: OutboundEmailSummary
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
  assignedToId: string | null
  commercialLeadId: string | null
  regionRunId: string | null
  createdAt: string
  updatedAt: string
  activities: OutboundActivity[]
  emails: OutboundEmail[]
}

export type OutreachSort = 'createdAt' | 'roofAreaM2' | 'roofKwhYear'

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

export interface OutreachSendsPerDayPoint {
  day: string
  count: number
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
  contactFirstName?: string
  contactLastName?: string
  contactPhone?: string
  contactRole?: string
  industry?: string
  timeline?: string
  note?: string
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
