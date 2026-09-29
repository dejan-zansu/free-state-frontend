// Owner signals of the owner-first build (backend
// docs/outbound-owner-first-build.md 4.7 and 4.11): building permits, SHAB
// notices, simap tenders, transfers, fund and listed-company inventories.
// Mirrors backend src/controllers/owner-signals.controller.ts.

import type {
  OwnerPartyType,
  OwnerSignalKind,
  OwnerSignalStatus,
} from './owner-first'

// BUYER | SELLER | BAUHERR | LANDOWNER | ARCHITECT | CONTRIBUTOR |
// PURPOSE_OWNER | FUND_OWNER | PUBLIC_BUYER
export const OWNER_SIGNAL_PARTY_ROLES = [
  'BUYER',
  'SELLER',
  'BAUHERR',
  'LANDOWNER',
  'ARCHITECT',
  'CONTRIBUTOR',
  'PURPOSE_OWNER',
  'FUND_OWNER',
  'PUBLIC_BUYER',
] as const
export type OwnerSignalPartyRole = (typeof OWNER_SIGNAL_PARTY_ROLES)[number]

export interface OwnerSignalListItem {
  id: string
  kind: OwnerSignalKind
  // amtsblatt:BP-ZH01 | amtsblatt:BA-SH05 | amtsblatt:HR | simap | ...
  source: string
  externalId: string
  // Amtsblatt publication number or simap project number.
  publicationNumber: string | null
  publishedAt: string | null
  canton: string | null
  municipalityName: string | null
  parcelNumber: string | null
  egrid: string | null
  egid: string | null
  // Building address, "Strasse Nr, PLZ Ort".
  address: string | null
  partyRole: OwnerSignalPartyRole | string
  partyName: string
  partyUid: string | null
  partyType: OwnerPartyType
  partySeat: string | null
  partyAddress: string | null
  portfolioName: string | null
  projectDescription: string | null
  pvMentioned: boolean
  newBuild: boolean | null
  status: OwnerSignalStatus
  ignoreReason: string | null
  // The recorder's filter verdict (new_build, roof_work, unsure_use_change, ...).
  filterReason: string | null
  // NEW and marked unsure: waits for the skill run or a person.
  review: boolean
  // Signed PDF of an Amtsblatt publication, null for simap.
  sourceUrl: string | null
  prospect: { id: string; reference: string; companyName: string } | null
  createdAt: string
}

export interface OwnerSignalListQuery {
  kind?: OwnerSignalKind | ''
  status?: OwnerSignalStatus | ''
  q?: string
  review?: boolean
  page?: number
  pageSize?: number
}

export interface OwnerSignalListResponse {
  items: OwnerSignalListItem[]
  total: number
  page: number
  pageSize: number
}

export type OwnerSignalStatsKindRow = {
  kind: OwnerSignalKind
  total: number
} & Record<OwnerSignalStatus, number>

export interface OwnerSignalStatsResponse {
  byKind: OwnerSignalStatsKindRow[]
  review: number
  last7Days: number
  last30Days: number
  // OUTBOUND_SIGNALS_ENABLED on the backend: the daily connectors run.
  signalsEnabled: boolean
}

export interface OwnerSignalRouteRequest {
  dryRun?: boolean
}

export type OwnerSignalRouteOutcome =
  | 'evidence_added'
  | 'owner_prospect'
  | 'letter_queued'
  | 'ignored'
  | 'unmatched'

export interface OwnerSignalRouteResponse {
  outcome: OwnerSignalRouteOutcome
  prospectId?: string
  letterId?: string
  reason?: string
}

export interface OwnerSignalIgnoreRequest {
  reason: string
}

export interface OwnerSignalIgnoreResponse {
  changed: boolean
}
