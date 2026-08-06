'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
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
import type { MarketingAnalyticsOverview } from '@/types/admin-marketing'

const RANGE_OPTIONS = [7, 30, 90]

const TICK_STYLE = { fill: 'rgba(6,46,37,0.5)', fontSize: 11 }
const TOOLTIP_STYLE = { borderRadius: 8, border: '1px solid rgba(6,46,37,0.1)', fontSize: 13 }
const CHART_MARGIN = { top: 4, right: 8, left: 0, bottom: 0 }

function formatCount(value: number) {
  return value.toLocaleString('de-CH')
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

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function RankedRows({
  rows,
  emptyLabel,
  color,
}: {
  rows: { label: string; value: number }[]
  emptyLabel: string
  color: string
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-[#062E25]/40">{emptyLabel}</p>
  }
  const max = Math.max(...rows.map(row => row.value), 1)
  return (
    <div className="space-y-2">
      {rows.map(row => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 text-sm text-[#062E25]/60 truncate" title={row.label}>
            {row.label}
          </span>
          <div className="flex-1 bg-[#062E25]/[0.04] rounded h-5">
            {row.value > 0 && (
              <div
                className="h-5 rounded-r"
                style={{
                  width: `${(row.value / max) * 100}%`,
                  minWidth: 2,
                  backgroundColor: color,
                }}
              />
            )}
          </div>
          <span className="shrink-0 text-sm tabular-nums text-[#062E25] text-right whitespace-nowrap">
            {formatCount(row.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminMarketingAnalyticsPage() {
  const t = useTranslations('admin.marketing.analytics')
  const tc = useTranslations('admin.common')

  const [days, setDays] = useState(30)

  const range = useMemo(() => {
    const to = new Date()
    const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    return { from: isoDay(from), to: isoDay(to) }
  }, [days])

  const { data, isLoading, isPlaceholderData } = useQuery<MarketingAnalyticsOverview>({
    queryKey: ['admin', 'marketing', 'analytics', range.from, range.to],
    queryFn: () => adminMarketingService.getAnalyticsOverview(range),
    placeholderData: keepPreviousData,
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]/60">{tc('failedToLoad')}</p>
  }

  const { totals, daily, topPages, topSources, entryPages, comparison, channelFunnel } =
    data

  const tiles = [
    { label: t('sessions'), value: formatCount(totals.uniqueSessions) },
    { label: t('views'), value: formatCount(totals.totalViews) },
    { label: t('viewsPerSession'), value: totals.viewsPerSession.toLocaleString('de-CH') },
    {
      label: t('ga4Sessions'),
      value: formatCount(comparison.ga4Sessions),
      sub:
        comparison.capturedMultiple !== null
          ? t('capturedMultiple', {
              value: comparison.capturedMultiple.toLocaleString('de-CH'),
            })
          : undefined,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">{t('title')}</h1>
      <p className="text-sm text-[#062E25]/60 mb-6">{t('subtitle')}</p>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {RANGE_OPTIONS.map(option => (
          <Button
            key={option}
            variant={days === option ? 'default' : 'outline'}
            size="sm"
            className={cn(days === option && 'bg-[#062E25] hover:bg-[#062E25]/90 text-white')}
            onClick={() => setDays(option)}
          >
            {t('rangeDays', { count: option })}
          </Button>
        ))}
        <p className="text-sm text-[#062E25]/40 ml-auto">
          {t('rangeLabel', {
            from: formatFullDay(data.range.from),
            to: formatFullDay(data.range.to),
          })}
        </p>
      </div>

      <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {tiles.map(tile => (
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
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('chartSessions')}</h2>
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
                      labelFormatter={value => formatFullDay(String(value))}
                      formatter={value => formatCount(Number(value))}
                    />
                    <Bar
                      dataKey="sessions"
                      name={t('sessions')}
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
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('chartViews')}</h2>
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
                    <YAxis
                      allowDecimals={false}
                      width={40}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(6,46,37,0.2)' }}
                      contentStyle={TOOLTIP_STYLE}
                      labelFormatter={value => formatFullDay(String(value))}
                      formatter={value => formatCount(Number(value))}
                    />
                    <Line
                      dataKey="views"
                      name={t('views')}
                      stroke="#2a78d6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('sourcesTitle')}</h2>
              <RankedRows
                rows={topSources.map(row => ({ label: row.source, value: row.sessions }))}
                emptyLabel={t('empty')}
                color="#c98500"
              />
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('entryPagesTitle')}</h2>
              <RankedRows
                rows={entryPages.map(row => ({ label: row.path, value: row.sessions }))}
                emptyLabel={t('empty')}
                color="#4a3aa7"
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('channelFunnelTitle')}
            </h2>
            {channelFunnel.length === 0 ? (
              <p className="text-sm text-[#062E25]/40">{t('empty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('channel')}</TableHead>
                      <TableHead className="text-right">{t('calculatorStarted')}</TableHead>
                      <TableHead className="text-right">{t('reachedStep2')}</TableHead>
                      <TableHead className="text-right">{t('reachedLastStep')}</TableHead>
                      <TableHead className="text-right">{t('accountsCreated')}</TableHead>
                      <TableHead className="text-right">{t('step1ToStep2')}</TableHead>
                      <TableHead className="text-right">{t('startToAccount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channelFunnel.map(row => (
                      <TableRow key={row.channel}>
                        <TableCell className="font-medium">
                          {t.has(`channels.${row.channel}`)
                            ? t(`channels.${row.channel}`)
                            : row.channel}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCount(row.calculatorStarted)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCount(row.reachedStep2)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCount(row.reachedLastStep)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCount(row.accountsCreated)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.step1ToStep2Pct != null ? `${row.step1ToStep2Pct}%` : '-'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.startToAccountPct != null ? `${row.startToAccountPct}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('topPagesTitle')}</h2>
            {topPages.length === 0 ? (
              <p className="text-sm text-[#062E25]/40">{t('empty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('page')}</TableHead>
                      <TableHead className="text-right">{t('views')}</TableHead>
                      <TableHead className="text-right">{t('sessions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPages.map(row => (
                      <TableRow key={row.path}>
                        <TableCell className="text-[#062E25]">
                          <span className="block max-w-md truncate" title={row.path}>
                            {row.path}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(row.views)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]/80">
                          {formatCount(row.sessions)}
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
    </div>
  )
}
