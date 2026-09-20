'use client'

import { useTranslations } from 'next-intl'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminMarketingService } from '@/services/admin-marketing.service'

const REFRESH_MS = 10_000

const TICK_STYLE = { fill: 'rgba(6,46,37,0.85)', fontSize: 11 }
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid rgba(6,46,37,0.1)',
  fontSize: 13,
  color: '#062E25',
}

function clockTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function secondsAgo(iso: string, now: number): number {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
}

function clientLabel(
  device: string | null,
  browser: string | null,
  os: string | null
): string {
  return [device, browser, os].filter(Boolean).join(' / ') || '-'
}

export default function MarketingLivePage() {
  const t = useTranslations('admin.marketing.live')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'marketing', 'analytics', 'live'],
    queryFn: () => adminMarketingService.getLiveAnalytics(),
    refetchInterval: REFRESH_MS,
    refetchOnWindowFocus: true,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })

  if (isLoading && !data) return <AdminPageLoader />

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#062E25]">{t('title')}</h1>
        <Card>
          <CardContent className="py-8 text-center text-base text-[#062E25]/70">
            {t('error')}
          </CardContent>
        </Card>
      </div>
    )
  }

  const now = Date.now()
  const chartData = data.timeline.map(point => ({
    label: clockTime(point.minute),
    views: point.views,
    sessions: point.sessions,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#062E25]">
            {t('title')}
          </h1>
          <p className="mt-1 text-base text-[#062E25]/70">
            {t('subtitle', { minutes: data.windowMinutes })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-base text-[#062E25]/70">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          {t('updated', { time: clockTime(data.generatedAt) })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-base text-[#062E25]/70">{t('activeSessions')}</p>
            <p className="mt-1 text-3xl font-semibold text-[#062E25]">
              {data.activeSessions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-base text-[#062E25]/70">{t('inCalculator')}</p>
            <p className="mt-1 text-3xl font-semibold text-[#062E25]">
              {data.calculatorSessions}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <p className="text-base text-[#062E25]/70">{t('activeViews')}</p>
            <p className="mt-1 text-3xl font-semibold text-[#062E25]">
              {data.activeViews}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-5">
          <p className="text-base font-medium text-[#062E25]">
            {t('timelineTitle')}
          </p>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(6,46,37,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={TICK_STYLE}
                  interval={4}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={TICK_STYLE}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar
                  dataKey="views"
                  name={t('views')}
                  fill="#0F766E"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="py-5">
            <p className="text-base font-medium text-[#062E25]">
              {t('pagesTitle')}
            </p>
            {data.paths.length === 0 ? (
              <p className="mt-3 text-base text-[#062E25]/60">{t('empty')}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.paths.map(row => (
                  <li
                    key={row.path}
                    className="flex justify-between gap-3 text-base"
                  >
                    <span className="truncate text-[#062E25]">{row.path}</span>
                    <span className="text-[#062E25]/70">{row.sessions}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="py-5">
            <p className="text-base font-medium text-[#062E25]">
              {t('channelsTitle')}
            </p>
            {data.channels.length === 0 ? (
              <p className="mt-3 text-base text-[#062E25]/60">{t('empty')}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.channels.map(row => (
                  <li
                    key={row.channel}
                    className="flex justify-between gap-3 text-base"
                  >
                    <span className="truncate text-[#062E25]">
                      {row.channel}
                    </span>
                    <span className="text-[#062E25]/70">{row.sessions}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="py-5">
            <p className="text-base font-medium text-[#062E25]">
              {t('devicesTitle')}
            </p>
            {data.devices.length === 0 ? (
              <p className="mt-3 text-base text-[#062E25]/60">{t('empty')}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.devices.map(row => (
                  <li
                    key={row.device}
                    className="flex justify-between gap-3 text-base"
                  >
                    <span className="truncate text-[#062E25]">
                      {row.device}
                    </span>
                    <span className="text-[#062E25]/70">{row.sessions}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-5">
          <p className="text-base font-medium text-[#062E25]">
            {t('sessionsTitle')}
          </p>
          {data.sessions.length === 0 ? (
            <p className="mt-3 text-base text-[#062E25]/60">{t('empty')}</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('page')}</TableHead>
                    <TableHead>{t('client')}</TableHead>
                    <TableHead>{t('channel')}</TableHead>
                    <TableHead className="text-right">{t('step')}</TableHead>
                    <TableHead className="text-right">{t('views')}</TableHead>
                    <TableHead className="text-right">
                      {t('lastSeen')}
                    </TableHead>
                    <TableHead>{t('replay')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.map(row => (
                    <TableRow key={row.sessionKey}>
                      <TableCell className="max-w-[260px] truncate">
                        {row.path}
                      </TableCell>
                      <TableCell>
                        {clientLabel(row.device, row.browser, row.os)}
                      </TableCell>
                      <TableCell>{row.channel}</TableCell>
                      <TableCell className="text-right">
                        {row.step ?? '-'}
                      </TableCell>
                      <TableCell className="text-right">{row.views}</TableCell>
                      <TableCell className="text-right">
                        {t('secondsAgo', {
                          seconds: secondsAgo(row.lastSeen, now),
                        })}
                      </TableCell>
                      <TableCell>
                        {row.replayUrl ? (
                          <a
                            className="text-[#0F766E] underline"
                            href={row.replayUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t('watch')}
                          </a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          <p className="text-base font-medium text-[#062E25]">
            {t('eventsTitle')}
          </p>
          {data.events.length === 0 ? (
            <p className="mt-3 text-base text-[#062E25]/60">{t('empty')}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.events.map(event => (
                <li key={event.id} className="flex flex-wrap gap-x-3 text-base">
                  <span className="text-[#062E25]/60">
                    {clockTime(event.createdAt)}
                  </span>
                  <span className="font-medium text-[#062E25]">
                    {event.name}
                  </span>
                  {event.step !== null && (
                    <span className="text-[#062E25]/70">
                      {t('stepShort', { step: event.step })}
                    </span>
                  )}
                  <span className="text-[#062E25]/60">{event.channel}</span>
                  {event.path && (
                    <span className="truncate text-[#062E25]/60">
                      {event.path}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
