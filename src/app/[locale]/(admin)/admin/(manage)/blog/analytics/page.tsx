'use client'

import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
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
import { adminService } from '@/services/admin.service'
import type { BlogAnalytics, BlogPostAnalyticsRow } from '@/types/admin'

const RANGE_OPTIONS = [30, 90, 365]

type SortKey =
  | 'views'
  | 'sessions'
  | 'reads'
  | 'avgDepth'
  | 'finishRate'
  | 'medianSeconds'
  | 'gscClicks'
  | 'gscImpressions'
  | 'gscPosition'

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatCount(value: number) {
  return value.toLocaleString('de-CH')
}

function formatPercent(value: number | null) {
  return value === null ? '-' : `${value}%`
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return '-'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

function formatPosition(value: number | null) {
  return value === null ? '-' : value.toLocaleString('de-CH')
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function sortValue(row: BlogPostAnalyticsRow, key: SortKey): number {
  const value = row[key]
  if (value === null)
    return key === 'gscPosition' ? Number.MAX_SAFE_INTEGER : -1
  return value
}

export default function AdminBlogAnalyticsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.blog.analytics')
  const tc = useTranslations('admin.common')

  const [days, setDays] = useState(90)
  const [sortKey, setSortKey] = useState<SortKey>('views')
  const [ascending, setAscending] = useState(false)

  const range = useMemo(() => {
    const to = new Date()
    const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
    return { from: isoDay(from), to: isoDay(to) }
  }, [days])

  const { data, isLoading } = useQuery<BlogAnalytics>({
    queryKey: ['admin', 'blog', 'analytics', range.from, range.to],
    queryFn: () => adminService.getBlogAnalytics(range),
    placeholderData: keepPreviousData,
  })

  const rows = useMemo(() => {
    if (!data) return []
    const sorted = [...data.posts]
    sorted.sort((a, b) => {
      const diff = sortValue(a, sortKey) - sortValue(b, sortKey)
      return ascending ? diff : -diff
    })
    return sorted
  }, [data, sortKey, ascending])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setAscending(prev => !prev)
      return
    }
    setSortKey(key)
    setAscending(false)
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  const tiles = [
    { label: t('totalViews'), value: formatCount(data.totals.views) },
    { label: t('totalSessions'), value: formatCount(data.totals.sessions) },
    { label: t('totalReads'), value: formatCount(data.totals.reads) },
    { label: t('avgDepth'), value: formatPercent(data.totals.avgDepth) },
    { label: t('gscClicks'), value: formatCount(data.totals.gscClicks) },
  ]

  const columns: { key: SortKey; label: string }[] = [
    { key: 'views', label: t('views') },
    { key: 'sessions', label: t('readers') },
    { key: 'reads', label: t('reads') },
    { key: 'avgDepth', label: t('depth') },
    { key: 'finishRate', label: t('finished') },
    { key: 'medianSeconds', label: t('readTime') },
    { key: 'gscClicks', label: t('clicks') },
    { key: 'gscImpressions', label: t('impressions') },
    { key: 'gscPosition', label: t('position') },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${locale}/admin/blog`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToPosts')}
          </Link>
        </Button>
      </div>
      <p className="text-base text-[#062E25]/75 mb-6">{t('subtitle')}</p>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {RANGE_OPTIONS.map(option => (
          <Button
            key={option}
            variant={days === option ? 'default' : 'outline'}
            size="sm"
            className={cn(
              days === option && 'bg-[#062E25] hover:bg-[#062E25]/90 text-white'
            )}
            onClick={() => setDays(option)}
          >
            {t('rangeDays', { count: option })}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {tiles.map(tile => (
          <Card key={tile.label} className="border-[#062E25]/10">
            <CardContent className="p-4">
              <p className="text-base text-[#062E25]/75">{tile.label}</p>
              <p className="text-2xl font-semibold text-[#062E25] mt-1 tabular-nums">
                {tile.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('post')}</TableHead>
                {columns.map(column => (
                  <TableHead key={column.key} className="text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1 hover:text-[#062E25]',
                        sortKey === column.key && 'text-[#062E25] font-semibold'
                      )}
                    >
                      {column.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[260px]">
                    <Link
                      href={`/${locale}/admin/blog/${row.id}`}
                      className="font-medium text-[#062E25] hover:underline"
                    >
                      {row.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base text-[#062E25]/75">
                        /{row.slug}
                      </span>
                      {row.status === 'DRAFT' && (
                        <StatusBadge status={row.status} />
                      )}
                    </div>
                    <p className="text-base text-[#062E25]/60 mt-1">
                      {t('publishedOn', { date: formatDate(row.publishedAt) })}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatCount(row.views)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatCount(row.sessions)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatCount(row.reads)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatPercent(row.avgDepth)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatPercent(row.finishRate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatDuration(row.medianSeconds)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatCount(row.gscClicks)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatCount(row.gscImpressions)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-[#062E25]">
                    {formatPosition(row.gscPosition)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rows.length === 0 && (
            <p className="text-center text-[#062E25]/75 py-8">{t('empty')}</p>
          )}

          <p className="text-base text-[#062E25]/60 mt-6">{t('readsNote')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
