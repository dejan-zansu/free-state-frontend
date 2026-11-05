import type { OutboundActivity, PvVerdict } from '@/types/admin-outreach'
import type {
  LeadDecisionOutcome,
  LeadNamedOwnerOutcome,
  LeadOurAnswer,
  LeadOwnerInfo,
  LeadWork,
  LeadWorkState,
  LeadWorkTabFilter,
  LeadWorkTurn,
  OutboundLeadAssignee,
} from '@/types/outreach/kpi'
import type {
  OutboundLeadKind,
  OwnershipConfidence,
} from '@/types/outreach/owner-first'

export const LEAD_TIME_ZONE = 'Europe/Zurich'

export interface LeadText {
  key: string
  values?: Record<string, string | number>
}

export type LeadPillTone = 'amber' | 'blue' | 'red' | 'green' | 'grey'

export const LEAD_PILL_TONE_CLASS: Record<LeadPillTone, string> = {
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  red: 'bg-red-100 text-red-700',
  green: 'bg-emerald-100 text-emerald-800',
  grey: 'bg-[#062E25]/10 text-[#062E25]',
}

export const LEAD_TURN_TONE: Record<LeadWorkTurn, LeadPillTone> = {
  US: 'amber',
  CUSTOMER: 'blue',
  OWNER: 'blue',
  PAUSED: 'grey',
  SALES: 'green',
  CLOSED: 'grey',
}

export const LEAD_KIND_TONE: Record<OutboundLeadKind, LeadPillTone> = {
  QRL: 'green',
  EIGENTUEMER_HINWEIS: 'amber',
  HOMEOWNER: 'blue',
}

export const LEAD_INTEREST_TONE: LeadPillTone = 'grey'

export const LEAD_LIST_TABS: LeadWorkTabFilter[] = [
  'us',
  'customer',
  'sales',
  'closed',
  'all',
]

export const LEAD_WORK_STATE_ORDER: LeadWorkState[] = [
  'ANTWORT_OFFEN',
  'ENTWURF_PRUEFEN',
  'NACHFASSEN_FAELLIG',
  'EIGENTUEMER_KONTAKTIEREN',
  'ABGESAGT',
  'BEENDET',
  'IM_VERKAUF',
  'ZURUECKGESTELLT',
  'EIGENTUEMER_ANGESCHRIEBEN',
  'WARTET_AUF_ANTWORT',
]

export const LEAD_QUICK_FOLLOW_UPS: { days: number; key: string }[] = [
  { days: 1, key: 'strip.tomorrow' },
  { days: 3, key: 'strip.in3Days' },
  { days: 7, key: 'strip.in1Week' },
]

const zurichFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: LEAD_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function zurichParts(value: string | Date) {
  const parts = zurichFormat.formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(item => item.type === type)?.value ?? ''
  return {
    year: part('year'),
    month: part('month'),
    day: part('day'),
    hour: part('hour'),
    minute: part('minute'),
  }
}

export function formatLeadDate(iso: string | null | undefined): string {
  if (!iso) return '-'
  const p = zurichParts(iso)
  return `${p.day}.${p.month}.${p.year}`
}

export function formatLeadDayMonth(iso: string | null | undefined): string {
  if (!iso) return '-'
  const p = zurichParts(iso)
  return `${p.day}.${p.month}.`
}

export function formatLeadTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  const p = zurichParts(iso)
  return `${p.hour}:${p.minute}`
}

export function formatLeadDateTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  return `${formatLeadDate(iso)}, ${formatLeadTime(iso)}`
}

export function formatLeadShortDateTime(
  iso: string | null | undefined
): string {
  if (!iso) return '-'
  return `${formatLeadDayMonth(iso)}, ${formatLeadTime(iso)}`
}

export function zurichDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const p = zurichParts(iso)
  return `${p.year}-${p.month}-${p.day}`
}

function dayNumber(value: string | Date): number {
  const p = zurichParts(value)
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)) / 86400000
}

export function zurichDaysAgo(iso: string, now: Date = new Date()): number {
  return dayNumber(now) - dayNumber(iso)
}

export function zurichDatePlusDays(
  days: number,
  now: Date = new Date()
): string {
  return new Date((dayNumber(now) + days) * 86400000).toISOString().slice(0, 10)
}

export function formatCh(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-'
  const number = Math.round(Number(value))
  if (!Number.isFinite(number)) return '-'
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

export function formatRoofMwh(kwhYear: number | null | undefined): string {
  if (kwhYear === null || kwhYear === undefined) return '-'
  return formatCh(kwhYear / 1000)
}

export function assigneeName(
  assignee: OutboundLeadAssignee | null | undefined
): string | null {
  if (!assignee) return null
  return `${assignee.firstName} ${assignee.lastName}`.trim()
}

export const leadStateKey = (state: LeadWorkState) => `state.${state}`
export const leadTurnKey = (turn: LeadWorkTurn) => `turn.${turn}`
export const leadNextStepKey = (step: NonNullable<LeadWork['nextStep']>) =>
  `nextStep.${step}`
export const leadNextStepButtonKey = (
  step: NonNullable<LeadWork['nextStep']>
) => `nextStepButton.${step}`
export const leadReasonKey = (reason: NonNullable<LeadWork['reason']>) =>
  `reason.${reason}`
export const leadInterestKey = (interest: NonNullable<LeadWork['interest']>) =>
  `interest.${interest}`
export const leadClosedReasonKey = (
  reason: NonNullable<LeadWork['closedReason']>
) => `closedReason.${reason}`
export const leadKindKey = (kind: OutboundLeadKind) => `kind.${kind}`
export const leadKindHintKey = (kind: OutboundLeadKind) => `kindHint.${kind}`
export const leadPvKey = (verdict: PvVerdict) => `pv.${verdict}`
export const leadOwnershipKey = (confidence: OwnershipConfidence) =>
  `ownership.${confidence}`

export function leadGroupKey(
  state: LeadWorkState,
  ownerStep?: LeadWork['ownerStep']
): string {
  if (state === 'EIGENTUEMER_KONTAKTIEREN' && ownerStep === 'REPLIED') {
    return 'group.EIGENTUEMER_REPLIED'
  }
  return `group.${state}`
}

export function leadShowsStateLabel(work: LeadWork): boolean {
  return work.state !== 'IM_VERKAUF'
}

export function leadHasRedBar(work: LeadWork): boolean {
  return work.state === 'ANTWORT_OFFEN'
}

export function leadIsClosed(work: LeadWork): boolean {
  return work.tab === 'closed'
}

export function leadDecisionsAllowed(
  work: LeadWork,
  crmLink: { id: string } | null | undefined
): boolean {
  return !work.readOnly && !crmLink
}

const CONTACT_STEPS: NonNullable<LeadWork['nextStep']>[] = [
  'REVIEW_DRAFT',
  'CALL',
  'REPLY',
  'FOLLOW_UP',
]

export function leadContactBlocked(work: LeadWork): boolean {
  return (
    work.doNotContact &&
    !!work.nextStep &&
    CONTACT_STEPS.includes(work.nextStep)
  )
}

export function leadHasCustomerTouch(work: LeadWork): boolean {
  return !!work.lastCustomerTouch || !!work.openRequest
}

export function leadOpenRequestAnswered(work: LeadWork): boolean {
  const { openRequest, lastOurAnswer } = work
  if (work.state !== 'ANTWORT_OFFEN' || !openRequest || !lastOurAnswer) {
    return false
  }
  if (lastOurAnswer.automatic) return false
  const touch = work.openTouch ?? work.lastCustomerTouch
  return !touch || Date.parse(lastOurAnswer.at) > Date.parse(touch.at)
}

function requestSentence(work: LeadWork): LeadText {
  const request = work.openRequest
  return {
    key:
      request?.criterion === 'MEETING_DATED'
        ? 'stand.meetingRequest'
        : 'stand.offerRequest',
    values: { date: formatLeadDate(request?.at ?? work.since) },
  }
}

export function leadOpenRequestLine(work: LeadWork): LeadText | null {
  return leadOpenRequestAnswered(work) ? requestSentence(work) : null
}

export function leadShownReason(work: LeadWork): LeadWork['reason'] {
  const closedReason =
    work.reason === 'NOT_INTERESTED' || work.reason === 'OPTED_OUT'
  return work.reopened && closedReason ? null : work.reason
}

export function leadReopenedLine(work: LeadWork): LeadText | null {
  if (!work.reopened || !work.openTouch) return null
  if (work.reason === 'NOT_INTERESTED') return { key: 'reopened.afterDecline' }
  if (work.reason === 'OPTED_OUT') return { key: 'reopened.afterOptOut' }
  return { key: 'reopened.afterClose' }
}

export function leadSinceText(
  work: LeadWork,
  crmReference?: string | null
): LeadText | null {
  switch (work.state) {
    case 'IM_VERKAUF':
      return crmReference
        ? { key: 'since.crmReference', values: { reference: crmReference } }
        : null
    case 'ZURUECKGESTELLT':
      return work.pausedUntil
        ? {
            key: 'since.until',
            values: { date: formatLeadDate(work.pausedUntil) },
          }
        : null
    case 'ABGESAGT':
    case 'BEENDET':
      return work.since
        ? { key: 'since.on', values: { date: formatLeadDate(work.since) } }
        : null
    case 'ENTWURF_PRUEFEN':
      return work.sinceDays === null
        ? null
        : { key: 'since.draft', values: { days: work.sinceDays } }
    case 'NACHFASSEN_FAELLIG':
    case 'WARTET_AUF_ANTWORT':
      return work.sinceDays === null
        ? null
        : { key: 'since.ourMessage', values: { days: work.sinceDays } }
    default:
      return work.sinceDays === null
        ? null
        : { key: 'since.open', values: { days: work.sinceDays } }
  }
}

export function leadNextLine(work: LeadWork): LeadText {
  if (leadContactBlocked(work)) return { key: 'nextLine.doNotContact' }
  if (work.nextStep === 'REVIEW_DRAFT' && work.draft?.stale) {
    return { key: 'nextLine.draftStale' }
  }
  if (work.nextStep) return { key: leadNextStepKey(work.nextStep) }
  if (work.state === 'ZURUECKGESTELLT' && work.pausedUntil) {
    return {
      key: 'nextLine.paused',
      values: { date: formatLeadDate(work.pausedUntil) },
    }
  }
  if (work.state === 'EIGENTUEMER_ANGESCHRIEBEN') {
    return { key: 'nextLine.ownerMailed' }
  }
  if (leadIsClosed(work)) return { key: 'nextLine.closed' }
  if (work.readOnly) return { key: 'nextLine.readOnly' }
  return { key: 'nextLine.waiting' }
}

export type LeadNewerContact = 'customer' | 'us' | null

export function leadNewerContact(work: LeadWork): LeadNewerContact {
  const customer = work.lastCustomerTouch?.at
  const ours = work.lastOurAnswer?.at
  if (customer && (!ours || Date.parse(customer) > Date.parse(ours))) {
    return 'customer'
  }
  return ours ? 'us' : null
}

export function leadAnswerTagKey(answer: LeadOurAnswer | null): string | null {
  if (!answer) return null
  if (answer.automatic) return 'answerTag.automatic'
  return answer.source === 'EMAIL' ? null : `answerTag.${answer.source}`
}

export type LeadFollowUpTone = 'red' | 'amber' | 'plain' | 'muted'

export const LEAD_FOLLOW_UP_TONE_CLASS: Record<LeadFollowUpTone, string> = {
  red: 'font-semibold text-red-700',
  amber: 'font-semibold text-amber-700',
  plain: 'text-[#062E25]',
  muted: 'text-[#062E25]/70',
}

export function leadFollowUpLine(
  work: LeadWork
): { tone: LeadFollowUpTone; text: LeadText } | null {
  if (leadIsClosed(work) || work.state === 'ZURUECKGESTELLT') return null
  const { at, active } = work.followUp
  if (!at) return { tone: 'muted', text: { key: 'followUp.none' } }
  const date = formatLeadDate(at)
  if (!active) {
    return {
      tone: 'muted',
      text: { key: 'followUp.overridden', values: { date } },
    }
  }
  const daysAgo = zurichDaysAgo(at)
  if (daysAgo > 0) {
    return { tone: 'red', text: { key: 'followUp.overdue', values: { date } } }
  }
  if (daysAgo === 0) return { tone: 'amber', text: { key: 'followUp.today' } }
  return { tone: 'plain', text: { key: 'followUp.date', values: { date } } }
}

function openSentence(work: LeadWork, who: string): LeadText {
  const touch = work.openTouch ?? work.lastCustomerTouch
  if (!touch || leadOpenRequestAnswered(work)) return requestSentence(work)
  const values = {
    who,
    date: formatLeadDate(touch.at),
    time: formatLeadTime(touch.at),
  }
  if (touch.source === 'ROOF_PAGE') {
    const offer = work.interest === 'OFFER_REQUEST'
    return { key: offer ? 'stand.roofOffer' : 'stand.roofAnswer', values }
  }
  if (touch.source === 'LINKEDIN') return { key: 'stand.linkedin', values }
  if (touch.source === 'LEAD') return { key: 'stand.leadTouch', values }
  const answer = work.lastOurAnswer
  const onlyAutomatic =
    !!answer?.automatic && Date.parse(answer.at) > Date.parse(touch.at)
  return {
    key: onlyAutomatic ? 'stand.mailOpenAuto' : 'stand.mailOpen',
    values,
  }
}

function draftSentence(work: LeadWork): LeadText {
  const date = formatLeadDate(work.draft?.createdAt ?? work.since)
  if (!work.draft?.stale) return { key: 'stand.draft', values: { date } }
  const last =
    leadNewerContact(work) === 'customer'
      ? work.lastCustomerTouch?.at
      : work.lastOurAnswer?.at
  return {
    key: 'stand.draftStale',
    values: { date, lastContact: formatLeadDate(last) },
  }
}

function ownerSentence(work: LeadWork, owner: LeadOwnerInfo | null): LeadText {
  if (work.ownerStep === 'REPLIED') {
    const at = owner?.row?.openTouchAt ?? work.since
    return {
      key: 'stand.ownerReplied',
      values: { date: formatLeadDate(at), time: formatLeadTime(at) },
    }
  }
  const named = work.lastCustomerTouch?.at ?? work.since
  return {
    key: work.lastOurAnswer?.automatic
      ? 'stand.ownerAutoThanks'
      : 'stand.ownerNamed',
    values: { date: formatLeadDate(named) },
  }
}

export function leadStandSentence(
  work: LeadWork,
  context: {
    who: string
    owner: LeadOwnerInfo | null
    crmReference?: string | null
  }
): LeadText {
  const { who, owner, crmReference } = context
  const answer = work.lastOurAnswer
  switch (work.state) {
    case 'ANTWORT_OFFEN':
      return openSentence(work, who)
    case 'ENTWURF_PRUEFEN':
      return draftSentence(work)
    case 'EIGENTUEMER_KONTAKTIEREN':
      return ownerSentence(work, owner)
    case 'EIGENTUEMER_ANGESCHRIEBEN':
      return { key: 'stand.ownerMailed' }
    case 'NACHFASSEN_FAELLIG':
      if (work.followUp.due && work.followUp.at) {
        return {
          key: 'stand.followUpDate',
          values: { date: formatLeadDate(work.followUp.at) },
        }
      }
      return answer
        ? {
            key: 'stand.followUpSilent',
            values: {
              date: formatLeadDate(answer.at),
              days: work.sinceDays ?? zurichDaysAgo(answer.at),
            },
          }
        : { key: 'stand.noContactYet' }
    case 'WARTET_AUF_ANTWORT':
      return answer
        ? {
            key: 'stand.waiting',
            values: { who, dateTime: formatLeadDateTime(answer.at) },
          }
        : { key: 'stand.noContactYet' }
    case 'ZURUECKGESTELLT':
      return {
        key: 'stand.paused',
        values: { date: formatLeadDate(work.pausedUntil) },
      }
    case 'IM_VERKAUF':
      return crmReference
        ? { key: 'stand.sales', values: { reference: crmReference } }
        : { key: 'stand.salesNoReference' }
    case 'ABGESAGT':
      return {
        key: work.doNotContact ? 'stand.optedOut' : 'stand.declined',
        values: { who, date: formatLeadDate(work.since) },
      }
    default:
      return { key: 'stand.ended' }
  }
}

export interface LeadClosingEvent {
  sentence: LeadText
  since: LeadText
}

function closingOutcome(activity: OutboundActivity): string | null {
  const payload = activity.payload
  if (activity.type === 'CALL_LOGGED') {
    return payload?.callOutcome === 'NOT_INTERESTED' ? 'NOT_INTERESTED' : null
  }
  if (activity.type !== 'STATUS_CHANGED' || payload?.source !== 'decision') {
    return null
  }
  const decision = payload.decision
  return decision === 'NOT_INTERESTED' || decision === 'HINT_DONE'
    ? decision
    : null
}

function closingSuppressed(activity: OutboundActivity): boolean {
  const payload = activity.payload
  const result = payload?.result as { suppressed?: unknown } | null | undefined
  return !!(payload?.suppressed ?? result?.suppressed)
}

export function leadClosingEvent(
  work: LeadWork,
  activities: OutboundActivity[]
): LeadClosingEvent | null {
  if (!leadIsClosed(work)) return null
  const closing = activities
    .filter(activity => closingOutcome(activity) !== null)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]
  if (!closing) return null
  const touch = work.lastCustomerTouch?.at
  if (touch && Date.parse(touch) > Date.parse(closing.createdAt)) return null
  const date = formatLeadDate(closing.createdAt)
  const declined = closingOutcome(closing) === 'NOT_INTERESTED'
  let key = 'stand.decisionHintDone'
  if (declined) {
    key = closingSuppressed(closing)
      ? 'stand.decisionDeclined'
      : 'stand.decisionDeclinedNoAddress'
  }
  return {
    sentence: { key, values: { date } },
    since: { key: 'since.on', values: { date } },
  }
}

export interface LeadOwnerLine {
  named: LeadText | null
  row: { id: string; reference: string } | null
  status: LeadText | null
}

function ownerRowStatus(row: NonNullable<LeadOwnerInfo['row']>): LeadText {
  if (row.openTouchAt) {
    return {
      key: 'ownerLine.replied',
      values: { date: formatLeadDate(row.openTouchAt) },
    }
  }
  if (row.closed) return { key: 'ownerLine.closed' }
  if (row.contacted) return { key: 'ownerLine.mailed' }
  return { key: row.hasDraft ? 'ownerLine.draft' : 'ownerLine.nothingSent' }
}

function ownerLookupStatus(owner: LeadOwnerInfo): LeadText {
  const lookup = owner.lookup
  if (!lookup) return { key: 'ownerLine.noEntry' }
  if (lookup.status === 'DONE') return { key: 'ownerLine.lookupDone' }
  if (lookup.status === 'NOT_FOUND') return { key: 'ownerLine.lookupNotFound' }
  if (lookup.status === 'VOID' || lookup.status === 'SKIPPED') {
    return { key: 'ownerLine.lookupStopped' }
  }
  return {
    key:
      owner.partyType === 'PERSON'
        ? 'ownerLine.lookupPrivate'
        : 'ownerLine.lookupWaiting',
    values: { days: zurichDaysAgo(lookup.createdAt) },
  }
}

export function leadOwnerLine(
  owner: LeadOwnerInfo | null
): LeadOwnerLine | null {
  if (!owner) return null
  const name = owner.name ?? owner.row?.companyName ?? null
  return {
    named: name ? { key: 'ownerLine.named', values: { name } } : null,
    row: owner.row
      ? { id: owner.row.id, reference: owner.row.reference }
      : null,
    status: owner.row ? ownerRowStatus(owner.row) : ownerLookupStatus(owner),
  }
}

export function leadDecisionToastKey(outcome: LeadDecisionOutcome): string {
  if (outcome === 'NOT_INTERESTED') return 'toast.declined'
  return outcome === 'HINT_DONE' ? 'toast.hintDone' : 'toast.snoozed'
}

function reasonField(reason: string | null, index: number): string {
  return reason?.split(':')[index] ?? ''
}

export function leadNamedOwnerText(
  outcome: LeadNamedOwnerOutcome,
  reason: string | null,
  name: string
): LeadText {
  const head = reasonField(reason, 0)
  if (outcome === 'owner_prospect') {
    return { key: 'namedOwner.ownerProspect', values: { name } }
  }
  if (outcome === 'duplicate') {
    return head === 'address_known'
      ? {
          key: 'namedOwner.addressKnown',
          values: { reference: reasonField(reason, 1) },
        }
      : { key: 'namedOwner.ownerRowExists' }
  }
  if (outcome === 'lookup_queued') {
    return {
      key:
        head === 'private_person'
          ? 'namedOwner.lookupPrivate'
          : 'namedOwner.lookupNotFound',
    }
  }
  switch (head) {
    case 'do_not_pitch':
      return { key: 'namedOwner.doNotPitch' }
    case 'in_liquidation':
      return { key: 'namedOwner.inLiquidation' }
    case 'suppressed':
      return { key: 'namedOwner.suppressed' }
    case 'existing_relationship':
      return { key: 'namedOwner.existingRelationship' }
    case 'declined':
      return {
        key: 'namedOwner.declined',
        values: { reference: reasonField(reason, 1) },
      }
    case 'names_the_tenant_itself':
    case 'no_name':
      return { key: 'namedOwner.namesTenant' }
    default:
      return { key: 'namedOwner.lookupImpossible' }
  }
}

const LEAD_ERROR_CODES = new Set([
  'ASSIGNEE_INVALID',
  'ASSIGNEE_REQUIRED',
  'LEAD_READ_ONLY',
  'PROSPECT_CONVERTED',
  'PROSPECT_TERMINAL',
  'NOT_FOUND',
  'VALIDATION_ERROR',
])

export function leadErrorKey(error: unknown): string {
  const code = (
    error as { response?: { data?: { error?: { code?: unknown } } } }
  )?.response?.data?.error?.code
  return typeof code === 'string' && LEAD_ERROR_CODES.has(code)
    ? `errors.${code}`
    : 'errors.generic'
}
