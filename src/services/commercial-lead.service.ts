import api from '@/lib/api'
import type { Attribution } from '@/lib/analytics/funnel-events'
import type {
  CommercialAttachmentType,
  CommercialExistingPv,
  CommercialIndustry,
  CreateCommercialLeadResponse,
} from '@/types/commercial-lead'

export type CommercialManualCheckSource =
  | 'no_roof'
  | 'places_unavailable'
  | 'address_not_found'
  | 'retry_blocked'
  | 'partial_contact'

export interface CommercialLeadPayload {
  locale: string
  company: {
    companyName: string
    industry?: CommercialIndustry | null
  }
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  address: {
    street: string
    number?: string
    postalCode: string
    city: string
    canton?: string
    country?: string
    lat?: number
    lng?: number
  }
  energy: {
    annualConsumptionKwh?: number | null
  }
  intent: {
    existingPv: CommercialExistingPv
  }
  calculation: {
    roofAreaM2: number
    usableRoofAreaM2: number
    estimatedPanelCount: number
    estimatedSystemKwp: number
    estimatedAnnualProductionKwh: number
    estimatedCo2ReductionKg: number
    estimatedSubsidyChf?: number | null
    estimatedAnnualSavingsChf?: number | null
    snapshot: Record<string, unknown>
  }
  consents: {
    privacy: true
    marketing?: boolean
  }
  attribution?: Attribution
}

export interface CommercialManualCheckPayload {
  email: string
  address: string
  privacy: true
  source?: CommercialManualCheckSource
  companyName?: string
  postalCode?: string
  city?: string
  lat?: number
  lng?: number
  systemSizeKwp?: number
  attribution?: Attribution
}

export interface CommercialLeadPublicView {
  reference: string
  companyName: string
  locale: string
  createdAt: string
  uploadTokenExpiresAt: string | null
  addressLabel: string
  calculation: {
    roofAreaM2: number | null
    usableRoofAreaM2: number | null
    estimatedPanelCount: number | null
    estimatedSystemKwp: number | null
    estimatedAnnualProductionKwh: number | null
    estimatedCo2ReductionKg: number | null
    estimatedSubsidyChf: number | null
    estimatedAnnualSavingsChf: number | null
    annualConsumptionKwh: number | null
    existingPv: CommercialExistingPv | null
    snapshot: Record<string, unknown> | null
  }
}

class CommercialLeadService {
  async create(
    payload: CommercialLeadPayload
  ): Promise<CreateCommercialLeadResponse> {
    const res = await api.post<{
      success: boolean
      data: CreateCommercialLeadResponse
    }>('/commercial-leads', payload)
    return res.data.data
  }

  async requestManualCheck(
    payload: CommercialManualCheckPayload
  ): Promise<void> {
    await api.post('/commercial-leads/manual-check', payload)
  }

  async getPublic(
    id: string,
    token: string
  ): Promise<CommercialLeadPublicView> {
    const res = await api.get<{
      success: boolean
      data: CommercialLeadPublicView
    }>(`/commercial-leads/${encodeURIComponent(id)}/public`, {
      params: { token },
    })
    return res.data.data
  }

  async uploadAttachment(
    leadId: string,
    token: string,
    type: CommercialAttachmentType,
    file: File,
    onProgress?: (pct: number) => void
  ) {
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    const res = await api.post(
      `/commercial-leads/${encodeURIComponent(leadId)}/attachments?token=${encodeURIComponent(token)}`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (onProgress && e.total)
            onProgress(Math.round((e.loaded / e.total) * 100))
        },
      }
    )
    return res.data.data
  }
}

export const commercialLeadService = new CommercialLeadService()
