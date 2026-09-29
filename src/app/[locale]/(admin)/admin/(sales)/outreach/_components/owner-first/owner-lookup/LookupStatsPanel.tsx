'use client'

// Outcome split, spend and measured minutes per lookup per canton. These
// numbers replace the design's assumptions (outcome split, 2.5 minutes per
// lookup) after the first two weeks.

import { useTranslations } from 'next-intl'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { LookupStats } from '@/types/outreach/owner-lookup'

import { chf } from './format'

export function LookupStatsPanel({ stats }: { stats: LookupStats }) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const tr = useTranslations('admin.outreach.ownerLookup.resolution')
  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('stats.canton')}</TableHead>
            <TableHead>{t('stats.queued')}</TableHead>
            <TableHead>{t('stats.claimed')}</TableHead>
            <TableHead>{t('stats.billedToday')}</TableHead>
            <TableHead>{t('stats.chfPeriod', { days: stats.days })}</TableHead>
            <TableHead>{t('stats.done')}</TableHead>
            <TableHead>{t('stats.notFound')}</TableHead>
            <TableHead>{t('stats.void')}</TableHead>
            <TableHead>{t('stats.minutes')}</TableHead>
            <TableHead>{t('stats.outcomes')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.byCanton.map(row => (
            <TableRow key={row.canton}>
              <TableCell className="font-semibold">{row.canton}</TableCell>
              <TableCell className="tabular-nums">{row.queued}</TableCell>
              <TableCell className="tabular-nums">{row.claimed}</TableCell>
              <TableCell className="tabular-nums">
                {row.billedToday} ({chf(row.chfToday)})
              </TableCell>
              <TableCell className="tabular-nums">
                {chf(row.chfPeriod)}
              </TableCell>
              <TableCell className="tabular-nums">{row.done}</TableCell>
              <TableCell className="tabular-nums">{row.notFound}</TableCell>
              <TableCell className="tabular-nums">{row.void}</TableCell>
              <TableCell className="tabular-nums">
                {row.medianMinutes ?? '-'}
              </TableCell>
              <TableCell>
                {Object.entries(row.outcomes)
                  .map(([resolution, count]) => `${tr(resolution)} ${count}`)
                  .join(', ') || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {stats.operatorsToday.length > 0 && (
        <p className="text-[#062E25]/75">
          {t('stats.operatorsToday')}:{' '}
          {stats.operatorsToday
            .map(
              row =>
                `${row.name} ${row.canton} ${row.billed}${row.portal ? ` + ${row.portal}` : ''}`
            )
            .join(' | ')}
        </p>
      )}
    </div>
  )
}
