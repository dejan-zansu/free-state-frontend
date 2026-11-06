const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const BASE = `${API_URL}/api/public/roof-renovation`

export type RoofSuggestion = {
  label: string
  egid: number
  edid: number
  x: number
  y: number
}

export type RoofSegment =
  | 'house'
  | 'multi_family'
  | 'hall'
  | 'farm'
  | 'commercial'
  | 'special'
  | 'other'
export type RoofForm = 'steep' | 'flat' | 'mixed' | 'shed'
export type RoofDisplay =
  | 'market_reference'
  | 'per_m2'
  | 'visit_only'
  | 'young_roof'
export type RoofVisitReason =
  | 'shared_roof'
  | 'flat_small'
  | 'farm'
  | 'shed'
  | 'mixed'
  | 'oversized_unanswered'
  | 'no_roof_data'
  | 'high_rise'
  | 'other'
export type RoofCoverAnswer = 'tile' | 'fibre_cement' | 'metal' | 'unknown'
export type RoofQuestion = 'cover_material' | 'whole_roof'
export type RoofSubsidyCondition =
  | 'u_value'
  | 'apply_before_start'
  | 'built_before_2000'
  | 'requires_pv'

export type RoofPriceExclusion = 'scaffold_scope' | 'planning' | 'pah_bitumen'

export type RoofPrice = {
  vat: 'incl'
  scope: 'full_rebuild'
  perM2Low: number
  perM2High: number
  perM2LowExclVat: number
  perM2HighExclVat: number
  exclusions: RoofPriceExclusion[]
}

export type RoofMarketReference =
  | {
      kind: 'chf_job'
      p25: number
      median: number
      p75: number
      n: number
      scope: 'with_insulation'
    }
  | { kind: 'chf_m2'; p25: number; median: number; p75: number; n: number }

export type RoofSubsidy = {
  status: 'estimated' | 'not_eligible' | 'not_checked'
  chfLow: number | null
  chfHigh: number | null
  rateChfPerM2: number | null
  conditions: RoofSubsidyCondition[]
}

export type RoofEstimateOk = {
  status: 'ok'
  building: {
    egid: number
    label: string | null
    canton: string | null
    municipality: string | null
    buildingYear: number | null
    class: number | null
    segment: RoofSegment
    dwellings: number | null
    x: number | null
    y: number | null
  }
  roof: {
    areaM2: number | null
    form: RoofForm | null
    meanTiltDeg: number | null
    flatShare: number | null
    source:
      | 'sonnendach_egid'
      | 'sonnendach_centroid'
      | 'sonnendach_split'
      | 'none'
    shared: boolean
    oversized: boolean
  }
  display: RoofDisplay
  reason: RoofVisitReason | null
  price: RoofPrice | null
  marketReference: RoofMarketReference | null
  subsidy: RoofSubsidy | null
  asbestosCheck: boolean
  existingPv: { kw: number | null; startYear: number | null } | null
  pvPotential: { kwp: number; kwhYear: number } | null
  questions: RoofQuestion[]
  priceTableVersion: string
  sources: Array<'sonnendach' | 'gwr' | 'pv_register'>
}

export type RoofEstimateResponse =
  | RoofEstimateOk
  | { status: 'not_found' | 'lookup_failed' }

export type RoofApiResult<T> =
  | { kind: 'ok'; data: T }
  | { kind: 'disabled' }
  | { kind: 'rate_limited' }
  | { kind: 'failed' }

export type RoofAnswers = {
  coverAnswer?: RoofCoverAnswer
  wholeRoof?: boolean
}

async function readResult<T>(response: Response): Promise<RoofApiResult<T>> {
  if (response.status === 404) return { kind: 'disabled' }
  if (response.status === 429) return { kind: 'rate_limited' }
  if (!response.ok) return { kind: 'failed' }
  const body = (await response.json()) as { data?: T }
  return body.data === undefined
    ? { kind: 'failed' }
    : { kind: 'ok', data: body.data }
}

export async function isRoofEstimatorEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE}/suggest?q=ab`)
    return response.status !== 404
  } catch {
    return true
  }
}

export async function suggestRoofAddress(
  query: string,
  signal: AbortSignal
): Promise<RoofApiResult<RoofSuggestion[]>> {
  const response = await fetch(
    `${BASE}/suggest?q=${encodeURIComponent(query)}`,
    { signal }
  )
  return readResult<RoofSuggestion[]>(response)
}

export async function fetchRoofEstimate(
  row: RoofSuggestion,
  answers: RoofAnswers
): Promise<RoofApiResult<RoofEstimateResponse>> {
  try {
    const response = await fetch(`${BASE}/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        egid: row.egid,
        edid: row.edid,
        x: row.x,
        y: row.y,
        ...answers,
      }),
    })
    return await readResult<RoofEstimateResponse>(response)
  } catch {
    return { kind: 'failed' }
  }
}

export function formatChf(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

export function formatDecimal(value: number, locale: string): string {
  const text = String(Math.round(value * 10) / 10)
  return locale === 'fr' || locale === 'it' ? text.replace('.', ',') : text
}

export function parseAddressLabel(
  label: string
): { street: string; postalCode: string; city: string } | null {
  const match = label.match(/^(.+?),\s*(\d{4})\s+(.+)$/)
  if (!match) return null
  return {
    street: match[1].trim(),
    postalCode: match[2],
    city: match[3].trim(),
  }
}

export function aerialImageUrl(
  x: number,
  y: number,
  areaM2: number | null
): string {
  const half = Math.round(
    Math.min(180, Math.max(30, Math.sqrt(areaM2 ?? 200) * 1.6))
  )
  const easting = Math.round(x)
  const northing = Math.round(y)
  const bbox = `${easting - half},${northing - half},${easting + half},${northing + half}`
  return `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ch.swisstopo.swissimage&STYLES=&CRS=EPSG:2056&BBOX=${bbox}&WIDTH=800&HEIGHT=800&FORMAT=image/jpeg`
}
