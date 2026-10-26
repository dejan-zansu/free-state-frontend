import type {
  SalesLeadPerson,
  SalesLeadSource,
  SalesLeadStatus,
} from '@/types/sales-lead'

export const PIPELINE_STATUSES: SalesLeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
]

export const ACTIVE_STATUSES: SalesLeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
]

export const ALL_STATUSES: SalesLeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'ON_HOLD',
  'WON',
  'LOST',
]

export const ALL_SOURCES: SalesLeadSource[] = [
  'WEBSITE',
  'REFERRAL',
  'ADVERTISEMENT',
  'COLD_CALL',
  'TRADE_SHOW',
  'PARTNER',
  'OTHER',
]

export function isClosedStatus(status: SalesLeadStatus): boolean {
  return status === 'WON' || status === 'LOST'
}

export function personName(
  person: Pick<SalesLeadPerson, 'firstName' | 'lastName'> | null | undefined
): string {
  if (!person) return ''
  return `${person.firstName} ${person.lastName}`.trim()
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('de-CH')
}

export function formatDateTime(
  value: string | Date | null | undefined
): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const RELATIVE_STEPS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
]

export function formatRelative(
  value: string | Date | null | undefined,
  locale: string
): string {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  const diff = date.getTime() - Date.now()
  if (Number.isNaN(diff)) return '-'
  const formatter = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'de', {
    numeric: 'auto',
  })
  for (const step of RELATIVE_STEPS) {
    if (Math.abs(diff) >= step.ms) {
      return formatter.format(Math.round(diff / step.ms), step.unit)
    }
  }
  return formatter.format(0, 'second')
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export type FollowUpState = 'none' | 'overdue' | 'today' | 'upcoming'

export function followUpState(
  nextFollowUp: string | null | undefined,
  status: SalesLeadStatus
): FollowUpState {
  if (!nextFollowUp || isClosedStatus(status)) return 'none'
  const due = new Date(nextFollowUp)
  if (Number.isNaN(due.getTime())) return 'none'
  const today = startOfDay(new Date())
  const dueDay = startOfDay(due)
  if (dueDay.getTime() < today.getTime()) return 'overdue'
  if (dueDay.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

export function followUpDateValue(
  nextFollowUp: string | null | undefined
): string {
  if (!nextFollowUp) return ''
  const date = new Date(nextFollowUp)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function followUpIsoFromDateValue(value: string): string | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, 9, 0, 0, 0).toISOString()
}

export function followUpIsoInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(9, 0, 0, 0)
  return date.toISOString()
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

export function mapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
