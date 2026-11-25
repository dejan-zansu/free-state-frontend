'use client'

import { Search } from 'lucide-react'
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
import { inboxSourceKey } from '@/lib/outbound-inbox'
import { formatCh } from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import {
  INBOX_SOURCES,
  INBOX_TABS,
  type InboxListResponse,
  type InboxSource,
  type InboxTab,
} from '@/types/outreach/inbox'
import type { LeadAssigneeFilter } from '@/types/outreach/kpi'

import {
  INBOX_ASSIGNEE_FILTERS,
  INBOX_SEARCH_MAX_LENGTH,
  type InboxFilters,
} from '../use-inbox-filters'

const ALL_VALUE = '__all__'
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-[#062E25] focus-visible:ring-offset-2'
const COUNT_CLASS =
  'inline-flex h-6 min-w-7 items-center justify-center rounded-full px-1.5 text-base font-semibold tabular-nums'
const TRIGGER_CLASS =
  'w-full border-[#062E25]/20 bg-white text-base text-[#062E25] data-[size=default]:h-11 sm:w-52'
const ITEM_CLASS = 'py-2 text-base'

type Summary = InboxListResponse['summary'] | undefined

export function InboxTabs({
  value,
  summary,
  onChange,
}: {
  value: InboxTab
  summary: Summary
  onChange: (tab: InboxTab) => void
}) {
  const t = useTranslations('admin.outreach.inbox')

  return (
    <div
      role="group"
      aria-label={t('tabsAria')}
      className="flex flex-wrap gap-2"
    >
      {INBOX_TABS.map(tab => {
        const selected = value === tab
        const count = summary?.byTab[tab]
        return (
          <button
            key={tab}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab)}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-full border pl-4 pr-2 text-base font-medium transition-colors max-sm:flex-auto max-sm:justify-between',
              FOCUS_RING,
              selected
                ? 'border-[#062E25] bg-[#062E25] text-white'
                : 'border-[#062E25]/20 bg-white text-[#062E25] hover:bg-[#F5F7EE]'
            )}
          >
            <span>{t(`tabs.${tab}`)}</span>
            {count === undefined ? (
              <span
                aria-hidden
                className="h-6 w-7 animate-pulse rounded-full bg-current opacity-15"
              />
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

export function InboxFilterBar({
  filters,
  summary,
  searchInput,
  hasActiveFilters,
  onSearchChange,
  onSourceChange,
  onAssigneeChange,
  onReset,
}: {
  filters: InboxFilters
  summary: Summary
  searchInput: string
  hasActiveFilters: boolean
  onSearchChange: (value: string) => void
  onSourceChange: (source: InboxSource | null) => void
  onAssigneeChange: (assignee: LeadAssigneeFilter | null) => void
  onReset: () => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const tl = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')

  const sources = INBOX_SOURCES.filter(
    source => (summary?.bySource[source] ?? 0) > 0 || filters.source === source
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-[1_1_240px] sm:max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#062E25]/60"
        />
        <Input
          type="search"
          autoComplete="off"
          maxLength={INBOX_SEARCH_MAX_LENGTH}
          value={searchInput}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={t('filters.search')}
          aria-label={tl('searchAria')}
          className="h-11 border-[#062E25]/20 bg-white pl-10 text-base text-ellipsis md:text-base"
        />
      </div>

      <div className="w-full sm:w-auto">
        <Select
          value={filters.source ?? ALL_VALUE}
          onValueChange={value =>
            onSourceChange(value === ALL_VALUE ? null : (value as InboxSource))
          }
        >
          <SelectTrigger
            aria-label={t('filters.sourceAria')}
            className={TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE} className={ITEM_CLASS}>
              {t('filters.allSources')}
            </SelectItem>
            {sources.map(source => (
              <SelectItem key={source} value={source} className={ITEM_CLASS}>
                {`${t(inboxSourceKey(source))} (${formatCh(summary?.bySource[source] ?? 0)})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-auto">
        <Select
          value={filters.assignee ?? ALL_VALUE}
          onValueChange={value =>
            onAssigneeChange(
              value === ALL_VALUE ? null : (value as LeadAssigneeFilter)
            )
          }
        >
          <SelectTrigger
            aria-label={tw('strip.assignee')}
            className={TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE} className={ITEM_CLASS}>
              {t('filters.allAssignees')}
            </SelectItem>
            {INBOX_ASSIGNEE_FILTERS.map(assignee => (
              <SelectItem
                key={assignee}
                value={assignee}
                className={ITEM_CLASS}
              >
                {tl(`toggle.${assignee}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="h-11 px-2.5 text-base text-[#062E25]/70 hover:bg-[#F5F7EE] hover:text-[#062E25]"
        >
          {tl('resetShort')}
        </Button>
      ) : null}
    </div>
  )
}
