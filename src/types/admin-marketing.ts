export type MarketingAlertSeverity = 'red' | 'amber' | 'info'

export interface MarketingAlert {
  id: string
  severity: MarketingAlertSeverity
  title: string
  detail?: string
  link?: string
}

export interface MarketingLeadsTile {
  thisWeek: number
  lastWeek: number
  bySource: { source: string; count: number }[]
}

export interface MarketingCplTile {
  valueChf: number | null
  targetChf: number | null
  spend7dChf: number
  paidLeads7d: number
}

export interface MarketingFunnelTile {
  sessions7d: number
  leads7d: number
  ratePct: number | null
}

export interface MarketingEngagementTile {
  available: boolean
}

export interface MarketingTimelinePoint {
  date: string
  total: number
  bySource: Record<string, number>
}

export interface MarketingEvent {
  id: string
  date: string
  type: string
  title: string
}

export interface MarketingDigest {
  date: string
  markdown: string
}

export interface MarketingOverview {
  today: MarketingAlert[]
  tiles: {
    leads: MarketingLeadsTile
    cpl: MarketingCplTile
    funnel: MarketingFunnelTile
    engagement: MarketingEngagementTile
  }
  timeline: MarketingTimelinePoint[]
  events: MarketingEvent[]
  latestDigest: MarketingDigest | null
}

export interface MarketingCampaignRow {
  campaignId: string
  name: string
  status: string
  spend7dChf: number
  spend30dChf: number
  metaLeads30d: number
  dbLeads30d: number
  trueCplChf: number | null
  consults30d: number
  contracts30d: number
  wonChf30d: number
}

export interface MarketingCampaigns {
  rows: MarketingCampaignRow[]
  lastSyncAt: string | null
  unattributedLeads30d: number
}

export interface CampaignDetail {
  campaign: {
    id: string
    name: string
    objective: string | null
    status: string
    dailyBudgetChf: number | null
    createdTime: string | null
    adSetCount: number
    adCount: number
    adAccountId: string | null
  }
  range: { from: string; to: string; days: number }
  totals: {
    spendChf: number
    impressions: number
    clicks: number
    ctrPct: number | null
    cpcChf: number | null
    metaLeads: number
    dbLeads: number
    trueCplChf: number | null
    ga4Sessions: number
    consults: number
    contracts: number
    wonChf: number
  }
  daily: {
    date: string
    spendChf: number
    impressions: number
    clicks: number
    ctrPct: number | null
    ga4Sessions: number
    dbLeads: number
  }[]
  funnel: {
    attributed: boolean
    landedAny: number
    landedCalculator: number
    steps: { step: number; sessions: number }[]
    modelSelected: number
    leads: number
    resultsViewed: number
    accountsCreated: number
    consultationsBooked: number
    contractsSigned: number
  }
  ads: {
    adId: string
    name: string
    status: string
    adSetName: string
    creativeThumbUrl: string | null
    spendChf: number
    impressions: number
    clicks: number
    ctrPct: number | null
    cpcChf: number | null
    metaLeads: number
    dbLeads: number
    trueCplChf: number | null
  }[]
  ga4: {
    linked: boolean
    byLandingPage: { landingPage: string; sessions: number; engagedSessions: number }[]
  }
  lastSyncAt: string | null
}

export interface MarketingAnalyticsOverview {
  range: { from: string; to: string }
  totals: {
    totalViews: number
    uniqueSessions: number
    viewsPerSession: number
  }
  daily: { date: string; views: number; sessions: number }[]
  topPages: { path: string; views: number; sessions: number }[]
  topSources: { source: string; sessions: number }[]
  entryPages: { path: string; sessions: number }[]
  comparison: {
    firstPartySessions: number
    ga4Sessions: number
    capturedMultiple: number | null
  }
  channelFunnel: {
    channel: string
    sessions: number
    calculatorStarted: number
    reachedStep2: number
    reachedLastStep: number
    modelSelected: number
    accountsCreated: number
    step1ToStep2Pct: number | null
    startToAccountPct: number | null
  }[]
}

export interface CampaignBreakdowns {
  available: boolean
  reason: 'ok' | 'not_configured' | 'api_error' | 'no_data'
  placements: {
    platform: string
    position: string
    spendChf: number
    impressions: number
    clicks: number
    ctrPct: number | null
  }[]
  demographics: {
    age: string
    gender: string
    spendChf: number
    impressions: number
    clicks: number
    ctrPct: number | null
  }[]
  fetchedAt: string
}

export interface MarketingConnectorStatus {
  name: string
  lastRunAt: string | null
  lastStatus: string | null
  lastError: string | null
  itemsUpserted: number | null
  consecutiveFailures: number
}

export interface MarketingTargets {
  cplTargetChf: number | null
  monthlySpendCapChf: number | null
  weeklyPostGoal: number | null
}

export interface MarketingCredential {
  name: string
  present: boolean
}

export interface MarketingSettings {
  connectors: MarketingConnectorStatus[]
  targets: MarketingTargets
  credentials: MarketingCredential[]
}

export interface MarketingTargetsUpdate {
  cplTargetChf?: number
  monthlySpendCapChf?: number
  weeklyPostGoal?: number
}

export interface MarketingEventCreate {
  date?: string
  type: string
  title: string
  detail?: string
}

export type MarketingSocialPlatform = 'INSTAGRAM' | 'FACEBOOK'

export type MarketingDraftStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'

export interface MarketingContentPostRow {
  id: string
  platform: MarketingSocialPlatform
  publishedAt: string | null
  permalink: string | null
  type: string
  pillar: string | null
  caption: string | null
  mediaUrl: string | null
  views: number | null
  reach: number | null
  likes: number | null
  comments: number | null
  saves: number | null
  shares: number | null
  engagementRatePct: number | null
}

export interface MarketingContentPosts {
  rows: MarketingContentPostRow[]
  lastSyncAt: string | null
}

export interface MarketingContentWinners {
  rows: MarketingContentPostRow[]
  windowDays: number
}

export interface MarketingStudioDraft {
  id: string
  channel: MarketingSocialPlatform
  caption: string
  headlineHtml: string | null
  imageSource: string | null
  renderedCardUrl: string | null
  variantGroup: string | null
  status: MarketingDraftStatus
  scheduledFor: string | null
  generatedBy: string | null
  promptVersion: string | null
  createdAt: string
}

export interface MarketingStudioDrafts {
  rows: MarketingStudioDraft[]
}

export interface MarketingCompetitorRow {
  id: string
  name: string
  website: string | null
  igHandle: string | null
  adLibraryUrl: string | null
  watchUrls: string[]
  notes: string | null
  active: boolean
  lastAdSeenAt: string | null
  adsLogged30d: number
  lastPageDiffAt: string | null
}

export interface MarketingCompetitors {
  rows: MarketingCompetitorRow[]
}

export interface MarketingCompetitorCreate {
  name: string
  website?: string
  igHandle?: string
  adLibraryUrl?: string
  watchUrls?: string[]
  notes?: string
}

export interface MarketingCompetitorUpdate {
  name?: string
  website?: string
  igHandle?: string
  adLibraryUrl?: string
  watchUrls?: string[]
  notes?: string
  active?: boolean
}

export interface MarketingCompetitorAdRow {
  id: string
  headline: string | null
  bodyText: string | null
  screenshotUrl: string | null
  landingUrl: string | null
  firstSeenAt: string
  lastSeenAt: string
  isActive: boolean
  euReach: number | null
  notes: string | null
}

export interface MarketingCompetitorAds {
  rows: MarketingCompetitorAdRow[]
}

export interface MarketingCompetitorAdCreate {
  headline?: string
  bodyText?: string
  screenshotUrl?: string
  landingUrl?: string
  firstSeenAt?: string
  isActive?: boolean
  euReach?: number
  notes?: string
}

export interface MarketingCompetitorDiffRow {
  id: string
  url: string
  changedAt: string
  diffSummary: string | null
}

export interface MarketingCompetitorDiffs {
  rows: MarketingCompetitorDiffRow[]
}

export type ExperimentVariantKind = 'ad' | 'adset' | 'campaign' | 'lp-variant'

export type ExperimentStatus = 'DRAFT' | 'RUNNING' | 'DECIDED' | 'ABANDONED'

export interface ExperimentVariant {
  kind: ExperimentVariantKind
  refId?: string | null
  label: string
}

export interface Experiment {
  id: string
  name: string
  hypothesis: string
  variable: string
  variants: ExperimentVariant[]
  primaryMetric: string
  minSample: number | null
  status: ExperimentStatus
  startAt: string | null
  endAt: string | null
  decision: string | null
  learnings: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export interface MarketingExperiments {
  rows: Experiment[]
}

export interface CreateExperimentInput {
  name: string
  hypothesis: string
  variable: string
  variants: ExperimentVariant[]
  primaryMetric: string
  minSample?: number
  startAt?: string
  endAt?: string
}

export interface UpdateExperimentInput {
  name?: string
  hypothesis?: string
  variable?: string
  variants?: ExperimentVariant[]
  primaryMetric?: string
  minSample?: number | null
  status?: ExperimentStatus
  startAt?: string
  endAt?: string
  decision?: string
  learnings?: string
}
