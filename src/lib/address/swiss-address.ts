export type FetchResponseLike = {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

export type FetchLike = (
  url: string,
  init: { signal: AbortSignal }
) => Promise<FetchResponseLike>

export interface FederalOptions {
  fetch?: FetchLike
  baseUrl?: string
  signal?: AbortSignal
}

export type FederalErrorKind = 'timeout' | 'network' | 'http' | 'parse'

export class FederalRequestError extends Error {
  kind: FederalErrorKind
  status?: number

  constructor(kind: FederalErrorKind, status?: number) {
    super(`federal_${kind}`)
    this.name = 'FederalRequestError'
    this.kind = kind
    this.status = status
  }
}

export const FEDERAL_API_BASE = 'https://api3.geo.admin.ch/rest/services/api'
export const ADDRESS_LAYER = 'ch.swisstopo.amtliches-gebaeudeadressverzeichnis'
export const SEARCH_FIRST_TIMEOUT_MS = 2500
export const SEARCH_RETRY_TIMEOUT_MS = 6000
export const IDENTIFY_TIMEOUT_MS = 4000
export const MAX_QUERY_WORDS = 10
export const OUTSIDE_CH_BFS_MIN = 7000

export const CANTON_CODES = [
  'AG',
  'AI',
  'AR',
  'BE',
  'BL',
  'BS',
  'FR',
  'GE',
  'GL',
  'GR',
  'JU',
  'LU',
  'NE',
  'NW',
  'OW',
  'SG',
  'SH',
  'SO',
  'SZ',
  'TG',
  'TI',
  'UR',
  'VD',
  'VS',
  'ZG',
  'ZH',
] as const

const CANTON_SET = new Set<string>(CANTON_CODES)

export function isCantonCode(value: string): boolean {
  return CANTON_SET.has(value.toUpperCase())
}

export interface SwissAddressRow {
  featureId: string
  egid: string
  gwrId: string
  label: string
  street: string
  streets: string[]
  number: string
  noNumber: boolean
  decimal: boolean
  postalCode: string
  locality: string
  localityLabel: string
  cantonSuffix: boolean
  canton: string
  bfs: number | null
  municipality: string
  municipalityFull: string
  municipalitySuffix: boolean
  lat: number
  lng: number
  e: number
  n: number
  outsideCh: boolean
}

export interface SwissIdentifyRow {
  egid: string
  edid: string
  gwrId: string
  street: string
  streets: string[]
  number: string
  postalCode: string
  locality: string
  municipality: string
  lat: number
  lng: number
  e: number
  n: number
  distanceM: number
}

export function abortError(): Error {
  const error = new Error('Aborted')
  error.name = 'AbortError'
  return error
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function isFederalError(error: unknown): error is FederalRequestError {
  return error instanceof FederalRequestError
}

export function toFederalQuery(text: string): string {
  return text
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, MAX_QUERY_WORDS)
    .join(' ')
}

function defaultFetch(): FetchLike {
  if (typeof globalThis.fetch !== 'function') {
    return () => Promise.reject(new FederalRequestError('network'))
  }
  return (url, init) => globalThis.fetch(url, init)
}

export async function requestJson(
  url: string,
  options: FederalOptions & { timeoutMs: number }
): Promise<unknown> {
  const { signal, timeoutMs } = options
  const fetchImpl = options.fetch ?? defaultFetch()
  if (signal?.aborted) throw abortError()

  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(
    () => {
      timedOut = true
      controller.abort()
    },
    Math.max(0, timeoutMs)
  )
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    const response = await fetchImpl(url, { signal: controller.signal })
    if (!response.ok) throw new FederalRequestError('http', response.status)
    try {
      return await response.json()
    } catch (error) {
      if (signal?.aborted) throw abortError()
      if (timedOut) throw new FederalRequestError('timeout')
      if (isAbortError(error)) throw new FederalRequestError('timeout')
      throw new FederalRequestError('parse')
    }
  } catch (error) {
    if (signal?.aborted) throw abortError()
    if (timedOut) throw new FederalRequestError('timeout')
    if (isFederalError(error)) throw error
    throw new FederalRequestError('network')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
}

function stripTags(value: string): string {
  return value
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|apos|#39|#x27);/g, match => ENTITIES[match])
    .replace(/\s+/g, ' ')
    .trim()
}

export function splitStreetAlternatives(street: string): string[] {
  const parts = street
    .split(/\s+\/\s+/)
    .map(part => part.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [street.trim()]
}

const NUMBER_PATTERN = /^\d+(?:\.\d+)?[a-z]{0,4}$/i

function parseBox(value: unknown): { e: number; n: number } | null {
  if (typeof value !== 'string') return null
  const match = value.match(
    /^BOX\(\s*([\d.]+)\s+([\d.]+)\s*,\s*([\d.]+)\s+([\d.]+)\s*\)$/
  )
  if (!match) return null
  const [e1, n1, e2, n2] = match.slice(1).map(Number)
  if (![e1, n1, e2, n2].every(Number.isFinite)) return null
  if (Math.abs(e1 - e2) > 0.01 || Math.abs(n1 - n2) > 0.01) return null
  return { e: e1, n: n1 }
}

interface DetailParts {
  canton: string
  bfs: number | null
  municipality: string
  municipalityFull: string
  municipalitySuffix: boolean
  noCanton: boolean
}

function parseDetail(detail: string): DetailParts {
  const tokens = detail.trim().split(/\s+/).filter(Boolean)
  const empty: DetailParts = {
    canton: '',
    bfs: null,
    municipality: '',
    municipalityFull: '',
    municipalitySuffix: false,
    noCanton: false,
  }
  if (tokens.length < 3) return empty

  let chIndex = -1
  let canton = ''
  let noCanton = false
  if (tokens[tokens.length - 1] === 'ch') {
    chIndex = tokens.length - 1
    noCanton = true
  } else if (tokens[tokens.length - 2] === 'ch') {
    chIndex = tokens.length - 2
    canton = tokens[tokens.length - 1].toUpperCase()
  } else {
    return empty
  }

  let bfsIndex = -1
  for (let index = chIndex - 1; index >= 0; index -= 1) {
    if (/^\d+$/.test(tokens[index])) {
      bfsIndex = index
      break
    }
  }
  if (bfsIndex < 0) return { ...empty, canton, noCanton }

  const nameTokens = tokens.slice(bfsIndex + 1, chIndex)
  const suffix = nameTokens.some(token => /^_.*_$/.test(token))
  const municipality = nameTokens
    .filter(token => !/^_.*_$/.test(token))
    .join(' ')
  const municipalityFull = nameTokens
    .map(token => token.replace(/^_(.*)_$/, '$1'))
    .join(' ')
  return {
    canton,
    bfs: Number(tokens[bfsIndex]),
    municipality,
    municipalityFull,
    municipalitySuffix: suffix,
    noCanton,
  }
}

export function isOutsideCh(row: SwissAddressRow): boolean {
  return row.outsideCh
}

export function parseSearchRow(raw: unknown): SwissAddressRow | null {
  if (!raw || typeof raw !== 'object') return null
  const attrs = (raw as { attrs?: Record<string, unknown> }).attrs
  if (!attrs || typeof attrs !== 'object') return null
  if (typeof attrs.origin === 'string' && attrs.origin !== 'address') {
    return null
  }
  const rawLabel = typeof attrs.label === 'string' ? attrs.label : ''
  if (!rawLabel.includes('<b>')) return null

  const [streetPart, placePart = ''] = rawLabel.split('<b>')
  const left = stripTags(streetPart)
  const right = stripTags(placePart)
  if (!left || !right) return null

  const leftTokens = left.split(' ')
  const last = leftTokens[leftTokens.length - 1] ?? ''
  let number = ''
  let street = left
  if (last === '#' || NUMBER_PATTERN.test(last)) {
    number = last.toLowerCase()
    street = leftTokens.slice(0, -1).join(' ').trim()
  }
  if (!street) return null
  const noNumber = number === '' || number === '#'
  const decimal = !noNumber && /^\d+\.\d+/.test(number)

  const placeTokens = right.split(' ')
  const postalCode = /^\d{4}$/.test(placeTokens[0] ?? '') ? placeTokens[0] : ''
  const localityLabel = (postalCode ? placeTokens.slice(1) : placeTokens)
    .join(' ')
    .trim()
  const suffixMatch = localityLabel.match(/^(.+?)\s+([A-Z]{2})$/)
  const cantonSuffix = !!suffixMatch && isCantonCode(suffixMatch[2])
  const locality = cantonSuffix && suffixMatch ? suffixMatch[1] : localityLabel

  const detail = typeof attrs.detail === 'string' ? attrs.detail : ''
  const parts = parseDetail(detail)
  const canton =
    parts.canton || (cantonSuffix && suffixMatch ? suffixMatch[2] : '')

  const featureId = typeof attrs.featureId === 'string' ? attrs.featureId : ''
  const egid = /^\d+_\d+$/.test(featureId) ? featureId.split('_')[0] : ''

  const lat = Number(attrs.lat)
  const lng = Number(attrs.lon)
  const box = parseBox(attrs.geom_st_box2d)
  const e = box ? box.e : Number(attrs.y)
  const n = box ? box.n : Number(attrs.x)
  if (![lat, lng, e, n].every(Number.isFinite)) return null

  const outsideCh =
    parts.noCanton || (parts.bfs !== null && parts.bfs >= OUTSIDE_CH_BFS_MIN)

  return {
    featureId,
    egid,
    gwrId: egid ? featureId : '',
    label: `${left} ${right}`,
    street,
    streets: splitStreetAlternatives(street),
    number: noNumber ? '' : number,
    noNumber,
    decimal,
    postalCode,
    locality,
    localityLabel,
    cantonSuffix,
    canton,
    bfs: parts.bfs,
    municipality: parts.municipality,
    municipalityFull: parts.municipalityFull,
    municipalitySuffix: parts.municipalitySuffix,
    lat,
    lng,
    e,
    n,
    outsideCh,
  }
}

export function searchUrl(text: string, limit: number, baseUrl?: string) {
  const params = new URLSearchParams({
    searchText: toFederalQuery(text),
    type: 'locations',
    origins: 'address',
    limit: String(Math.min(Math.max(Math.round(limit), 1), 50)),
    sr: '2056',
  })
  return `${baseUrl ?? FEDERAL_API_BASE}/SearchServer?${params.toString()}`
}

export async function searchOnce(
  text: string,
  options: FederalOptions & { limit?: number; timeoutMs?: number } = {}
): Promise<SwissAddressRow[]> {
  const query = toFederalQuery(text)
  if (!query) return []
  const json = await requestJson(
    searchUrl(query, options.limit ?? 10, options.baseUrl),
    {
      ...options,
      timeoutMs: options.timeoutMs ?? SEARCH_FIRST_TIMEOUT_MS,
    }
  )
  const results = (json as { results?: unknown })?.results
  if (!Array.isArray(results)) throw new FederalRequestError('parse')
  return results
    .map(parseSearchRow)
    .filter((row): row is SwissAddressRow => row !== null)
}

export async function search(
  text: string,
  options: FederalOptions & { limit?: number; timeouts?: number[] } = {}
): Promise<SwissAddressRow[]> {
  const timeouts = options.timeouts ?? [
    SEARCH_FIRST_TIMEOUT_MS,
    SEARCH_RETRY_TIMEOUT_MS,
  ]
  let lastError: unknown = new FederalRequestError('network')
  for (const timeoutMs of timeouts) {
    try {
      return await searchOnce(text, { ...options, timeoutMs })
    } catch (error) {
      if (isAbortError(error)) throw error
      if (isFederalError(error) && error.kind === 'http') {
        if (error.status !== undefined && error.status < 500) throw error
      }
      lastError = error
    }
  }
  throw lastError
}

export function wgs84ToLv95(
  lat: number,
  lng: number
): { e: number; n: number } {
  const latAux = (lat * 3600 - 169028.66) / 10000
  const lngAux = (lng * 3600 - 26782.5) / 10000
  const e =
    2600072.37 +
    211455.93 * lngAux -
    10938.51 * lngAux * latAux -
    0.36 * lngAux * latAux * latAux -
    44.54 * lngAux * lngAux * lngAux
  const n =
    1200147.07 +
    308807.95 * latAux +
    3745.25 * lngAux * lngAux +
    76.63 * latAux * latAux -
    194.56 * lngAux * lngAux * latAux +
    119.79 * latAux * latAux * latAux
  return { e: Math.round(e * 100) / 100, n: Math.round(n * 100) / 100 }
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const meanLat = ((a.lat + b.lat) / 2) * rad
  const x = dLng * Math.cos(meanLat)
  return Math.sqrt(x * x + dLat * dLat) * 6371008.8
}

export function identifyUrl(
  lat: number,
  lng: number,
  radiusM: number,
  baseUrl?: string
) {
  const radius = Math.max(1, Math.round(radiusM))
  const dLat = radius / 111320
  const dLng = radius / (111320 * Math.cos((lat * Math.PI) / 180))
  const params = new URLSearchParams({
    geometryType: 'esriGeometryPoint',
    geometry: `${lng},${lat}`,
    sr: '4326',
    layers: `all:${ADDRESS_LAYER}`,
    returnGeometry: 'true',
    tolerance: String(radius),
    imageDisplay: `${radius * 2},${radius * 2},96`,
    mapExtent: [lng - dLng, lat - dLat, lng + dLng, lat + dLat]
      .map(value => value.toFixed(7))
      .join(','),
    lang: 'de',
  })
  return `${baseUrl ?? FEDERAL_API_BASE}/MapServer/identify?${params.toString()}`
}

function parseIdentifyRow(
  raw: unknown,
  origin: { lat: number; lng: number }
): SwissIdentifyRow | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as {
    geometry?: { x?: unknown; y?: unknown }
    attributes?: Record<string, unknown>
  }
  const attributes = item.attributes
  if (!attributes) return null
  const lng = Number(item.geometry?.x)
  const lat = Number(item.geometry?.y)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const egid = attributes.bdg_egid
  const edid = attributes.adr_edid
  if (egid === null || egid === undefined || egid === '') return null
  const street =
    typeof attributes.stn_label === 'string' ? attributes.stn_label : ''
  const number =
    typeof attributes.adr_number === 'string' ||
    typeof attributes.adr_number === 'number'
      ? String(attributes.adr_number).trim().toLowerCase()
      : ''
  const zip =
    typeof attributes.zip_label === 'string' ? attributes.zip_label : ''
  const zipMatch = zip.match(/^(\d{4})\s*(.*)$/)
  const lv95 = wgs84ToLv95(lat, lng)
  const edidText =
    edid === null || edid === undefined || edid === '' ? '0' : String(edid)
  return {
    egid: String(egid),
    edid: edidText,
    gwrId: `${String(egid)}_${edidText}`,
    street,
    streets: splitStreetAlternatives(street),
    number,
    postalCode: zipMatch ? zipMatch[1] : '',
    locality: zipMatch ? zipMatch[2].trim() : zip,
    municipality:
      typeof attributes.com_name === 'string' ? attributes.com_name : '',
    lat,
    lng,
    e: lv95.e,
    n: lv95.n,
    distanceM: distanceMeters(origin, { lat, lng }),
  }
}

export async function identifyAddresses(
  lat: number,
  lng: number,
  radiusM: number,
  options: FederalOptions & { timeoutMs?: number } = {}
): Promise<SwissIdentifyRow[]> {
  const json = await requestJson(
    identifyUrl(lat, lng, radiusM, options.baseUrl),
    { ...options, timeoutMs: options.timeoutMs ?? IDENTIFY_TIMEOUT_MS }
  )
  const results = (json as { results?: unknown })?.results
  if (!Array.isArray(results)) throw new FederalRequestError('parse')
  return results
    .map(result => parseIdentifyRow(result, { lat, lng }))
    .filter((row): row is SwissIdentifyRow => row !== null)
    .filter(row => row.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM)
}
