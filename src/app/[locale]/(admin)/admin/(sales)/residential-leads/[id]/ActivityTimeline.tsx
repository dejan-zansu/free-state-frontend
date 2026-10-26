'use client'

import {
  ArrowRight,
  CalendarCheck,
  FileText,
  Mail,
  Phone,
  Send,
  Sparkles,
  StickyNote,
  Trophy,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  formatDate,
  formatDateTime,
  formatRelative,
  personName,
} from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import type { SalesLeadActivity, SalesLeadDetail } from '@/types/sales-lead'

import { formatChfAmount } from './leadUtils'

type TimelineEntry =
  | { id: string; at: string; kind: 'activity'; activity: SalesLeadActivity }
  | { id: string; at: string; kind: 'created' }
  | { id: string; at: string; kind: 'offer' }

const NOTE_ICONS: Record<string, LucideIcon> = {
  NOTE: StickyNote,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
}

const NEUTRAL_TONE = 'bg-[#F5F7EE] text-[#062E25]'

function buildTimeline(lead: SalesLeadDetail): TimelineEntry[] {
  const entries: TimelineEntry[] = lead.activities.map(activity => ({
    id: activity.id,
    at: activity.createdAt,
    kind: 'activity',
    activity,
  }))
  if (lead.offerCount > 0) {
    entries.push({
      id: 'synthetic-offer',
      at: lead.offerSentAt ?? lead.createdAt,
      kind: 'offer',
    })
  }
  entries.push({ id: 'synthetic-created', at: lead.createdAt, kind: 'created' })

  const rank = (entry: TimelineEntry) => (entry.kind === 'created' ? 0 : 1)
  return entries.sort((a, b) => {
    const diff = new Date(b.at).getTime() - new Date(a.at).getTime()
    if (diff !== 0 && !Number.isNaN(diff)) return diff
    return rank(b) - rank(a)
  })
}

function StatusValue({ value }: { value: string | null }) {
  if (!value) return <span className="text-base text-[#062E25]/60">-</span>
  return <StatusBadge status={value} className="px-3 text-sm sm:text-base" />
}

function entryVisual(entry: TimelineEntry): { icon: LucideIcon; tone: string } {
  if (entry.kind === 'created') return { icon: Sparkles, tone: NEUTRAL_TONE }
  if (entry.kind === 'offer') {
    return { icon: FileText, tone: 'bg-emerald-100 text-emerald-700' }
  }
  switch (entry.activity.type) {
    case 'WON':
      return { icon: Trophy, tone: 'bg-green-100 text-green-700' }
    case 'LOST':
      return { icon: XCircle, tone: 'bg-red-100 text-red-700' }
    case 'CONSULT_BOOKED':
      return { icon: CalendarCheck, tone: 'bg-blue-100 text-blue-700' }
    case 'OFFER_SENT':
      return { icon: Send, tone: 'bg-emerald-100 text-emerald-700' }
    case 'NOTE':
      return {
        icon: NOTE_ICONS[entry.activity.fromValue ?? 'NOTE'] ?? StickyNote,
        tone: NEUTRAL_TONE,
      }
    default:
      return { icon: ArrowRight, tone: NEUTRAL_TONE }
  }
}

type ItemProps = {
  entry: TimelineEntry
  lead: SalesLeadDetail
  showWonAmount: boolean
  showLostReason: boolean
}

function TimelineItem({
  entry,
  lead,
  showWonAmount,
  showLostReason,
}: ItemProps) {
  const t = useTranslations('admin.salesLeads.detail')
  const locale = useLocale()
  const { icon: Icon, tone } = entryVisual(entry)

  const activity = entry.kind === 'activity' ? entry.activity : null
  const actorName = activity
    ? personName(activity.actor) || t('timeline.system')
    : null
  const isWon = activity?.type === 'WON'
  const isLost = activity?.type === 'LOST'

  return (
    <li className="group relative flex gap-4 pb-6 last:pb-0">
      <span
        aria-hidden
        className="absolute left-5 top-10 bottom-0 w-px -translate-x-1/2 bg-[#062E25]/10 group-last:hidden"
      />
      <span
        className={cn(
          'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
          tone
        )}
      >
        <Icon className="size-5" />
      </span>
      <div
        className={cn(
          'min-w-0 flex-1',
          isWon || isLost
            ? cn(
                'rounded-xl border p-3',
                isWon
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              )
            : 'pt-1.5'
        )}
      >
        {entry.kind === 'created' && (
          <p className="text-base font-semibold text-[#062E25]">
            {t('timeline.created')}
          </p>
        )}

        {entry.kind === 'offer' && (
          <>
            <p className="text-base font-semibold text-[#062E25]">
              {t('timeline.offerRequested')}
            </p>
            <p className="mt-0.5 text-base text-[#062E25]">
              {t('timeline.offerCount', { count: lead.offerCount })}
              {lead.offerSentAt &&
                ` · ${t('timeline.offerLast', { date: formatDate(lead.offerSentAt) })}`}
            </p>
          </>
        )}

        {activity?.type === 'STATUS_CHANGED' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-[#062E25]">
              {t('timeline.statusChanged')}
            </span>
            <StatusValue value={activity.fromValue} />
            <ArrowRight className="size-4 text-[#062E25]/60" aria-hidden />
            <StatusValue value={activity.toValue} />
          </div>
        )}

        {(isWon || isLost) && activity && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'text-base font-semibold',
                  isWon ? 'text-green-800' : 'text-red-800'
                )}
              >
                {isWon ? t('timeline.won') : t('timeline.lost')}
              </span>
              <StatusValue value={activity.fromValue} />
              <ArrowRight className="size-4 text-[#062E25]/60" aria-hidden />
              <StatusValue value={activity.toValue} />
            </div>
            {isWon && showWonAmount && lead.wonAmountChf != null && (
              <p className="mt-1.5 text-base font-semibold text-green-800">
                {t('timeline.wonAmount', {
                  amount: formatChfAmount(lead.wonAmountChf),
                })}
              </p>
            )}
            {isLost && showLostReason && lead.lostReason && (
              <p className="mt-1.5 whitespace-pre-wrap break-words text-base text-[#062E25]">
                <span className="text-[#062E25]/75">
                  {t('timeline.lostReason')}
                </span>{' '}
                {lead.lostReason}
              </p>
            )}
          </>
        )}

        {activity?.type === 'NOTE' && (
          <>
            <p className="text-base font-semibold text-[#062E25]">
              {t(
                `composer.kinds.${
                  activity.fromValue && NOTE_ICONS[activity.fromValue]
                    ? activity.fromValue
                    : 'NOTE'
                }`
              )}
            </p>
            {activity.toValue && (
              <p className="mt-1.5 whitespace-pre-wrap break-words rounded-xl bg-[#F5F7EE] p-3 text-base text-[#062E25]">
                {activity.toValue}
              </p>
            )}
          </>
        )}

        {activity?.type === 'CONSULT_BOOKED' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-[#062E25]">
              {t('timeline.consultBooked')}
            </span>
            {activity.fromValue && activity.toValue && (
              <>
                <StatusValue value={activity.fromValue} />
                <ArrowRight className="size-4 text-[#062E25]/60" aria-hidden />
                <StatusValue value={activity.toValue} />
              </>
            )}
          </div>
        )}

        {activity?.type === 'OFFER_SENT' && (
          <p className="text-base font-semibold text-[#062E25]">
            {t('timeline.offerSent')}
          </p>
        )}

        <p className="mt-1 text-base text-[#062E25]/75">
          {actorName && <span>{actorName} · </span>}
          <time dateTime={entry.at} title={formatDateTime(entry.at)}>
            {formatRelative(entry.at, locale)}
          </time>
        </p>
      </div>
    </li>
  )
}

export function ActivityTimeline({ lead }: { lead: SalesLeadDetail }) {
  const t = useTranslations('admin.salesLeads.detail')
  const entries = useMemo(() => buildTimeline(lead), [lead])

  const firstWonId = entries.find(
    entry => entry.kind === 'activity' && entry.activity.type === 'WON'
  )?.id
  const firstLostId = entries.find(
    entry => entry.kind === 'activity' && entry.activity.type === 'LOST'
  )?.id
  const legacyNote = lead.notes?.trim() ? lead.notes : null

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-[#062E25]">
        {t('timeline.title')}
      </h2>

      {legacyNote && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 text-base font-semibold text-amber-900">
            {t('timeline.legacyNote')}
            <span className="ml-2 font-normal text-amber-900/80">
              {t('timeline.legacyNoteHint')}
            </span>
          </p>
          <p className="whitespace-pre-wrap break-words text-base text-[#062E25]">
            {legacyNote}
          </p>
        </div>
      )}

      {lead.activities.length === 0 && (
        <p className="mb-5 rounded-xl bg-[#F5F7EE] p-4 text-base text-[#062E25]/75">
          {t('timeline.empty')}
        </p>
      )}

      <ol>
        {entries.map(entry => (
          <TimelineItem
            key={entry.id}
            entry={entry}
            lead={lead}
            showWonAmount={entry.id === firstWonId}
            showLostReason={entry.id === firstLostId}
          />
        ))}
      </ol>
    </div>
  )
}
