import api from '@/lib/api'

export interface DashboardData {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  status: 'no_project' | 'calculation_complete' | 'offer_requested' | 'contract_pending' | 'contract_signed'
  stats: {
    systemSizeKwp: number
    annualProductionKwh: number
    annualSavings: number
    co2Savings: number
  } | null
  project: {
    id: string
    address: string
    status: string
    package: string
    createdAt: string
  } | null
  contract: {
    id: string
    contractNumber: string
    status: string
    signatureStatus: string
    createdAt: string
    validUntil: string
    customerSignedAt: string | null
  } | null
  activity: {
    type: string
    date: string
  }[]
}

export interface ProjectSummary {
  id: string
  address: string
  status: string
  package: string
  createdAt: string
  system: {
    systemSizeKwp: number
    annualProductionKwh: number
    annualSavings: number
    co2Savings: number
    panelCount: number
    selfConsumptionRate: number
    estimatedConsumption: number
  } | null
  contract: {
    id: string
    contractNumber: string
    status: string
    signatureStatus: string
  } | null
}

export interface ContractSummary {
  id: string
  contractNumber: string
  status: string
  signatureStatus: string
  contractType: string
  language: string
  createdAt: string
  validUntil: string
  customerSignedAt: string | null
  unsignedPdfUrl: string | null
  signedPdfUrl: string | null
  address: string
  package: string
  acknowledgments: { type: string; acknowledgedAt: string }[]
}

export interface InquirySummary {
  id: string
  message: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  createdAt: string
}

class CustomerPortalService {
  async getDashboard(): Promise<DashboardData> {
    const res = await api.get<{ success: boolean; data: DashboardData }>('/me/dashboard')
    return res.data.data
  }

  async getProjects(): Promise<ProjectSummary[]> {
    const res = await api.get<{ success: boolean; data: ProjectSummary[] }>('/me/projects')
    return res.data.data
  }

  async getProjectById(id: string): Promise<any> {
    const res = await api.get<{ success: boolean; data: any }>(`/me/projects/${id}`)
    return res.data.data
  }

  async getContracts(): Promise<ContractSummary[]> {
    const res = await api.get<{ success: boolean; data: ContractSummary[] }>('/me/contracts')
    return res.data.data
  }

  async getContractById(id: string): Promise<any> {
    const res = await api.get<{ success: boolean; data: any }>(`/me/contracts/${id}`)
    return res.data.data
  }

  async getInquiries(): Promise<InquirySummary[]> {
    const res = await api.get<{ success: boolean; data: InquirySummary[] }>('/me/inquiries')
    return res.data.data
  }

  async createInquiry(data: { subject: string; message: string }): Promise<InquirySummary> {
    const res = await api.post<{ success: boolean; data: InquirySummary }>('/me/inquiries', data)
    return res.data.data
  }

  async updateProfile(data: {
    firstName?: string
    lastName?: string
    phone?: string
    preferredLanguage?: string
  }): Promise<any> {
    const res = await api.patch<{ success: boolean; data: any }>('/me/profile', data)
    return res.data.data
  }
}

export const customerPortalService = new CustomerPortalService()
