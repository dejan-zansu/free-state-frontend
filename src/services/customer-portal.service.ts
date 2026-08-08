import api from '@/lib/api'
import type { CalculatorPackage } from '@/services/residential-calculator.service'
import type { Milestone } from '@/types/milestone'
export type { Milestone, MilestoneStage, MilestoneStatus } from '@/types/milestone'

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
  milestones: Milestone[]
}

export interface ProjectSummary {
  id: string
  address: string
  status: string
  package: string
  createdAt: string
  isPropertyOwner: boolean
  solarModel: string | null
  offerRequested: boolean
  offerRequestedAt: string | null
  conversionStatus: 'calculation_complete' | 'offer_requested' | 'contract_pending' | 'contract_signed'
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
    solarModel: string | null
  } | null
}

export interface ContractSummary {
  id: string
  projectId: string
  contractNumber: string
  status: string
  signatureStatus: string
  contractType: string
  solarModel: string | null
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

export interface WorkspaceProject {
  id: string
  address: string
  postalCode: string | null
  status: string
  selectedPackage: string | null
  createdAt: string
  isPropertyOwner: boolean
}

export interface WorkspaceDevices {
  heatPumpHeating?: boolean
  electricHeating?: boolean
  electricBoiler?: boolean
  evChargingStation?: boolean
  swimmingPoolSauna?: boolean
}

export interface WorkspaceCalculation {
  solarModel: string | null
  ppaDiscountPercent: number | null
  systemSizeKwp: number
  panelCount: number | null
  annualProductionKwh: number
  monthlyProductionKwh: number[]
  selfConsumptionRate: number
  annualConsumptionKwh: number
  consumptionOverrideKwh: number | null
  roofImageUrl: string | null
  householdSize: number | null
  devices: WorkspaceDevices | null
  hasHeatingHeatPump: string | null
  carbonOffsetKg: number
  electricityTariffRpKwh: number | null
  feedInTariffRpKwh: number | null
}

export interface WorkspaceEvCharger {
  id: string
  displayName: string
  manufacturerName: string
  priceChf: number
  quantity: number
  totalChf: number
  imageUrl: string | null
}

export interface WorkspaceSubsidyRate {
  estimatedAmountChf: number
  tier1MaxKwp: number
  tier1ChfPerKwp: number
  tier2ChfPerKwp: number
  validFrom: string
}

export interface WorkspaceRates {
  subsidy: WorkspaceSubsidyRate | null
  feedIn: { chfPerKwh: number; validFrom: string } | null
  electricityChfPerKwh: number
}

export interface WorkspaceFinancials {
  solarModel: 'solar-direct' | 'solar-free' | 'solar-abo'
  totalInvestmentChf?: number
  subsidiesChf?: number
  netInvestmentChf?: number
  totalSavings25yChf?: number
  ppaDiscountPercent?: number
  contractTermYears?: number
  electricityTariffRpKwh?: number
  feedInTariffRpKwh?: number
  electricitySupplier?: string
  costSource?: 'snapshot' | 'estimated'
  evChargerTotalChf: number
  grossPriceChf: number
  netPriceChf: number
  annualSavingsChf: number
  paybackYears: number | null
  lifetimeSavings25yChf: number
  aboTotalChf?: number | null
  aboMonthlyChf?: number | null
  aboTermMonths: number
  aboUpliftFactor: number
}

export interface WorkspaceContract {
  id: string
  contractNumber: string
  status: string
  signatureStatus: string | null
  contractType: string
  solarModel: string | null
  validUntil: string | null
  customerSignedAt: string | null
  monthlyRateChf: number | null
  termMonths: number | null
  createdAt: string
}

export interface WorkspacePayload {
  project: WorkspaceProject
  calculation: WorkspaceCalculation
  package: (CalculatorPackage & { retired?: boolean }) | null
  packageRetired: boolean
  evCharger: WorkspaceEvCharger | null
  rates: WorkspaceRates
  financials: WorkspaceFinancials
  contract: WorkspaceContract | null
  conversionStatus:
    | 'calculation_complete'
    | 'offer_requested'
    | 'contract_pending'
    | 'contract_signed'
  offerRequestedAt: string | null
  offer: {
    requested: boolean
    sentAt: string | null
    configChanged: boolean
    canReoffer: boolean
    cooldownUntil: string | null
  }
  milestones: Milestone[]
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

  async getProjectWorkspace(projectId: string): Promise<WorkspacePayload> {
    const response = await api.get(`/me/projects/${projectId}/workspace`)
    return response.data.data
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

  async downloadProjectReport(projectId: string): Promise<void> {
    const response = await api.get(`/me/projects/${projectId}/report`, {
      responseType: 'blob',
      timeout: 60000,
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const disposition = response.headers['content-disposition'] as string | undefined
    const match = disposition?.match(/filename="(.+)"/)
    link.download = match?.[1] ?? `Solar_Report_${projectId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const customerPortalService = new CustomerPortalService()
