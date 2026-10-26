'use client'

import { AlertCircle, Inbox } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

type EmptyVariant = 'filtered' | 'noActive' | 'none'

interface EmptyStateProps {
  variant: EmptyVariant
  onReset: () => void
  onShowAll: () => void
}

export function EmptyState({ variant, onReset, onShowAll }: EmptyStateProps) {
  const t = useTranslations('admin.salesLeads.list')

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#062E25]/20 bg-white px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#F5F7EE] text-[#062E25]">
        <Inbox aria-hidden className="size-7" />
      </span>
      <h2 className="text-lg font-semibold text-[#062E25]">
        {t(`empty.${variant}Title`)}
      </h2>
      <p className="max-w-md text-base text-[#062E25]/75">
        {t(`empty.${variant}Text`)}
      </p>
      {variant === 'filtered' ? (
        <Button
          type="button"
          onClick={onReset}
          className="mt-1 h-11 bg-[#062E25] px-5 text-base text-white hover:bg-[#062E25]/90"
        >
          {t('empty.resetFilters')}
        </Button>
      ) : null}
      {variant === 'noActive' ? (
        <Button
          type="button"
          onClick={onShowAll}
          className="mt-1 h-11 bg-[#062E25] px-5 text-base text-white hover:bg-[#062E25]/90"
        >
          {t('empty.showAll')}
        </Button>
      ) : null}
    </div>
  )
}

interface ErrorStateProps {
  onRetry: () => void
  retrying: boolean
  compact?: boolean
}

export function ErrorState({ onRetry, retrying, compact }: ErrorStateProps) {
  const t = useTranslations('admin.salesLeads.list')

  return (
    <div
      role="alert"
      className={
        compact
          ? 'flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between'
          : 'flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-14 text-center'
      }
    >
      <div
        className={
          compact
            ? 'flex items-start gap-3'
            : 'flex flex-col items-center gap-3'
        }
      >
        <AlertCircle aria-hidden className="size-6 shrink-0 text-red-700" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-red-800">
            {t('error.title')}
          </h2>
          <p className="text-base text-red-800/90">{t('error.text')}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={retrying}
        onClick={onRetry}
        className="h-11 border-red-300 bg-white px-5 text-base text-red-800 hover:bg-red-100"
      >
        {t('error.retry')}
      </Button>
    </div>
  )
}
