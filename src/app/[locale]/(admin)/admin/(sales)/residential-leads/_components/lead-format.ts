import { useLocale } from 'next-intl'

import { STATUS_COLORS } from '@/components/admin/StatusBadge'
import { personName } from '@/lib/sales-lead'
import type { SalesLeadListItem } from '@/types/sales-lead'

const countFormatter = new Intl.NumberFormat('de-CH')
const kwpFormatter = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const chfFormatter = new Intl.NumberFormat('de-CH', {
  maximumFractionDigits: 0,
})

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function formatCount(value: unknown): string | null {
  const parsed = toFiniteNumber(value)
  return parsed === null ? null : countFormatter.format(parsed)
}

export function formatKwp(value: unknown): string | null {
  const parsed = toFiniteNumber(value)
  return parsed === null || parsed <= 0 ? null : kwpFormatter.format(parsed)
}

export function formatChf(value: unknown): string | null {
  const parsed = toFiniteNumber(value)
  return parsed === null || parsed <= 0 ? null : chfFormatter.format(parsed)
}

export function statusDotClass(status: string): string {
  const textClass = (STATUS_COLORS[status] ?? '')
    .split(' ')
    .find(token => token.startsWith('text-'))
  return textClass ?? 'text-gray-700'
}

export function useRelativeLocale(): string {
  const locale = useLocale()
  return locale === 'en' ? 'en' : 'de'
}

export function leadHref(locale: string, id: string): string {
  return `/${locale}/admin/residential-leads/${id}`
}

export function customerDisplayName(
  user: SalesLeadListItem['customer']['user'],
  fallback: string
): string {
  return personName(user) || user.email || fallback
}

export function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(
      'a, button, input, select, textarea, label, [role="combobox"], [role="button"]'
    ) !== null
  )
}
