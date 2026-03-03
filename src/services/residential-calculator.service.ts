import api from '@/lib/api'
import type { RoofSegment } from '@/types/sonnendach'

interface ResidentialCalculatorContact {
  salutation: string
  firstName: string
  lastName: string
  email: string
  phone: string
  remarks: string
}

interface ResidentialCalculatorData {
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

interface SubmitPayload {
  contact: ResidentialCalculatorContact
  calculation: ResidentialCalculatorData
}

interface SubmitResponse {
  success: boolean
  data: {
    leadId: string
    projectId: string
  }
}

interface CreateContractPayload {
  projectId: string
  acknowledgments: string[]
  language: string
}

interface CreateContractResponse {
  success: boolean
  data: {
    contractId: string
    contractNumber: string
    pdfUrl: string
  }
}

class ResidentialCalculatorService {
  async submit(payload: SubmitPayload): Promise<SubmitResponse> {
    const response = await api.post<SubmitResponse>(
      '/residential-calculator/submit',
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
