import api from '@/lib/api'
import type { SolarModel } from '@/stores/solar-abo-calculator.store'
import type { RoofSegment } from '@/types/sonnendach'

interface ContactPayload {
  salutation: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  remarks: string
  country: 'CH' | 'LI'
  postalCode: string
  city: string
  street: string
  streetNumber: string
  addressAdditional: string
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
  solarModel: SolarModel
  ppaDiscountPercent: number | null
  heatPumpInterest: boolean
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
  heatPumpInterest?: boolean
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
  solarModel?: string
  equipmentSelections?: Array<{
    equipmentId: string
    equipmentType: string
    quantity: number
  }>
  heatPumpInterest?: boolean
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
  imageUrl: string | null
  pricePerKwp: number | null
  currency: string
  minCapacityKwp: number | null
  maxCapacityKwp: number | null
  contractTermYears: number
  electricitySavingsPercent: number
  purchasePriceChf: number | null
  installerWarrantyYears: number | null
  equipment: {
    equipmentType: string
    name: string
    quantity: number
    isOptional: boolean
    imageUrl?: string
    panelWattageW?: number
    panelAreaM2?: number
    panelFirstYearDegradationPercent?: number
    panelAnnualDegradationPercent?: number
    panelGuaranteedPowerAfter30YearsPercent?: number
  }[]
}

interface GetPackagesResponse {
  success: boolean
  data: CalculatorPackage[]
}

export type SolarModelFilter = 'SOLAR_FREE' | 'SOLAR_DIRECT'

class ResidentialCalculatorService {
  async getPackages(language: string = 'en', solarModel?: SolarModelFilter): Promise<CalculatorPackage[]> {
    const params = new URLSearchParams({ lang: language })
    if (solarModel) params.set('solarModel', solarModel)
    const response = await api.get<GetPackagesResponse>(
      `/equipment/packages?${params}`
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
