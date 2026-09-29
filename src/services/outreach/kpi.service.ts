// Client for the owner-first KPI and QRL endpoints (backend
// src/routes/outbound-kpi.routes.ts), typed with @/types/outreach/kpi.

import api from '@/lib/api'
import type {
  CallDueLettersResponse,
  KpiDailyQuery,
  KpiDailyResponse,
  LeadsResponse,
  RecordLeadRequest,
  RecordLeadResponse,
  WarmOpenResponse,
} from '@/types/outreach/kpi'

class OutreachKpiService {
  async getDaily(q: KpiDailyQuery = {}): Promise<KpiDailyResponse> {
    const response = await api.get<{
      success: boolean
      data: KpiDailyResponse
    }>('/admin/outreach/kpi/daily', {
      params: { from: q.from || undefined, to: q.to || undefined },
    })
    return response.data.data
  }

  async getWarmOpen(): Promise<WarmOpenResponse> {
    const response = await api.get<{
      success: boolean
      data: WarmOpenResponse
    }>('/admin/outreach/kpi/warm-open')
    return response.data.data
  }

  async listLeads(q: KpiDailyQuery = {}): Promise<LeadsResponse> {
    const response = await api.get<{ success: boolean; data: LeadsResponse }>(
      '/admin/outreach/leads',
      {
        params: { from: q.from || undefined, to: q.to || undefined },
      }
    )
    return response.data.data
  }

  async recordLead(
    prospectId: string,
    input: RecordLeadRequest
  ): Promise<RecordLeadResponse> {
    const response = await api.post<{
      success: boolean
      data: RecordLeadResponse
    }>(`/admin/outreach/prospects/${prospectId}/leads`, input)
    return response.data.data
  }

  async listCallDueLetters(
    q: { listedOnly?: boolean } = {}
  ): Promise<CallDueLettersResponse> {
    const response = await api.get<{
      success: boolean
      data: CallDueLettersResponse
    }>('/admin/outreach/call-queue/letters', {
      params: q.listedOnly ? { listedOnly: 'true' } : undefined,
    })
    return response.data.data
  }
}

export const outreachKpiService = new OutreachKpiService()
