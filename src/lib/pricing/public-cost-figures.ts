/**
 * Public price figures for the /kosten page.
 *
 * Every CHF number shown on the page is derived from the same sources the
 * online calculator uses: the SolarDirect package catalog (price per kWp) and
 * the current Pronovo KLEIV rate row. Both are fetched server-side with a
 * one-hour revalidate so the page never drifts from the calculator. The
 * FALLBACK block is only used when the API is unreachable at render time and
 * mirrors the production values as of 2026-09-07.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const REVALIDATE_SECONDS = 3600

/** Swiss VAT on installations, same constant as the offer PDF templates. */
export const VAT_RATE = 0.081

export interface CostFigures {
  /** Lowest price per kWp across active SolarDirect packages, exkl. MwSt. */
  minChfPerKwp: number
  /** Highest price per kWp across active SolarDirect packages, exkl. MwSt. */
  maxChfPerKwp: number
  /** Optional EV charger add-on, flat price exkl. MwSt. */
  evChargerChf: number | null
  subsidy: {
    source: string
    validFrom: string
    tier1MaxKwp: number
    tier1ChfPerKwp: number
    tier2MaxKwp: number
    tier2ChfPerKwp: number
  }
  feedInRpPerKwh: number
  /** True when at least one value came from the fallback block. */
  usedFallback: boolean
}

export interface CostExample {
  kwp: number
  grossExVatMin: number
  grossExVatMax: number
  grossInclVatMin: number
  grossInclVatMax: number
  subsidy: number
  netMin: number
  netMax: number
}

const FALLBACK: CostFigures = {
  minChfPerKwp: 2300,
  maxChfPerKwp: 2800,
  evChargerChf: 2000,
  subsidy: {
    source: 'Pronovo KLEIV 2026 H1',
    validFrom: '2026-01-01',
    tier1MaxKwp: 30,
    tier1ChfPerKwp: 360,
    tier2MaxKwp: 100,
    tier2ChfPerKwp: 300,
  },
  feedInRpPerKwh: 6,
  usedFallback: true,
}

interface PackageRow {
  pricePerKwp: number | null
  purchasePriceChf: number | null
  availableEvCharger: { priceChf: number } | null
}

interface SubsidyRow {
  source: string
  validFrom: string
  tier1MaxKwp: number
  tier1ChfPerKwp: number
  tier2MaxKwp: number
  tier2ChfPerKwp: number
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return null
    const body = (await res.json()) as { success?: boolean; data?: T }
    return body.data ?? null
  } catch {
    return null
  }
}

export async function getCostFigures(): Promise<CostFigures> {
  const [packages, subsidy, feedIn] = await Promise.all([
    fetchJson<PackageRow[]>(
      '/api/equipment/packages?lang=de&solarModel=SOLAR_DIRECT'
    ),
    fetchJson<SubsidyRow>('/api/subsidies/current'),
    fetchJson<{ chfPerKwh: number }>('/api/feed-in-tariffs/current'),
  ])

  const perKwp = (packages ?? [])
    .map(p => p.pricePerKwp)
    .filter((v): v is number => typeof v === 'number' && v > 0)

  let usedFallback = false
  let minChfPerKwp = FALLBACK.minChfPerKwp
  let maxChfPerKwp = FALLBACK.maxChfPerKwp
  if (perKwp.length > 0) {
    minChfPerKwp = Math.min(...perKwp)
    maxChfPerKwp = Math.max(...perKwp)
  } else {
    usedFallback = true
  }

  const evPrices = (packages ?? [])
    .map(p => p.availableEvCharger?.priceChf)
    .filter((v): v is number => typeof v === 'number' && v > 0)
  const evChargerChf =
    evPrices.length > 0 ? Math.min(...evPrices) : FALLBACK.evChargerChf

  let subsidyFigures = FALLBACK.subsidy
  if (subsidy && subsidy.tier1ChfPerKwp > 0) {
    subsidyFigures = {
      source: subsidy.source,
      validFrom: subsidy.validFrom.slice(0, 10),
      tier1MaxKwp: subsidy.tier1MaxKwp,
      tier1ChfPerKwp: subsidy.tier1ChfPerKwp,
      tier2MaxKwp: subsidy.tier2MaxKwp,
      tier2ChfPerKwp: subsidy.tier2ChfPerKwp,
    }
  } else {
    usedFallback = true
  }

  let feedInRpPerKwh = FALLBACK.feedInRpPerKwh
  if (feedIn && feedIn.chfPerKwh > 0) {
    feedInRpPerKwh = Math.round(feedIn.chfPerKwh * 1000) / 10
  } else {
    usedFallback = true
  }

  return {
    minChfPerKwp,
    maxChfPerKwp,
    evChargerChf,
    subsidy: subsidyFigures,
    feedInRpPerKwh,
    usedFallback,
  }
}

/** Same marginal-tier formula as backend subsidy.service.ts. */
export function subsidyForKwp(kwp: number, s: CostFigures['subsidy']): number {
  const tier1Kwp = Math.min(kwp, s.tier1MaxKwp)
  const tier2Kwp = Math.max(
    0,
    Math.min(kwp - s.tier1MaxKwp, s.tier2MaxKwp - s.tier1MaxKwp)
  )
  return Math.round(tier1Kwp * s.tier1ChfPerKwp + tier2Kwp * s.tier2ChfPerKwp)
}

export function buildExamples(
  figures: CostFigures,
  sizesKwp: number[]
): CostExample[] {
  return sizesKwp.map(kwp => {
    const grossExVatMin = Math.round(kwp * figures.minChfPerKwp)
    const grossExVatMax = Math.round(kwp * figures.maxChfPerKwp)
    const grossInclVatMin = Math.round(grossExVatMin * (1 + VAT_RATE))
    const grossInclVatMax = Math.round(grossExVatMax * (1 + VAT_RATE))
    const subsidy = subsidyForKwp(kwp, figures.subsidy)
    return {
      kwp,
      grossExVatMin,
      grossExVatMax,
      grossInclVatMin,
      grossInclVatMax,
      subsidy,
      netMin: Math.max(0, grossInclVatMin - subsidy),
      netMax: Math.max(0, grossInclVatMax - subsidy),
    }
  })
}

/** Swiss thousands separator, e.g. 24863 -> "24'863". */
export function chf(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}
