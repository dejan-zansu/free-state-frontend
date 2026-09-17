'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type IndexState = 'indexed' | 'notIndexed' | 'indexUnknown'

const FALLBACK_LABELS: Record<IndexState | 'lastCrawl', string> = {
  indexed: 'Indexiert',
  notIndexed: 'Nicht indexiert',
  indexUnknown: 'Unbekannt',
  lastCrawl: 'Gecrawlt am {date}',
}

const STATE_COLORS: Record<IndexState, string> = {
  indexed: 'bg-green-100 text-green-700',
  notIndexed: 'bg-amber-100 text-amber-700',
  indexUnknown: 'bg-gray-100 text-gray-700',
}

function indexState(verdict: string | null): IndexState {
  if (verdict === 'PASS') return 'indexed'
  if (verdict === 'FAIL' || verdict === 'NEUTRAL' || verdict === 'PARTIAL') return 'notIndexed'
  return 'indexUnknown'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface BlogIndexStatusProps {
  verdict: string | null
  coverageState: string | null
  lastCrawlTime: string | null
  detailClassName?: string
}

export function BlogIndexStatus({
  verdict,
  coverageState,
  lastCrawlTime,
  detailClassName,
}: BlogIndexStatusProps) {
  const t = useTranslations('admin.blog.analytics')
  const state = indexState(verdict)
  const label = t.has(state) ? t(state) : FALLBACK_LABELS[state]
  const crawled = lastCrawlTime ? formatDate(lastCrawlTime) : null

  return (
    <div className="min-w-[160px]">
      <Badge
        variant="secondary"
        className={cn('font-medium border-0', STATE_COLORS[state])}
        title={coverageState ?? undefined}
      >
        {label}
      </Badge>
      {state === 'notIndexed' && coverageState && (
        <p className={cn('text-[#062E25]/75 mt-1', detailClassName)}>{coverageState}</p>
      )}
      {crawled && (
        <p className={cn('text-[#062E25]/60 mt-1', detailClassName)}>
          {t.has('lastCrawl')
            ? t('lastCrawl', { date: crawled })
            : FALLBACK_LABELS.lastCrawl.replace('{date}', crawled)}
        </p>
      )}
    </div>
  )
}
