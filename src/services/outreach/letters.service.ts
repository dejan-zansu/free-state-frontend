// Client for the letter endpoints (backend src/routes/outbound-letters.routes.ts),
// typed with @/types/outreach/letters.

import api from '@/lib/api'
import type {
  CancelLetterResponse,
  LetterListQuery,
  LettersResponse,
  LetterTargetQuery,
  LetterTargetsResponse,
  ProspectLetterPreview,
  SubmitDueRequest,
  SubmitDueResponse,
} from '@/types/outreach/letters'

class OutreachLettersService {
  async list(q: LetterListQuery = {}): Promise<LettersResponse> {
    const response = await api.get<{ success: boolean; data: LettersResponse }>(
      '/admin/outreach/letters',
      { params: { status: q.status, kind: q.kind, limit: q.limit } }
    )
    return response.data.data
  }

  async listTargets(q: LetterTargetQuery = {}): Promise<LetterTargetsResponse> {
    const response = await api.get<{
      success: boolean
      data: LetterTargetsResponse
    }>('/admin/outreach/letter-targets', {
      params: { kind: q.kind, status: q.status, limit: q.limit },
    })
    return response.data.data
  }

  async preview(prospectId: string): Promise<ProspectLetterPreview> {
    const response = await api.get<{
      success: boolean
      data: ProspectLetterPreview
    }>('/admin/outreach/letters/preview', { params: { prospectId } })
    return response.data.data
  }

  // The PDF as an object URL (the endpoint needs the admin session, so a
  // plain link would not carry it). The caller revokes the URL.
  async pdfUrl(letterId: string): Promise<string> {
    const response = await api.get<Blob>(
      `/admin/outreach/letters/${letterId}/pdf`,
      { responseType: 'blob' }
    )
    return URL.createObjectURL(response.data)
  }

  async cancel(letterId: string): Promise<CancelLetterResponse> {
    const response = await api.post<{
      success: boolean
      data: CancelLetterResponse
    }>(`/admin/outreach/letters/${letterId}/cancel`)
    return response.data.data
  }

  async submitDue(input: SubmitDueRequest): Promise<SubmitDueResponse> {
    const response = await api.post<{
      success: boolean
      data: SubmitDueResponse
    }>('/admin/outreach/letters/submit-due', input)
    return response.data.data
  }
}

export const outreachLettersService = new OutreachLettersService()
