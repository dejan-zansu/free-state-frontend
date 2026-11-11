const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const PV_SERVICE_INVERTER_BRANDS = [
  'SMA',
  'Fronius',
  'Huawei',
  'SolarEdge',
  'Kostal',
  'Sungrow',
  'other',
  'unknown',
] as const

export const PV_SERVICE_PACKAGE_KEYS = [
  'monitoring',
  'wartung',
  'wartung_plus',
] as const
export type PvServicePackageKey = (typeof PV_SERVICE_PACKAGE_KEYS)[number]

export const PV_SERVICE_SIZE_BAND_KEYS = [
  'up_to_30',
  '30_to_100',
  '100_to_300',
  '300_to_600',
  '600_to_1000',
  'over_1000',
] as const
export type PvServiceSizeBandKey = (typeof PV_SERVICE_SIZE_BAND_KEYS)[number]

export const PV_SERVICE_PRICE_TABLE_ID = 'richtpreis-2026-11-10'

export const PV_SERVICE_PRICE_ROWS: readonly {
  band: PvServiceSizeBandKey
  annualChf: Record<PvServicePackageKey, number> | null
  onboardingChf: number | null
}[] = [
  {
    band: 'up_to_30',
    annualChf: { monitoring: 240, wartung: 690, wartung_plus: 990 },
    onboardingChf: 390,
  },
  {
    band: '30_to_100',
    annualChf: { monitoring: 360, wartung: 990, wartung_plus: 1490 },
    onboardingChf: 390,
  },
  {
    band: '100_to_300',
    annualChf: { monitoring: 520, wartung: 1490, wartung_plus: 2290 },
    onboardingChf: 590,
  },
  {
    band: '300_to_600',
    annualChf: { monitoring: 720, wartung: 2190, wartung_plus: 3390 },
    onboardingChf: 890,
  },
  {
    band: '600_to_1000',
    annualChf: { monitoring: 920, wartung: 2990, wartung_plus: 4690 },
    onboardingChf: 890,
  },
  { band: 'over_1000', annualChf: null, onboardingChf: null },
]

export type PvServicePlant = {
  totalPowerKw: number | null
  beginningOfOperation: string | null
  registerAddress: string | null
  source: string
}

export type PvServiceEstimate = {
  plant: PvServicePlant | null
  sizeBand: {
    key: PvServiceSizeBandKey
    fromKw: number
    toKw: number | null
  } | null
  packages: { key: PvServicePackageKey; priceChf: number | null }[]
  onboardingChf: number | null
  priceTable: string
  due: {
    liabilityEnded: boolean | null
    inverterWarrantyLikelyEnded: boolean | null
    ageYears: number | null
  }
}

export type PvServiceEstimateInput = {
  lat?: number
  lng?: number
  egid?: number
  address?: string
  kw?: number
  year?: number
}

export type PvServiceEstimateResult =
  | { kind: 'ok'; data: PvServiceEstimate }
  | { kind: 'invalid' }
  | { kind: 'rate_limited' }
  | { kind: 'failed' }

function isEstimate(value: unknown): value is PvServiceEstimate {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    Array.isArray(record.packages) &&
    'plant' in record &&
    !!record.due &&
    typeof record.due === 'object'
  )
}

export async function fetchPvServiceEstimate(
  input: PvServiceEstimateInput
): Promise<PvServiceEstimateResult> {
  try {
    const response = await fetch(`${API_URL}/api/pv-service/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (response.status === 429) return { kind: 'rate_limited' }
    if (response.status === 400) return { kind: 'invalid' }
    if (!response.ok) return { kind: 'failed' }
    const body = (await response.json()) as { data?: unknown }
    const data = body.data ?? body
    return isEstimate(data) ? { kind: 'ok', data } : { kind: 'failed' }
  } catch {
    return { kind: 'failed' }
  }
}

export function startYearOf(value: string | null): number | null {
  if (!value) return null
  const match = value.match(/^(\d{4})/)
  return match ? Number(match[1]) : null
}

export function formatKw(value: number, locale: string): string {
  const rounded = Math.round(value * 10) / 10
  const [whole, fraction] = String(rounded).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  if (!fraction) return grouped
  return `${grouped}${locale === 'fr' || locale === 'it' ? ',' : '.'}${fraction}`
}
