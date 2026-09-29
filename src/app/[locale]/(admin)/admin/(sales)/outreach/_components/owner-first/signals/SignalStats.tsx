'use client'

// Counts of the owner signals page: what came in lately, what waits for a
// judgment, and every kind by status. Says so when the daily connectors are
// switched off (OUTBOUND_SIGNALS_ENABLED).

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OWNER_SIGNAL_STATUSES } from '@/types/outreach/owner-first'
import type { OwnerSignalStatsResponse } from '@/types/outreach/signals'

function StatCard({
  label,
  value,
  onClick,
}: {
  label: string
  value: number
  onClick?: () => void
}) {
  const body = (
    <CardContent className="p-4">
      <p className="text-[#062E25]/75">{label}</p>
      <p className="text-2xl font-bold text-[#062E25] tabular-nums">{value}</p>
    </CardContent>
  )
  return (
    <Card className="border-[#062E25]/10">
      {onClick ? (
        <button type="button" onClick={onClick} className="w-full text-left">
          {body}
        </button>
      ) : (
        body
      )}
    </Card>
  )
}

export function SignalStats({
  stats,
  onShowReview,
}: {
  stats: OwnerSignalStatsResponse
  onShowReview: () => void
}) {
  const t = useTranslations('admin.outreach.signals')
  const kinds = stats.byKind.filter(row => row.total > 0)

  return (
    <div className="mb-6">
      {!stats.signalsEnabled && (
        <p className="mb-4 p-3 rounded bg-amber-50 text-amber-800">
          {t('gateOff')}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard label={t('cardLast7')} value={stats.last7Days} />
        <StatCard label={t('cardLast30')} value={stats.last30Days} />
        <StatCard
          label={t('cardReview')}
          value={stats.review}
          onClick={onShowReview}
        />
      </div>
      {kinds.length > 0 && (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">
              {t('byKindTitle')}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">{t('colKind')}</TableHead>
                  {OWNER_SIGNAL_STATUSES.map(status => (
                    <TableHead key={status} className="text-base text-right">
                      {t(`status.${status}`)}
                    </TableHead>
                  ))}
                  <TableHead className="text-base text-right">
                    {t('colTotal')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kinds.map(row => (
                  <TableRow key={row.kind}>
                    <TableCell className="text-base">
                      {t(`kind.${row.kind}`)}
                    </TableCell>
                    {OWNER_SIGNAL_STATUSES.map(status => (
                      <TableCell
                        key={status}
                        className="text-base text-right tabular-nums"
                      >
                        {row[status]}
                      </TableCell>
                    ))}
                    <TableCell className="text-base text-right tabular-nums font-semibold">
                      {row.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
