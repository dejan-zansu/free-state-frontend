/**
 * Contract Service
 * Frontend API client for contract management
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Types
export interface Address {
  street: string
  streetNumber?: string
  postalCode: string
  city: string
  canton: string
  country: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  preferredLanguage: 'de' | 'fr' | 'it' | 'en'
}

export interface PropertyOwnership {
  isPropertyOwner: boolean
  propertyOwnerName?: string
  propertyOwnerEmail?: string
  propertyOwnerPhone?: string
}

export interface Consents {
  terms: boolean
  privacy: boolean
  marketing: boolean
}

export interface RoofSegment {
  id: string
  area: number
  potentialKwh: number
  tilt: number
  orientation: number
  suitability?: string
  coordinates?: number[][]
}

export interface CalculationData {
  address: string
  latitude: number
  longitude: number
  selectedSegments: RoofSegment[]
  roofProperties: {
    roofType: string
    buildingFloors: number
    roofMaterial: string
  }
  restrictedAreas?: {
    id: string
    coordinates: number[][]
    area: number
    label?: string
  }[]
  selectedPanel: {
    id: string
    name: string
    power: number
    width: number
    height: number
    efficiency: number
    manufacturer: string
    price: number
  }
  selectedInverter: {
    id: string
    name: string
    power: number
    efficiency: number
    manufacturer: string
    price: number
  }
  panelCount: number
  consumption: {
    propertyType: string
    isNewBuilding: boolean
    evChargingStations: number
    heatPumpHotWater: boolean
    heatPumpHeating: boolean
    electricityProvider?: string
    residents: number
    annualConsumptionKwh: number
    electricityTariff: number
    feedInTariff: number
  }
  usableArea: number
  estimatedProductionKwh: number
  systemSizeKwp: number
  totalInvestment: number
  subsidies: number
  netInvestment: number
  annualSavings: number
  paybackYears: number
  co2Savings: number
}

export interface CreateContractInput {
  personal: PersonalInfo
  installationAddress: Address
  billingAddress?: Address
  sameAsInstallation: boolean
  ownership: PropertyOwnership
  consents: Consents
  calculation: CalculationData
  packageCode: string
}

export interface ContractResponse {
  contractId: string
  contractNumber: string
  projectId: string
  customerId: string
  userId: string
  status: string
  pdfUrl?: string
}

export interface SignatureInitiationResponse {
  signatureRequestId: string
  maskedPhone: string
  expiresAt: string
}

export interface SignatureVerificationResponse {
  success: boolean
  signedAt: string
  signedPdfUrl: string
}

export interface ContractDetails {
  id: string
  contractNumber: string
  status: string
  contractType: string
  language: string
  packageCode?: string
  grossAmount?: number
  subsidyAmount?: number
  netAmount?: number
  unsignedPdfUrl?: string
  signedPdfUrl?: string
  signatureStatus?: string
  customerSignedAt?: string
  validUntil?: string
  project: {
    id: string
    propertyAddress: string
    status: string
    solarCalculation?: {
      panelCount: number
      totalSystemCapacityKw: number
      annualProductionKwh: number
    }
  }
  customer: {
    id: string
    user: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
  }
  acknowledgments: {
    type: string
    acknowledgedAt: string
  }[]
}

class ContractService {
  /**
   * Create a contract from calculator data
   */
  async createFromCalculator(input: CreateContractInput): Promise<ContractResponse> {
    const response = await fetch(`${API_URL}/api/contracts/from-calculator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to create contract')
    }

    return data.data
  }

  /**
   * Get contract by ID
   */
  async getById(contractId: string, accessToken?: string): Promise<ContractDetails> {
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    const response = await fetch(`${API_URL}/api/contracts/${contractId}`, {
      headers,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to get contract')
    }

    return data.data
  }

  /**
   * Get contract PDF URL
   */
  getPdfUrl(contractId: string, signed = false): string {
    const query = signed ? '?signed=true' : ''
    return `${API_URL}/api/contracts/${contractId}/pdf${query}`
  }

  /**
   * Download contract PDF
   */
  getDownloadUrl(contractId: string, signed = false): string {
    const query = signed ? '?signed=true' : ''
    return `${API_URL}/api/contracts/${contractId}/download${query}`
  }

  /**
   * Initiate signature process
   */
  async initiateSignature(
    contractId: string,
    acknowledgments: string[]
  ): Promise<SignatureInitiationResponse> {
    const response = await fetch(`${API_URL}/api/contracts/${contractId}/sign/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ acknowledgments }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to initiate signature')
    }

    return data.data
  }

  /**
   * Verify OTP and complete signature
   */
  async verifySignature(contractId: string, otp: string): Promise<SignatureVerificationResponse> {
    const response = await fetch(`${API_URL}/api/contracts/${contractId}/sign/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to verify signature')
    }

    return data.data
  }

  /**
   * Get signature status
   */
  async getSignatureStatus(contractId: string): Promise<{ status: string; signedAt?: string }> {
    const response = await fetch(`${API_URL}/api/contracts/${contractId}/sign/status`)

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to get signature status')
    }

    return data.data
  }
}

export const contractService = new ContractService()
