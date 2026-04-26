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
  createdAt: string
  solarCalculation: AdminLeadSolarCalculation | null
  contracts: AdminLeadContract[]
}

export interface AdminLeadDetail extends AdminLead {
  customer: {
    id: string
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
