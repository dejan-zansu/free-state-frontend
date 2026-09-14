'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import { de, enUS, fr, it } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
const MONTH_OPTIONS = 12
const ROLLING_WINDOW = 7

const TICK_STYLE = { fill: 'rgba(6,46,37,0.85)', fontSize: 11 }
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid rgba(6,46,37,0.1)',
  fontSize: 13,
  color: '#062E25',
}
const TOOLTIP_ITEM_STYLE = { color: '#062E25' }
const LEGEND_STYLE = { fontSize: 12, color: '#062E25' }
const CHART_MARGIN = { top: 4, right: 8, left: 0, bottom: 0 }

// Fixed per channel so paid and organic keep the same colour in every chart.
const CHANNEL_COLORS: Record<string, string> = {
  google_ads: '#2a78d6',
  meta_ads: '#4a3aa7',
  paid_other: '#e34948',
  organic_search: '#178f63',
  ai_assistant: '#0f8a8a',
  social: '#eda100',
  referral: '#b4653a',
  direct: '#8a8781',
  unknown: '#b9b6b0',
  unattributed: '#b9b6b0',
}
const FALLBACK_COLOR = '#b9b6b0'

// Without this the calendar falls back to English weekday names and a Sunday
// week start.
const CALENDAR_LOCALES = { de, en: enUS, fr, it } as const

function formatCount(value: number) {
  return value.toLocaleString('de-CH')
}

function formatChf(value: number) {
  return `CHF ${formatChfAmount(value)}`
}

function formatChfAmount(value: number) {
  return value.toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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

function formatMonth(value: string) {
  return new Date(`${value}-01T00:00:00.000Z`).toLocaleDateString('de-CH', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

// The calendar hands back local dates. Formatting those through toISOString
// would shift them a day back in Swiss summer time.
function localIsoDay(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function parseIsoDay(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

// Last day of the month, capped at today so a running month does not chart
// empty future days.
function monthRange(key: string) {
  const start = new Date(`${key}-01T00:00:00.000Z`)
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0))
  const today = new Date()
  return { from: isoDay(start), to: isoDay(end < today ? end : today) }
}

function deltaPct(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function formatDelta(value: number | null) {
  if (value === null) return null
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('de-CH')}%`
}

type RangeMode =
  | { kind: 'days'; days: number }
  | { kind: 'month'; month: string }
  | { kind: 'custom'; from: string; to: string }

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
    return <p className="text-sm text-[#062E25]">{emptyLabel}</p>
  }
  const max = Math.max(...rows.map(row => row.value), 1)
  return (
    <div className="space-y-2">
      {rows.map(row => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="w-40 shrink-0 text-sm text-[#062E25] truncate" title={row.label}>
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
  const locale = useLocale()
  const calendarLocale =
    CALENDAR_LOCALES[locale as keyof typeof CALENDAR_LOCALES] ?? CALENDAR_LOCALES.de

  const [mode, setMode] = useState<RangeMode>({ kind: 'days', days: 30 })
  const [pickerOpen, setPickerOpen] = useState(false)
  const [picked, setPicked] = useState<DateRange | undefined>()

  const months = useMemo(() => {
    const now = new Date()
    return Array.from({ length: MONTH_OPTIONS }, (_, index) =>
      monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1))),
    )
  }, [])

  const range = useMemo(() => {
    if (mode.kind === 'month') return monthRange(mode.month)
    if (mode.kind === 'custom') return { from: mode.from, to: mode.to }
    const to = new Date()
    const from = new Date(to.getTime() - (mode.days - 1) * 24 * 60 * 60 * 1000)
    return { from: isoDay(from), to: isoDay(to) }
  }, [mode])

  // A preset range that happens to cover exactly one calendar month still shows
  // that month in the select, so no control sits empty while a range is active.
  const activeMonth = useMemo(() => {
    const match = months.find(month => {
      const bounds = monthRange(month)
      return bounds.from === range.from && bounds.to === range.to
    })
    return match ?? ''
  }, [months, range.from, range.to])

  const activeCalendarRange = useMemo<DateRange>(
    () => ({ from: parseIsoDay(range.from), to: parseIsoDay(range.to) }),
    [range.from, range.to],
  )

  const { data, isLoading, isPlaceholderData } = useQuery<MarketingAnalyticsOverview>({
    queryKey: ['admin', 'marketing', 'analytics', range.from, range.to],
    queryFn: () => adminMarketingService.getAnalyticsOverview(range),
    placeholderData: keepPreviousData,
  })

  const daily = data?.daily ?? []
  const previousDaily = data?.previous?.daily ?? []

  const channelSeries = useMemo(() => {
    const channels = data?.channels ?? []
    return channels.map(channel => ({
      key: channel,
      label: t.has(`channels.${channel}`) ? t(`channels.${channel}`) : channel,
      color: CHANNEL_COLORS[channel] ?? FALLBACK_COLOR,
    }))
  }, [data?.channels, t])

  const channelRows = useMemo(
    () =>
      (data?.dailyByChannel ?? []).map(row => ({
        date: row.date,
        ...row.sessions,
      })),
    [data?.dailyByChannel],
  )

  // Daily views with a rolling mean, so a single busy day does not read as a trend.
  const viewRows = useMemo(
    () =>
      daily.map((row, index) => {
        const start = Math.max(0, index - (ROLLING_WINDOW - 1))
        const window = daily.slice(start, index + 1)
        const mean = window.reduce((sum, entry) => sum + entry.views, 0) / window.length
        return { date: row.date, views: row.views, rolling: Math.round(mean * 10) / 10 }
      }),
    [daily],
  )

  // Cumulative curve against the same-length window before it, aligned by
  // position: day 1 of this period sits above day 1 of the previous one.
  const progressRows = useMemo(() => {
    let current = 0
    let previous = 0
    return daily.map((row, index) => {
      current += row.sessions
      previous += previousDaily[index]?.sessions ?? 0
      return {
        date: row.date,
        current,
        previous: previousDaily.length > 0 ? previous : null,
      }
    })
  }, [daily, previousDaily])

  const conversionRows = useMemo(() => {
    const signups = data?.dailySignups ?? []
    const spend = data?.dailySpend ?? []
    let cumulative = 0
    return signups.map((row, index) => {
      cumulative += row.total
      return {
        date: row.date,
        signups: row.total,
        cumulative,
        spend: spend[index]?.total ?? 0,
      }
    })
  }, [data?.dailySignups, data?.dailySpend])

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const { totals, topPages, topSources, entryPages, comparison } = data
  const channelFunnel = data.channelFunnel ?? []
  const previous = data.previous
  const signupsTotal = data.signups?.total ?? 0
  const spendTotal = data.spend?.totalChf ?? 0

  const previousLabel = previous
    ? t('previousRange', {
        from: formatFullDay(previous.from),
        to: formatFullDay(previous.to),
      })
    : undefined

  const tiles = [
    {
      label: t('sessions'),
      value: formatCount(totals.uniqueSessions),
      unit: null,
      delta: previous ? deltaPct(totals.uniqueSessions, previous.sessions) : null,
      sub: null,
    },
    {
      label: t('views'),
      value: formatCount(totals.totalViews),
      unit: null,
      delta: previous ? deltaPct(totals.totalViews, previous.views) : null,
      sub: null,
    },
    {
      label: t('viewsPerSession'),
      value: totals.viewsPerSession.toLocaleString('de-CH'),
      unit: null,
      delta: null,
      sub: null,
    },
    {
      label: t('signups'),
      value: formatCount(signupsTotal),
      unit: null,
      delta: previous ? deltaPct(signupsTotal, previous.signups) : null,
      sub: null,
    },
    {
      label: t('spend'),
      value: formatChfAmount(spendTotal),
      unit: 'CHF',
      delta: null,
      sub: null,
    },
    {
      label: t('ga4Sessions'),
      value: formatCount(comparison.ga4Sessions),
      unit: null,
      delta: null,
      sub:
        comparison.capturedMultiple !== null
          ? t('capturedMultiple', {
              value: comparison.capturedMultiple.toLocaleString('de-CH'),
            })
          : null,
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">{t('title')}</h1>
      <p className="text-sm text-[#062E25]/75 mb-6">{t('subtitle')}</p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex items-center rounded-md border border-[#062E25]/15 bg-white p-0.5">
          {RANGE_OPTIONS.map(option => {
            const active = mode.kind === 'days' && mode.days === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setPicked(undefined)
                  setMode({ kind: 'days', days: option })
                }}
                className={cn(
                  'h-8 rounded-[5px] px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#062E25] text-white'
                    : 'text-[#062E25]/75 hover:bg-[#062E25]/[0.06]',
                )}
              >
                {t('rangeDays', { count: option })}
              </button>
            )
          })}
        </div>

        <Select
          value={activeMonth || undefined}
          onValueChange={value => {
            setPicked(undefined)
            setMode({ kind: 'month', month: value })
          }}
        >
          <SelectTrigger className="h-9 w-44 border-[#062E25]/15 text-[#062E25]">
            <SelectValue placeholder={t('rangeMonthPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {months.map(month => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Collapsible open={pickerOpen} onOpenChange={setPickerOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 justify-start gap-2 border-[#062E25]/15 font-normal text-[#062E25]',
                mode.kind === 'custom' && 'border-[#062E25]/40',
              )}
            >
              <CalendarIcon className="h-4 w-4 text-[#062E25]/60" />
              {t('rangeLabel', {
                from: formatFullDay(data.range.from),
                to: formatFullDay(data.range.to),
              })}
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', pickerOpen && 'rotate-180')}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="absolute z-20 mt-2">
            <div className="rounded-md border border-[#062E25]/15 bg-white p-2 shadow-lg">
              <Calendar
                mode="range"
                numberOfMonths={2}
                locale={calendarLocale}
                defaultMonth={parseIsoDay(data.range.from)}
                selected={picked ?? activeCalendarRange}
                disabled={{ after: new Date() }}
                onSelect={next => {
                  setPicked(next)
                  if (next?.from && next?.to) {
                    setMode({
                      kind: 'custom',
                      from: localIsoDay(next.from),
                      to: localIsoDay(next.to),
                    })
                    setPickerOpen(false)
                  }
                }}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {previousLabel && (
          <p className="ml-auto text-sm text-[#062E25]/60">{previousLabel}</p>
        )}
      </div>

      <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {tiles.map(tile => (
                <div
                  key={tile.label}
                  className={cn(
                    'px-5 py-4 border-b border-r border-[#062E25]/10',
                    '[&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0',
                    'md:[&:nth-child(2n)]:border-r md:[&:nth-child(3n)]:border-r-0',
                    'md:[&:nth-last-child(-n+3)]:border-b-0',
                    'xl:[&:nth-child(3n)]:border-r xl:[&:nth-child(6n)]:border-r-0 xl:border-b-0',
                  )}
                >
                  <p className="text-xs uppercase tracking-wide text-[#062E25]/60 mb-2">
                    {tile.label}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold tabular-nums text-[#062E25]">
                      {tile.value}
                    </span>
                    {tile.unit && (
                      <span className="text-sm font-medium text-[#062E25]/60">{tile.unit}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#062E25]/70 min-h-[1rem]">
                    {tile.delta !== null && tile.delta !== undefined ? (
                      <span
                        className={cn(
                          'font-medium',
                          tile.delta > 0 && 'text-[#178f63]',
                          tile.delta < 0 && 'text-[#d03b3b]',
                        )}
                      >
                        {formatDelta(tile.delta)}
                      </span>
                    ) : (
                      tile.sub
                    )}
                    {tile.delta !== null && tile.delta !== undefined && previous && (
                      <span className="text-[#062E25]/60"> {t('vsPrevious')}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-1">
              {t('chartSessionsByChannel')}
            </h2>
            <p className="text-sm text-[#062E25]/75 mb-4">{t('chartSessionsByChannelHint')}</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelRows} margin={CHART_MARGIN}>
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
                    labelFormatter={value => formatFullDay(String(value))}
                    formatter={value => formatCount(Number(value))}
                  />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                  {channelSeries.map(series => (
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      name={series.label}
                      stackId="channels"
                      fill={series.color}
                      maxBarSize={26}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-1">{t('chartViews')}</h2>
              <p className="text-sm text-[#062E25]/75 mb-4">{t('chartViewsHint')}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewRows} margin={CHART_MARGIN}>
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
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelFormatter={value => formatFullDay(String(value))}
                      formatter={value => formatCount(Number(value))}
                    />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Line
                      dataKey="views"
                      name={t('views')}
                      stroke="#2a78d6"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    />
                    <Line
                      dataKey="rolling"
                      name={t('rollingAverage', { count: ROLLING_WINDOW })}
                      stroke="#062E25"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-1">{t('chartProgress')}</h2>
              <p className="text-sm text-[#062E25]/75 mb-4">{t('chartProgressHint')}</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressRows} margin={CHART_MARGIN}>
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
                      width={48}
                      tickLine={false}
                      axisLine={false}
                      tick={TICK_STYLE}
                    />
                    <Tooltip
                      cursor={{ stroke: 'rgba(6,46,37,0.2)' }}
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      labelFormatter={value => formatFullDay(String(value))}
                      formatter={value => formatCount(Number(value))}
                    />
                    <Legend wrapperStyle={LEGEND_STYLE} />
                    <Line
                      dataKey="current"
                      name={t('currentPeriod')}
                      stroke="#178f63"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    />
                    <Line
                      dataKey="previous"
                      name={t('previousPeriod')}
                      stroke="#8a8781"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-1">{t('chartConversions')}</h2>
            <p className="text-sm text-[#062E25]/75 mb-4">{t('chartConversionsHint')}</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={conversionRows} margin={CHART_MARGIN}>
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
                    yAxisId="left"
                    allowDecimals={false}
                    width={40}
                    tickLine={false}
                    axisLine={false}
                    tick={TICK_STYLE}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    width={56}
                    tickLine={false}
                    axisLine={false}
                    tick={TICK_STYLE}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(6,46,37,0.04)' }}
                    contentStyle={TOOLTIP_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    labelFormatter={value => formatFullDay(String(value))}
                    formatter={(value, name) =>
                      name === t('spend')
                        ? formatChf(Number(value))
                        : formatCount(Number(value))
                    }
                  />
                  <Legend wrapperStyle={LEGEND_STYLE} />
                  <Bar
                    yAxisId="left"
                    dataKey="signups"
                    name={t('signups')}
                    fill="#178f63"
                    maxBarSize={26}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    dataKey="cumulative"
                    name={t('cumulativeSignups')}
                    stroke="#062E25"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    dataKey="spend"
                    name={t('spend')}
                    stroke="#e34948"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
              <p className="text-sm text-[#062E25]">{t('empty')}</p>
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
              <p className="text-sm text-[#062E25]">{t('empty')}</p>
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
                        <TableCell className="text-right tabular-nums text-[#062E25]">
                          {formatCount(row.views)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-[#062E25]">
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
