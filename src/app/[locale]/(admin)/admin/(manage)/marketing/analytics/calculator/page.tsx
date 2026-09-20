'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import type { CalculatorFlowKey } from '@/types/admin-marketing'

const RANGE_OPTIONS = [7, 30, 90]
const FLOW_OPTIONS: CalculatorFlowKey[] = ['residential', 'commercial']

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '-'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`
}

function clientLabel(
  device: string | null,
  browser: string | null,
  os: string | null
): string {
  return [device, browser, os].filter(Boolean).join(' / ') || '-'
}

export default function CalculatorFunnelPage() {
  const t = useTranslations('admin.marketing.calculatorFunnel')
  const locale = useLocale()
  const [days, setDays] = useState(30)
  const [flow, setFlow] = useState<CalculatorFlowKey>('residential')
  const [openSession, setOpenSession] = useState<string | null>(null)

  const to = new Date()
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000)

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'admin',
      'marketing',
      'analytics',
      'calculator',
      isoDay(from),
      isoDay(to),
      flow,
    ],
    queryFn: () =>
      adminMarketingService.getCalculatorFunnel({
        from: isoDay(from),
        to: isoDay(to),
        flow,
      }),
    placeholderData: keepPreviousData,
  })

  const sessionQuery = useQuery({
    queryKey: ['admin', 'marketing', 'analytics', 'session', openSession],
    queryFn: () =>
      adminMarketingService.getSessionDetail(openSession as string),
    enabled: Boolean(openSession),
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

  const firstStepSessions = data.steps[0]?.sessions ?? 0
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#062E25]">{t('title')}</h1>
        <p className="mt-1 text-base text-[#062E25]/70">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FLOW_OPTIONS.map(option => (
          <Button
            key={option}
            variant={flow === option ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFlow(option)}
          >
            {t(`flow.${option}`)}
          </Button>
        ))}
        <span className="mx-2 h-5 w-px bg-[#062E25]/15" />
        {RANGE_OPTIONS.map(option => (
          <Button
            key={option}
            variant={days === option ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDays(option)}
          >
            {t('rangeDays', { count: option })}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="py-5">
          <p className="text-base font-medium text-[#062E25]">
            {t('stepsTitle')}
          </p>
          {data.steps.length === 0 ? (
            <p className="mt-3 text-base text-[#062E25]/60">{t('empty')}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.steps.map(step => {
                const width =
                  firstStepSessions > 0
                    ? Math.max((step.sessions / firstStepSessions) * 100, 2)
                    : 0
                return (
                  <div key={step.step}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-base">
                      <span className="font-medium text-[#062E25]">
                        {t('stepLabel', { step: step.step })}
                      </span>
                      <span className="text-[#062E25]/70">
                        {t('stepSummary', {
                          sessions: step.sessions,
                          median: formatDuration(step.medianSeconds),
                        })}
                      </span>
                    </div>
                    <div className="mt-1 h-7 w-full rounded bg-[#062E25]/8">
                      <div
                        className="h-7 rounded bg-[#0F766E]"
                        style={{ width: `${width}%` }}
                        aria-hidden
                      />
                    </div>
                    {step.dropOff > 0 && (
                      <p className="mt-1 text-base text-[#B45309]">
                        {t('dropOff', {
                          count: step.dropOff,
                          percent: Math.round(step.dropOffRate * 100),
                        })}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <p className="text-base font-medium text-[#062E25]">
              {t('outcomesTitle')}
            </p>
            <ul className="mt-3 space-y-2">
              {data.outcomes.map(row => (
                <li
                  key={row.name}
                  className="flex justify-between gap-3 text-base"
                >
                  <span className="truncate text-[#062E25]">
                    {t(`outcome.${row.name}`)}
                  </span>
                  <span className="text-[#062E25]/70">{row.sessions}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <p className="text-base font-medium text-[#062E25]">
              {t('devicesTitle')}
            </p>
            <ul className="mt-3 space-y-2">
              {data.devices.map(row => (
                <li
                  key={row.device}
                  className="flex justify-between gap-3 text-base"
                >
                  <span className="truncate text-[#062E25]">{row.device}</span>
                  <span className="text-[#062E25]/70">
                    {t('sessionsAndSignups', {
                      sessions: row.sessions,
                      signups: row.signups,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <p className="text-base font-medium text-[#062E25]">
              {t('channelsTitle')}
            </p>
            <ul className="mt-3 space-y-2">
              {data.channels.map(row => (
                <li
                  key={row.channel}
                  className="flex justify-between gap-3 text-base"
                >
                  <span className="truncate text-[#062E25]">{row.channel}</span>
                  <span className="text-[#062E25]/70">
                    {t('sessionsAndSignups', {
                      sessions: row.sessions,
                      signups: row.signups,
                    })}
                  </span>
                </li>
              ))}
            </ul>
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
                    <TableHead>{t('started')}</TableHead>
                    <TableHead>{t('client')}</TableHead>
                    <TableHead>{t('channel')}</TableHead>
                    <TableHead className="text-right">
                      {t('reachedStep')}
                    </TableHead>
                    <TableHead>{t('result')}</TableHead>
                    <TableHead>{t('replay')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.map(row => (
                    <TableRow key={row.sessionKey}>
                      <TableCell>{formatDateTime(row.startedAt)}</TableCell>
                      <TableCell>
                        {clientLabel(row.device, row.browser, row.os)}
                      </TableCell>
                      <TableCell>{row.channel}</TableCell>
                      <TableCell className="text-right">
                        {row.maxStep ?? '-'}
                      </TableCell>
                      <TableCell
                        className={cn(
                          row.signedUp
                            ? 'text-emerald-700'
                            : row.reachedResults
                              ? 'text-[#062E25]'
                              : 'text-[#062E25]/60'
                        )}
                      >
                        {row.signedUp
                          ? t('resultSignup')
                          : row.reachedResults
                            ? t('resultResults')
                            : t('resultDropped')}
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
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenSession(row.sessionKey)}
                        >
                          {t('openTimeline')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(openSession)}
        onOpenChange={open => !open && setOpenSession(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('timelineTitle')}</DialogTitle>
          </DialogHeader>
          {sessionQuery.isLoading && (
            <p className="text-base text-[#062E25]/70">{t('loading')}</p>
          )}
          {sessionQuery.data && (
            <div className="space-y-4">
              <div className="grid gap-1 text-base text-[#062E25]/80">
                <p>
                  {t('channel')}:{' '}
                  {sessionQuery.data.attribution?.channel ?? '-'}
                </p>
                <p>
                  {t('client')}:{' '}
                  {clientLabel(
                    sessionQuery.data.attribution?.device ?? null,
                    sessionQuery.data.attribution?.browser ?? null,
                    sessionQuery.data.attribution?.os ?? null
                  )}
                </p>
                <p>
                  {t('timezone')}:{' '}
                  {sessionQuery.data.attribution?.timezone ?? '-'}
                </p>
                <p className="truncate">
                  {t('landingPage')}:{' '}
                  {sessionQuery.data.attribution?.landingPage ?? '-'}
                </p>
                {sessionQuery.data.projectId && (
                  <a
                    className="text-[#0F766E] underline"
                    href={`/admin/projects/${sessionQuery.data.projectId}`}
                  >
                    {t('openProject')}
                  </a>
                )}
              </div>
              <ol className="space-y-2 border-l border-[#062E25]/15 pl-4">
                {sessionQuery.data.timeline.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="text-base">
                    <span className="text-[#062E25]/60">
                      {formatDateTime(entry.at)}
                    </span>{' '}
                    <span
                      className={
                        entry.kind === 'event'
                          ? 'font-medium text-[#062E25]'
                          : 'text-[#062E25]/80'
                      }
                    >
                      {entry.label}
                    </span>
                    {entry.step !== null && (
                      <span className="text-[#062E25]/60">
                        {' '}
                        {t('stepLabel', { step: entry.step })}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
