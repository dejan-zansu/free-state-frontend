'use client'

import { useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type {
  CampaignBreakdownDimension,
  CampaignBreakdowns,
  CampaignDetail,
  MarketingPlatform,
} from '@/types/admin-marketing'

type CampaignAd = CampaignDetail['ads'][number]

const RANGE_OPTIONS = [7, 30, 90]
const FUNNEL_COLORS = ['#67c299', '#3fae7d', '#1f9866', '#128254', '#0d6c45', '#095536', '#063f27']
const BREAKDOWN_COLOR = '#2a78d6'
const STORED_BREAKDOWN_ORDER: CampaignBreakdownDimension[] = [
  'network',
  'device',
  'region',
  'placement',
  'ageGender',
]
const SEARCH_TERMS_LIMIT = 50

const PLATFORM_PILL_CLASSES: Record<MarketingPlatform, string> = {
  meta: 'bg-blue-100 text-blue-700',
  google: 'bg-amber-100 text-amber-700',
}

const TICK_STYLE = { fill: 'rgba(6,46,37,0.85)', fontSize: 11 }
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid rgba(6,46,37,0.1)',
  fontSize: 13,
  color: '#062E25',
}
const TOOLTIP_ITEM_STYLE = { color: '#062E25' }
const CHART_MARGIN = { top: 4, right: 8, left: 0, bottom: 0 }

function formatChf(value: number) {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 2 })
}

function formatMaybeChf(value: number | null) {
  return value !== null ? formatChf(value) : '-'
}

function formatCount(value: number) {
  return value.toLocaleString('de-CH')
}

function formatMaybeCount(value: number | null) {
  return value !== null ? formatCount(value) : '-'
}

function formatPct(value: number | null) {
  if (value === null) return '-'
  return `${value.toLocaleString('de-CH', { maximumFractionDigits: 2 })} %`
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
}

function formatFullDay(date: string) {
  return new Date(date).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function PlatformPill({ platform, label }: { platform: MarketingPlatform; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap',
        PLATFORM_PILL_CLASSES[platform] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {label}
    </span>
  )
}

function BreakdownRows({
  rows,
  emptyLabel,
}: {
  rows: { label: string; spendChf: number; ctrPct: number | null; extra?: string }[]
  emptyLabel: string
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#062E25]">{emptyLabel}</p>
  }
  const maxSpend = Math.max(...rows.map((row) => row.spendChf))
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm text-[#062E25] truncate" title={row.label}>
            {row.label}
          </span>
          <div className="flex-1 bg-[#062E25]/[0.04] rounded h-5">
            {row.spendChf > 0 && (
              <div
                className="h-5 rounded-r"
                style={{
                  width: `${maxSpend > 0 ? (row.spendChf / maxSpend) * 100 : 0}%`,
                  minWidth: 2,
                  backgroundColor: BREAKDOWN_COLOR,
                }}
              />
            )}
          </div>
          <span className="shrink-0 text-sm tabular-nums text-[#062E25] text-right whitespace-nowrap">
            CHF {formatChf(row.spendChf)} · {formatPct(row.ctrPct)}
            {row.extra ? ` · ${row.extra}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function GoogleAdCard({ ad, campaignId }: { ad: CampaignAd; campaignId: string }) {
  const t = useTranslations('admin.marketing.campaigns')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const locked = ad.creativeSource === 'google-ads'
  const hasText = ad.headlines !== null && ad.headlines.length > 0
  const [editing, setEditing] = useState(!hasText)
  const [form, setForm] = useState({
    headlines: (ad.headlines ?? []).join('\n'),
    descriptions: (ad.descriptions ?? []).join('\n'),
    finalUrl: ad.finalUrls?.[0] ?? '',
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      adminMarketingService.updateAdCreative(campaignId, ad.adId, {
        headlines: splitLines(form.headlines),
        descriptions: splitLines(form.descriptions),
        finalUrl: form.finalUrl.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketing', 'campaigns', campaignId] })
      setEditing(false)
    },
  })

  const creativeSourceLabel =
    ad.creativeSource === 'google-ads'
      ? t('detail.creativeSourceGoogleAds')
      : ad.creativeSource === 'manual'
        ? t('detail.creativeSourceManual')
        : '-'

  const stats = [
    { label: t('detail.spend'), value: `CHF ${formatChf(ad.spendChf)}` },
    { label: t('detail.impressions'), value: formatCount(ad.impressions) },
    { label: t('detail.clicks'), value: formatCount(ad.clicks) },
    { label: t('detail.ctr'), value: formatPct(ad.ctrPct) },
    { label: t('detail.cpc'), value: formatMaybeChf(ad.cpcChf) },
    { label: t('detail.sessions'), value: formatMaybeCount(ad.sessions) },
    { label: t('detail.signups'), value: formatCount(ad.signups) },
  ]

  return (
    <div className="rounded-lg border border-[#062E25]/10 p-5">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <p className="font-medium text-[#062E25]">{ad.name}</p>
        <StatusBadge status={ad.status} />
        {ad.adStrength && (
          <span className="inline-flex items-center rounded-full bg-[#062E25]/[0.06] px-2.5 py-0.5 text-sm font-medium text-[#062E25] whitespace-nowrap">
            {t('detail.adStrength')}: {ad.adStrength}
          </span>
        )}
        <span className="text-sm text-[#062E25]/75 ml-auto truncate">{ad.adSetName}</span>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-sm text-[#062E25]/75">{stat.label}</dt>
            <dd className="tabular-nums font-medium text-[#062E25]">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {hasText && !editing ? (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-[#062E25]/75 mb-1">{t('detail.adHeadlines')}</p>
            <div className="flex flex-wrap gap-2">
              {(ad.headlines ?? []).map((headline, index) => (
                <span
                  key={`${index}-${headline}`}
                  className="inline-flex items-center rounded-full border border-[#062E25]/15 px-3 py-1 text-sm text-[#062E25]"
                >
                  {headline}
                </span>
              ))}
            </div>
          </div>
          {ad.descriptions && ad.descriptions.length > 0 && (
            <div>
              <p className="text-sm text-[#062E25]/75 mb-1">{t('detail.adDescriptions')}</p>
              <div className="space-y-1">
                {ad.descriptions.map((description, index) => (
                  <p key={`${index}-${description}`} className="text-[#062E25]">
                    {description}
                  </p>
                ))}
              </div>
            </div>
          )}
          {ad.finalUrls && ad.finalUrls.length > 0 && (
            <div>
              <p className="text-sm text-[#062E25]/75 mb-1">{t('detail.adFinalUrl')}</p>
              {ad.finalUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#062E25] underline underline-offset-2 truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <p className="text-sm text-[#062E25]/75">
              {t('detail.creativeSource')}: {creativeSourceLabel}
            </p>
            {!locked && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setEditing(true)}
              >
                {t('detail.adEdit')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!hasText && (
            <div className="rounded-md bg-[#062E25]/[0.04] px-4 py-3 text-base text-[#062E25]">
              {t('detail.adTextMissing')}
            </div>
          )}
          {locked && <p className="text-base text-[#062E25]">{t('detail.adLockedByApi')}</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`ad-headlines-${ad.adId}`}>{t('detail.adHeadlines')}</Label>
              <Textarea
                id={`ad-headlines-${ad.adId}`}
                rows={5}
                disabled={locked}
                placeholder={t('detail.adHeadlinesPlaceholder')}
                value={form.headlines}
                onChange={(e) => setForm((prev) => ({ ...prev, headlines: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ad-descriptions-${ad.adId}`}>{t('detail.adDescriptions')}</Label>
              <Textarea
                id={`ad-descriptions-${ad.adId}`}
                rows={5}
                disabled={locked}
                placeholder={t('detail.adDescriptionsPlaceholder')}
                value={form.descriptions}
                onChange={(e) => setForm((prev) => ({ ...prev, descriptions: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`ad-final-url-${ad.adId}`}>{t('detail.adFinalUrl')}</Label>
            <Input
              id={`ad-final-url-${ad.adId}`}
              type="url"
              disabled={locked}
              placeholder="https://"
              value={form.finalUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, finalUrl: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              disabled={locked || saveMutation.isPending || splitLines(form.headlines).length === 0}
              onClick={() => saveMutation.mutate()}
            >
              {t('detail.adSave')}
            </Button>
            {hasText && (
              <Button variant="outline" onClick={() => setEditing(false)}>
                {tc('cancel')}
              </Button>
            )}
            {saveMutation.isError && (
              <span className="text-sm text-red-600">{t('detail.adSaveError')}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminMarketingCampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const t = useTranslations('admin.marketing.campaigns')
  const tc = useTranslations('admin.common')
  const locale = useLocale()

  const [days, setDays] = useState(30)
  const [showAllSearchTerms, setShowAllSearchTerms] = useState(false)

  const { data, isLoading, isPlaceholderData } = useQuery<CampaignDetail>({
    queryKey: ['admin', 'marketing', 'campaigns', campaignId, days],
    queryFn: () => adminMarketingService.getCampaign(campaignId, days),
    placeholderData: keepPreviousData,
  })

  const isGoogle = data?.campaign.platform === 'google'

  const {
    data: breakdowns,
    isLoading: breakdownsLoading,
    isPlaceholderData: breakdownsPlaceholder,
  } = useQuery<CampaignBreakdowns>({
    queryKey: ['admin', 'marketing', 'campaigns', campaignId, 'breakdowns', days],
    queryFn: () => adminMarketingService.getCampaignBreakdowns(campaignId, days),
    placeholderData: keepPreviousData,
    enabled: !!data && !isGoogle,
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const { campaign, totals, daily, funnel, ads, ga4 } = data
  const realAds = ads.filter((ad) => !ad.synthetic)
  const syntheticAds = ads.filter((ad) => ad.synthetic)
  const adGroupsAll = data.adGroups ?? []
  const adGroups = [
    ...adGroupsAll.filter((group) => !group.synthetic),
    ...adGroupsAll.filter((group) => group.synthetic),
  ]
  const keywords = data.keywords ?? []
  const searchTerms = data.searchTerms ?? []
  const breakdownsStored = data.breakdownsStored ?? {}
  const dataSources = data.dataSources

  const platformLabel = isGoogle ? t('platformGoogle') : t('platformMeta')

  const dataSourceLabels = isGoogle
    ? [
        dataSources?.ga4.active || campaign.dataSource === 'ga4' ? t('detail.dataSourceGa4') : null,
        dataSources?.googleAds.configured || campaign.dataSource === 'google-ads'
          ? t('detail.dataSourceGoogleAds')
          : null,
      ].filter((label): label is string => label !== null)
    : [t('detail.dataSourceMeta')]

  const consoleUrl =
    campaign.consoleUrl ??
    (!isGoogle && campaign.adAccountId
      ? `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${encodeURIComponent(campaign.adAccountId)}&selected_campaign_ids=${encodeURIComponent(campaign.id)}`
      : null)

  const subline = [
    campaign.objective,
    campaign.dailyBudgetChf !== null
      ? t('detail.dailyBudget', { value: formatChf(campaign.dailyBudgetChf) })
      : null,
    campaign.createdTime !== null
      ? t('detail.createdOn', { date: new Date(campaign.createdTime).toLocaleDateString('de-CH') })
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const tiles = isGoogle
    ? [
        {
          label: t('detail.spend'),
          value: `CHF ${formatChf(totals.spendChf)}`,
          sub: t('detail.impressionsSub', { count: formatCount(totals.impressions) }),
        },
        { label: t('detail.clicks'), value: formatCount(totals.clicks) },
        { label: t('detail.ctr'), value: formatPct(totals.ctrPct) },
        {
          label: t('detail.cpc'),
          value: totals.cpcChf !== null ? `CHF ${formatChf(totals.cpcChf)}` : '-',
        },
        {
          label: t('detail.sessions'),
          value: formatMaybeCount(totals.sessions),
          sub:
            totals.engagedSessions !== null
              ? t('detail.engagedSessionsSub', { count: formatCount(totals.engagedSessions) })
              : undefined,
        },
        { label: t('detail.signups'), value: formatCount(totals.signups) },
        {
          label: t('detail.costPerSignup'),
          value:
            totals.costPerSignupChf !== null ? `CHF ${formatChf(totals.costPerSignupChf)}` : '-',
        },
        {
          label: t('detail.keyEvents'),
          value: formatMaybeCount(totals.keyEvents),
          sub:
            totals.conversions !== null
              ? t('detail.conversionsSub', {
                  count: totals.conversions.toLocaleString('de-CH', { maximumFractionDigits: 1 }),
                })
              : undefined,
        },
      ]
    : [
        { label: t('detail.spend'), value: `CHF ${formatChf(totals.spendChf)}` },
        {
          label: t('detail.clicks'),
          value: formatCount(totals.clicks),
          sub: t('detail.ctrSub', { value: formatPct(totals.ctrPct) }),
        },
        { label: t('detail.impressions'), value: formatCount(totals.impressions) },
        { label: t('detail.ga4Sessions'), value: formatCount(totals.ga4Sessions) },
        {
          label: t('detail.dbLeads'),
          value: formatCount(totals.dbLeads),
          sub: t('detail.metaLeadsSub', { count: totals.metaLeads }),
        },
        {
          label: t('trueCpl'),
          value: totals.trueCplChf !== null ? `CHF ${formatChf(totals.trueCplChf)}` : '-',
        },
        { label: t('detail.signups'), value: formatCount(totals.signups) },
        {
          label: t('detail.costPerSignup'),
          value:
            totals.costPerSignupChf !== null ? `CHF ${formatChf(totals.costPerSignupChf)}` : '-',
        },
        { label: t('detail.consults'), value: formatCount(totals.consults) },
        {
          label: t('detail.contracts'),
          value: formatCount(totals.contracts),
          sub: t('detail.wonSub', { value: formatChf(totals.wonChf) }),
        },
      ]

  const funnelRows = [
    { key: 'landed-any', label: t('detail.funnelLandedAny'), value: funnel.landedAny },
    {
      key: 'landed-calculator',
      label: t('detail.funnelLandedCalculator'),
      value: funnel.landedCalculator,
    },
    ...funnel.steps.map((step) => ({
      key: `step-${step.step}`,
      label: t('detail.funnelStep', { step: step.step }),
      value: step.sessions,
    })),
    ...(funnel.estimateViewed > 0
      ? [
          {
            key: 'estimate',
            label: t('detail.funnelEstimateViewed'),
            value: funnel.estimateViewed,
          },
        ]
      : []),
    { key: 'lead', label: t('detail.funnelLead'), value: funnel.leads },
    { key: 'account', label: t('detail.funnelAccountCreated'), value: funnel.accountsCreated },
    { key: 'results', label: t('detail.funnelResultsViewed'), value: funnel.resultsViewed },
    {
      key: 'offer',
      label: t('detail.funnelOfferRequested'),
      value: funnel.offerRequested ?? 0,
    },
    {
      key: 'consultation',
      label: t('detail.funnelConsultation'),
      value: funnel.consultationsBooked,
    },
    { key: 'contract', label: t('detail.funnelContractSigned'), value: funnel.contractsSigned },
  ].map((row, index) => ({
    ...row,
    color: FUNNEL_COLORS[Math.min(index, FUNNEL_COLORS.length - 1)],
  }))
  const funnelMax = Math.max(...funnelRows.map((row) => row.value), 1)
  const funnelBase = funnel.landedAny || funnel.steps[0]?.sessions || 0

  const sortedSearchTerms = [...searchTerms].sort((a, b) => b.spendChf - a.spendChf)
  const visibleSearchTerms = showAllSearchTerms
    ? sortedSearchTerms
    : sortedSearchTerms.slice(0, SEARCH_TERMS_LIMIT)

  const storedDimensions = STORED_BREAKDOWN_ORDER.filter(
    (dimension) => (breakdownsStored[dimension]?.length ?? 0) > 0
  )
  const storedDimensionLabel: Record<CampaignBreakdownDimension, string> = {
    network: t('detail.breakdownNetwork'),
    device: t('detail.breakdownDevice'),
    region: t('detail.breakdownRegion'),
    placement: t('detail.breakdownPlacement'),
    ageGender: t('detail.breakdownAgeGender'),
  }

  const keywordsAllGa4 = keywords.length > 0 && keywords.every((row) => row.source === 'ga4')
  const searchTermsAllGa4 =
    searchTerms.length > 0 && searchTerms.every((row) => row.source === 'ga4')

  const dailySessions = (row: CampaignDetail['daily'][number]) =>
    isGoogle ? row.sessions : row.ga4Sessions

  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/${locale}/admin/marketing/campaigns`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('detail.back')}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{campaign.name}</h1>
        <PlatformPill platform={isGoogle ? 'google' : 'meta'} label={platformLabel} />
        <StatusBadge status={campaign.status} />
        {consoleUrl && (
          <Button variant="outline" size="sm" asChild className="ml-auto">
            <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              {isGoogle ? t('detail.openGoogleAds') : t('detail.openAdsManager')}
            </a>
          </Button>
        )}
      </div>

      {subline && <p className="text-sm text-[#062E25]/75 mb-1">{subline}</p>}
      {dataSourceLabels.length > 0 && (
        <p className="text-sm text-[#062E25]/75 mb-6">
          {t('detail.dataSourceLabel', { value: dataSourceLabels.join(' + ') })}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={days === option ? 'default' : 'outline'}
            size="sm"
            className={cn(days === option && 'bg-[#062E25] hover:bg-[#062E25]/90 text-white')}
            onClick={() => setDays(option)}
          >
            {t('detail.rangeDays', { count: option })}
          </Button>
        ))}
        <p className="text-sm text-[#062E25]/75 ml-auto">
          {data.lastSyncAt
            ? t('lastSync', { date: new Date(data.lastSyncAt).toLocaleString('de-CH') })
            : t('neverSynced')}
        </p>
      </div>

      <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6',
            tiles.length > 8 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'
          )}
        >
          {tiles.map((tile) => (
            <Card key={tile.label} className="border-[#062E25]/10">
              <CardContent className="p-5">
                <p className="text-sm text-[#062E25] mb-2">{tile.label}</p>
                <p className="text-2xl font-bold text-[#062E25] mb-1">{tile.value}</p>
                {tile.sub && <p className="text-sm text-[#062E25]/75">{tile.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.chartSpend')}</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={CHART_MARGIN}>
                    <CartesianGrid vertical={false} stroke="rgba(6,46,37,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                      minTickGap={24}
                    />
                    <YAxis width={40} tickLine={false} axisLine={false} tick={TICK_STYLE} />
                    <Tooltip
                      cursor={{ fill: 'rgba(6,46,37,0.04)' }}
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelFormatter={(value) => formatFullDay(String(value))}
                      formatter={(value) => `CHF ${formatChf(Number(value))}`}
                    />
                    <Bar
                      dataKey="spendChf"
                      name={t('detail.spend')}
                      fill="#178f63"
                      maxBarSize={22}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.chartClicks')}</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={CHART_MARGIN}>
                    <CartesianGrid vertical={false} stroke="rgba(6,46,37,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                      minTickGap={24}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={40}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(6,46,37,0.04)' }}
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelFormatter={(value) => formatFullDay(String(value))}
                      formatter={(value) => formatCount(Number(value))}
                    />
                    <Bar
                      dataKey="clicks"
                      name={t('detail.clicks')}
                      fill="#2a78d6"
                      maxBarSize={22}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.chartCtr')}</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily} margin={CHART_MARGIN}>
                    <CartesianGrid vertical={false} stroke="rgba(6,46,37,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                      minTickGap={24}
                    />
                    <YAxis width={40} tickLine={false} axisLine={false} tick={TICK_STYLE} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(6,46,37,0.2)' }}
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelFormatter={(value) => formatFullDay(String(value))}
                      formatter={(value) => formatPct(Number(value))}
                    />
                    <Line
                      dataKey="ctrPct"
                      name={t('detail.ctr')}
                      stroke="#4a3aa7"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {isGoogle ? t('detail.chartSessionsGoogle') : t('detail.chartSessions')}
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={CHART_MARGIN}>
                    <CartesianGrid vertical={false} stroke="rgba(6,46,37,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDay}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                      minTickGap={24}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={40}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(6,46,37,0.04)' }}
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelFormatter={(value) => formatFullDay(String(value))}
                      formatter={(value) => formatCount(Number(value))}
                    />
                    <Bar
                      dataKey={isGoogle ? 'sessions' : 'ga4Sessions'}
                      name={t('detail.sessions')}
                      fill="#c98500"
                      maxBarSize={22}
                      radius={[4, 4, 0, 0]}
                    />
                    {isGoogle && (
                      <Bar
                        dataKey="signups"
                        name={t('detail.signups')}
                        fill="#062E25"
                        maxBarSize={22}
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <details className="mb-6">
          <summary className="cursor-pointer text-sm text-[#062E25]">
            {t('detail.dailyTableToggle')}
          </summary>
          <Card className="border-[#062E25]/10 mt-3">
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.date')}</TableHead>
                      <TableHead className="text-right">{t('detail.spend')}</TableHead>
                      <TableHead className="text-right">{t('detail.impressions')}</TableHead>
                      <TableHead className="text-right">{t('detail.clicks')}</TableHead>
                      <TableHead className="text-right">{t('detail.ctr')}</TableHead>
                      <TableHead className="text-right">{t('detail.sessions')}</TableHead>
                      <TableHead className="text-right">{t('detail.signups')}</TableHead>
                      <TableHead className="text-right">{t('detail.leads')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daily.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell className="text-sm tabular-nums text-[#062E25]">
                          {formatFullDay(row.date)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatChf(row.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatPct(row.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeCount(dailySessions(row))}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.signups ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.dbLeads)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </details>

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.funnelTitle')}</h2>
            {!funnel.attributed ? (
              <p className="text-sm text-[#062E25]">{t('detail.funnelUnattributed')}</p>
            ) : (
              <>
                <div className="space-y-2">
                  {funnelRows.map((row) => (
                    <div key={row.key} className="flex items-center gap-3">
                      <span
                        className="w-44 shrink-0 text-sm text-[#062E25] truncate"
                        title={row.label}
                      >
                        {row.label}
                      </span>
                      <div className="flex-1 bg-[#062E25]/[0.04] rounded h-7">
                        {row.value > 0 && (
                          <div
                            className="h-7 rounded-r"
                            style={{
                              width: `${(row.value / funnelMax) * 100}%`,
                              minWidth: 2,
                              backgroundColor: row.color,
                            }}
                          />
                        )}
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-[#062E25] text-right whitespace-nowrap">
                        {formatCount(row.value)}
                        {funnelBase > 0 && (
                          <span className="text-[#062E25]/75">
                            {' '}
                            · {Math.round((row.value / funnelBase) * 100)} %
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#062E25]/75 mt-4">{t('detail.funnelNote')}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.ga4Title')}</h2>
            {!ga4.linked ? (
              <p className="text-sm text-[#062E25]">{t('detail.ga4NotLinked')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.landingPage')}</TableHead>
                      <TableHead className="text-right">{t('detail.sessions')}</TableHead>
                      <TableHead className="text-right">{t('detail.engagedSessions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ga4.byLandingPage.map((row) => (
                      <TableRow key={row.landingPage}>
                        <TableCell className="text-[#062E25]">
                          <span className="block max-w-xs truncate" title={row.landingPage}>
                            {row.landingPage}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.sessions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.engagedSessions)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {adGroups.length > 0 && (
          <Card className="border-[#062E25]/10 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {t('detail.adGroupsTitle')}
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.adGroup')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">{t('detail.spend')}</TableHead>
                      <TableHead className="text-right">{t('detail.impressions')}</TableHead>
                      <TableHead className="text-right">{t('detail.clicks')}</TableHead>
                      <TableHead className="text-right">{t('detail.ctr')}</TableHead>
                      <TableHead className="text-right">{t('detail.sessions')}</TableHead>
                      <TableHead className="text-right">{t('detail.keywordCount')}</TableHead>
                      <TableHead className="text-right">{t('detail.adCount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adGroups.map((group) => (
                      <TableRow
                        key={group.id}
                        className={cn(
                          group.synthetic &&
                            'bg-[#062E25]/[0.03] hover:bg-[#062E25]/[0.03] text-[#062E25]/70'
                        )}
                      >
                        <TableCell
                          className={cn(
                            'font-medium',
                            group.synthetic ? 'text-[#062E25]/70' : 'text-[#062E25]'
                          )}
                        >
                          {group.name}
                        </TableCell>
                        <TableCell>
                          {group.synthetic ? (
                            <span className="text-[#062E25]/60">-</span>
                          ) : (
                            <StatusBadge status={group.status} />
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatChf(group.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(group.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(group.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatPct(group.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeCount(group.sessions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(group.keywordCount)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(group.adCount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.adsTitle')}</h2>
            {ads.length === 0 ? (
              <p className="text-center py-12 text-[#062E25]">{t('detail.adsEmpty')}</p>
            ) : isGoogle ? (
              <div className="space-y-4">
                {realAds.map((ad) => (
                  <GoogleAdCard key={ad.adId} ad={ad} campaignId={campaignId} />
                ))}
                {syntheticAds.map((ad) => (
                  <div
                    key={ad.adId}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md bg-[#062E25]/[0.03] px-4 py-3 text-sm text-[#062E25]/70"
                  >
                    <span className="font-medium">{ad.name}</span>
                    <span className="tabular-nums">
                      {t('detail.spend')} CHF {formatChf(ad.spendChf)}
                    </span>
                    <span className="tabular-nums">
                      {t('detail.impressions')} {formatCount(ad.impressions)}
                    </span>
                    <span className="tabular-nums">
                      {t('detail.clicks')} {formatCount(ad.clicks)}
                    </span>
                    <span className="tabular-nums">
                      {t('detail.sessions')} {formatMaybeCount(ad.sessions)}
                    </span>
                    <span className="tabular-nums">
                      {t('detail.signups')} {formatCount(ad.signups)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.ad')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">{t('detail.spend')}</TableHead>
                      <TableHead className="text-right">{t('detail.impressions')}</TableHead>
                      <TableHead className="text-right">{t('detail.clicks')}</TableHead>
                      <TableHead className="text-right">{t('detail.ctr')}</TableHead>
                      <TableHead className="text-right">{t('detail.cpc')}</TableHead>
                      <TableHead className="text-right">{t('detail.metaLeads')}</TableHead>
                      <TableHead className="text-right">{t('detail.dbLeads')}</TableHead>
                      <TableHead className="text-right">{t('detail.cpl')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...realAds, ...syntheticAds].map((ad) => (
                      <TableRow
                        key={ad.adId}
                        className={cn(
                          ad.synthetic &&
                            'bg-[#062E25]/[0.03] hover:bg-[#062E25]/[0.03] text-[#062E25]/70'
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {ad.creativeThumbUrl && (
                              <img
                                src={ad.creativeThumbUrl}
                                alt=""
                                className="h-10 w-10 rounded object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  'font-medium truncate',
                                  ad.synthetic ? 'text-[#062E25]/70' : 'text-[#062E25]'
                                )}
                              >
                                {ad.name}
                              </p>
                              {!ad.synthetic && (
                                <p className="text-sm text-[#062E25]/75 truncate">{ad.adSetName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ad.synthetic ? (
                            <span className="text-[#062E25]/60">-</span>
                          ) : (
                            <StatusBadge status={ad.status} />
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatChf(ad.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(ad.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(ad.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatPct(ad.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeChf(ad.cpcChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(ad.metaLeads)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(ad.dbLeads)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeChf(ad.trueCplChf)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card className="border-[#062E25]/10 mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {t('detail.keywordsTitle')}
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.keyword')}</TableHead>
                      <TableHead>{t('detail.matchType')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead className="text-right">{t('detail.qualityScore')}</TableHead>
                      <TableHead className="text-right">{t('detail.spend')}</TableHead>
                      <TableHead className="text-right">{t('detail.impressions')}</TableHead>
                      <TableHead className="text-right">{t('detail.clicks')}</TableHead>
                      <TableHead className="text-right">{t('detail.ctr')}</TableHead>
                      <TableHead className="text-right">{t('detail.cpc')}</TableHead>
                      <TableHead className="text-right">{t('detail.sessions')}</TableHead>
                      <TableHead className="text-right">{t('detail.conversions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell>
                          <p className="font-medium text-[#062E25]">{keyword.text}</p>
                          <p className="text-sm text-[#062E25]/75">{keyword.adGroupName}</p>
                        </TableCell>
                        <TableCell className="text-[#062E25]">{keyword.matchType ?? '-'}</TableCell>
                        <TableCell>
                          {keyword.status ? (
                            <StatusBadge status={keyword.status} />
                          ) : (
                            <span className="text-[#062E25]/75">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeCount(keyword.qualityScore)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatChf(keyword.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(keyword.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(keyword.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatPct(keyword.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeChf(keyword.cpcChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeCount(keyword.sessions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {keyword.conversions !== null
                            ? keyword.conversions.toLocaleString('de-CH', {
                                maximumFractionDigits: 1,
                              })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-[#062E25]/75 mt-4">
                {keywordsAllGa4 ? t('detail.keywordsSourceGa4') : t('detail.keywordsSourceGoogleAds')}
              </p>
            </CardContent>
          </Card>
        )}

        {searchTerms.length > 0 && (
          <Card className="border-[#062E25]/10 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold text-[#062E25]">
                  {t('detail.searchTermsTitle')}
                </h2>
                {sortedSearchTerms.length > SEARCH_TERMS_LIMIT && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllSearchTerms((prev) => !prev)}
                  >
                    {showAllSearchTerms
                      ? t('detail.searchTermsShowTop', { count: SEARCH_TERMS_LIMIT })
                      : t('detail.searchTermsShowAll', { count: sortedSearchTerms.length })}
                  </Button>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('detail.searchTerm')}</TableHead>
                      <TableHead>{t('detail.matchedKeyword')}</TableHead>
                      <TableHead>{t('detail.matchType')}</TableHead>
                      <TableHead className="text-right">{t('detail.spend')}</TableHead>
                      <TableHead className="text-right">{t('detail.impressions')}</TableHead>
                      <TableHead className="text-right">{t('detail.clicks')}</TableHead>
                      <TableHead className="text-right">{t('detail.ctr')}</TableHead>
                      <TableHead className="text-right">{t('detail.cpc')}</TableHead>
                      <TableHead className="text-right">{t('detail.sessions')}</TableHead>
                      <TableHead className="text-right">{t('detail.conversions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSearchTerms.map((row) => (
                      <TableRow key={`${row.adGroupId}-${row.term}`}>
                        <TableCell>
                          <p className="font-medium text-[#062E25]">{row.term}</p>
                          <p className="text-sm text-[#062E25]/75">{row.adGroupName}</p>
                        </TableCell>
                        <TableCell className="text-[#062E25]">{row.matchedKeyword ?? '-'}</TableCell>
                        <TableCell className="text-[#062E25]">{row.matchType ?? '-'}</TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatChf(row.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatPct(row.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeChf(row.cpcChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatMaybeCount(row.sessions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {row.conversions !== null
                            ? row.conversions.toLocaleString('de-CH', { maximumFractionDigits: 1 })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-[#062E25]/75 mt-4">
                {searchTermsAllGa4
                  ? t('detail.searchTermsSourceGa4')
                  : t('detail.searchTermsSourceGoogleAds')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {!isGoogle &&
        (breakdownsLoading ? (
          <AdminPageLoader className="h-32" />
        ) : !breakdowns ? (
          <p className="text-[#062E25]">{tc('failedToLoad')}</p>
        ) : !breakdowns.available ? (
          breakdowns.reason !== 'not_applicable' && (
            <Card className="border-[#062E25]/10 mb-6">
              <CardContent className="p-6">
                <p className="text-sm text-[#062E25]">
                  {breakdowns.reason === 'not_configured'
                    ? t('detail.breakdownNotConfigured')
                    : breakdowns.reason === 'api_error'
                      ? t('detail.breakdownApiError')
                      : t('detail.breakdownNoData')}
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <div
            className={cn(
              'grid lg:grid-cols-2 gap-4 mb-6 transition-opacity',
              breakdownsPlaceholder && 'opacity-60'
            )}
          >
            <Card className="border-[#062E25]/10">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                  {t('detail.placementsTitle')}
                </h2>
                <BreakdownRows
                  rows={breakdowns.placements.map((row) => ({
                    label: `${row.platform} · ${row.position}`,
                    spendChf: row.spendChf,
                    ctrPct: row.ctrPct,
                  }))}
                  emptyLabel={t('detail.breakdownNoData')}
                />
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                  {t('detail.demographicsTitle')}
                </h2>
                <BreakdownRows
                  rows={breakdowns.demographics.map((row) => ({
                    label: `${row.age} · ${row.gender}`,
                    spendChf: row.spendChf,
                    ctrPct: row.ctrPct,
                  }))}
                  emptyLabel={t('detail.breakdownNoData')}
                />
              </CardContent>
            </Card>
          </div>
        ))}

      {storedDimensions.length > 0 && (
        <div className={cn('mb-6 transition-opacity', isPlaceholderData && 'opacity-60')}>
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">
            {t('detail.breakdownsTitle')}
          </h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {storedDimensions.map((dimension) => (
              <Card key={dimension} className="border-[#062E25]/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#062E25] mb-4">
                    {storedDimensionLabel[dimension]}
                  </h3>
                  <BreakdownRows
                    rows={(breakdownsStored[dimension] ?? []).map((row) => ({
                      label: row.key,
                      spendChf: row.spendChf,
                      ctrPct: row.ctrPct,
                      extra:
                        row.conversions !== null && row.conversions !== undefined
                          ? `${row.conversions.toLocaleString('de-CH', { maximumFractionDigits: 1 })} ${t('detail.conversions')}`
                          : undefined,
                    }))}
                    emptyLabel={t('detail.breakdownNoData')}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isGoogle && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('detail.dataSourcesTitle')}
            </h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    dataSources?.ga4.active ? 'bg-[#0ca30c]' : 'bg-gray-300'
                  )}
                />
                <span className="font-medium text-[#062E25]">{t('detail.dataSourceGa4')}</span>
                <span className="text-sm text-[#062E25] ml-auto">
                  {dataSources?.ga4.active
                    ? t('detail.dataSourceActive')
                    : t('detail.dataSourceInactive')}
                  {' · '}
                  {dataSources?.ga4.lastSyncAt
                    ? t('lastSync', {
                        date: new Date(dataSources.ga4.lastSyncAt).toLocaleString('de-CH'),
                      })
                    : t('neverSynced')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    dataSources?.googleAds.configured ? 'bg-[#0ca30c]' : 'bg-gray-300'
                  )}
                />
                <span className="font-medium text-[#062E25]">
                  {t('detail.dataSourceGoogleAds')}
                </span>
                <span className="text-sm text-[#062E25] ml-auto">
                  {dataSources?.googleAds.configured
                    ? t('detail.dataSourceConfigured')
                    : t('detail.dataSourceNotConfigured')}
                  {' · '}
                  {dataSources?.googleAds.lastSyncAt
                    ? t('lastSync', {
                        date: new Date(dataSources.googleAds.lastSyncAt).toLocaleString('de-CH'),
                      })
                    : t('neverSynced')}
                </span>
              </div>
              {dataSources?.googleAds.lastError && (
                <p className="text-sm text-red-600 break-words">
                  {t('detail.dataSourceLastError', { error: dataSources.googleAds.lastError })}
                </p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[#062E25]/10 space-y-1 text-base text-[#062E25]">
              <p>{t('detail.dataSourcesHint1')}</p>
              <p>{t('detail.dataSourcesHint2')}</p>
              <p>{t('detail.dataSourcesHint3')}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href={`/${locale}/admin/marketing/settings`}>
                {t('detail.dataSourcesSettingsLink')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
