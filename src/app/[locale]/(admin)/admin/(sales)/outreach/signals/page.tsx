'use client'

// Owner signals (doc 69 W2-13, W2-14, M-7): building permits, SHAB
// Sacheinlage notices, simap tenders, transfers and fund or listed-company
// buildings, with their routing state. Unsure permits wait here for the skill
// run or a person, tenders are bid on simap.

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { outreachSignalsService } from '@/services/outreach/signals.service'
import {
  OWNER_SIGNAL_KINDS,
  OWNER_SIGNAL_STATUSES,
  type OwnerSignalKind,
  type OwnerSignalStatus,
} from '@/types/outreach/owner-first'
import type { OwnerSignalListItem } from '@/types/outreach/signals'

import { SignalActions } from '../_components/owner-first/signals/SignalActions'
import { SignalStats } from '../_components/owner-first/signals/SignalStats'

const PAGE_SIZE = 50
const ALL = '__all__'

const STATUS_STYLE: Record<OwnerSignalStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  MATCHED: 'bg-amber-100 text-amber-800',
  ROUTED: 'bg-green-100 text-green-700',
  IGNORED: 'bg-gray-100 text-gray-700',
}

function formatDay(value: string | null): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('de-CH', {
    timeZone: 'Europe/Zurich',
  })
}

function SignalRow({ signal }: { signal: OwnerSignalListItem }) {
  const t = useTranslations('admin.outreach.signals')
  const locale = useLocale()
  const place =
    signal.address ??
    [signal.municipalityName, signal.canton].filter(Boolean).join(', ')

  return (
    <TableRow className="align-top">
      <TableCell className="text-base whitespace-nowrap tabular-nums">
        {formatDay(signal.publishedAt)}
      </TableCell>
      <TableCell className="text-base">
        <p className="font-medium">{t(`kind.${signal.kind}`)}</p>
        <p className="text-[#062E25]/75">
          {signal.publicationNumber ?? signal.source}
        </p>
      </TableCell>
      <TableCell className="text-base max-w-[16rem]">
        <p className="font-medium break-words">{signal.partyName}</p>
        <p className="text-[#062E25]/75">
          {t(`role.${signal.partyRole}`)}
          {signal.partyUid ? `, ${signal.partyUid}` : ''}
        </p>
        {signal.portfolioName && (
          <p className="text-[#062E25]/75 break-words">
            {signal.portfolioName}
          </p>
        )}
      </TableCell>
      <TableCell className="text-base max-w-[14rem]">
        <p className="break-words">{place || '-'}</p>
        {(signal.parcelNumber || signal.egid) && (
          <p className="text-[#062E25]/75">
            {[
              signal.parcelNumber
                ? t('parcel', { number: signal.parcelNumber })
                : null,
              signal.egid ? t('egid', { egid: signal.egid }) : null,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
      </TableCell>
      <TableCell className="text-base max-w-[22rem]">
        <p className="line-clamp-3 break-words">
          {signal.projectDescription ?? '-'}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {signal.newBuild && (
            <span className="px-2 rounded bg-purple-100 text-purple-800">
              {t('newBuild')}
            </span>
          )}
          {signal.pvMentioned && (
            <span className="px-2 rounded bg-yellow-100 text-yellow-800">
              {t('pv')}
            </span>
          )}
          {signal.review && (
            <span className="px-2 rounded bg-orange-100 text-orange-800">
              {t('reviewBadge')}
            </span>
          )}
        </div>
        {signal.filterReason && (
          <p className="mt-1 text-[#062E25]/75">
            {t('filterReason', { reason: signal.filterReason })}
          </p>
        )}
      </TableCell>
      <TableCell className="text-base">
        <span
          className={cn(
            'px-2 py-0.5 rounded whitespace-nowrap',
            STATUS_STYLE[signal.status]
          )}
        >
          {t(`status.${signal.status}`)}
        </span>
        {signal.prospect && (
          <p className="mt-1">
            <Link
              href={`/${locale}/admin/outreach/${signal.prospect.id}`}
              className="text-blue-600 hover:underline break-words"
            >
              {signal.prospect.reference}
            </Link>
          </p>
        )}
        {signal.ignoreReason && (
          <p className="mt-1 text-[#062E25]/75 break-words max-w-[14rem]">
            {signal.ignoreReason}
          </p>
        )}
      </TableCell>
      <TableCell className="text-base">
        <SignalActions signal={signal} />
      </TableCell>
    </TableRow>
  )
}

export default function AdminOutreachSignalsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.signals')
  const [kind, setKind] = useState<OwnerSignalKind | ''>('')
  const [status, setStatus] = useState<OwnerSignalStatus | ''>('')
  const [review, setReview] = useState(false)
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const stats = useQuery({
    queryKey: ['admin', 'outreach', 'signals', 'stats'],
    queryFn: () => outreachSignalsService.stats(),
  })
  const list = useQuery({
    queryKey: [
      'admin',
      'outreach',
      'signals',
      'list',
      kind,
      status,
      review,
      q,
      page,
    ],
    queryFn: () =>
      outreachSignalsService.list({
        kind,
        status,
        review,
        q,
        page,
        pageSize: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  })

  const total = list.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const showReview = () => {
    setReview(true)
    setStatus('')
    setPage(1)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </Button>
      </div>
      <p className="mb-4 text-[#062E25]/75">{t('subtitle')}</p>

      {stats.data && (
        <SignalStats stats={stats.data} onShowReview={showReview} />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          value={kind || ALL}
          onValueChange={v => {
            setKind(v === ALL ? '' : (v as OwnerSignalKind))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56 text-base">
            <SelectValue placeholder={t('allKinds')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('allKinds')}</SelectItem>
            {OWNER_SIGNAL_KINDS.map(value => (
              <SelectItem key={value} value={value}>
                {t(`kind.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status || ALL}
          onValueChange={v => {
            setStatus(v === ALL ? '' : (v as OwnerSignalStatus))
            setReview(false)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48 text-base">
            <SelectValue placeholder={t('allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
            {OWNER_SIGNAL_STATUSES.map(value => (
              <SelectItem key={value} value={value}>
                {t(`status.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={review ? 'default' : 'outline'}
          className="text-base"
          onClick={() => {
            // The backend lists NEW rows in review mode, whatever the status.
            if (!review) setStatus('')
            setReview(!review)
            setPage(1)
          }}
        >
          {t('reviewOnly')}
        </Button>
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault()
            setQ(search.trim())
            setPage(1)
          }}
        >
          <Input
            value={search}
            placeholder={t('searchPlaceholder')}
            className="w-64 text-base"
            onChange={e => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline" className="text-base">
            {t('search')}
          </Button>
        </form>
      </div>

      {list.isLoading ? (
        <AdminPageLoader />
      ) : list.isError ? (
        <p className="p-3 rounded bg-red-50 text-red-700">{t('loadFailed')}</p>
      ) : (list.data?.items.length ?? 0) === 0 ? (
        <p className="p-3 text-[#062E25]/75">{t('empty')}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">{t('colDate')}</TableHead>
                  <TableHead className="text-base">{t('colSignal')}</TableHead>
                  <TableHead className="text-base">{t('colParty')}</TableHead>
                  <TableHead className="text-base">{t('colPlace')}</TableHead>
                  <TableHead className="text-base">{t('colProject')}</TableHead>
                  <TableHead className="text-base">{t('colStatus')}</TableHead>
                  <TableHead className="text-base">{t('colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data!.items.map(signal => (
                  <SignalRow key={signal.id} signal={signal} />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3 mt-4">
            <p className="text-[#062E25]/75">
              {t('pageInfo', { page, pages, total })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-base"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {t('prev')}
              </Button>
              <Button
                variant="outline"
                className="text-base"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
