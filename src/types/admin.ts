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
}

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
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
    city: string | null
    canton: string | null
    country: string
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
  }
}

export interface SalesRep {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface ListQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: string | number | undefined
}
