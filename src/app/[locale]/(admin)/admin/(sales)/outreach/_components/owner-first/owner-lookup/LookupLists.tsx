'use client'

// Compact tables of lookups: today's closed items and the head of the queue
// of the selected canton.

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OwnerLookupItem } from '@/types/outreach/owner-lookup'

import { chf, dateTime, kwh } from './format'

export function LookupTable(props: {
  items: OwnerLookupItem[]
  mode: 'done' | 'queued'
}) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const locale = useLocale()
  if (props.items.length === 0)
    return <p className="text-[#062E25]/60">{t('lists.empty')}</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('lists.tier')}</TableHead>
          <TableHead>{t('lists.prospect')}</TableHead>
          <TableHead>E-GRID</TableHead>
          <TableHead>{t('lists.parcel')}</TableHead>
          {props.mode === 'done' ? (
            <>
              <TableHead>{t('lists.status')}</TableHead>
              <TableHead>{t('lists.outcome')}</TableHead>
              <TableHead>{t('lists.fee')}</TableHead>
              <TableHead>{t('lists.when')}</TableHead>
            </>
          ) : (
            <>
              <TableHead>{t('lists.score')}</TableHead>
              <TableHead>{t('lists.roof')}</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.items.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.tier}</TableCell>
            <TableCell>
              {item.trigger ? (
                <Link
                  href={`/${locale}/admin/outreach/${item.trigger.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {item.trigger.reference}
                </Link>
              ) : (
                '-'
              )}{' '}
              {item.trigger?.companyName ?? ''}
            </TableCell>
            <TableCell className="font-mono">{item.egrid}</TableCell>
            <TableCell>
              {item.parcelNumber ?? '-'}
              {item.losCode ? ` (${item.losCode})` : ''}
            </TableCell>
            {props.mode === 'done' ? (
              <>
                <TableCell>{t(`status.${item.status}`)}</TableCell>
                <TableCell>
                  {item.resolution ? t(`resolution.${item.resolution}`) : '-'}
                </TableCell>
                <TableCell>{item.billed ? chf(item.feeChf) : '-'}</TableCell>
                <TableCell>{dateTime(item.queriedAt)}</TableCell>
              </>
            ) : (
              <>
                <TableCell className="tabular-nums">
                  {item.priority.toFixed(1)}
                </TableCell>
                <TableCell>{kwh(item.trigger?.roofKwhYear)}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
