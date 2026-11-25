'use client'

import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { inboxSourceKey, inboxStateTone, inboxTime } from '@/lib/outbound-inbox'
import {
  LEAD_PILL_TONE_CLASS,
  assigneeName,
  leadStateKey,
  type LeadPillTone,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type { InboxItem, InboxTab } from '@/types/outreach/inbox'

const PILL_CLASS =
  'inline-flex max-w-full items-center rounded-full px-2.5 font-medium'
const SKELETON_ROWS = 6

function Pill({ tone, label }: { tone: LeadPillTone; label: string }) {
  return (
    <span className={cn(PILL_CLASS, LEAD_PILL_TONE_CLASS[tone])}>{label}</span>
  )
}

function InboxRow({
  item,
  selected,
  onSelect,
}: {
  item: InboxItem
  selected: boolean
  onSelect: () => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const tl = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const person = item.person?.trim()

  return (
    <li className="border-b border-[#062E25]/10 last:border-b-0">
      <button
        type="button"
        aria-current={selected ? 'true' : undefined}
        onClick={onSelect}
        className={cn(
          'relative flex w-full min-w-0 flex-col gap-1 py-3 pl-8 pr-4 text-left text-base text-[#062E25] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#062E25]',
          selected ? 'bg-[#062E25]/10' : 'hover:bg-[#F5F7EE]'
        )}
      >
        {item.late ? (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-1 bg-red-600"
          />
        ) : null}
        {item.isNew ? (
          <span
            aria-hidden
            className="absolute left-3 top-[1.125rem] size-2.5 rounded-full bg-blue-600"
          />
        ) : null}

        <span className="flex w-full min-w-0 items-baseline justify-between gap-3">
          <span
            className={cn(
              'min-w-0 truncate',
              item.isNew ? 'font-bold' : 'font-semibold'
            )}
          >
            {item.isNew ? (
              <span className="sr-only">{`${t('list.new')}: `}</span>
            ) : null}
            {item.title}
          </span>
          <span
            className={cn(
              'shrink-0 tabular-nums',
              item.late ? 'font-semibold text-red-700' : 'text-[#062E25]/70'
            )}
          >
            {inboxTime(item.at)}
          </span>
        </span>

        {person ? (
          <span className="w-full truncate text-[#062E25]/75">{person}</span>
        ) : null}

        {item.excerpt ? (
          <span className="w-full truncate text-[#062E25]/75">
            {item.excerpt}
          </span>
        ) : null}

        <span className="flex w-full flex-wrap items-center gap-1.5">
          {item.source ? (
            <Pill tone="grey" label={t(inboxSourceKey(item.source))} />
          ) : null}
          {item.prospect ? (
            <Pill
              tone={inboxStateTone(item)}
              label={tw(leadStateKey(item.prospect.work.state))}
            />
          ) : null}
          {item.isLead ? <Pill tone="green" label={t('list.lead')} /> : null}
          {item.late ? (
            <span className="sr-only">{tw('strip.overdue')}</span>
          ) : null}
          <span className="ml-auto max-w-full truncate text-[#062E25]/70">
            {assigneeName(item.assignedTo) ?? tl('unassigned')}
          </span>
        </span>
      </button>
    </li>
  )
}

function InboxRowSkeleton() {
  return (
    <li className="flex flex-col gap-2 border-b border-[#062E25]/10 py-3 pl-8 pr-4 last:border-b-0">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-6 w-40 rounded-full" />
    </li>
  )
}

export function InboxEmpty({
  tab,
  filtered,
  onReset,
}: {
  tab: InboxTab
  filtered: boolean
  onReset: () => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const tl = useTranslations('admin.outreach.leads')

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#F5F7EE] text-[#062E25]">
        <Inbox aria-hidden className="size-7" />
      </span>
      <p className="max-w-md text-base text-[#062E25]">
        {filtered ? t('list.emptyFiltered') : t(`empty.${tab}`)}
      </p>
      {filtered ? (
        <Button
          type="button"
          onClick={onReset}
          className="mt-1 h-11 bg-[#062E25] px-5 text-base text-white hover:bg-[#062E25]/90"
        >
          {tl('resetShort')}
        </Button>
      ) : null}
    </div>
  )
}

export function InboxError({
  text,
  retrying,
  onRetry,
}: {
  text: string
  retrying: boolean
  onRetry: () => void
}) {
  const tl = useTranslations('admin.outreach.leads')

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 border-b border-red-200 bg-red-50 px-6 py-6 text-center"
    >
      <div className="flex items-center gap-3">
        <AlertCircle aria-hidden className="size-6 shrink-0 text-red-700" />
        <p className="text-base font-semibold text-red-800">{text}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={retrying}
        onClick={onRetry}
        className="h-11 border-red-300 bg-white px-5 text-base text-red-800 hover:bg-red-100"
      >
        {tl('retry')}
      </Button>
    </div>
  )
}

export function InboxRows({
  items,
  loading,
  selectedKey,
  onSelect,
}: {
  items: InboxItem[]
  loading: boolean
  selectedKey: string | null
  onSelect: (item: InboxItem) => void
}) {
  const t = useTranslations('admin.outreach.inbox')

  return (
    <ul aria-label={t('list.aria')}>
      {loading
        ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <InboxRowSkeleton key={index} />
          ))
        : items.map(item => (
            <InboxRow
              key={item.key}
              item={item}
              selected={item.key === selectedKey}
              onSelect={() => onSelect(item)}
            />
          ))}
    </ul>
  )
}

export function InboxPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const tl = useTranslations('admin.outreach.leads')
  const tc = useTranslations('admin.common')
  const lastPage = Math.max(1, totalPages)
  const shown = Math.min(Math.max(1, page), lastPage)
  const buttonClass =
    'size-11 border-[#062E25]/25 text-[#062E25] hover:bg-[#F5F7EE]'

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#062E25]/10 px-4 py-2">
      <p aria-live="polite" className="text-base text-[#062E25]/75">
        {t('list.total', { count: total })}
      </p>
      {lastPage > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            aria-label={tl('previousPage')}
            disabled={shown <= 1}
            onClick={() => onPageChange(shown - 1)}
            className={buttonClass}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="text-center text-base tabular-nums text-[#062E25]">
            {tc('page', { page: shown, totalPages: lastPage })}
          </span>
          <Button
            type="button"
            variant="outline"
            aria-label={tl('nextPage')}
            disabled={shown >= lastPage}
            onClick={() => onPageChange(shown + 1)}
            className={buttonClass}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
