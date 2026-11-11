export const PV_SERVICE_REQUEST_STATUSES = [
  'NEW',
  'CONTACTED',
  'OFFER_SENT',
  'WON',
  'LOST',
] as const

export type PvServiceRequestStatus =
  (typeof PV_SERVICE_REQUEST_STATUSES)[number]

export const PV_SERVICE_REQUEST_INTERESTS = [
  'monitoring',
  'maintenance',
  'cleaning',
  'thermography',
  'fault',
  'sina',
] as const

export type PvServiceRequestInterest =
  (typeof PV_SERVICE_REQUEST_INTERESTS)[number]

export type PvServiceInstallerStatus = 'active' | 'gone' | 'unknown'

export interface PvServiceRequestAssignee {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface PvServiceRequestListItem {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  postalCode: string
  city: string
  plantKw: number | null
  commissioningYear: number | null
  interests: string[]
  placement: string | null
  status: PvServiceRequestStatus
  annualFeeChf: number | null
  assignedToId: string | null
  assignedTo: PvServiceRequestAssignee | null
  createdAt: string
  updatedAt: string
}

export interface PvServiceRequest extends PvServiceRequestListItem {
  street: string
  locale: string | null
  inverterBrand: string | null
  installerStatus: string | null
  message: string | null
  consentPrivacy: boolean
  outboundProspectId: string | null
  adminNotes: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmId: string | null
  utmTerm: string | null
  utmContent: string | null
  referrer: string | null
  landingPage: string | null
  fbclid: string | null
  gclid: string | null
  sessionKey: string | null
}

export interface PvServiceRequestListResponse {
  success: boolean
  data: PvServiceRequestListItem[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface UpdatePvServiceRequestPayload {
  status?: PvServiceRequestStatus
  adminNotes?: string | null
  annualFeeChf?: number | null
  assignedToId?: string | null
}
