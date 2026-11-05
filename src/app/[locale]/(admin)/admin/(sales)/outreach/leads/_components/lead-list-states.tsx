'use client'

import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import type { LeadWorkTabFilter } from '@/types/outreach/kpi'

export function LeadEmptyState({
  tab,
  filtered,
  onReset,
}: {
  tab: LeadWorkTabFilter
  filtered: boolean
  onReset: () => void
}) {
  const t = useTranslations('admin.outreach.leads')

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[#062E25]/10 bg-white px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#F5F7EE] text-[#062E25]">
        <Inbox aria-hidden className="size-7" />
      </span>
      <p className="max-w-md text-lg text-[#062E25]">
        {filtered ? t('emptyFiltered') : t(`emptyTab.${tab}`)}
      </p>
      {filtered ? (
        <Button
          type="button"
          onClick={onReset}
          className="mt-1 h-11 bg-[#062E25] px-5 text-base text-white hover:bg-[#062E25]/90"
        >
          {t('resetShort')}
        </Button>
      ) : null}
    </div>
  )
}

export function LeadErrorState({
  retrying,
  compact,
  onRetry,
}: {
  retrying: boolean
  compact?: boolean
  onRetry: () => void
}) {
  const t = useTranslations('admin.outreach.leads')

  return (
    <div
      role="alert"
      className={
        compact
          ? 'flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between'
          : 'flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center'
      }
    >
      <div
        className={
          compact
            ? 'flex items-center gap-3'
            : 'flex flex-col items-center gap-3'
        }
      >
        <AlertCircle aria-hidden className="size-6 shrink-0 text-red-700" />
        <p className="text-lg font-semibold text-red-800">{t('loadFailed')}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={retrying}
        onClick={onRetry}
        className="h-11 border-red-300 bg-white px-5 text-base text-red-800 hover:bg-red-100"
      >
        {t('retry')}
      </Button>
    </div>
  )
}

export function LeadPagination({
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
  const t = useTranslations('admin.outreach.leads')
  const tc = useTranslations('admin.common')
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const buttonClass =
    'size-11 border-[#062E25]/25 text-[#062E25] hover:bg-[#F5F7EE]'

  return (
    <div className="flex flex-col items-center gap-3 pt-1 sm:flex-row sm:justify-between">
      <p aria-live="polite" className="text-base text-[#062E25]/75">
        {t('total', { count: total })}
      </p>
      {safeTotalPages > 1 ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            aria-label={t('previousPage')}
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className={buttonClass}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="min-w-28 text-center text-base tabular-nums text-[#062E25]">
            {tc('page', { page: safePage, totalPages: safeTotalPages })}
          </span>
          <Button
            type="button"
            variant="outline"
            aria-label={t('nextPage')}
            disabled={safePage >= safeTotalPages}
            onClick={() => onPageChange(safePage + 1)}
            className={buttonClass}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
