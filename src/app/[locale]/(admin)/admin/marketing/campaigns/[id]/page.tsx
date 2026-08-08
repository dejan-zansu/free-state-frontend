'use client'

import { useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { adminMarketingService } from '@/services/admin-marketing.service'
import type { CampaignBreakdowns, CampaignDetail } from '@/types/admin-marketing'

const RANGE_OPTIONS = [7, 30, 90]
const FUNNEL_COLORS = ['#67c299', '#3fae7d', '#1f9866', '#128254', '#0d6c45', '#095536', '#063f27']
const BREAKDOWN_COLOR = '#2a78d6'

const TICK_STYLE = { fill: 'rgba(6,46,37,0.5)', fontSize: 11 }
const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid rgba(6,46,37,0.1)', fontSize: 13 }
const CHART_MARGIN = { top: 4, right: 8, left: 0, bottom: 0 }

function formatChf(value: number) {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 2 })
}

function formatCount(value: number) {
  return value.toLocaleString('de-CH')
}

function formatPct(value: number | null) {
  if (value === null) return '—'
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

function BreakdownRows({
  rows,
  emptyLabel,
}: {
  rows: { label: string; spendChf: number; ctrPct: number | null }[]
  emptyLabel: string
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#062E25]/40">{emptyLabel}</p>
  }
  const maxSpend = Math.max(...rows.map((row) => row.spendChf))
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm text-[#062E25]/60 truncate" title={row.label}>
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
          <span className="shrink-0 text-sm tabular-nums text-[#062E25]/80 text-right whitespace-nowrap">
            CHF {formatChf(row.spendChf)} · {formatPct(row.ctrPct)}
          </span>
        </div>
      ))}
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

  const { data, isLoading, isPlaceholderData } = useQuery<CampaignDetail>({
    queryKey: ['admin', 'marketing', 'campaigns', campaignId, days],
    queryFn: () => adminMarketingService.getCampaign(campaignId, days),
    placeholderData: keepPreviousData,
  })

  const {
    data: breakdowns,
    isLoading: breakdownsLoading,
    isPlaceholderData: breakdownsPlaceholder,
  } = useQuery<CampaignBreakdowns>({
    queryKey: ['admin', 'marketing', 'campaigns', campaignId, 'breakdowns', days],
    queryFn: () => adminMarketingService.getCampaignBreakdowns(campaignId, days),
    placeholderData: keepPreviousData,
    enabled: !!data,
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]/60">{tc('failedToLoad')}</p>
  }

  const { campaign, totals, daily, funnel, ads, ga4 } = data

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

  const tiles = [
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
      value: totals.trueCplChf !== null ? `CHF ${formatChf(totals.trueCplChf)}` : '—',
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
        <StatusBadge status={campaign.status} />
        {campaign.adAccountId && (
          <Button variant="outline" size="sm" asChild className="ml-auto">
            <a
              href={`https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${encodeURIComponent(campaign.adAccountId)}&selected_campaign_ids=${encodeURIComponent(campaign.id)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('detail.openAdsManager')}
            </a>
          </Button>
        )}
      </div>

      {subline && <p className="text-sm text-[#062E25]/60 mb-6">{subline}</p>}

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
        <p className="text-sm text-[#062E25]/40 ml-auto">
          {data.lastSyncAt
            ? t('lastSync', { date: new Date(data.lastSyncAt).toLocaleString('de-CH') })
            : t('neverSynced')}
        </p>
      </div>

      <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {tiles.map((tile) => (
            <Card key={tile.label} className="border-[#062E25]/10">
              <CardContent className="p-5">
                <p className="text-sm text-[#062E25]/60 mb-2">{tile.label}</p>
                <p className="text-2xl font-bold text-[#062E25] mb-1">{tile.value}</p>
                {tile.sub && <p className="text-sm text-[#062E25]/40">{tile.sub}</p>}
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
                {t('detail.chartSessions')}
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
                      labelFormatter={(value) => formatFullDay(String(value))}
                      formatter={(value) => formatCount(Number(value))}
                    />
                    <Bar
                      dataKey="ga4Sessions"
                      name={t('detail.sessions')}
                      fill="#c98500"
                      maxBarSize={22}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <details className="mb-6">
          <summary className="cursor-pointer text-sm text-[#062E25]/60 hover:text-[#062E25]">
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
                      <TableHead className="text-right">{t('detail.leads')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daily.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell className="text-sm tabular-nums text-[#062E25]">
                          {formatFullDay(row.date)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatChf(row.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(row.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(row.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatPct(row.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(row.ga4Sessions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
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
              <p className="text-sm text-[#062E25]/40">{t('detail.funnelUnattributed')}</p>
            ) : (
              <>
                <div className="space-y-2">
                  {funnelRows.map((row) => (
                    <div key={row.key} className="flex items-center gap-3">
                      <span
                        className="w-44 shrink-0 text-sm text-[#062E25]/60 truncate"
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
                          <span className="text-[#062E25]/40">
                            {' '}
                            · {Math.round((row.value / funnelBase) * 100)} %
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#062E25]/40 mt-4">{t('detail.funnelNote')}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.ga4Title')}</h2>
            {!ga4.linked ? (
              <p className="text-sm text-[#062E25]/40">{t('detail.ga4NotLinked')}</p>
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
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(row.sessions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
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

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('detail.adsTitle')}</h2>
            {ads.length === 0 ? (
              <p className="text-center py-12 text-[#062E25]/40">{t('detail.adsEmpty')}</p>
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
                    {ads.map((ad) => (
                      <TableRow key={ad.adId}>
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
                              <p className="font-medium text-[#062E25] truncate">{ad.name}</p>
                              <p className="text-sm text-[#062E25]/40 truncate">{ad.adSetName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ad.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatChf(ad.spendChf)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(ad.impressions)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(ad.clicks)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatPct(ad.ctrPct)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {ad.cpcChf !== null ? formatChf(ad.cpcChf) : '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(ad.metaLeads)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(ad.dbLeads)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {ad.trueCplChf !== null ? formatChf(ad.trueCplChf) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {breakdownsLoading ? (
        <AdminPageLoader className="h-32" />
      ) : !breakdowns ? (
        <p className="text-[#062E25]/60">{tc('failedToLoad')}</p>
      ) : !breakdowns.available ? (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/40">
              {breakdowns.reason === 'not_configured'
                ? t('detail.breakdownNotConfigured')
                : breakdowns.reason === 'api_error'
                  ? t('detail.breakdownApiError')
                  : t('detail.breakdownNoData')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            'grid lg:grid-cols-2 gap-4 transition-opacity',
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
      )}
    </div>
  )
}
