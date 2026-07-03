/**
 * Contract Service
 * Frontend API client for contract management
 */

import api from '@/lib/api'

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
  processId: string
  signingUrl: string
}

export interface SignatureStatusResponse {
  status: 'CREATED' | 'PENDING' | 'COMPLETED' | 'EXPIRED'
  signedAt?: string
  signedPdfUrl?: string
  customerSignedAt?: string | null
  companySignedAt?: string | null
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
  async getSigningConfig(): Promise<{ enabled: boolean; aboContractsEnabled: boolean }> {
    try {
      const response = await api.get('/contracts/sign/config')
      return response.data.data
    } catch {
      return { enabled: true, aboContractsEnabled: false }
    }
  }

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
  async getById(contractId: string): Promise<ContractDetails> {
    try {
      const response = await api.get(`/contracts/${contractId}`)
      return response.data.data
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
      throw new Error(
        axiosError.response?.data?.error?.message ?? 'Failed to get contract',
      )
    }
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
    try {
      const response = await api.post(`/contracts/${contractId}/sign/initiate`, {
        acknowledgments,
      })
      return response.data.data
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { code?: string; message?: string } } } }
      const err = new Error(
        axiosError.response?.data?.error?.message ?? 'Failed to initiate signature',
      ) as Error & { code?: string }
      err.code = axiosError.response?.data?.error?.code
      throw err
    }
  }

  async getSigningUrl(contractId: string): Promise<string> {
    try {
      const response = await api.post(`/contracts/${contractId}/sign/url`)
      return response.data.data.signingUrl
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
      throw new Error(
        axiosError.response?.data?.error?.message ?? 'Failed to get signing URL',
      )
    }
  }

  async checkSignatureStatus(contractId: string): Promise<SignatureStatusResponse> {
    try {
      const response = await api.get(`/contracts/${contractId}/sign/status`)
      return response.data.data
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } }
      throw new Error(
        axiosError.response?.data?.error?.message ?? 'Failed to check signature status',
      )
    }
  }
}

export const contractService = new ContractService()
