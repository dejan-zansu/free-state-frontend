import type {
  OutboundActivity,
  OutboundProspectDetail,
  OutboundProspectEmail,
} from '@/types/admin-outreach'
import type { LeadCustomerTouch } from '@/types/outreach/kpi'

export type LeadEventKind = 'meeting' | 'visit' | 'offer' | 'letter'

export type LeadSystemLine =
  | { type: 'autoMail'; email: OutboundProspectEmail }
  | { type: 'received'; email: OutboundProspectEmail }
  | { type: 'forwarded'; email: OutboundProspectEmail }
  | { type: 'mailFailed'; email: OutboundProspectEmail }
  | { type: 'activity'; activity: OutboundActivity }

export type LeadTimelineEntry = { id: string; at: string } & (
  | {
      kind: 'inbound'
      email: OutboundProspectEmail
      open: boolean
      newest: boolean
    }
  | { kind: 'outbound'; email: OutboundProspectEmail }
  | { kind: 'roof'; activity: OutboundActivity; open: boolean }
  | {
      kind: 'linkedin'
      activity: OutboundActivity
      action: string
      fromCustomer: boolean
      open: boolean
    }
  | { kind: 'call'; activity: OutboundActivity }
  | { kind: 'event'; activity: OutboundActivity; event: LeadEventKind }
  | { kind: 'note'; activity: OutboundActivity; note: string }
  | { kind: 'system'; line: LeadSystemLine }
)

const WEAK_CLASSIFICATIONS = ['OOO', 'BOUNCE', 'UNSUBSCRIBE']
const LINKEDIN_REPLY_ACTIONS = ['reply', 'reply_received']
const LINKEDIN_CUSTOMER_ACTIONS = [...LINKEDIN_REPLY_ACTIONS, 'accepted']
const LINKEDIN_ROW_ACTIONS = [
  ...LINKEDIN_CUSTOMER_ACTIONS,
  'request',
  'message',
  'followup',
  'withdrawn',
  'comment',
  'like',
]

const EVENT_BY_TYPE: Partial<Record<OutboundActivity['type'], LeadEventKind>> =
  {
    MEETING_BOOKED: 'meeting',
    MEETING_HELD: 'visit',
    OFFER_SENT: 'offer',
    LETTER_SENT: 'letter',
  }

const SYSTEM_TYPES: OutboundActivity['type'][] = [
  'ASSIGNED',
  'SNOOZED',
  'PROMOTED',
  'QRL_RECORDED',
]

export function leadPayloadText(
  activity: OutboundActivity,
  key: string
): string | null {
  const value = activity.payload?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function leadIsDecision(activity: OutboundActivity): boolean {
  return leadPayloadText(activity, 'source') === 'decision'
}

function isSameMoment(a: string, b: string): boolean {
  return Date.parse(a) === Date.parse(b)
}

function isOpenActivity(
  touch: LeadCustomerTouch | null,
  source: LeadCustomerTouch['source'],
  activity: OutboundActivity
): boolean {
  return (
    !!touch &&
    touch.source === source &&
    isSameMoment(touch.at, activity.createdAt)
  )
}

function mailEntry(
  email: OutboundProspectEmail,
  prospect: OutboundProspectDetail,
  newestInboundId: string | null
): LeadTimelineEntry | null {
  const { work } = prospect
  const id = `email-${email.id}`
  if (email.direction === 'INBOUND') {
    const at = email.receivedAt ?? email.createdAt
    if (isWeakMail(email, prospect)) {
      return {
        id,
        at,
        kind: 'system',
        line: { type: 'received', email },
      }
    }
    return {
      id,
      at,
      kind: 'inbound',
      email,
      open: work.openTouch?.emailId === email.id,
      newest: email.id === newestInboundId,
    }
  }
  if (email.status === 'DRAFT') return null
  const at = email.sentAt ?? email.createdAt
  if (email.status === 'FAILED') {
    return { id, at, kind: 'system', line: { type: 'mailFailed', email } }
  }
  if (email.headersJson?.offThread === true) {
    return { id, at, kind: 'system', line: { type: 'forwarded', email } }
  }
  if (email.autoReplyKey && email.autoSendApproved) {
    return { id, at, kind: 'system', line: { type: 'autoMail', email } }
  }
  return { id, at, kind: 'outbound', email }
}

function isWeakMail(
  email: OutboundProspectEmail,
  prospect: OutboundProspectDetail
): boolean {
  const { openTouch, lastCustomerTouch } = prospect.work
  if (openTouch?.emailId === email.id) return false
  if (lastCustomerTouch?.emailId === email.id) return false
  return WEAK_CLASSIFICATIONS.includes(email.replyClassification ?? '')
}

function activityEntry(
  activity: OutboundActivity,
  prospect: OutboundProspectDetail
): LeadTimelineEntry | null {
  const { work } = prospect
  const base = { id: `activity-${activity.id}`, at: activity.createdAt }
  const event = EVENT_BY_TYPE[activity.type]
  if (event) return { ...base, kind: 'event', activity, event }
  if (SYSTEM_TYPES.includes(activity.type)) {
    return { ...base, kind: 'system', line: { type: 'activity', activity } }
  }
  switch (activity.type) {
    case 'LANDING_RESPONSE':
      return {
        ...base,
        kind: 'roof',
        activity,
        open: isOpenActivity(work.openTouch, 'ROOF_PAGE', activity),
      }
    case 'LINKEDIN': {
      const action = leadPayloadText(activity, 'action')
      if (!action || !LINKEDIN_ROW_ACTIONS.includes(action)) return null
      return {
        ...base,
        kind: 'linkedin',
        activity,
        action,
        fromCustomer: LINKEDIN_CUSTOMER_ACTIONS.includes(action),
        open: isOpenActivity(work.openTouch, 'LINKEDIN', activity),
      }
    }
    case 'CALL_LOGGED':
      return { ...base, kind: 'call', activity }
    case 'NOTE': {
      const note = leadPayloadText(activity, 'note')
      if (!note || leadPayloadText(activity, 'source') === 'building-first') {
        return null
      }
      if (!activity.actorId && leadPayloadText(activity, 'emailId')) return null
      return activity.actorId
        ? { ...base, kind: 'note', activity, note }
        : { ...base, kind: 'system', line: { type: 'activity', activity } }
    }
    case 'STATUS_CHANGED': {
      const movedByPerson =
        !!activity.actorId &&
        !!leadPayloadText(activity, 'from') &&
        !!leadPayloadText(activity, 'to')
      return leadIsDecision(activity) || movedByPerson
        ? { ...base, kind: 'system', line: { type: 'activity', activity } }
        : null
    }
    default:
      return null
  }
}

function newestInboundId(prospect: OutboundProspectDetail): string | null {
  const inbound = prospect.emails
    .filter(
      email => email.direction === 'INBOUND' && !isWeakMail(email, prospect)
    )
    .sort(
      (a, b) =>
        Date.parse(b.receivedAt ?? b.createdAt) -
        Date.parse(a.receivedAt ?? a.createdAt)
    )
  return inbound[0]?.id ?? null
}

export function buildLeadTimeline(
  prospect: OutboundProspectDetail
): LeadTimelineEntry[] {
  const newest = newestInboundId(prospect)
  const entries: LeadTimelineEntry[] = []
  for (const email of prospect.emails) {
    const entry = mailEntry(email, prospect, newest)
    if (entry) entries.push(entry)
  }
  for (const activity of prospect.activities) {
    const entry = activityEntry(activity, prospect)
    if (entry) entries.push(entry)
  }
  return entries.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}
