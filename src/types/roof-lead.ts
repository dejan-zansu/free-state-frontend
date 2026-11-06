export type RoofLeadKind = 'BUILDING' | 'ORGANISATION'

export type RoofLeadSegment =
  | 'HOUSE'
  | 'MULTI_FAMILY'
  | 'COMMERCIAL'
  | 'HALL'
  | 'FARM'
  | 'MANAGER'
  | 'COOPERATIVE'
  | 'OWNER_PORTFOLIO'

export type RoofLeadForm = 'FLAT' | 'STEEP' | 'MIXED' | 'SHED' | 'UNKNOWN'

export type RoofLeadPvState = 'NONE' | 'OLD' | 'MID' | 'RECENT' | 'UNKNOWN'

export type RoofLeadImageryVerdict =
  | 'NOT_REPLACED'
  | 'WORN'
  | 'REPLACED'
  | 'UNCLEAR'

export type RoofLeadChannel = 'LETTER' | 'EMAIL_B2B' | 'PHONE' | 'NONE'

export type RoofLeadStatus =
  | 'NEW'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'REPLIED'
  | 'LEAD'
  | 'WON'
  | 'LOST'
  | 'EXCLUDED'

export interface RoofLeadListItem {
  id: string
  key: string
  kind: RoofLeadKind
  segment: RoofLeadSegment
  companyName: string | null
  ownerName: string | null
  street: string | null
  houseNumber: string | null
  postalCode: string | null
  city: string | null
  canton: string | null
  buildingYear: number | null
  buildingPeriod: string | null
  footprintM2: number | null
  dwellings: number | null
  roofAreaM2: number | null
  roofForm: RoofLeadForm
  pvState: RoofLeadPvState
  pvStartYear: number | null
  pvKw: number | null
  imageryVerdict: RoofLeadImageryVerdict | null
  score: number
  contactEmail: string | null
  contactPhone: string | null
  contactName: string | null
  contactBlock: string | null
  channel: RoofLeadChannel
  status: RoofLeadStatus
  exclusionReason: string | null
  assignedToId: string | null
  contactedAt: string | null
  wonAmountChf: number | null
  updatedAt: string
}

export interface RoofLeadActivity {
  id: string
  targetId: string
  type: string
  payload: Record<string, unknown> | null
  actorId: string | null
  createdAt: string
}

export interface RoofLeadDetail extends RoofLeadListItem {
  countryCode: string
  buildingRef: number | null
  companyRegistryId: string | null
  municipalityCode: number | null
  municipalityName: string | null
  x: number | null
  y: number | null
  buildingClass: number | null
  floors: number | null
  roofPermitAt: string | null
  imageryNotes: string | null
  imageryCheckedAt: string | null
  scoreParts: Record<string, number> | null
  scoreVersion: string | null
  ownerSource: string | null
  contactSource: string | null
  outboundProspectId: string | null
  notes: string | null
  batch: string | null
  createdAt: string
  activities: RoofLeadActivity[]
}

export interface RoofLeadSummary {
  total: number
  byStatus: Partial<Record<RoofLeadStatus, number>>
  bySegment: Partial<Record<RoofLeadSegment, number>>
  byStatusAndSegment: {
    status: RoofLeadStatus
    segment: RoofLeadSegment
    count: number
  }[]
}

export interface UpdateRoofLeadPayload {
  status?: RoofLeadStatus
  notes?: string | null
  wonAmountChf?: number | null
}

export interface RoofRequestTarget {
  id: string
  key: string
  status: RoofLeadStatus
  wonAmountChf: number | null
}

export interface RoofRequestListItem {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  phone: string
  email: string
  street: string | null
  postalCode: string
  city: string
  message: string | null
  status: string
  egid: number | null
  target: RoofRequestTarget | null
}

export interface RoofRequestPromotion {
  requestId: string
  created: boolean
  target: RoofRequestTarget
}
