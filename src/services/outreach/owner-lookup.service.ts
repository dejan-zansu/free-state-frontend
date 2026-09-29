// Client for the owner-lookup endpoints (backend
// src/routes/owner-lookup.routes.ts), typed with @/types/outreach/owner-lookup.
// Nothing here opens a Terravis or cantonal portal: the page shows those as
// links a person clicks.

import api from '@/lib/api'
import type {
  CaptureRequest,
  ClaimRequest,
  ClaimResponse,
  EnqueueResponse,
  LookupStats,
  NotFoundRequest,
  OperatorInput,
  OperatorsResponse,
  OwnerLookupDetail,
  OwnerLookupOperatorRow,
  OwnerLookupQueueView,
  PdfResponse,
  PreviewResponse,
  ResultRequest,
  ResultResponse,
  VoidRequest,
} from '@/types/outreach/owner-lookup'

type Envelope<T> = { success: boolean; data: T }

class OwnerLookupService {
  async getQueue(canton?: string | null): Promise<OwnerLookupQueueView> {
    const response = await api.get<Envelope<OwnerLookupQueueView>>(
      '/admin/outreach/owner-lookup/queue',
      {
        params: canton ? { canton } : undefined,
      }
    )
    return response.data.data
  }

  async getItem(id: string): Promise<OwnerLookupDetail> {
    const response = await api.get<Envelope<OwnerLookupDetail>>(
      `/admin/outreach/owner-lookup/${id}`
    )
    return response.data.data
  }

  async claim(input: ClaimRequest): Promise<ClaimResponse> {
    const response = await api.post<Envelope<ClaimResponse>>(
      '/admin/outreach/owner-lookup/claim',
      input
    )
    return response.data.data
  }

  async preview(id: string, input: CaptureRequest): Promise<PreviewResponse> {
    const response = await api.post<Envelope<PreviewResponse>>(
      `/admin/outreach/owner-lookup/${id}/preview`,
      input
    )
    return response.data.data
  }

  async submitResult(
    id: string,
    input: ResultRequest
  ): Promise<ResultResponse> {
    const response = await api.post<Envelope<ResultResponse>>(
      `/admin/outreach/owner-lookup/${id}/result`,
      input
    )
    return response.data.data
  }

  async uploadPdf(id: string, file: File): Promise<PdfResponse> {
    const form = new FormData()
    form.append('file', file)
    const response = await api.post<Envelope<PdfResponse>>(
      `/admin/outreach/owner-lookup/${id}/pdf`,
      form
    )
    return response.data.data
  }

  async notFound(
    id: string,
    input: NotFoundRequest
  ): Promise<{ status: string }> {
    const response = await api.post<Envelope<{ status: string }>>(
      `/admin/outreach/owner-lookup/${id}/not-found`,
      input
    )
    return response.data.data
  }

  async voidLookup(
    id: string,
    input: VoidRequest
  ): Promise<{ status: string; billed: boolean }> {
    const response = await api.post<
      Envelope<{ status: string; billed: boolean }>
    >(`/admin/outreach/owner-lookup/${id}/void`, input)
    return response.data.data
  }

  async release(id: string): Promise<{ status: string }> {
    const response = await api.post<Envelope<{ status: string }>>(
      `/admin/outreach/owner-lookup/${id}/release`
    )
    return response.data.data
  }

  // T0: "Eigentümer abfragen" on a prospect page.
  async enqueueForProspect(
    prospectId: string,
    reason?: string
  ): Promise<EnqueueResponse> {
    const response = await api.post<Envelope<EnqueueResponse>>(
      `/admin/outreach/prospects/${prospectId}/owner-lookup`,
      {
        ...(reason ? { reason } : {}),
      }
    )
    return response.data.data
  }

  async getStats(days?: number): Promise<LookupStats> {
    const response = await api.get<Envelope<LookupStats>>(
      '/admin/outreach/owner-lookup/stats',
      {
        params: days ? { days } : undefined,
      }
    )
    return response.data.data
  }

  async listOperators(): Promise<OperatorsResponse> {
    const response = await api.get<Envelope<OperatorsResponse>>(
      '/admin/outreach/owner-lookup/operators'
    )
    return response.data.data
  }

  async createOperator(input: OperatorInput): Promise<OwnerLookupOperatorRow> {
    const response = await api.post<Envelope<OwnerLookupOperatorRow>>(
      '/admin/outreach/owner-lookup/operators',
      input
    )
    return response.data.data
  }

  async updateOperator(
    id: string,
    input: OperatorInput
  ): Promise<OwnerLookupOperatorRow> {
    const response = await api.patch<Envelope<OwnerLookupOperatorRow>>(
      `/admin/outreach/owner-lookup/operators/${id}`,
      input
    )
    return response.data.data
  }
}

export const ownerLookupService = new OwnerLookupService()
