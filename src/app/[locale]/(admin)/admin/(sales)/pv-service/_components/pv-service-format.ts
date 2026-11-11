import type {
  PvServiceRequestAssignee,
  PvServiceRequestStatus,
} from '@/types/pv-service'

export const PV_SERVICE_QUERY_KEY = ['admin', 'pv-service'] as const

export const PV_SERVICE_STATUS_CLASS: Partial<
  Record<PvServiceRequestStatus, string>
> = {
  OFFER_SENT: 'bg-purple-100 text-purple-700',
}

const numberFormat = new Intl.NumberFormat('de-CH', {
  maximumFractionDigits: 2,
})

const chfFormat = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatChf(value: number): string {
  return `CHF ${chfFormat.format(value)}`
}

export function formatKw(value: number | null): string | null {
  return value === null ? null : `${formatNumber(value)} kWp`
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('de-CH')
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('de-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function assigneeName(
  assignee: PvServiceRequestAssignee | null
): string | null {
  if (!assignee) return null
  const name = [assignee.firstName, assignee.lastName].filter(Boolean).join(' ')
  return name || assignee.email
}
