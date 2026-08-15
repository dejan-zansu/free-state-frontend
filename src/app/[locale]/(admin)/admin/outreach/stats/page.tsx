'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { OUTBOUND_PROSPECT_STATUSES } from '@/types/admin-outreach'

const BAR_COLOR = '#178f63'

function formatPct(v: number | undefined): string {
  if (v == null) return '-'
  return `${(v * 100).toLocaleString('de-CH', { maximumFractionDigits: 1 })}%`
}

function formatDay(day: string): string {
  return new Date(day).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card><CardContent className="p-4">
      <p className="text-[#062E25]/75">{label}</p>
      <p className="text-2xl font-bold text-[#062E25] tabular-nums">{value}</p>
    </CardContent></Card>
  )
}

export default function AdminOutreachStatsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.stats')
  const tr = useTranslations('admin.outreach.replyClassifications')
  const tn = useTranslations('admin.outreach.stats.notInterestedReasons')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'outreach', 'stats'],
    queryFn: () => adminOutreachService.getStats(),
  })

  if (isLoading || !stats) return <AdminPageLoader />

  const sendsPerDay = stats.sendsPerDay ?? []
  const replyMix = Object.entries(stats.replyMix ?? {}).sort((a, b) => b[1] - a[1])
  const notInterestedReasons = Object.entries(stats.notInterestedReasons ?? {}).sort(
    (a, b) => b[1] - a[1],
  )
  const perTemplate = stats.perTemplate ?? []
  const statusRows = OUTBOUND_PROSPECT_STATUSES
    .map((s) => ({ status: s, count: stats.byStatus[s] ?? 0 }))
    .filter((r) => r.count > 0)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />{t('backToList')}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard label={t('cardProspects')} value={stats.total.toLocaleString('de-CH')} />
        <KpiCard label={t('cardContactFindRate')} value={formatPct(stats.contactFindRate)} />
        <KpiCard label={t('cardMeetingsBooked')} value={(stats.meetingsBooked ?? 0).toLocaleString('de-CH')} />
        <KpiCard label={t('cardDraftsUnedited')} value={formatPct(stats.draftsUneditedPct)} />
        <KpiCard
          label={t('cardMedianDraftToSend')}
          value={stats.medianDraftToSendHours != null
            ? t('hoursValue', {
                hours: stats.medianDraftToSendHours.toLocaleString('de-CH', { maximumFractionDigits: 1 }),
              })
            : '-'}
        />
      </div>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">{t('sendsPerDayTitle')}</h3>
          {sendsPerDay.length === 0 ? (
            <p className="text-[#062E25]/75">{t('noSends')}</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sendsPerDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} width={32} tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(day) => formatDay(String(day))}
                    formatter={(value) => [String(value), t('sendsTooltipLabel')]}
                  />
                  <Bar dataKey="sent" fill={BAR_COLOR} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">{t('byStatusTitle')}</h3>
            {statusRows.length === 0 ? (
              <p className="text-[#062E25]/75">{t('noProspects')}</p>
            ) : (
              <Table className="text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colStage')}</TableHead>
                    <TableHead className="text-right">{t('colCount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusRows.map((r) => (
                    <TableRow key={r.status}>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-right tabular-nums">{r.count.toLocaleString('de-CH')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">{t('replyMixTitle')}</h3>
            {replyMix.length === 0 ? (
              <p className="text-[#062E25]/75">{t('noReplies')}</p>
            ) : (
              <Table className="text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colClassification')}</TableHead>
                    <TableHead className="text-right">{t('colCount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {replyMix.map(([classification, count]) => (
                    <TableRow key={classification}>
                      <TableCell>{tr.has(classification) ? tr(classification) : classification}</TableCell>
                      <TableCell className="text-right tabular-nums">{count.toLocaleString('de-CH')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">{t('notInterestedTitle')}</h3>
          {notInterestedReasons.length === 0 ? (
            <p className="text-[#062E25]/75">{t('noNotInterestedReasons')}</p>
          ) : (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {notInterestedReasons.map(([reason, count]) => (
                <span key={reason} className="inline-flex items-center gap-2">
                  <span>{tn.has(reason) ? tn(reason) : reason}</span>
                  <span className="font-bold tabular-nums">{count.toLocaleString('de-CH')}</span>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">{t('perTemplateTitle')}</h3>
          {perTemplate.length === 0 ? (
            <p className="text-[#062E25]/75">{t('noTemplateData')}</p>
          ) : (
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('colTemplate')}</TableHead>
                  <TableHead className="text-right">{t('colSent')}</TableHead>
                  <TableHead className="text-right">{t('colReplied')}</TableHead>
                  <TableHead className="text-right">{t('colReplyRate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perTemplate.map((row) => (
                  <TableRow key={row.templateId}>
                    <TableCell className="font-mono">{row.key} v{row.version}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.sent.toLocaleString('de-CH')}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.replied.toLocaleString('de-CH')}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.sent > 0 ? formatPct(row.replied / row.sent) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {stats.lastRuns.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[#062E25]/75">{t('lastRuns')}:</span>
          {stats.lastRuns.map((run) => (
            <span key={run.connector} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#062E25]/5">
              <span className="font-mono">{run.connector}</span>
              <StatusBadge status={run.status} />
              {run.itemsUpserted != null && <span className="tabular-nums">{run.itemsUpserted}</span>}
              <span className="text-[#062E25]/75">
                {run.finishedAt ? new Date(run.finishedAt).toLocaleString('de-CH') : '-'}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
