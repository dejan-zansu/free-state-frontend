import {
  LEAD_TURN_TONE,
  formatLeadDate,
  formatLeadTime,
  zurichDaysAgo,
  type LeadPillTone,
} from '@/lib/outbound-lead-work'
import type {
  InboxItem,
  InboxSource,
  InboxSuppressionReason,
} from '@/types/outreach/inbox'
import type { LeadManualChannel } from '@/types/outreach/kpi'

export const INBOX_QUERY_KEY = ['admin', 'outreach', 'inbox'] as const
export const INBOX_LIST_QUERY_KEY = [...INBOX_QUERY_KEY, 'list'] as const
export const INBOX_SUMMARY_QUERY_KEY = [...INBOX_QUERY_KEY, 'summary'] as const
export const INBOX_MATCHES_QUERY_KEY = [...INBOX_QUERY_KEY, 'matches'] as const

export const INBOX_POLL_MS = 60000

const CONVERSATION_KEY = /^(prospect|customer):([A-Za-z0-9-]{1,64})$/

export function inboxConversationKey(value: string | null): string | null {
  return value && CONVERSATION_KEY.test(value) ? value : null
}

export function inboxProspectId(key: string): string | null {
  const match = CONVERSATION_KEY.exec(key)
  return match?.[1] === 'prospect' ? match[2] : null
}

export function inboxTime(at: string | null): string {
  if (!at) return ''
  return zurichDaysAgo(at) <= 0 ? formatLeadTime(at) : formatLeadDate(at)
}

export function inboxStateTone(item: InboxItem): LeadPillTone {
  if (item.late) return 'red'
  return item.prospect ? LEAD_TURN_TONE[item.prospect.work.turn] : 'grey'
}

export const inboxSourceKey = (source: InboxSource) => `source.${source}`

const SOURCE_OF_CHANNEL: Record<LeadManualChannel, InboxSource> = {
  explee: 'EXPLEE',
  phone: 'PHONE',
  letter: 'LETTER',
  other: 'OTHER',
}

export const inboxChannelKey = (channel: LeadManualChannel) =>
  inboxSourceKey(SOURCE_OF_CHANNEL[channel])

export function inboxSuppressionKey(reason: InboxSuppressionReason): string {
  return reason === 'OPT_OUT' || reason === 'PRIOR_CONTACT'
    ? `activityReasons.${reason}`
    : `inbox.suppression.${reason}`
}

export function inboxSeenUpTo(
  item: InboxItem | undefined,
  shownAt: string | null
): string | null {
  const listedAt = item?.at ?? null
  const upTo =
    listedAt && (!shownAt || Date.parse(listedAt) > Date.parse(shownAt))
      ? listedAt
      : shownAt
  return item && !item.isNew && upTo === listedAt ? null : upTo
}

export function localDateTimeInput(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
