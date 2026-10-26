'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

interface PaginationBarProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: PaginationBarProps) {
  const t = useTranslations('admin.salesLeads.list')
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const buttonClass =
    'h-11 border-[#062E25]/25 px-4 text-base text-[#062E25] hover:bg-[#F5F7EE]'

  return (
    <div className="flex flex-col items-center gap-3 pt-1 sm:flex-row sm:justify-between">
      <p aria-live="polite" className="text-base text-[#062E25]/75">
        {t('pagination.total', { count: total })}
      </p>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className={buttonClass}
        >
          <ChevronLeft aria-hidden />
          {t('pagination.previous')}
        </Button>
        <span className="min-w-28 text-center text-base tabular-nums text-[#062E25]">
          {t('pagination.page', {
            page: safePage,
            totalPages: safeTotalPages,
          })}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
          className={buttonClass}
        >
          {t('pagination.next')}
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  )
}
