'use client'

import { Check, Pause, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { STATUS_COLORS } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatDateTime, PIPELINE_STATUSES } from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import type { SalesLeadDetail, SalesLeadStatus } from '@/types/sales-lead'

import {
  CARD_CLASS,
  daysSince,
  formatChfAmount,
  OUTLINE_BUTTON,
  resumeStatus,
  statusSince,
} from './leadUtils'
import { StatusChangeDialog } from './StatusChangeDialog'

const SINCE_DAYS_LIMIT = 60

function useSinceLabel(lead: SalesLeadDetail) {
  const t = useTranslations('admin.salesLeads.detail')
  const since = statusSince(lead)
  const days = daysSince(since)
  const label =
    days > SINCE_DAYS_LIMIT
      ? t('pipeline.sinceDate', { date: formatDate(since) })
      : t('pipeline.since', { days })
  return { label, title: formatDateTime(since) }
}

export function StatusPipeline({
  lead,
  children,
}: {
  lead: SalesLeadDetail
  children?: ReactNode
}) {
  const t = useTranslations('admin.salesLeads.detail')
  const tl = useTranslations('admin.statusLabels')
  const locale = useLocale()
  const [target, setTarget] = useState<SalesLeadStatus | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentRef = useRef<HTMLLIElement>(null)
  const since = useSinceLabel(lead)

  const currentIndex = PIPELINE_STATUSES.indexOf(lead.status)
  const isOnHold = lead.status === 'ON_HOLD'
  const isLost = lead.status === 'LOST'
  const isParked = isOnHold || isLost

  useEffect(() => {
    const container = scrollRef.current
    const current = currentRef.current
    if (!container || !current) return
    if (container.scrollWidth <= container.clientWidth) return
    container.scrollLeft =
      current.offsetLeft - (container.clientWidth - current.clientWidth) / 2
  }, [lead.status, locale])

  const wonAmount =
    lead.status === 'WON' && lead.wonAmountChf != null
      ? formatChfAmount(lead.wonAmountChf)
      : null

  return (
    <>
      <Card className={cn(CARD_CLASS, 'mb-6')}>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#062E25]">
              {t('pipeline.title')}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="lg"
                disabled={isOnHold}
                onClick={() => setTarget('ON_HOLD')}
                className={cn(OUTLINE_BUTTON, isOnHold && 'bg-gray-100')}
              >
                <Pause />
                {t('pipeline.putOnHold')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={isLost}
                onClick={() => setTarget('LOST')}
                className={cn(
                  'border-red-200 text-base text-red-700 hover:bg-red-50 hover:text-red-700',
                  isLost && 'bg-red-50'
                )}
              >
                <XCircle />
                {t('pipeline.markLost')}
              </Button>
            </div>
          </div>

          {isParked && (
            <div
              role="status"
              className={cn(
                'mb-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
                isLost
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                    STATUS_COLORS[lead.status]
                  )}
                >
                  {isLost ? (
                    <XCircle className="size-5" />
                  ) : (
                    <Pause className="size-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#062E25]">
                    {isLost
                      ? t('pipeline.lostBanner')
                      : t('pipeline.holdBanner')}
                    <span
                      title={since.title}
                      className="ml-2 font-normal text-[#062E25]/75"
                    >
                      {since.label}
                    </span>
                  </p>
                  {isLost && lead.lostReason && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-base text-[#062E25]">
                      <span className="text-[#062E25]/75">
                        {t('pipeline.lostReason')}
                      </span>{' '}
                      {lead.lostReason}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setTarget(resumeStatus(lead))}
                className={cn(OUTLINE_BUTTON, 'bg-white sm:shrink-0')}
              >
                <RotateCcw />
                {t('pipeline.resume')}
              </Button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="relative -mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
          >
            <ol
              aria-label={t('pipeline.stepsLabel')}
              className="flex w-full flex-col sm:flex-row"
            >
              {PIPELINE_STATUSES.map((status, index) => {
                const isCurrent = index === currentIndex
                const isDone = currentIndex > -1 && index < currentIndex
                const isLast = index === PIPELINE_STATUSES.length - 1
                const label = tl(status)

                const circle = (
                  <span
                    className={cn(
                      'relative z-10 flex size-10 items-center justify-center rounded-full border-2 text-base font-semibold',
                      isCurrent &&
                        cn(
                          STATUS_COLORS[status],
                          'border-current ring-4 ring-current/15'
                        ),
                      isDone && 'border-[#062E25] bg-[#062E25] text-white',
                      !isCurrent &&
                        !isDone &&
                        'border-[#062E25]/20 bg-white text-[#062E25]/60'
                    )}
                  >
                    {isDone ? (
                      <Check className="size-5" />
                    ) : isCurrent && status === 'WON' ? (
                      <Trophy className="size-5" />
                    ) : isCurrent ? (
                      <span className="size-3 rounded-full bg-current" />
                    ) : (
                      index + 1
                    )}
                  </span>
                )

                return (
                  <li
                    key={status}
                    ref={isCurrent ? currentRef : undefined}
                    aria-current={isCurrent ? 'step' : undefined}
                    className="relative sm:min-w-[112px] sm:flex-1"
                  >
                    {!isLast && (
                      <span
                        aria-hidden
                        className={cn(
                          'absolute left-[23px] top-[48px] h-[calc(100%-40px)] w-0.5 sm:left-[calc(50%+24px)] sm:top-[27px] sm:h-0.5 sm:w-[calc(100%-48px)]',
                          isDone ? 'bg-[#062E25]' : 'bg-[#062E25]/15'
                        )}
                      />
                    )}
                    {isCurrent ? (
                      <div className="flex items-center gap-4 px-1 py-2 text-left sm:flex-col sm:gap-1.5 sm:text-center">
                        {circle}
                        <div className="flex flex-col sm:items-center sm:gap-1.5">
                          <span className="text-base font-semibold text-[#062E25]">
                            {label}
                          </span>
                          {wonAmount && (
                            <span className="text-base font-semibold text-green-700">
                              {wonAmount}
                            </span>
                          )}
                          <span
                            title={since.title}
                            className="text-sm text-[#062E25]/75 sm:text-base"
                          >
                            {since.label}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTarget(status)}
                        aria-label={t('pipeline.moveTo', { status: label })}
                        className="group flex w-full items-center gap-4 rounded-xl px-1 py-2 text-left transition-colors hover:bg-[#F5F7EE] focus-visible:outline-2 focus-visible:outline-[#062E25] sm:flex-col sm:gap-1.5 sm:text-center"
                      >
                        {circle}
                        <span
                          className={cn(
                            'text-base',
                            isDone
                              ? 'font-medium text-[#062E25]'
                              : 'text-[#062E25]/75'
                          )}
                        >
                          {label}
                        </span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
          {children}
        </CardContent>
      </Card>

      {target && (
        <StatusChangeDialog
          lead={lead}
          target={target}
          onClose={() => setTarget(null)}
        />
      )}
    </>
  )
}
