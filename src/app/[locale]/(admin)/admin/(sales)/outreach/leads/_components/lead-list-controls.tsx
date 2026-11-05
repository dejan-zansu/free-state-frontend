'use client'

import {
  CalendarClock,
  Check,
  FileEdit,
  Search,
  User,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LEAD_LIST_TABS, formatCh, leadKindKey } from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import type {
  LeadAssigneeFilter,
  LeadWorkTabFilter,
  OutboundLeadListResponse,
} from '@/types/outreach/kpi'
import {
  OUTBOUND_CHANNELS,
  OUTBOUND_LEAD_CRITERIA,
  OUTBOUND_LEAD_KINDS,
  type OutboundChannel,
  type OutboundLeadCriterion,
  type OutboundLeadKind,
} from '@/types/outreach/owner-first'

import {
  SEARCH_MAX_LENGTH,
  type LeadListFilters,
} from '../use-lead-list-filters'

const ALL_VALUE = '__all__'
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#062E25] focus-visible:ring-offset-2'
const COUNT_CLASS =
  'inline-flex h-6 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums'
const TRIGGER_CLASS =
  'w-full border-[#062E25]/20 bg-white text-base text-[#062E25] data-[size=default]:h-11 sm:w-52'
const ITEM_CLASS = 'py-2 text-base'

type Summary = OutboundLeadListResponse['summary'] | undefined

function CountSkeleton() {
  return (
    <span
      aria-hidden
      className="h-6 w-7 animate-pulse rounded-full bg-current opacity-15"
    />
  )
}

export function LeadTabs({
  value,
  summary,
  onChange,
}: {
  value: LeadWorkTabFilter
  summary: Summary
  onChange: (tab: LeadWorkTabFilter) => void
}) {
  const t = useTranslations('admin.outreach.leads')

  return (
    <div
      role="group"
      aria-label={t('tabsAria')}
      className="flex flex-wrap gap-2"
    >
      {LEAD_LIST_TABS.map(tab => {
        const selected = value === tab
        const count = summary?.byTab[tab]
        return (
          <button
            key={tab}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab)}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-full border pl-4 pr-2 text-lg font-medium transition-colors max-sm:flex-auto max-sm:justify-between',
              FOCUS_RING,
              selected
                ? 'border-[#062E25] bg-[#062E25] text-white'
                : 'border-[#062E25]/20 bg-white text-[#062E25] hover:bg-[#F5F7EE]'
            )}
          >
            <span>{t(`tabs.${tab}`)}</span>
            {count === undefined ? (
              <CountSkeleton />
            ) : (
              <span
                className={cn(
                  COUNT_CLASS,
                  selected ? 'bg-white/20 text-white' : 'bg-[#062E25]/10'
                )}
              >
                {formatCh(count)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface ToggleItem {
  key: 'me' | 'unassigned' | 'draftWaiting' | 'followUpDue'
  icon: LucideIcon
  pressed: boolean
  urgent?: boolean
  onClick: () => void
}

export function LeadToggles({
  filters,
  summary,
  onToggleAssignee,
  onToggleDraftWaiting,
  onToggleFollowUpDue,
}: {
  filters: LeadListFilters
  summary: Summary
  onToggleAssignee: (assignee: LeadAssigneeFilter) => void
  onToggleDraftWaiting: () => void
  onToggleFollowUpDue: () => void
}) {
  const t = useTranslations('admin.outreach.leads')

  const items: ToggleItem[] = [
    {
      key: 'me',
      icon: User,
      pressed: filters.assignee === 'me',
      onClick: () => onToggleAssignee('me'),
    },
    {
      key: 'unassigned',
      icon: UserX,
      pressed: filters.assignee === 'unassigned',
      onClick: () => onToggleAssignee('unassigned'),
    },
    {
      key: 'draftWaiting',
      icon: FileEdit,
      pressed: filters.draftWaiting,
      onClick: onToggleDraftWaiting,
    },
    {
      key: 'followUpDue',
      icon: CalendarClock,
      pressed: filters.followUpDue,
      urgent: true,
      onClick: onToggleFollowUpDue,
    },
  ]

  return (
    <div
      role="group"
      aria-label={t('togglesAria')}
      className="flex flex-wrap gap-2"
    >
      {items.map(item => {
        const Icon = item.pressed ? Check : item.icon
        const count = summary?.toggles[item.key]
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={item.pressed}
            onClick={item.onClick}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-lg border-2 px-2.5 py-1 text-left text-base text-[#062E25] transition-colors max-sm:flex-[1_1_calc(50%-4px)]',
              FOCUS_RING,
              item.pressed
                ? 'border-[#062E25] bg-[#062E25]/10 font-semibold'
                : 'border-[#062E25]/15 bg-white font-medium hover:bg-[#F5F7EE]'
            )}
          >
            <Icon aria-hidden className="size-5 shrink-0 max-sm:hidden" />
            <span className="min-w-0 max-sm:flex-1">
              {t(`toggle.${item.key}`)}
            </span>
            {count === undefined ? (
              <CountSkeleton />
            ) : (
              <span
                className={cn(
                  COUNT_CLASS,
                  item.urgent && count > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-[#062E25]/10'
                )}
              >
                {formatCh(count)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function LeadFilterBar({
  filters,
  summary,
  searchInput,
  moreOpen,
  hasActiveFilters,
  onSearchChange,
  onKindChange,
  onCriterionChange,
  onChannelChange,
  onToggleMore,
  onReset,
}: {
  filters: LeadListFilters
  summary: Summary
  searchInput: string
  moreOpen: boolean
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onKindChange: (kind: OutboundLeadKind | null) => void
  onCriterionChange: (criterion: OutboundLeadCriterion | null) => void
  onChannelChange: (channel: OutboundChannel | null) => void
  onToggleMore: () => void
  onReset: () => void
}) {
  const t = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const hiddenCount = (filters.criterion ? 1 : 0) + (filters.channel ? 1 : 0)

  const kinds = OUTBOUND_LEAD_KINDS.filter(
    kind => !summary || (summary.byKind[kind] ?? 0) > 0 || filters.kind === kind
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-[1_1_240px] sm:max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#062E25]/60"
          />
          <Input
            type="search"
            autoComplete="off"
            maxLength={SEARCH_MAX_LENGTH}
            value={searchInput}
            onChange={event => onSearchChange(event.target.value)}
            placeholder={t('searchShort')}
            aria-label={t('searchAria')}
            className="h-11 border-[#062E25]/20 bg-white pl-10 text-base text-ellipsis md:text-base"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select
            value={filters.kind ?? ALL_VALUE}
            onValueChange={value =>
              onKindChange(
                value === ALL_VALUE ? null : (value as OutboundLeadKind)
              )
            }
          >
            <SelectTrigger aria-label={t('kindAria')} className={TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE} className={ITEM_CLASS}>
                {t('allKinds')}
              </SelectItem>
              {kinds.map(kind => (
                <SelectItem key={kind} value={kind} className={ITEM_CLASS}>
                  {tw(leadKindKey(kind))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          aria-expanded={moreOpen}
          onClick={onToggleMore}
          className="h-11 gap-2 px-2.5 text-base text-[#062E25]/70 hover:bg-[#F5F7EE] hover:text-[#062E25]"
        >
          {t('moreFilters')}
          {hiddenCount > 0 ? (
            <span className={cn(COUNT_CLASS, 'bg-[#062E25]/10 text-[#062E25]')}>
              {hiddenCount}
            </span>
          ) : null}
        </Button>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            className="h-11 px-2.5 text-base text-[#062E25]/70 hover:bg-[#F5F7EE] hover:text-[#062E25]"
          >
            {t('resetShort')}
          </Button>
        ) : null}
      </div>

      {moreOpen ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-auto">
            <Select
              value={filters.criterion ?? ALL_VALUE}
              onValueChange={value =>
                onCriterionChange(
                  value === ALL_VALUE ? null : (value as OutboundLeadCriterion)
                )
              }
            >
              <SelectTrigger
                aria-label={t('reasonAria')}
                className={TRIGGER_CLASS}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE} className={ITEM_CLASS}>
                  {t('allReasons')}
                </SelectItem>
                {OUTBOUND_LEAD_CRITERIA.map(criterion => (
                  <SelectItem
                    key={criterion}
                    value={criterion}
                    className={ITEM_CLASS}
                  >
                    {t(`criterion.${criterion}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select
              value={filters.channel ?? ALL_VALUE}
              onValueChange={value =>
                onChannelChange(
                  value === ALL_VALUE ? null : (value as OutboundChannel)
                )
              }
            >
              <SelectTrigger
                aria-label={t('channelAria')}
                className={TRIGGER_CLASS}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE} className={ITEM_CLASS}>
                  {t('allChannels')}
                </SelectItem>
                {OUTBOUND_CHANNELS.map(channel => (
                  <SelectItem
                    key={channel}
                    value={channel}
                    className={ITEM_CLASS}
                  >
                    {t(`channel.${channel}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}
    </div>
  )
}
