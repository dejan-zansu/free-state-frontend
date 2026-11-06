export const CONTACT_ENTITY_TYPES = [
  'roof_renovation',
  'offer_request',
  'company',
  'private',
] as const

interface EntityTypeTranslator {
  (key: string): string
  has: (key: string) => boolean
}

export function contactEntityTypeLabel(
  t: EntityTypeTranslator,
  entityType: string | null
): string {
  if (!entityType) return '-'
  const key = `entityTypes.${entityType}`
  return t.has(key) ? t(key) : entityType
}
