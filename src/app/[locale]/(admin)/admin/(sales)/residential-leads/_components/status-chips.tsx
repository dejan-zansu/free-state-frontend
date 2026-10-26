'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { ACTIVE_STATUSES, ALL_STATUSES } from '@/lib/sales-lead'
import type { SalesLeadSummary } from '@/types/sales-lead'

import { formatCount, statusDotClass } from './lead-format'
import type { StatusFilter } from './use-lead-filters'

interface StatusChipsProps {
  value: StatusFilter
  summary: SalesLeadSummary | undefined
  onChange: (status: StatusFilter) => void
}

interface ChipItem {
  key: StatusFilter
  label: string
  count: number | undefined
  dotClass?: string
}

function ChipCount({
  value,
  selected,
}: {
  value: number | undefined
  selected: boolean
}) {
  const formatted = formatCount(value)
  if (formatted === null) {
    return (
      <span
        aria-hidden
        className="h-6 w-7 animate-pulse rounded-full bg-current opacity-15"
      />
    )
  }
  return (
    <span
      className={cn(
        'inline-flex h-6 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums',
        selected ? 'bg-white/20 text-white' : 'bg-[#062E25]/10 text-[#062E25]'
      )}
    >
      {formatted}
    </span>
  )
}

export function StatusChips({ value, summary, onChange }: StatusChipsProps) {
  const t = useTranslations('admin.salesLeads.list')
  const tl = useTranslations('admin.statusLabels')

  const activeCount = summary
    ? ACTIVE_STATUSES.reduce(
        (sum, status) => sum + (summary.byStatus[status] ?? 0),
        0
      )
    : undefined

  const items: ChipItem[] = [
    { key: 'ACTIVE', label: t('statusChips.active'), count: activeCount },
    ...ALL_STATUSES.map(status => ({
      key: status as StatusFilter,
      label: tl(status),
      count: summary?.byStatus[status],
      dotClass: statusDotClass(status),
    })),
    { key: 'ALL', label: t('statusChips.all'), count: summary?.total },
  ]

  return (
    <div
      role="group"
      aria-label={t('statusFilterLabel')}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1.5 lg:flex-wrap lg:overflow-visible"
    >
      {items.map(item => {
        const selected = value === item.key
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.key)}
            className={cn(
              'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border pl-4 pr-2 text-base font-medium whitespace-nowrap transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#062E25] focus-visible:ring-offset-2',
              selected
                ? 'border-[#062E25] bg-[#062E25] text-white'
                : 'border-[#062E25]/20 bg-white text-[#062E25] hover:bg-[#F5F7EE]'
            )}
          >
            {item.dotClass ? (
              <span
                aria-hidden
                className={cn(
                  'size-2.5 shrink-0 rounded-full bg-current',
                  item.dotClass,
                  selected && 'ring-2 ring-white'
                )}
              />
            ) : null}
            <span>{item.label}</span>
            <ChipCount value={item.count} selected={selected} />
          </button>
        )
      })}
    </div>
  )
}
