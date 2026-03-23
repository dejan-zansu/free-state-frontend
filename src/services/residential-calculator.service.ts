import api from '@/lib/api'
import type { RoofSegment } from '@/types/sonnendach'

interface ContactPayload {
  salutation: string
  firstName: string
  lastName: string
  email: string
  phone: string
  remarks: string
}

interface CalculationPayload {
  address: string
  lat: number
  lng: number
  selectedSegments: RoofSegment[]
  selectedArea: number
  buildingType: string
  householdSize: number
  devices: {
    heatPumpHeating: boolean
    electricHeating: boolean
    electricBoiler: boolean
    evChargingStation: boolean
    swimmingPoolSauna: boolean
  }
  roofCovering: string
  estimatedProduction: number
  estimatedConsumption: number
  selfConsumptionRate: number
  annualSavings: number
  co2Savings: number
  systemSizeKwp: number
  recommendedPackage: string
}

interface CreateAccountPayload {
  contact: ContactPayload
  calculation: CalculationPayload
  consents: {
    dataProcessing: boolean
  }
}

interface CreateAccountResponse {
  success: boolean
  data: {
    userId: string
    customerId: string
    projectId: string
  }
}

interface RequestOfferPayload {
  projectId: string
}

interface RequestOfferResponse {
  success: boolean
  data: {
    leadId: string
  }
}

interface EmailReportPayload {
  projectId: string
}

interface EmailReportResponse {
  success: boolean
  data: {
    sent: boolean
  }
}

interface CreateContractPayload {
  projectId: string
  acknowledgments: string[]
  language: string
  packageId?: string
  roofImage?: string
}

interface CreateContractResponse {
  success: boolean
  data: {
    contractId: string
    contractNumber: string
    pdfUrl: string
  }
}

export interface CalculatorPackage {
  id: string
  code: string
  name: string
  description: string
  features: string[]
  highlightedFeature: string | null
  pricePerKwp: number | null
  currency: string
  minCapacityKwp: number | null
  maxCapacityKwp: number | null
  contractTermYears: number
  electricitySavingsPercent: number
  equipment: {
    equipmentType: string
    name: string
    quantity: number
    isOptional: boolean
    panelWattageW?: number
    panelAreaM2?: number
  }[]
}

interface GetPackagesResponse {
  success: boolean
  data: CalculatorPackage[]
}

class ResidentialCalculatorService {
  async getPackages(language: string = 'en'): Promise<CalculatorPackage[]> {
    const response = await api.get<GetPackagesResponse>(
      `/equipment/packages?lang=${language}`
    )
    return response.data.data
  }

  async createAccount(payload: CreateAccountPayload): Promise<CreateAccountResponse> {
    const response = await api.post<CreateAccountResponse>(
      '/residential-calculator/create-account',
      payload
    )
    return response.data
  }

  async requestOffer(payload: RequestOfferPayload): Promise<RequestOfferResponse> {
    const response = await api.post<RequestOfferResponse>(
      '/residential-calculator/request-offer',
      payload
    )
    return response.data
  }

  async emailReport(payload: EmailReportPayload): Promise<EmailReportResponse> {
    const response = await api.post<EmailReportResponse>(
      '/residential-calculator/email-report',
      payload
    )
    return response.data
  }

  async createContract(payload: CreateContractPayload): Promise<CreateContractResponse> {
    const response = await api.post<CreateContractResponse>(
      '/residential-calculator/contract',
      payload
    )
    return response.data
  }
}

export const residentialCalculatorService = new ResidentialCalculatorService()
