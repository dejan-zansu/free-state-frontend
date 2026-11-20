export const SOLAR_MODEL_KEYS = ['solar-free', 'solar-abo', 'solar-direct'] as const

export type SolarModelKey = (typeof SOLAR_MODEL_KEYS)[number]

export type SolarModelMessageKey = 'free' | 'abo' | 'direct'

export type SolarModelQuoteSource = 'SOLAR_FREE' | 'SOLAR_ABO' | 'SOLAR_DIRECT'

export type SolarModelPackageFilter = 'SOLAR_FREE' | 'SOLAR_DIRECT'

export const SOLAR_MODEL_ROWS = [
  'investment',
  'payment',
  'ownership',
  'service',
  'term',
] as const

export type SolarModelRow = (typeof SOLAR_MODEL_ROWS)[number]

interface SolarModelDefinition {
  messageKey: SolarModelMessageKey
  href: '/solar-free' | '/solar-abo' | '/solar-direct'
  quoteSource: SolarModelQuoteSource
  packageFilter: SolarModelPackageFilter
  featured: boolean
  serviceIncluded: boolean
}

export const SOLAR_MODELS: Record<SolarModelKey, SolarModelDefinition> = {
  'solar-free': {
    messageKey: 'free',
    href: '/solar-free',
    quoteSource: 'SOLAR_FREE',
    packageFilter: 'SOLAR_FREE',
    featured: true,
    serviceIncluded: true,
  },
  'solar-abo': {
    messageKey: 'abo',
    href: '/solar-abo',
    quoteSource: 'SOLAR_ABO',
    packageFilter: 'SOLAR_DIRECT',
    featured: false,
    serviceIncluded: false,
  },
  'solar-direct': {
    messageKey: 'direct',
    href: '/solar-direct',
    quoteSource: 'SOLAR_DIRECT',
    packageFilter: 'SOLAR_DIRECT',
    featured: false,
    serviceIncluded: false,
  },
}

export function isSolarModelKey(value: unknown): value is SolarModelKey {
  return (
    typeof value === 'string' &&
    (SOLAR_MODEL_KEYS as readonly string[]).includes(value)
  )
}

const PACKAGE_CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isPackageCode(value: unknown): value is string {
  return typeof value === 'string' && PACKAGE_CODE_PATTERN.test(value)
}

export function calculatorHref(model: SolarModelKey, packageCode?: string) {
  const params = new URLSearchParams({ model })
  if (packageCode && isPackageCode(packageCode)) {
    params.set('package', packageCode)
  }
  return `/calculator?${params.toString()}`
}
