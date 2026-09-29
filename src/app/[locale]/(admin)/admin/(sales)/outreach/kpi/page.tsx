'use client'

// Owner-first KPI page (doc 69 §10, W1-8): the daily KPI line, the open warm
// replies and the recorded leads with their CRM promotion.

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
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
import { outreachKpiService } from '@/services/outreach/kpi.service'
import type { KpiDay, OutboundLeadRow } from '@/types/outreach/kpi'

const DAY_MS = 24 * 60 * 60 * 1000

function isoDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function shortDay(day: string): string {
  const [, month, date] = day.split('-')
  return `${date}.${month}`
}

function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('de-CH', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

function recipients(day: KpiDay): string {
  const entries = Object.entries(day.newRecipientsBySegment).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  return entries.length
    ? entries.map(([letter, n]) => `${letter} ${n}`).join(', ')
    : '0'
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-[#062E25]/75">{label}</p>
        <p className="text-2xl font-bold text-[#062E25] tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">
      {children}
    </h3>
  )
}

function PromotionCell({ lead }: { lead: OutboundLeadRow }) {
  const t = useTranslations('admin.outreach.kpi')
  const locale = useLocale()
  if (lead.commercialLead) {
    return (
      <Link
        href={`/${locale}/admin/commercial-leads/${lead.commercialLead.id}`}
        className="text-blue-600 hover:underline"
      >
        {lead.commercialLead.reference}
      </Link>
    )
  }
  if (lead.kind !== 'QRL') return <span className="text-[#062E25]/40">-</span>
  return (
    <span className="text-amber-800">
      {lead.promotionNote ?? t('notPromoted')}
    </span>
  )
}

export default function AdminOutreachKpiPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.kpi')
  const [to, setTo] = useState(() => isoDay(new Date()))
  const [from, setFrom] = useState(() =>
    isoDay(new Date(Date.now() - 13 * DAY_MS))
  )
  const [copied, setCopied] = useState(false)

  const daily = useQuery({
    queryKey: ['admin', 'outreach', 'kpi', 'daily', from, to],
    queryFn: () => outreachKpiService.getDaily({ from, to }),
  })
  const warm = useQuery({
    queryKey: ['admin', 'outreach', 'kpi', 'warm-open'],
    queryFn: () => outreachKpiService.getWarmOpen(),
    refetchInterval: 60_000,
  })
  const leads = useQuery({
    queryKey: ['admin', 'outreach', 'kpi', 'leads', from, to],
    queryFn: () => outreachKpiService.listLeads({ from, to }),
  })

  const days = daily.data?.days ?? []
  const latest = days[days.length - 1]

  const copyLine = async () => {
    if (!latest) return
    try {
      await navigator.clipboard.writeText(latest.line)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div>
          <Label htmlFor="kpi-from">{t('from')}</Label>
          <Input
            id="kpi-from"
            type="date"
            value={from}
            max={to}
            className="mt-1 text-base"
            onChange={e => e.target.value && setFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="kpi-to">{t('to')}</Label>
          <Input
            id="kpi-to"
            type="date"
            value={to}
            min={from}
            className="mt-1 text-base"
            onChange={e => e.target.value && setTo(e.target.value)}
          />
        </div>
      </div>

      {daily.data && !daily.data.qrlPromotionConfigured && (
        <p className="mb-4 p-3 rounded bg-amber-50 text-amber-800">
          {t('promotionMissing')}
        </p>
      )}

      {daily.isLoading ? (
        <AdminPageLoader />
      ) : daily.isError ? (
        <p className="mb-6 p-3 rounded bg-red-50 text-red-700">
          {t('loadFailed')}
        </p>
      ) : (
        latest && (
          <>
            <Card className="border-[#062E25]/10 mb-6">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <SectionTitle>
                    {t('lineTitle', { day: shortDay(latest.day) })}
                  </SectionTitle>
                  <Button variant="outline" size="sm" onClick={copyLine}>
                    {copied ? t('copied') : t('copy')}
                  </Button>
                </div>
                <p className="font-mono break-words text-[#062E25]">
                  {latest.line}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <KpiCard label={t('cardQrl7d')} value={String(latest.qrl7d)} />
              <KpiCard label={t('cardQrl20d')} value={String(latest.qrl20d)} />
              <KpiCard
                label={t('cardQrlPerDay')}
                value={formatNumber(latest.qrl20d / 20, 2)}
              />
              <KpiCard
                label={t('cardWarmOpen')}
                value={String(latest.warmOpenOver4h)}
              />
              <KpiCard
                label={t('cardMedianAnswer')}
                value={
                  latest.medianWarmAnswerHours == null
                    ? '-'
                    : t('hoursValue', {
                        hours: formatNumber(latest.medianWarmAnswerHours),
                      })
                }
              />
              <KpiCard
                label={t('cardBounces')}
                value={`${formatNumber(latest.bounceRate7d)}%`}
              />
            </div>

            <Card className="border-[#062E25]/10 mb-6">
              <CardContent className="p-6">
                <SectionTitle>{t('daysTitle')}</SectionTitle>
                <div className="overflow-x-auto">
                  <Table className="text-base min-w-[960px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('colDay')}</TableHead>
                        <TableHead>{t('colRecipients')}</TableHead>
                        <TableHead className="text-right">
                          {t('colLetters')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colDials')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colReplies')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colHints')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colQrl')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colMeetings')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colOffers')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('colBounces')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...days].reverse().map(day => (
                        <TableRow key={day.day}>
                          <TableCell className="tabular-nums">
                            {shortDay(day.day)}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {recipients(day)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {day.letters}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {day.dials}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {day.humanReplies} ({day.tenantReplies},{' '}
                            {day.hasPvReplies})
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {day.ownerHints}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-semibold">
                            {day.qrl}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {day.meetingsHeld}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {day.offersSent}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatNumber(day.bounceRate7d)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <SectionTitle>{t('warmTitle')}</SectionTitle>
          {warm.isLoading ? (
            <AdminPageLoader />
          ) : warm.isError ? (
            <p className="p-3 rounded bg-red-50 text-red-700">
              {t('loadFailed')}
            </p>
          ) : (warm.data?.items.length ?? 0) === 0 ? (
            <p className="text-[#062E25]/75">{t('warmEmpty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colReceived')}</TableHead>
                    <TableHead className="text-right">{t('colAge')}</TableHead>
                    <TableHead>{t('colSignal')}</TableHead>
                    <TableHead>{t('colCompany')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warm.data!.items.map(item => (
                    <TableRow key={item.emailId}>
                      <TableCell className="tabular-nums">
                        {new Date(item.receivedAt).toLocaleString('de-CH')}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.ageWorkingHours)}
                      </TableCell>
                      <TableCell>
                        {item.signal ??
                          (item.humanRequired ? t('humanRequired') : '-')}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/${locale}/admin/outreach/${item.prospectId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {item.companyName ??
                            item.reference ??
                            item.prospectId}
                        </Link>
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
          <SectionTitle>{t('leadsTitle')}</SectionTitle>
          {leads.isLoading ? (
            <AdminPageLoader />
          ) : leads.isError ? (
            <p className="p-3 rounded bg-red-50 text-red-700">
              {t('loadFailed')}
            </p>
          ) : (leads.data?.items.length ?? 0) === 0 ? (
            <p className="text-[#062E25]/75">{t('leadsEmpty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-base min-w-[880px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colQualified')}</TableHead>
                    <TableHead>{t('colKind')}</TableHead>
                    <TableHead>{t('colCriterion')}</TableHead>
                    <TableHead>{t('colChannel')}</TableHead>
                    <TableHead>{t('colCompany')}</TableHead>
                    <TableHead>{t('colPromotion')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.data!.items.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell className="tabular-nums">
                        {new Date(lead.qualifiedAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell>{t(`leadKind.${lead.kind}`)}</TableCell>
                      <TableCell>{t(`criterion.${lead.criterion}`)}</TableCell>
                      <TableCell>{t(`channel.${lead.channel}`)}</TableCell>
                      <TableCell>
                        {lead.prospect ? (
                          <Link
                            href={`/${locale}/admin/outreach/${lead.prospect.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {lead.prospect.companyName}
                          </Link>
                        ) : (
                          <span className="font-mono">{lead.buildingKey}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PromotionCell lead={lead} />
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
  )
}
