/**
 * Contract Service
 * Frontend API client for contract management
 */

import api from '@/lib/api'

// Types
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
   * Download contract PDF (authenticated)
   */
  async downloadPdf(contractId: string, signed = false): Promise<void> {
    const query = signed ? '?signed=true' : ''
    const response = await api.get(`/contracts/${contractId}/download${query}`, {
      responseType: 'blob',
      timeout: 60000,
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const disposition = response.headers['content-disposition'] as string | undefined
    const match = disposition?.match(/filename="(.+)"/)
    link.download = match?.[1] ?? `Vertrag_${contractId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
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
