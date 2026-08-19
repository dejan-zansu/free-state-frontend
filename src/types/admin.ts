export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface DashboardStats {
  users: {
    total: number
    byRole: Record<string, number>
  }
  leads: {
    total: number
    byStatus: Record<string, number>
  }
  projects?: {
    total: number
    withCalculation: number
    withoutOffer: number
    last7d: number
    last30d: number
  }
  contracts: {
    total: number
    byStatus: Record<string, number>
  }
  revenue: {
    totalSigned: number
  }
  supportTickets: {
    total: number
    byStatus: Record<string, number>
  }
  contactSubmissions: {
    total: number
  }
  newsletterSubscriptions: {
    total: number
  }
  blogPosts: {
    total: number
  }
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  dateOfBirth: string | null
  nationality: string | null
  role: 'ADMIN' | 'CUSTOMER' | 'SALES_REP'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  _count: {
    assignedLeads: number
    createdQuotes: number
  }
}

export interface AdminUserDetail extends AdminUser {
  customer: {
    id: string
    companyName: string | null
    street: string | null
    streetNumber: string | null
    postalCode: string | null
    city: string | null
    canton: string | null
    country: string
    addressAdditional: string | null
  } | null
}

export interface AdminLead {
  id: string
  status: string
  source: string
  propertyAddress: string
  interestedPackage: string | null
  estimatedBudget: number | null
  nextFollowUp: string | null
  notes: string | null
  createdAt: string
  customer: {
    id: string
    isPropertyOwner: boolean
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
    }
  }
  assignedTo: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  project: {
    isPropertyOwner: boolean
  } | null
}

export interface AdminLeadRoofSegment {
  area?: number | null
  tilt?: number | null
  azimuth?: number | null
}

export interface AdminLeadDevices {
  heatPumpHeating?: boolean
  electricHeating?: boolean
  electricBoiler?: boolean
  evChargingStation?: boolean
  swimmingPoolSauna?: boolean
}

export interface AdminLeadSolarCalculation {
  id: string
  totalSystemCapacityKw: number | null
  panelCount: number | null
  annualProductionKwh: number | null
  monthlyProductionKwh: number[] | null
  annualConsumptionKwh: number | null
  selfConsumptionRate: number | null
  annualSavingsChf: number | null
  systemCostChf: number | null
  carbonOffsetKg: number | null
  householdSize: number | null
  buildingType: string | null
  roofCovering: string | null
  solarModel: string | null
  ppaDiscountPercent: number | null
  recommendedPackage: string | null
  devices: AdminLeadDevices | null
  roofSegments: AdminLeadRoofSegment[] | null
  electricityTariff: number | null
  feedInTariff: number | null
  createdAt: string
}

export interface AdminLeadFinancials {
  solarModel: 'solar-direct' | 'solar-free' | 'solar-abo'
  totalInvestmentChf?: number
  subsidiesChf?: number
  netInvestmentChf?: number
  paybackYears?: number
  totalSavings25yChf?: number
  aboTotalChf?: number
  aboMonthlyChf?: number
  aboTermMonths?: number
  ppaDiscountPercent?: number
  contractTermYears?: number
  electricityTariffRpKwh?: number
  feedInTariffRpKwh?: number
  electricitySupplier?: string
  costSource?: 'snapshot' | 'estimated'
}

export interface AdminLeadContract {
  id: string
  contractNumber: string
  status: string
  contractType: string
  signatureStatus: string | null
  customerSignedAt: string | null
  grossAmount: string | null
  netAmount: string | null
  createdAt: string
}

export interface AdminLeadProject {
  id: string
  status: string
  propertyAddress: string
  propertyLat: number
  propertyLng: number
  selectedPackage: string | null
  isPropertyOwner: boolean
  createdAt: string
  solarCalculation: AdminLeadSolarCalculation | null
  contracts: AdminLeadContract[]
}

export interface AdminLeadDetail extends AdminLead {
  customer: {
    id: string
    isPropertyOwner: boolean
    propertyOwnerName: string | null
    propertyOwnerEmail: string | null
    propertyOwnerPhone: string | null
    notes: string | null
    addressAdditional: string | null
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string | null
      dateOfBirth: string | null
      nationality: string | null
      preferredLanguage: string | null
    }
  }
  project: AdminLeadProject | null
  financials: AdminLeadFinancials | null
}

export type AdminAttributionChannel =
  | 'google_ads'
  | 'meta_ads'
  | 'paid_other'
  | 'organic_search'
  | 'ai_assistant'
  | 'social'
  | 'referral'
  | 'direct'

export interface AdminProjectAttribution {
  channel: AdminAttributionChannel
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmId: string | null
  utmTerm: string | null
  utmContent: string | null
  gclid: string | null
  fbclid: string | null
  referrer: string | null
  referrerHost: string | null
  landingPage: string | null
  sessionKey: string | null
  marketingConsent: boolean | null
}

export interface AdminProjectLead {
  id: string
  status: string
  source?: string
  offerSentAt: string | null
  offerCount: number
  createdAt?: string
}

export interface AdminProject {
  id: string
  propertyAddress: string
  status: string
  selectedPackage: string | null
  calculatorType: string | null
  isPropertyOwner: boolean
  createdAt: string
  updatedAt: string
  attribution: AdminProjectAttribution
  customer: {
    id: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string | null
    }
  }
  solarCalculation: {
    totalSystemCapacityKw: number | null
    annualProductionKwh: number | null
    annualSavingsChf: number | null
    solarModel: string | null
  } | null
  lead: AdminProjectLead | null
  _count: {
    contracts: number
  }
}

export interface AdminProjectJourneyEntry {
  id: string
  kind: 'page_view' | 'funnel_event'
  name: string
  step: number | null
  path: string | null
  referrer: string | null
  utmId: string | null
  createdAt: string
}

export interface AdminProjectDetail {
  id: string
  propertyAddress: string
  propertyLat: number
  propertyLng: number
  status: string
  selectedPackage: string | null
  calculatorType: string | null
  isPropertyOwner: boolean
  createdAt: string
  updatedAt: string
  attribution: AdminProjectAttribution
  financials: AdminLeadFinancials | null
  journey: AdminProjectJourneyEntry[]
  lead: AdminProjectLead | null
  contracts: AdminLeadContract[]
  solarCalculation: AdminLeadSolarCalculation | null
  customer: {
    id: string
    isPropertyOwner: boolean
    propertyOwnerName: string | null
    propertyOwnerEmail: string | null
    propertyOwnerPhone: string | null
    notes: string | null
    addressAdditional: string | null
    street: string | null
    streetNumber: string | null
    postalCode: string | null
    city: string | null
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone: string | null
      dateOfBirth: string | null
      nationality: string | null
      preferredLanguage: string | null
      emailVerified: boolean
      createdAt: string
    }
  }
}

export interface AdminSendOfferResult {
  leadId: string
  status: 'sent' | 'updated' | 'unchanged' | 'cooldown'
  retryAfter?: string
}

export interface AdminContract {
  id: string
  contractNumber: string
  status: string
  contractType: string
  language: string
  packageCode: string | null
  grossAmount: string | null
  subsidyAmount: string | null
  netAmount: string | null
  signatureStatus: string | null
  customerSignedAt: string | null
  createdAt: string
  customer: {
    id: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
    }
  }
  project: {
    id: string
    propertyAddress: string
    status: string
    selectedPackage: string | null
    subsidyStatus: string | null
    subsidyAppliedAt: string | null
    subsidyApprovedAt: string | null
    subsidyPaidAmount: number | null
    subsidyReferenceNumber: string | null
    subsidyNotes: string | null
    solarCalculation: {
      solarModel: string | null
      subsidiesChf: number | null
    } | null
  }
}

export interface SalesRep {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface AdminInquiry {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  postalCode: string
  location: string
  maintenanceServices: string[]
  hasFreeStateSystem: boolean | null
  systemOutputKwp: string | null
  hasInternetAccess: string | null
  products: string[]
  message: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  adminNotes: string | null
  consentPrivacy: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminContactSubmission {
  id: string
  entityType: string | null
  salutation: string | null
  firstName: string
  lastName: string
  postalCode: string
  city: string
  phone: string
  email: string
  message: string | null
  consentPrivacy: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminNewsletterSubscription {
  id: string
  firstName: string
  lastName: string
  email: string
  consentMarketing: boolean
  createdAt: string
}

export interface AdminCareerSubscription {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  comment: string | null
  consentMarketing: boolean
  locale: string
  createdAt: string
  updatedAt: string
}

export type QuoteRequestSource = 'SOLAR_FREE' | 'SOLAR_DIRECT'
export type QuoteRequestStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED'

export interface AdminQuoteRequest {
  id: string
  source: QuoteRequestSource
  firstName: string
  lastName: string
  email: string
  postalCode: string
  phone: string
  ownsHome: boolean
  consent: boolean
  status: QuoteRequestStatus
  adminNotes: string | null
  locale: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminInvestorRequest {
  id: string
  entityType: string | null
  salutation: string | null
  firstName: string
  lastName: string
  address: string | null
  postalCode: string | null
  city: string | null
  email: string
  phonePrefix: string | null
  phone: string | null
  comment: string | null
  language: string
  status: 'NEW' | 'CONTACTED' | 'DOCUMENTS_SENT' | 'CLOSED'
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminBlogPostTranslation {
  id: string
  blogPostId: string
  language: string
  title: string
  excerpt: string | null
  content: string
  metaTitle: string | null
  metaDescription: string | null
}

export interface AdminBlogPost {
  id: string
  slug: string
  coverImageUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
  authorId: string
  author: { id: string; firstName: string; lastName: string }
  translations: AdminBlogPostTranslation[]
  createdAt: string
  updatedAt: string
}

export interface ListQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}

export type InternalTaskStatus = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED'

export type InternalTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type InternalTaskActivityType =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNED'
  | 'DUE_DATE_CHANGED'
  | 'DETAILS_CHANGED'
  | 'COMMENT_ADDED'
  | 'COMMENT_DELETED'
  | 'ATTACHMENT_UPLOADED'
  | 'ATTACHMENT_DELETED'

export interface UserLite {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export interface InternalTaskListItem {
  id: string
  reference: string
  title: string
  status: InternalTaskStatus
  priority: InternalTaskPriority
  dueDate: string | null
  assignedTo: UserLite | null
  createdBy: UserLite | null
  _count: {
    comments: number
    attachments: number
  }
  createdAt: string
  updatedAt: string
}

export interface InternalTaskComment {
  id: string
  body: string
  author: UserLite | null
  createdAt: string
  updatedAt: string
}

export interface InternalTaskAttachment {
  id: string
  fileName: string
  mimeType: string
  sizeBytes: number
  uploadedBy: UserLite | null
  uploadedAt: string
}

export interface InternalTaskActivity {
  id: string
  type: InternalTaskActivityType
  actor: UserLite | null
  payload: Record<string, unknown> | null
  createdAt: string
}

export interface InternalTaskDetail extends Omit<InternalTaskListItem, '_count'> {
  description: string | null
  completedAt: string | null
  comments: InternalTaskComment[]
  attachments: InternalTaskAttachment[]
  activities: InternalTaskActivity[]
}

export interface InternalTaskSummary {
  myOpen: number
  myOverdue: number
}

export interface InternalTaskCreateInput {
  title: string
  description?: string | null
  priority?: InternalTaskPriority
  dueDate?: string | null
  assignedToId?: string | null
}

export interface InternalTaskUpdateInput {
  title?: string
  description?: string | null
  status?: InternalTaskStatus
  priority?: InternalTaskPriority
  dueDate?: string | null
  assignedToId?: string | null
}

export interface InternalTaskListQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title'
  sortOrder?: 'asc' | 'desc'
  status?: InternalTaskStatus[]
  priority?: InternalTaskPriority
  assignedToId?: string
  createdById?: string
  dueBefore?: string
  dueAfter?: string
  overdue?: boolean
}

export type ReferenceStatus = 'DRAFT' | 'PUBLISHED'

export type ReferenceCategory =
  | 'INDUSTRIEDACH'
  | 'GEWERBE'
  | 'OEFFENTLICHE_GEBAEUDE'
  | 'LANDWIRTSCHAFT'
  | 'WOHNGEBAEUDE'
  | 'FREIFLAECHE'

export type ReferenceMountingType =
  | 'AUFDACH'
  | 'INDACH'
  | 'FLACHDACH'
  | 'FASSADE'
  | 'FREIFLAECHE'
  | 'CARPORT'

export interface AdminReferenceTranslation {
  id: string
  referenceId: string
  language: string
  title: string
  subtitle: string | null
  lead: string | null
  body: string | null
  situation: string | null
  approach: string | null
  outcome: string | null
  quoteText: string | null
  quoteAuthorRole: string | null
  metaTitle: string | null
  metaDescription: string | null
}

export interface AdminReferenceImage {
  id: string
  referenceId: string
  url: string
  alt: string | null
  sortOrder: number
}

export interface AdminReference {
  id: string
  slug: string
  status: ReferenceStatus
  category: ReferenceCategory
  featured: boolean
  sortOrder: number
  publishedAt: string | null
  coverImageUrl: string | null
  location: string | null
  year: number | null
  clientName: string | null
  contactPerson: string | null
  installedKwp: number | null
  moduleCount: number | null
  moduleWattPeak: number | null
  batteryKwh: number | null
  annualYieldKwh: number | null
  mountingType: ReferenceMountingType | null
  productModel: string | null
  inverter: string | null
  storageSystem: string | null
  buildDurationWeeks: number | null
  commissionedAt: string | null
  quoteAuthorName: string | null
  images: AdminReferenceImage[]
  translations: AdminReferenceTranslation[]
  createdAt: string
  updatedAt: string
}
