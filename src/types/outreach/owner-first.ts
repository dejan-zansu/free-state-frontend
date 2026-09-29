// Enum unions of the owner-first outbound build (backend
// docs/outbound-owner-first-build.md section 2), shared by every outreach page.
// Each union comes with its value list for selects, filters and i18n keys
// (admin.outreach.<namespace>.<group>.<VALUE>). Keep in step with
// backend/prisma/schema.prisma.

export const OWNERSHIP_CONFIDENCES = [
  'CONFIRMED_OWNER',
  'LIKELY_OWNER',
  'MANAGER',
  'UNKNOWN',
  'LIKELY_TENANT',
  'CONFIRMED_TENANT',
] as const
export type OwnershipConfidence = (typeof OWNERSHIP_CONFIDENCES)[number]

export const OWNER_PARTY_TYPES = [
  'COMPANY',
  'PERSON',
  'PUBLIC_BODY',
  'STWEG',
  'UNKNOWN',
] as const
export type OwnerPartyType = (typeof OWNER_PARTY_TYPES)[number]

export const OWNER_ENTITY_CLASSES = [
  'PROPERTY_COMPANY',
  'PURE_HOLDING',
  'MANAGER',
  'COOPERATIVE',
  'FOUNDATION',
  'FUND',
  'PUBLIC_BODY',
  'OPERATING',
  'UNKNOWN',
] as const
export type OwnerEntityClass = (typeof OWNER_ENTITY_CLASSES)[number]

export const PROSPECT_PARTY_ROLES = ['OCCUPANT', 'OWNER', 'MANAGER'] as const
export type ProspectPartyRole = (typeof PROSPECT_PARTY_ROLES)[number]

// Doc 69 §6 segments A to F. Homeowners live in LetterTarget, not here.
export const OUTBOUND_SEGMENTS = [
  'OWNER_OCCUPIER',
  'PROPERTY_OWNER',
  'MANAGER',
  'MUNICIPALITY',
  'UNKNOWN_TENANT',
  'FARM',
] as const
export type OutboundSegment = (typeof OUTBOUND_SEGMENTS)[number]

export const OWNER_LOOKUP_STATUSES = [
  'QUEUED',
  'CLAIMED',
  'DONE',
  'NOT_FOUND',
  'VOID',
  'SKIPPED',
] as const
export type OwnerLookupStatus = (typeof OWNER_LOOKUP_STATUSES)[number]

export const OWNER_LOOKUP_SOURCES = [
  'TERRAVIS_UI',
  'TERRAVIS_GBIX',
  'CANTONAL_PORTAL',
  'LAND_REGISTRY_LIST',
  'MANUAL',
] as const
export type OwnerLookupSource = (typeof OWNER_LOOKUP_SOURCES)[number]

export const OWNER_RESOLUTIONS = [
  'OWNER_IS_OCCUPANT',
  'OWNER_FAMILY_OF_OCCUPANT',
  'OWNER_COMPANY_ELSEWHERE',
  'PRIVATE_PERSON',
  'STWEG',
  'PUBLIC_BODY',
  'EXCLUDED_OWNER',
  'UNRESOLVED',
] as const
export type OwnerResolution = (typeof OWNER_RESOLUTIONS)[number]

export const OWNER_SIGNAL_KINDS = [
  'PERMIT',
  'TRANSFER',
  'SACHEINLAGE',
  'PURPOSE_TEXT',
  'FUND_INVENTORY',
  'LISTED_INVENTORY',
  'TENDER',
] as const
export type OwnerSignalKind = (typeof OWNER_SIGNAL_KINDS)[number]

export const OWNER_SIGNAL_STATUSES = [
  'NEW',
  'MATCHED',
  'ROUTED',
  'IGNORED',
] as const
export type OwnerSignalStatus = (typeof OWNER_SIGNAL_STATUSES)[number]

export const OUTBOUND_MAILBOX_PROVIDERS = [
  'SMTP',
  'GMAIL_API',
  'MS_GRAPH',
] as const
export type OutboundMailboxProvider =
  (typeof OUTBOUND_MAILBOX_PROVIDERS)[number]

export const OUTBOUND_MAILBOX_STATUSES = [
  'SETUP',
  'WARMING',
  'ACTIVE',
  'PAUSED',
  'RETIRED',
] as const
export type OutboundMailboxStatus = (typeof OUTBOUND_MAILBOX_STATUSES)[number]

export const LETTER_TARGET_KINDS = ['HOMEOWNER', 'FARM'] as const
export type LetterTargetKind = (typeof LETTER_TARGET_KINDS)[number]

export const LETTER_TARGET_STATUSES = [
  'NEW',
  'QUALIFIED',
  'EXCLUDED',
  'LETTER_QUEUED',
  'LETTER_SENT',
  'RESPONDED',
  'CONVERTED',
] as const
export type LetterTargetStatus = (typeof LETTER_TARGET_STATUSES)[number]

export const OUTBOUND_LETTER_KINDS = [
  'OWNER',
  'TRIGGER',
  'FARM',
  'HOMEOWNER',
  'UNKNOWN_OWNER',
] as const
export type OutboundLetterKind = (typeof OUTBOUND_LETTER_KINDS)[number]

export const OUTBOUND_LETTER_STATUSES = [
  'QUEUED',
  'RENDERED',
  'SUBMITTED',
  'SENT',
  'DELIVERED',
  'RETURNED',
  'FAILED',
  'CANCELLED',
] as const
export type OutboundLetterStatus = (typeof OUTBOUND_LETTER_STATUSES)[number]

export const OUTBOUND_LEAD_KINDS = [
  'QRL',
  'HOMEOWNER',
  'EIGENTUEMER_HINWEIS',
] as const
export type OutboundLeadKind = (typeof OUTBOUND_LEAD_KINDS)[number]

export const OUTBOUND_LEAD_CRITERIA = [
  'MEETING_DATED',
  'OFFER_REQUEST',
  'BUILDING_DATA',
  'OWNER_NAMED',
  'CALCULATOR_START',
  'CONTACT_REQUEST',
] as const
export type OutboundLeadCriterion = (typeof OUTBOUND_LEAD_CRITERIA)[number]

export const OUTBOUND_CHANNELS = [
  'EMAIL',
  'LETTER',
  'PHONE',
  'REFERRAL',
  'PERMIT_TRIGGER',
  'TRANSFER_TRIGGER',
  'LANDING',
  'LINKEDIN',
  'OTHER',
] as const
export type OutboundChannel = (typeof OUTBOUND_CHANNELS)[number]

// Appendix A.9 call branches (backend owner-first.types.ts CallOutcome).
export const CALL_OUTCOMES = [
  'OWNER_INTERESTED_OFFER',
  'OWNER_INTERESTED_VISIT',
  'OWNER_NOT_NOW',
  'TENANT_NAMED_OWNER',
  'TENANT_NO_NAME',
  'NOT_INTERESTED',
  'NO_ANSWER',
  'WRONG_NUMBER',
] as const
export type CallOutcome = (typeof CALL_OUTCOMES)[number]

// QRL criteria a person may record from the cockpit (activity body).
export const QRL_CRITERIA = [
  'MEETING_DATED',
  'OFFER_REQUEST',
  'BUILDING_DATA',
] as const
export type QrlCriterion = (typeof QRL_CRITERIA)[number]

export const LOOKUP_TIERS = [
  'T0',
  'T1',
  'T1b',
  'T2',
  'T3',
  'T4',
  'CAL',
] as const
export type LookupTier = (typeof LOOKUP_TIERS)[number]

// Owner-first activity types added to OutboundActivityType.
export const OWNER_FIRST_ACTIVITY_TYPES = [
  'OWNER_LOOKUP',
  'OWNERSHIP_CHANGED',
  'OWNER_SIGNAL',
  'QRL_RECORDED',
  'WARM_ALERT',
  'LANDING_RESPONSE',
  'MAILBOX_EVENT',
  'DIRECTORY_CHECKED',
  'OFFER_SENT',
  'MEETING_HELD',
] as const
export type OwnerFirstActivityType = (typeof OWNER_FIRST_ACTIVITY_TYPES)[number]
