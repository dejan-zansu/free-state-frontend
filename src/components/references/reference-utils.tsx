import type { AdminReference, AdminReferenceTranslation } from '@/types/admin'

export const REFERENCE_CONTAINER = 'max-w-[1240px] mx-auto px-6'

export const REFERENCE_SPLIT_GRID =
  'grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-x-16 xl:gap-x-[110px]'

export function pickReferenceTranslation(
  reference: AdminReference,
  locale: string
): AdminReferenceTranslation | undefined {
  return (
    reference.translations.find(tr => tr.language === locale) ||
    reference.translations.find(tr => tr.language === 'de') ||
    reference.translations[0]
  )
}

export function formatSwissNumber(value: number): string {
  return new Intl.NumberFormat('de-CH').format(value).replace(/[’ʼ´′]/g, "'")
}

export function formatMonthYear(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${month} / ${date.getUTCFullYear()}`
}

export function referenceInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}
