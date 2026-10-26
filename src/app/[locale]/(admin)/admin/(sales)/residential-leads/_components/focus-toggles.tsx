'use client'

import { CalendarClock, Check, MailCheck, User, UserX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import type { SalesLeadSummary } from '@/types/sales-lead'

import { formatCount } from './lead-format'
import type { AssigneeFilter } from './use-lead-filters'

interface FocusTogglesProps {
  assignee: AssigneeFilter
  followUpDue: boolean
  offerRequested: boolean
  summary: SalesLeadSummary | undefined
  onToggleAssignee: (assignee: 'me' | 'unassigned') => void
  onToggleFollowUpDue: () => void
  onToggleOfferRequested: () => void
}

interface ToggleItem {
  key: string
  label: string
  icon: LucideIcon
  pressed: boolean
  count?: number
  urgent?: boolean
  onClick: () => void
}

function ToggleCount({
  value,
  urgent,
}: {
  value: number | undefined
  urgent: boolean
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
        urgent ? 'bg-red-100 text-red-700' : 'bg-[#062E25]/10 text-[#062E25]'
      )}
    >
      {formatted}
    </span>
  )
}

export function FocusToggles({
  assignee,
  followUpDue,
  offerRequested,
  summary,
  onToggleAssignee,
  onToggleFollowUpDue,
  onToggleOfferRequested,
}: FocusTogglesProps) {
  const t = useTranslations('admin.salesLeads.list')

  const items: ToggleItem[] = [
    {
      key: 'mine',
      label: t('focus.mine'),
      icon: User,
      pressed: assignee === 'me',
      count: summary?.mine,
      onClick: () => onToggleAssignee('me'),
    },
    {
      key: 'unassigned',
      label: t('focus.unassigned'),
      icon: UserX,
      pressed: assignee === 'unassigned',
      count: summary?.unassigned,
      onClick: () => onToggleAssignee('unassigned'),
    },
    {
      key: 'followUpDue',
      label: t('focus.followUpDue'),
      icon: CalendarClock,
      pressed: followUpDue,
      count: summary?.followUpDue,
      urgent: (summary?.followUpDue ?? 0) > 0,
      onClick: onToggleFollowUpDue,
    },
    {
      key: 'offerRequested',
      label: t('focus.offerRequested'),
      icon: MailCheck,
      pressed: offerRequested,
      onClick: onToggleOfferRequested,
    },
  ]

  return (
    <div
      role="group"
      aria-label={t('focusFilterLabel')}
      className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
    >
      {items.map(item => {
        const Icon = item.pressed ? Check : item.icon
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={item.pressed}
            onClick={item.onClick}
            className={cn(
              'inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border-2 px-3 text-base text-[#062E25] transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#062E25] focus-visible:ring-offset-2',
              item.pressed
                ? 'border-[#062E25] bg-[#062E25]/10 font-semibold'
                : 'border-[#062E25]/15 bg-white font-medium hover:bg-[#F5F7EE]'
            )}
          >
            <Icon aria-hidden className="size-5 shrink-0" />
            <span>{item.label}</span>
            {item.key === 'offerRequested' ? null : (
              <ToggleCount value={item.count} urgent={item.urgent === true} />
            )}
          </button>
        )
      })}
    </div>
  )
}
