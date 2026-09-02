'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, ImageOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
import type {
  MarketingContentPostRow,
  MarketingContentPosts,
  MarketingContentWinners,
  MarketingSocialPlatform,
} from '@/types/admin-marketing'

const PLATFORM_CLASSES: Record<MarketingSocialPlatform, string> = {
  INSTAGRAM: 'bg-pink-100 text-pink-700',
  FACEBOOK: 'bg-blue-100 text-blue-700',
}

const DAY_OPTIONS = [30, 90, 180, 365]

type SortKey =
  | 'savesShares'
  | 'views'
  | 'reach'
  | 'likes'
  | 'comments'
  | 'saves'
  | 'shares'
  | 'engagementRatePct'

function PlatformBadge({ platform }: { platform: MarketingSocialPlatform }) {
  return (
    <Badge
      variant="secondary"
      className={cn('font-medium border-0', PLATFORM_CLASSES[platform] ?? 'bg-gray-100 text-gray-700')}
    >
      {platform === 'INSTAGRAM' ? 'Instagram' : 'Facebook'}
    </Badge>
  )
}

function formatCount(value: number | null) {
  return value !== null ? value.toLocaleString('de-CH') : '-'
}

function sortValue(row: MarketingContentPostRow, key: SortKey): number {
  if (key === 'savesShares') {
    if (row.saves === null && row.shares === null) return -1
    return (row.saves ?? 0) + (row.shares ?? 0)
  }
  return row[key] ?? -1
}

function SortableHead({
  label,
  column,
  sort,
  onSort,
}: {
  label: string
  column: SortKey
  sort: { key: SortKey; desc: boolean }
  onSort: (key: SortKey) => void
}) {
  const active = sort.key === column
  return (
    <TableHead className="text-right">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'inline-flex items-center gap-1 hover:text-[#062E25]',
          active && 'text-[#062E25] font-semibold'
        )}
      >
        {label}
        {active ? (
          sort.desc ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
        )}
      </button>
    </TableHead>
  )
}

export default function AdminMarketingContentPage() {
  const t = useTranslations('admin.marketing.content')
  const tc = useTranslations('admin.common')

  const [platform, setPlatform] = useState('__all__')
  const [days, setDays] = useState(90)
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: 'savesShares',
    desc: true,
  })

  const { data, isLoading } = useQuery<MarketingContentPosts>({
    queryKey: ['admin', 'marketing', 'content', 'posts', platform, days],
    queryFn: () =>
      adminMarketingService.getContentPosts({
        platform: platform === '__all__' ? undefined : platform,
        days,
      }),
  })

  const { data: winners } = useQuery<MarketingContentWinners>({
    queryKey: ['admin', 'marketing', 'content', 'winners'],
    queryFn: () => adminMarketingService.getContentWinners(),
  })

  const sortedRows = useMemo(() => {
    if (!data) return []
    return [...data.rows].sort((a, b) => {
      const diff = sortValue(a, sort.key) - sortValue(b, sort.key)
      return sort.desc ? -diff : diff
    })
  }, [data, sort])

  const onSort = (key: SortKey) => {
    setSort((prev) => (prev.key === key ? { key, desc: !prev.desc } : { key, desc: true }))
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!data) {
    return <p className="text-[#062E25]">{tc('failedToLoad')}</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25]">
            {t('winnersTitle', { days: winners?.windowDays ?? 28 })}
          </h2>
          <p className="text-sm text-[#062E25]/75 mb-4">{t('winnersHint')}</p>
          {!winners || winners.rows.length === 0 ? (
            <p className="text-sm text-[#062E25] py-6 text-center">{t('winnersEmpty')}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {winners.rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-[#062E25]/10 overflow-hidden"
                >
                  <div className="aspect-square bg-[#062E25]/5">
                    {row.mediaUrl ? (
                      <img
                        src={row.mediaUrl}
                        alt={row.caption ?? ''}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-6 w-6 text-[#062E25]/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <PlatformBadge platform={row.platform} />
                      {row.permalink && (
                        <a
                          href={row.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#062E25]/40 hover:text-[#062E25]"
                          aria-label={t('openPost')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[#062E25] tabular-nums">
                      {t('savesShares', { count: (row.saves ?? 0) + (row.shares ?? 0) })}
                    </p>
                    {row.caption && (
                      <p className="text-sm text-[#062E25] truncate" title={row.caption}>
                        {row.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-[#062E25]">{t('postsTitle')}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={t('allPlatforms')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('allPlatforms')}</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {t('daysOption', { count: option })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedRows.length === 0 ? (
            <p className="text-center py-12 text-[#062E25]">{t('empty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('platform')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('pillar')}</TableHead>
                    <TableHead>{t('caption')}</TableHead>
                    <SortableHead label={t('views')} column="views" sort={sort} onSort={onSort} />
                    <SortableHead label={t('reach')} column="reach" sort={sort} onSort={onSort} />
                    <SortableHead label={t('likes')} column="likes" sort={sort} onSort={onSort} />
                    <SortableHead
                      label={t('comments')}
                      column="comments"
                      sort={sort}
                      onSort={onSort}
                    />
                    <SortableHead label={t('saves')} column="saves" sort={sort} onSort={onSort} />
                    <SortableHead label={t('shares')} column="shares" sort={sort} onSort={onSort} />
                    <SortableHead
                      label={t('er')}
                      column="engagementRatePct"
                      sort={sort}
                      onSort={onSort}
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <PlatformBadge platform={row.platform} />
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25] whitespace-nowrap">
                        {row.publishedAt
                          ? new Date(row.publishedAt).toLocaleDateString('de-CH')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]">{row.type}</TableCell>
                      <TableCell className="text-sm text-[#062E25]">
                        {row.pillar ?? '-'}
                      </TableCell>
                      <TableCell>
                        {row.permalink ? (
                          <a
                            href={row.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-[240px] truncate text-sm text-[#062E25]/80 hover:underline"
                            title={row.caption ?? undefined}
                          >
                            {row.caption ?? '-'}
                          </a>
                        ) : (
                          <span
                            className="block max-w-[240px] truncate text-sm text-[#062E25]/80"
                            title={row.caption ?? undefined}
                          >
                            {row.caption ?? '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatCount(row.views)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatCount(row.reach)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatCount(row.likes)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatCount(row.comments)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatCount(row.saves)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {formatCount(row.shares)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#062E25]/80">
                        {row.engagementRatePct !== null
                          ? `${row.engagementRatePct.toLocaleString('de-CH', { maximumFractionDigits: 1 })} %`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#062E25]/10">
            <p className="text-sm text-[#062E25]/75">
              {data.lastSyncAt
                ? t('lastSync', { date: new Date(data.lastSyncAt).toLocaleString('de-CH') })
                : t('neverSynced')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
