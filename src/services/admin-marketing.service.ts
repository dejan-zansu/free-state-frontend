import api from '@/lib/api'
import type {
  CampaignAdCreativePatch,
  CampaignBreakdowns,
  CampaignDetail,
  CreateExperimentInput,
  Experiment,
  MarketingCampaigns,
  MarketingCompetitorAdCreate,
  MarketingCompetitorAdRow,
  MarketingCompetitorAds,
  MarketingCompetitorCreate,
  MarketingCompetitorDiffs,
  MarketingCompetitorRow,
  MarketingCompetitorUpdate,
  MarketingCompetitors,
  MarketingContentPosts,
  MarketingContentWinners,
  MarketingAnalyticsOverview,
  MarketingEvent,
  MarketingEventCreate,
  MarketingExperiments,
  MarketingOverview,
  MarketingSettings,
  MarketingStudioDraft,
  MarketingStudioDrafts,
  MarketingTargets,
  MarketingTargetsUpdate,
  UpdateExperimentInput,
} from '@/types/admin-marketing'

class AdminMarketingService {
  async getOverview(): Promise<MarketingOverview> {
    const response = await api.get<{ success: boolean; data: MarketingOverview }>('/admin/marketing/overview')
    return response.data.data
  }

  async getCampaigns(): Promise<MarketingCampaigns> {
    const response = await api.get<{ success: boolean; data: MarketingCampaigns }>('/admin/marketing/campaigns')
    return response.data.data
  }

  async getCampaign(id: string, days: number): Promise<CampaignDetail> {
    const response = await api.get<{ success: boolean; data: CampaignDetail }>(`/admin/marketing/campaigns/${id}`, { params: { days } })
    return response.data.data
  }

  async getCampaignBreakdowns(id: string, days: number): Promise<CampaignBreakdowns> {
    const response = await api.get<{ success: boolean; data: CampaignBreakdowns }>(`/admin/marketing/campaigns/${id}/breakdowns`, { params: { days } })
    return response.data.data
  }

  async updateAdCreative(
    campaignId: string,
    adId: string,
    patch: CampaignAdCreativePatch
  ): Promise<CampaignDetail['ads'][number]> {
    const response = await api.patch<{ success: boolean; data: CampaignDetail['ads'][number] }>(
      `/admin/marketing/campaigns/${campaignId}/ads/${adId}`,
      patch
    )
    return response.data.data
  }

  async getAnalyticsOverview(params?: { from?: string; to?: string }): Promise<MarketingAnalyticsOverview> {
    const response = await api.get<{ success: boolean; data: MarketingAnalyticsOverview }>('/admin/marketing/analytics/overview', { params })
    return response.data.data
  }

  async getSettings(): Promise<MarketingSettings> {
    const response = await api.get<{ success: boolean; data: MarketingSettings }>('/admin/marketing/settings')
    return response.data.data
  }

  async updateTargets(data: MarketingTargetsUpdate): Promise<MarketingTargets> {
    const response = await api.put<{ success: boolean; data: MarketingTargets }>('/admin/marketing/settings/targets', data)
    return response.data.data
  }

  async updateInternalEmails(emails: string[]): Promise<string[]> {
    const response = await api.put<{ success: boolean; data: string[] }>('/admin/marketing/settings/internal-emails', { emails })
    return response.data.data
  }

  async createEvent(data: MarketingEventCreate): Promise<MarketingEvent> {
    const response = await api.post<{ success: boolean; data: MarketingEvent }>('/admin/marketing/events', data)
    return response.data.data
  }

  async runConnector(connector: string): Promise<{ started: boolean }> {
    const response = await api.post<{ success: boolean; data: { started: boolean } }>(`/admin/marketing/sync/${connector}/run`)
    return response.data.data
  }

  async getContentPosts(params?: { platform?: string; days?: number }): Promise<MarketingContentPosts> {
    const response = await api.get<{ success: boolean; data: MarketingContentPosts }>('/admin/marketing/content/posts', { params })
    return response.data.data
  }

  async getContentWinners(): Promise<MarketingContentWinners> {
    const response = await api.get<{ success: boolean; data: MarketingContentWinners }>('/admin/marketing/content/winners')
    return response.data.data
  }

  async getStudioDrafts(params?: { status?: string }): Promise<MarketingStudioDrafts> {
    const response = await api.get<{ success: boolean; data: MarketingStudioDrafts }>('/admin/marketing/studio/drafts', { params })
    return response.data.data
  }

  async updateStudioDraft(id: string, data: { caption: string }): Promise<MarketingStudioDraft> {
    const response = await api.patch<{ success: boolean; data: MarketingStudioDraft }>(`/admin/marketing/studio/drafts/${id}`, data)
    return response.data.data
  }

  async approveStudioDraft(id: string, data: { scheduledFor?: string }): Promise<MarketingStudioDraft> {
    const response = await api.post<{ success: boolean; data: MarketingStudioDraft }>(`/admin/marketing/studio/drafts/${id}/approve`, data)
    return response.data.data
  }

  async rejectStudioDraft(id: string, data: { reason: string }): Promise<MarketingStudioDraft> {
    const response = await api.post<{ success: boolean; data: MarketingStudioDraft }>(`/admin/marketing/studio/drafts/${id}/reject`, data)
    return response.data.data
  }

  async getCompetitors(): Promise<MarketingCompetitors> {
    const response = await api.get<{ success: boolean; data: MarketingCompetitors }>('/admin/marketing/competitors')
    return response.data.data
  }

  async createCompetitor(data: MarketingCompetitorCreate): Promise<MarketingCompetitorRow> {
    const response = await api.post<{ success: boolean; data: MarketingCompetitorRow }>('/admin/marketing/competitors', data)
    return response.data.data
  }

  async updateCompetitor(id: string, data: MarketingCompetitorUpdate): Promise<MarketingCompetitorRow> {
    const response = await api.patch<{ success: boolean; data: MarketingCompetitorRow }>(`/admin/marketing/competitors/${id}`, data)
    return response.data.data
  }

  async getCompetitorAds(id: string): Promise<MarketingCompetitorAds> {
    const response = await api.get<{ success: boolean; data: MarketingCompetitorAds }>(`/admin/marketing/competitors/${id}/ads`)
    return response.data.data
  }

  async createCompetitorAd(id: string, data: MarketingCompetitorAdCreate): Promise<MarketingCompetitorAdRow> {
    const response = await api.post<{ success: boolean; data: MarketingCompetitorAdRow }>(`/admin/marketing/competitors/${id}/ads`, data)
    return response.data.data
  }

  async getCompetitorDiffs(id: string): Promise<MarketingCompetitorDiffs> {
    const response = await api.get<{ success: boolean; data: MarketingCompetitorDiffs }>(`/admin/marketing/competitors/${id}/diffs`)
    return response.data.data
  }

  async getExperiments(): Promise<MarketingExperiments> {
    const response = await api.get<{ success: boolean; data: MarketingExperiments }>('/admin/marketing/experiments')
    return response.data.data
  }

  async createExperiment(data: CreateExperimentInput): Promise<Experiment> {
    const response = await api.post<{ success: boolean; data: Experiment }>('/admin/marketing/experiments', data)
    return response.data.data
  }

  async updateExperiment(id: string, data: UpdateExperimentInput): Promise<Experiment> {
    const response = await api.patch<{ success: boolean; data: Experiment }>(`/admin/marketing/experiments/${id}`, data)
    return response.data.data
  }

  async markSweepDone(): Promise<{ ok: boolean }> {
    const response = await api.post<{ success: boolean; data: { ok: boolean } }>('/admin/marketing/competitors/sweep-done')
    return response.data.data
  }
}

export const adminMarketingService = new AdminMarketingService()
