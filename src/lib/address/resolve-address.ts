import {
  type FederalOptions,
  type FetchLike,
  type SwissAddressRow,
  MAX_QUERY_WORDS,
  SEARCH_FIRST_TIMEOUT_MS,
  SEARCH_RETRY_TIMEOUT_MS,
  abortError,
  distanceMeters,
  isAbortError,
  isCantonCode,
  searchOnce,
} from './swiss-address'

export type ResolveTrigger =
  | 'notChosen'
  | 'textEntered'
  | 'pendingTimeout'
  | 'prefill'
  | 'federalMode'

export type ResolveOutcome =
  | 'resolved'
  | 'candidates'
  | 'houseNumber'
  | 'notInRegister'
  | 'needLocality'
  | 'needStreet'
  | 'notFound'
  | 'networkError'
  | 'outsideCh'

export type ResolveProvider = 'federal' | 'geocoder' | null

export interface GeocoderAddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export type LatLngLike =
  | { lat(): number; lng(): number }
  | { lat: number; lng: number }

export interface GeocoderResultLike {
  address_components?: GeocoderAddressComponent[]
  formatted_address?: string
  geometry?: { location?: LatLngLike; location_type?: string }
  partial_match?: boolean
  types?: string[]
}

export type Geocoder = (
  address: string,
  options: { signal?: AbortSignal }
) => Promise<GeocoderResultLike[]>

export interface GeocodeServiceLike {
  geocode(request: {
    address: string
    componentRestrictions?: { country: string }
  }): Promise<{ results: GeocoderResultLike[] }>
}

export interface ResolvedAddress {
  street: string
  streetNumber: string
  postalCode: string
  city: string
  canton: string
  formatted: string
  lat: number
  lng: number
  egid: string | null
  gwrId: string | null
  e: number | null
  n: number | null
  provider: 'federal' | 'geocoder'
}

export interface AddressCandidate {
  row: SwissAddressRow
  street: string
  label: string
  address: ResolvedAddress
}

export interface StreetContext {
  street: string
  postalCode: string
  city: string
  canton: string
}

export interface HouseNumberChip {
  number: string
  label: string
  row: SwissAddressRow
  address: ResolvedAddress
}

export interface ResolveResult {
  outcome: ResolveOutcome
  provider: ResolveProvider
  trigger: ResolveTrigger
  address?: ResolvedAddress
  row?: SwissAddressRow
  candidates?: AddressCandidate[]
  street?: StreetContext
  typedNumber?: string
  chips?: HouseNumberChip[]
  point?: { lat: number; lng: number }
  precision?: 'street'
  federalRows: number
  ms: number
}

export interface ResolverDeps {
  fetch?: FetchLike
  baseUrl?: string
  isOnline?: () => boolean
  now?: () => number
}

export interface ResolveOptions {
  trigger: ResolveTrigger
  geocoder?: Geocoder
  signal?: AbortSignal
}

export const GEOCODER_TIMEOUT_MS = 3000
export const RESOLVE_BUDGET_MS = 8500
export const MAX_CANDIDATES = 5
export const MAX_CHIPS = 12
export const LIVE_CHIP_LIMIT = 20
export const ALL_CHIP_LIMIT = 50
const VERIFY_TIMEOUT_MS = SEARCH_FIRST_TIMEOUT_MS
const MIN_CALL_MS = 400
const NEAR_STREET_MIN_LETTERS = 8
const NEAR_STREET_MAX_DISTANCE = 2

const COUNTRY_WORDS = new Set(['schweiz', 'switzerland', 'suisse', 'svizzera'])

export function cleanAddressQuery(text: string): string {
  const value = text
    .replace(/,/g, ' ')
    .replace(/(^|\s)CH-(?=\d)/gi, '$1')
    .replace(
      /([A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff]\.?)(\d)/g,
      '$1 $2'
    )
    .replace(/(^|\s)(\d+)\s+([A-Za-z])(?=\s|$)/g, '$1$2$3')
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => {
      const lower = word.toLowerCase()
      return (
        !COUNTRY_WORDS.has(lower.replace(/[.;:!?]+$/, '')) && lower !== 'ch'
      )
    })
    .map(word => (/^sankt$/i.test(word) ? 'St.' : word))
    .slice(0, MAX_QUERY_WORDS)
    .join(' ')
}

const COMPOUND_STREET = /^(.{3,}?)(strasse|gasse|weg|platz)$/i

export function splitCompoundQuery(cleaned: string): string | null {
  let changed = false
  const words = cleaned.split(' ').map(word => {
    const match = word.match(COMPOUND_STREET)
    if (!match || /[-.]$/.test(match[1])) return word
    changed = true
    return `${match[1]} ${match[2]}`
  })
  if (!changed) return null
  return words.join(' ').split(' ').slice(0, MAX_QUERY_WORDS).join(' ')
}

function mergeRows(
  first: SwissAddressRow[],
  second: SwissAddressRow[]
): SwissAddressRow[] {
  const seen = new Set(first.map(row => row.featureId || row.label))
  return [
    ...first,
    ...second.filter(row => !seen.has(row.featureId || row.label)),
  ]
}

const FOLD_TOKENS: Record<string, string> = {
  sankt: 'st',
  saint: 'st',
  st: 'st',
  sainte: 'ste',
  ste: 'ste',
  av: 'avenue',
  ave: 'avenue',
  ch: 'chemin',
  rte: 'route',
  bd: 'boulevard',
}

export function fold(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u00df/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[\s\-\u2010-\u2015.'\u2018\u2019`\u00b4()"\u00ab\u00bb_,;:]+/)
    .filter(Boolean)
    .map(part => {
      const mapped = FOLD_TOKENS[part]
      if (mapped) return mapped
      if (part.endsWith('str')) return `${part}asse`
      return part
    })
    .join('')
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
}

export function normalizeHouseNumber(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,;:]+$/, '')
}

const NUMBER_TOKEN = /^\d+(?:\.\d+)?[a-z]{0,3}$/

function isPostcodeShaped(value: string): boolean {
  if (!/^\d{4}$/.test(value)) return false
  const code = Number(value)
  return code >= 1000 && code <= 9699
}

export interface AddressToken {
  raw: string
  value: string
  index: number
  isNumber: boolean
  isPostcode: boolean
}

export interface WordRun {
  start: number
  end: number
  folded: string
}

export interface AddressAnalysis {
  cleaned: string
  tokens: AddressToken[]
  numberTokens: string[]
  postcodeTokens: string[]
  houseNumbers: string[]
  houseNumberTyped: boolean
  postcodeTyped: boolean
  runs: WordRun[]
  runFolds: Set<string>
}

export function analyseAddress(cleaned: string): AddressAnalysis {
  const tokens: AddressToken[] = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((raw, index) => {
      const value = raw.toLowerCase().replace(/[.,;:!?]+$/, '')
      const isNumber = NUMBER_TOKEN.test(value)
      return {
        raw,
        value,
        index,
        isNumber,
        isPostcode: isNumber && isPostcodeShaped(value),
      }
    })

  const numberTokens = tokens.filter(token => token.isNumber)
  const postcodeTokens = numberTokens.filter(token => token.isPostcode)
  const plainNumbers = numberTokens.filter(token => !token.isPostcode)
  const houseNumbers =
    plainNumbers.length > 0
      ? plainNumbers.map(token => token.value)
      : postcodeTokens.length >= 2
        ? postcodeTokens.map(token => token.value)
        : []

  const runs: WordRun[] = []
  let segmentStart = -1
  const flushSegment = (end: number) => {
    if (segmentStart < 0) return
    for (let start = segmentStart; start < end; start += 1) {
      for (let stop = start + 1; stop <= Math.min(end, start + 5); stop += 1) {
        const folded = fold(
          tokens
            .slice(start, stop)
            .map(token => token.raw)
            .join(' ')
        )
        if (folded) runs.push({ start, end: stop, folded })
      }
    }
    segmentStart = -1
  }
  tokens.forEach((token, index) => {
    if (token.isNumber) flushSegment(index)
    else if (segmentStart < 0) segmentStart = index
  })
  flushSegment(tokens.length)

  return {
    cleaned,
    tokens,
    numberTokens: numberTokens.map(token => token.value),
    postcodeTokens: postcodeTokens.map(token => token.value),
    houseNumbers,
    houseNumberTyped: houseNumbers.length > 0,
    postcodeTyped: postcodeTokens.length > 0,
    runs,
    runFolds: new Set(runs.map(run => run.folded)),
  }
}

export function editDistance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  const rows = a.length + 1
  const cols = b.length + 1
  const table: number[][] = Array.from({ length: rows }, () =>
    new Array<number>(cols).fill(0)
  )
  for (let i = 0; i < rows; i += 1) table[i][0] = i
  for (let j = 0; j < cols; j += 1) table[0][j] = j
  for (let i = 1; i < rows; i += 1) {
    let rowMin = Infinity
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      let value = Math.min(
        table[i - 1][j] + 1,
        table[i][j - 1] + 1,
        table[i - 1][j - 1] + cost
      )
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, table[i - 2][j - 2] + 1)
      }
      table[i][j] = value
      rowMin = Math.min(rowMin, value)
    }
    if (rowMin > max) return max + 1
  }
  return table[a.length][b.length]
}

interface PlaceNames {
  exact: Set<string>
  loose: Set<string>
  all: string[]
}

const placeNameCache = new WeakMap<SwissAddressRow, PlaceNames>()

function placeNames(row: SwissAddressRow): PlaceNames {
  const cached = placeNameCache.get(row)
  if (cached) return cached
  const exact = new Set<string>()
  const loose = new Set<string>()
  const add = (set: Set<string>, value: string) => {
    const folded = fold(value)
    if (folded) set.add(folded)
  }
  const halves = (value: string) =>
    value
      .split('/')
      .map(part => part.trim())
      .filter(Boolean)
  const baseName = (value: string) =>
    value
      .replace(/\s*\(.*\)\s*$/, '')
      .replace(/\s+(b\.|bei)\s+.*$/i, '')
      .trim()

  add(exact, row.localityLabel)
  if (row.cantonSuffix) {
    add(loose, row.locality)
    halves(row.locality).forEach(part => add(loose, part))
  } else {
    add(exact, row.locality)
    halves(row.locality).forEach(part => add(exact, part))
  }
  const localityBase = baseName(row.locality)
  if (localityBase && localityBase !== row.locality) add(loose, localityBase)

  if (row.municipalityFull) {
    add(loose, row.municipalityFull)
    add(loose, row.municipality)
    halves(row.municipality).forEach(part => add(loose, part))
  }

  exact.forEach(name => loose.add(name))
  const names = { exact, loose, all: Array.from(loose) }
  placeNameCache.set(row, names)
  return names
}

function overlaps(a: [number, number], b: WordRun): boolean {
  return a[0] < b.end && b.start < a[1]
}

export interface ClassifiedRow {
  row: SwissAddressRow
  streetExact: boolean
  streetNear: boolean
  street: string
  streetSpan: [number, number] | null
  numberMatch: boolean
  placeWord: boolean
  placeNamed: boolean
  placeExact: boolean
  placeLoose: boolean
  placeRelated: boolean
  exact: boolean
  near: boolean
  sameStreet: boolean
}

export function classifyRow(
  row: SwissAddressRow,
  analysis: AddressAnalysis
): ClassifiedRow {
  let streetExact = false
  let streetNear = false
  let street = row.streets[0] ?? row.street
  let streetSpan: [number, number] | null = null

  for (const alternative of row.streets) {
    const folded = fold(alternative)
    const run = analysis.runs.find(item => item.folded === folded)
    if (run) {
      streetExact = true
      street = alternative
      streetSpan = [run.start, run.end]
      break
    }
  }
  if (!streetExact) {
    let best = NEAR_STREET_MAX_DISTANCE + 1
    for (const alternative of row.streets) {
      const folded = fold(alternative)
      if (folded.replace(/[^a-z]/g, '').length < NEAR_STREET_MIN_LETTERS) {
        continue
      }
      for (const run of analysis.runs) {
        const distance = editDistance(
          run.folded,
          folded,
          NEAR_STREET_MAX_DISTANCE
        )
        if (distance < best) {
          best = distance
          street = alternative
          streetSpan = [run.start, run.end]
        }
      }
    }
    streetNear = best <= NEAR_STREET_MAX_DISTANCE
    if (!streetNear) streetSpan = null
  }

  const remaining = [...analysis.numberTokens]
  const postcodeIndex = remaining.indexOf(row.postalCode)
  const postcodeMatch =
    !!row.postalCode && analysis.postcodeTokens.includes(row.postalCode)
  if (postcodeMatch && postcodeIndex >= 0) remaining.splice(postcodeIndex, 1)
  const numberMatch =
    !row.noNumber && !!row.number && remaining.includes(row.number)

  const names = placeNames(row)
  const placeRuns = analysis.runs.filter(
    run => !streetSpan || !overlaps(streetSpan, run)
  )
  const placeWord = placeRuns.some(run => names.exact.has(run.folded))
  const placeNamed =
    placeWord || placeRuns.some(run => names.loose.has(run.folded))
  const placeExact = postcodeMatch || placeWord
  const placeLoose =
    placeExact || placeRuns.some(run => names.loose.has(run.folded))
  const placeRelated =
    placeLoose ||
    placeRuns.some(run =>
      names.all.some(
        name =>
          (run.folded.length >= 4 && name.startsWith(run.folded)) ||
          (run.folded.length >= 5 && editDistance(run.folded, name, 2) <= 2)
      )
    )

  const streetMatch = streetExact || streetNear
  const exact = streetExact && numberMatch && placeExact
  return {
    row,
    streetExact,
    streetNear,
    street,
    streetSpan,
    numberMatch,
    placeWord,
    placeNamed,
    placeExact,
    placeLoose,
    placeRelated,
    exact,
    near: streetMatch && numberMatch && !exact,
    sameStreet: streetMatch && !numberMatch && placeExact,
  }
}

export function addressFromRow(
  row: SwissAddressRow,
  preferredStreet?: string
): ResolvedAddress {
  const street =
    preferredStreet && row.streets.includes(preferredStreet)
      ? preferredStreet
      : (row.streets[0] ?? row.street)
  return {
    street,
    streetNumber: row.number,
    postalCode: row.postalCode,
    city: row.locality,
    canton: row.canton,
    formatted: `${street} ${row.number}, ${row.postalCode} ${row.locality}`,
    lat: row.lat,
    lng: row.lng,
    egid: row.egid || null,
    gwrId: row.gwrId || null,
    e: row.e,
    n: row.n,
    provider: 'federal',
  }
}

export function candidateFromRow(
  row: SwissAddressRow,
  preferredStreet?: string
): AddressCandidate {
  const address = addressFromRow(row, preferredStreet)
  return {
    row,
    street: address.street,
    label: `${address.street} ${row.number}, ${row.postalCode} ${row.localityLabel}`,
    address,
  }
}

function addressKey(row: SwissAddressRow): string {
  return `${fold(row.streets[0] ?? row.street)}|${row.number}|${row.postalCode}|${fold(row.locality)}`
}

function inLocality(row: SwissAddressRow, city: string): boolean {
  const target = fold(city)
  return (
    !!target &&
    (fold(row.locality) === target || fold(row.localityLabel) === target)
  )
}

function preferLocality(
  rows: SwissAddressRow[],
  city: string | undefined
): SwissAddressRow[] {
  if (!city) return rows
  const local = rows.filter(row => inLocality(row, city))
  return local.length > 0 ? local : rows
}

export function streetMatches(row: SwissAddressRow, street: string): boolean {
  const target = fold(street)
  return (
    !!target && row.streets.some(alternative => fold(alternative) === target)
  )
}

export function matchingStreet(row: SwissAddressRow, street: string): string {
  const target = fold(street)
  return (
    row.streets.find(alternative => fold(alternative) === target) ??
    row.streets[0] ??
    row.street
  )
}

export function findExactRow(
  rows: SwissAddressRow[],
  street: string,
  number: string,
  postalCode: string,
  prefer: { city?: string; near?: { lat: number; lng: number } } = {}
): SwissAddressRow | null {
  const wanted = normalizeHouseNumber(number)
  const matches = preferLocality(
    rows.filter(
      row =>
        !row.noNumber &&
        !row.outsideCh &&
        row.number === wanted &&
        row.postalCode === postalCode &&
        streetMatches(row, street)
    ),
    prefer.city
  )
  const near = prefer.near
  if (near && matches.length > 1) {
    return [...matches].sort(
      (a, b) => distanceMeters(near, a) - distanceMeters(near, b)
    )[0]
  }
  return matches[0] ?? null
}

export function compareHouseNumbers(a: string, b: string): number {
  const left = a.match(/^(\d+)(.*)$/)
  const right = b.match(/^(\d+)(.*)$/)
  if (left && right) {
    const difference = Number(left[1]) - Number(right[1])
    if (difference !== 0) return difference
    return left[2].localeCompare(right[2])
  }
  return a.localeCompare(b)
}

function numericPart(value: string): number {
  const match = value.match(/^(\d+)/)
  return match ? Number(match[1]) : Number.NaN
}

export function selectHouseNumberChips(
  rows: SwissAddressRow[],
  options: {
    street: string
    postalCode: string
    city?: string
    typed?: string
    order?: 'prefix' | 'distance'
  }
): HouseNumberChip[] {
  const typed = normalizeHouseNumber(options.typed ?? '')
  const seen = new Set<string>()
  const matching = preferLocality(
    rows.filter(row => {
      if (row.noNumber || row.outsideCh) return false
      if (row.postalCode !== options.postalCode) return false
      if (!streetMatches(row, options.street)) return false
      return !row.decimal || typed.includes('.')
    }),
    options.city
  ).filter(row => {
    if (seen.has(row.number)) return false
    seen.add(row.number)
    return true
  })

  let picked = matching
  if (options.order === 'distance' && typed) {
    const target = numericPart(typed)
    if (Number.isFinite(target)) {
      picked = [...matching]
        .sort((a, b) => {
          const difference =
            Math.abs(numericPart(a.number) - target) -
            Math.abs(numericPart(b.number) - target)
          return difference !== 0
            ? difference
            : compareHouseNumbers(a.number, b.number)
        })
        .slice(0, MAX_CHIPS)
    }
  } else if (typed) {
    const prefixed = matching.filter(row => row.number.startsWith(typed))
    if (prefixed.length > 0) picked = prefixed
  }

  return picked
    .slice(0, MAX_CHIPS)
    .sort((a, b) => compareHouseNumbers(a.number, b.number))
    .map(row => {
      const address = addressFromRow(row, matchingStreet(row, options.street))
      return {
        number: row.number,
        label: `${address.street} ${row.number}`,
        row,
        address,
      }
    })
}

export async function fetchHouseNumberChips(
  input: {
    street: string
    postalCode: string
    city?: string
    typed?: string
    mode: 'live' | 'all'
  },
  options: FederalOptions & { timeoutMs?: number } = {}
): Promise<HouseNumberChip[]> {
  const typed = normalizeHouseNumber(input.typed ?? '')
  const query =
    input.mode === 'live' && typed
      ? `${input.street} ${typed} ${input.postalCode}`
      : `${input.street} ${input.postalCode}`
  const rows = await searchOnce(query, {
    ...options,
    limit: input.mode === 'live' ? LIVE_CHIP_LIMIT : ALL_CHIP_LIMIT,
    timeoutMs: options.timeoutMs ?? VERIFY_TIMEOUT_MS,
  })
  return selectHouseNumberChips(rows, {
    street: input.street,
    postalCode: input.postalCode,
    city: input.city,
    typed,
    order: input.mode === 'all' ? 'distance' : 'prefix',
  })
}

export interface GeocoderView {
  route: string
  number: string
  numberRaw: string
  postalCode: string
  locality: string
  canton: string
  country: string
  lat: number
  lng: number
  locationType: string
  partial: boolean
  formatted: string
  level: 'address' | 'route' | 'place' | 'other'
}

function readLatLng(location: LatLngLike | undefined) {
  if (!location) return null
  const lat = typeof location.lat === 'function' ? location.lat() : location.lat
  const lng = typeof location.lng === 'function' ? location.lng() : location.lng
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

export function readGeocoderResult(
  result: GeocoderResultLike | undefined
): GeocoderView | null {
  if (!result) return null
  const point = readLatLng(result.geometry?.location)
  if (!point) return null
  const components = result.address_components ?? []
  const component = (type: string) =>
    components.find(entry => entry.types?.includes(type))
  const route = component('route')?.long_name ?? ''
  const numberRaw = component('street_number')?.long_name ?? ''
  const number = normalizeHouseNumber(numberRaw)
  const types = result.types ?? []
  const placeTypes = [
    'locality',
    'postal_code',
    'sublocality',
    'administrative_area_level_1',
    'administrative_area_level_2',
    'administrative_area_level_3',
    'political',
    'postal_town',
    'neighborhood',
  ]
  const level: GeocoderView['level'] =
    route && number
      ? 'address'
      : route
        ? 'route'
        : types.some(type => placeTypes.includes(type))
          ? 'place'
          : 'other'
  const cantonComponent = component('administrative_area_level_1')
  return {
    route,
    number,
    numberRaw,
    postalCode: component('postal_code')?.long_name ?? '',
    locality:
      component('locality')?.long_name ||
      component('postal_town')?.long_name ||
      component('administrative_area_level_2')?.long_name ||
      '',
    canton: cantonComponent?.short_name || cantonComponent?.long_name || '',
    country: component('country')?.short_name ?? '',
    lat: point.lat,
    lng: point.lng,
    locationType: result.geometry?.location_type ?? '',
    partial: result.partial_match === true,
    formatted: result.formatted_address ?? '',
    level,
  }
}

function addressFromGeocoder(view: GeocoderView): ResolvedAddress {
  return {
    street: view.route,
    streetNumber: view.numberRaw || view.number,
    postalCode: view.postalCode,
    city: view.locality,
    canton: view.canton,
    formatted:
      view.formatted ||
      `${view.route} ${view.numberRaw}, ${view.postalCode} ${view.locality}`,
    lat: view.lat,
    lng: view.lng,
    egid: null,
    gwrId: null,
    e: null,
    n: null,
    provider: 'geocoder',
  }
}

export function googleGeocoderAdapter(service: GeocodeServiceLike): Geocoder {
  return async address => {
    try {
      const response = await service.geocode({
        address,
        componentRestrictions: { country: 'ch' },
      })
      return response?.results ?? []
    } catch (error) {
      if ((error as { code?: unknown })?.code === 'ZERO_RESULTS') return []
      throw error
    }
  }
}

function geocoderUsable(view: GeocoderView | null): view is GeocoderView {
  return !!view && (!view.country || view.country === 'CH')
}

function routeMatchesInput(view: GeocoderView, analysis: AddressAnalysis) {
  return !!view.route && analysis.runFolds.has(fold(view.route))
}

function placeTypedForGeocoder(view: GeocoderView, analysis: AddressAnalysis) {
  return (
    (!!view.postalCode && analysis.postcodeTokens.includes(view.postalCode)) ||
    (!!view.locality && analysis.runFolds.has(fold(view.locality)))
  )
}

export function geocoderAutoAcceptable(
  view: GeocoderView | null,
  analysis: AddressAnalysis
): boolean {
  if (!geocoderUsable(view)) return false
  return (
    !view.partial &&
    view.locationType === 'ROOFTOP' &&
    !!view.number &&
    analysis.numberTokens.includes(view.number) &&
    placeTypedForGeocoder(view, analysis) &&
    routeMatchesInput(view, analysis)
  )
}

interface GeocoderRun {
  settled: boolean
  failed: boolean
  view: GeocoderView | null
  done: Promise<void>
}

function startGeocoder(
  geocoder: Geocoder | undefined,
  address: string,
  signal: AbortSignal
): GeocoderRun | null {
  if (!geocoder) return null
  const run: GeocoderRun = {
    settled: false,
    failed: false,
    view: null,
    done: Promise.resolve(),
  }
  run.done = new Promise<void>(resolve => {
    const finish = (failed: boolean, view: GeocoderView | null) => {
      if (run.settled) return
      run.settled = true
      run.failed = failed
      run.view = view
      clearTimeout(timer)
      signal.removeEventListener('abort', onAbort)
      resolve()
    }
    const onAbort = () => finish(true, null)
    const timer = setTimeout(() => finish(true, null), GEOCODER_TIMEOUT_MS)
    signal.addEventListener('abort', onAbort, { once: true })
    geocoder(address, { signal }).then(
      results => {
        const view = readGeocoderResult(
          Array.isArray(results) ? results[0] : undefined
        )
        finish(false, geocoderUsable(view) ? view : null)
      },
      () => finish(true, null)
    )
  })
  return run
}

function noiseRetryQuery(analysis: AddressAnalysis): string | null {
  const { tokens } = analysis
  const numberIndex = tokens.findIndex(
    token => token.isNumber && !token.isPostcode
  )
  const index =
    numberIndex >= 0 ? numberIndex : tokens.findIndex(token => token.isNumber)
  if (index < 0) return null
  const number = tokens[index].raw
  const postcode = tokens.find(
    token => token.isPostcode && token.index !== index
  )
  const before =
    index > 0 && !tokens[index - 1].isNumber ? tokens[index - 1] : null
  if (before) {
    const after =
      postcode?.raw ??
      tokens.slice(index + 1).find(token => !token.isNumber)?.raw ??
      ''
    return [before.raw, number, after].filter(Boolean).join(' ')
  }
  const following: string[] = []
  for (const token of tokens.slice(index + 1)) {
    if (token.isNumber) break
    following.push(token.raw)
    if (following.length >= 4) break
  }
  if (following.length === 0) return null
  return [number, ...following, postcode?.raw ?? ''].filter(Boolean).join(' ')
}

function residualTokens(
  analysis: AddressAnalysis,
  spans: Array<[number, number] | null>
): AddressToken[] {
  return analysis.tokens.filter(
    token =>
      !token.isNumber &&
      !spans.some(
        span => !!span && token.index >= span[0] && token.index < span[1]
      )
  )
}

function preferNamedPlace(items: ClassifiedRow[]): ClassifiedRow[] {
  const exactName = items.filter(item => item.placeWord)
  if (exactName.length > 0) return exactName
  const looseName = items.filter(item => item.placeNamed)
  return looseName.length > 0 ? looseName : items
}

function rankNear(a: ClassifiedRow, b: ClassifiedRow): number {
  const score = (item: ClassifiedRow) =>
    (item.placeLoose ? 0 : item.placeRelated ? 1 : 2) * 2 +
    (item.streetExact ? 0 : 1)
  return score(a) - score(b)
}

interface StreetGroup {
  key: string
  context: StreetContext
  exact: boolean
  rows: ClassifiedRow[]
}

function groupSameStreet(items: ClassifiedRow[]): StreetGroup[] {
  const groups = new Map<string, StreetGroup>()
  for (const item of items) {
    const key = `${fold(item.street)}|${item.row.postalCode}|${fold(item.row.locality)}`
    const group = groups.get(key)
    if (group) {
      group.rows.push(item)
      group.exact = group.exact || (item.streetExact && item.placeExact)
    } else {
      groups.set(key, {
        key,
        context: {
          street: item.street,
          postalCode: item.row.postalCode,
          city: item.row.locality,
          canton: item.row.canton,
        },
        exact: item.streetExact && item.placeExact,
        rows: [item],
      })
    }
  }
  return Array.from(groups.values())
}

function nearestRowTo(
  rows: SwissAddressRow[],
  typed: string
): SwissAddressRow | null {
  const target = numericPart(typed)
  if (!Number.isFinite(target)) return rows[0] ?? null
  let best: SwissAddressRow | null = null
  let bestDistance = Infinity
  for (const row of rows) {
    const distance = Math.abs(numericPart(row.number) - target)
    if (distance < bestDistance) {
      best = row
      bestDistance = distance
    }
  }
  return best
}

interface RunContext {
  fetch?: FetchLike
  baseUrl?: string
  signal: AbortSignal
  startedAt: number
  now: () => number
}

function remainingMs(context: RunContext): number {
  return context.startedAt + RESOLVE_BUDGET_MS - context.now()
}

async function lookup(
  context: RunContext,
  query: string,
  limit: number,
  timeoutMs = VERIFY_TIMEOUT_MS
): Promise<SwissAddressRow[] | null> {
  const budget = Math.min(timeoutMs, remainingMs(context))
  if (budget < MIN_CALL_MS) return null
  try {
    return await searchOnce(query, {
      fetch: context.fetch,
      baseUrl: context.baseUrl,
      signal: context.signal,
      limit,
      timeoutMs: budget,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    return null
  }
}

function defaultOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine !== false
}

const degradedResults = new WeakSet<ResolveResult>()

async function runResolve(
  text: string,
  options: ResolveOptions & ResolverDeps
): Promise<ResolveResult> {
  const now = options.now ?? (() => Date.now())
  const isOnline = options.isOnline ?? defaultOnline
  const signal = options.signal ?? new AbortController().signal
  const startedAt = now()
  const trigger = options.trigger
  const context: RunContext = {
    fetch: options.fetch,
    baseUrl: options.baseUrl,
    signal,
    startedAt,
    now,
  }
  const finish = (
    result: Omit<ResolveResult, 'trigger' | 'ms' | 'federalRows'> & {
      federalRows?: number
    }
  ): ResolveResult => ({
    federalRows: 0,
    ...result,
    trigger,
    ms: Math.round(now() - startedAt),
  })

  if (signal.aborted) throw abortError()
  const cleaned = cleanAddressQuery(text)
  const analysis = analyseAddress(cleaned)
  if (!cleaned) return finish({ outcome: 'needStreet', provider: null })

  const geocoderText = text.replace(/\s+/g, ' ').trim().slice(0, 200)
  const geocoderRun = startGeocoder(options.geocoder, geocoderText, signal)

  let rows: SwissAddressRow[] = []
  let federalFailed = false
  try {
    rows = await searchOnce(cleaned, {
      fetch: context.fetch,
      baseUrl: context.baseUrl,
      signal,
      limit: 10,
      timeoutMs: SEARCH_FIRST_TIMEOUT_MS,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    if (!isOnline()) {
      federalFailed = true
    } else if (
      geocoderRun?.settled &&
      geocoderAutoAcceptable(geocoderRun.view, analysis)
    ) {
      const view = geocoderRun.view as GeocoderView
      return finish({
        outcome: 'resolved',
        provider: 'geocoder',
        address: addressFromGeocoder(view),
      })
    } else {
      const retry = await lookup(context, cleaned, 10, SEARCH_RETRY_TIMEOUT_MS)
      if (retry === null) federalFailed = true
      else rows = retry
    }
  }

  if (!federalFailed && rows.length === 0) {
    const retryQuery = noiseRetryQuery(analysis)
    if (retryQuery && retryQuery !== cleaned) {
      rows = (await lookup(context, retryQuery, 10)) ?? []
    }
  }

  const placeTyped =
    analysis.postcodeTyped ||
    analysis.tokens.filter(token => !token.isNumber).length >= 2
  if (
    !federalFailed &&
    placeTyped &&
    !rows.some(row => {
      if (row.outsideCh) return false
      const item = classifyRow(row, analysis)
      return item.exact || (item.streetExact && item.placeExact)
    })
  ) {
    const splitQuery = splitCompoundQuery(cleaned)
    if (splitQuery) {
      const extra = await lookup(context, splitQuery, 10)
      if (extra?.length) rows = mergeRows(rows, extra)
    }
  }

  if (geocoderRun) await geocoderRun.done
  if (signal.aborted) throw abortError()
  const geocoder = geocoderRun?.view ?? null

  if (federalFailed && (!geocoderRun || geocoderRun.failed || !isOnline())) {
    return finish({ outcome: 'networkError', provider: null })
  }

  const federalRows = rows.length
  const classified = rows.map(row => classifyRow(row, analysis))

  const decided = await decide(analysis, classified, geocoder, {
    context,
    federalFailed,
    allRows: rows,
  })
  const result = finish({ ...decided, federalRows })
  if (federalFailed) degradedResults.add(result)
  return result
}

type Decision = Omit<ResolveResult, 'trigger' | 'ms' | 'federalRows'>

async function decide(
  analysis: AddressAnalysis,
  classified: ClassifiedRow[],
  geocoder: GeocoderView | null,
  state: {
    context: RunContext
    federalFailed: boolean
    allRows: SwissAddressRow[]
  }
): Promise<Decision> {
  const { context, federalFailed, allRows } = state
  const inCh = classified.filter(item => !item.row.outsideCh)

  const placeFolds = new Set<string>()
  for (const row of allRows) {
    if (!row.outsideCh)
      placeNames(row).all.forEach(name => placeFolds.add(name))
  }
  const namesAnotherPlace = (item: ClassifiedRow) =>
    !item.placeNamed &&
    analysis.runs.some(
      run =>
        (!item.streetSpan || !overlaps(item.streetSpan, run)) &&
        placeFolds.has(run.folded)
    )

  const exactSeen = new Set<string>()
  const exact = preferNamedPlace(inCh.filter(item => item.exact)).filter(
    item => {
      const key = addressKey(item.row)
      if (exactSeen.has(key)) return false
      exactSeen.add(key)
      return true
    }
  )
  const exactOutside = classified.filter(
    item => item.exact && item.row.outsideCh
  )

  if (exact.length === 1 && exactOutside.length === 0) {
    const item = exact[0]
    if (namesAnotherPlace(item)) {
      return {
        outcome: 'candidates',
        provider: 'federal',
        candidates: [candidateFromRow(item.row, item.street)],
      }
    }
    return {
      outcome: 'resolved',
      provider: 'federal',
      row: item.row,
      address: addressFromRow(item.row, item.street),
    }
  }
  if (exact.length === 0 && exactOutside.length > 0) {
    return {
      outcome: 'outsideCh',
      provider: 'federal',
      row: exactOutside[0].row,
    }
  }
  if (exact.length >= 1) {
    return {
      outcome: 'candidates',
      provider: 'federal',
      candidates: exact
        .slice(0, MAX_CANDIDATES)
        .map(item => candidateFromRow(item.row, item.street)),
    }
  }

  if (geocoderAutoAcceptable(geocoder, analysis)) {
    const view = geocoder as GeocoderView
    if (!federalFailed && view.postalCode) {
      const verify = await lookup(
        context,
        `${view.route} ${view.number} ${view.postalCode}`,
        10
      )
      const row = verify
        ? findExactRow(verify, view.route, view.number, view.postalCode, {
            city: view.locality,
            near: view,
          })
        : null
      if (row) {
        return {
          outcome: 'resolved',
          provider: 'federal',
          row,
          address: addressFromRow(row, matchingStreet(row, view.route)),
        }
      }
    }
    return {
      outcome: 'resolved',
      provider: 'geocoder',
      address: addressFromGeocoder(view),
    }
  }

  const streetAtTypedPlace = inCh.some(
    item => item.sameStreet && item.streetExact && item.placeExact
  )
  const near = inCh.filter(
    item => item.near && (!streetAtTypedPlace || item.placeLoose)
  )
  const nearSeen = new Set<string>()
  const nearRanked = [...near].sort(rankNear).filter(item => {
    const key = item.row.featureId || addressKey(item.row)
    if (nearSeen.has(key)) return false
    nearSeen.add(key)
    return true
  })
  const placeWordTyped =
    residualTokens(
      analysis,
      nearRanked.map(item => item.streetSpan)
    ).filter(token => !isCantonCode(token.value)).length > 0
  if (
    !analysis.postcodeTyped &&
    !placeWordTyped &&
    nearRanked.length > MAX_CANDIDATES
  ) {
    return { outcome: 'needLocality', provider: null }
  }

  const candidates: AddressCandidate[] = []
  if (
    geocoder &&
    geocoder.level === 'address' &&
    geocoder.postalCode &&
    !federalFailed
  ) {
    const verify = await lookup(
      context,
      `${geocoder.route} ${geocoder.number} ${geocoder.postalCode}`,
      10
    )
    const row = verify
      ? findExactRow(
          verify,
          geocoder.route,
          geocoder.number,
          geocoder.postalCode,
          { city: geocoder.locality, near: geocoder }
        )
      : null
    if (row) {
      candidates.push(
        candidateFromRow(row, matchingStreet(row, geocoder.route))
      )
    }
  }
  for (const item of nearRanked) {
    if (candidates.length >= MAX_CANDIDATES) break
    if (
      candidates.some(
        candidate => candidate.row.featureId === item.row.featureId
      )
    ) {
      continue
    }
    candidates.push(candidateFromRow(item.row, item.street))
  }
  if (candidates.length > 0) {
    return {
      outcome: 'candidates',
      provider: 'federal',
      candidates: candidates.slice(0, MAX_CANDIDATES),
    }
  }

  const sameStreetNamed = preferNamedPlace(inCh.filter(item => item.sameStreet))
  const sameStreetExact = sameStreetNamed.filter(item => item.streetExact)
  const sameStreet =
    sameStreetExact.length > 0 ? sameStreetExact : sameStreetNamed
  const streetGroups = groupSameStreet(sameStreet)
  const placeNamedTyped =
    residualTokens(
      analysis,
      sameStreet.map(item => item.streetSpan)
    ).filter(token => !isCantonCode(token.value)).length > 0
  const groups =
    streetGroups.length > 1 && placeNamedTyped
      ? streetGroups.slice(0, 1)
      : streetGroups
  const geocoderStreet =
    geocoderUsable(geocoder) && routeMatchesInput(geocoder, analysis)
      ? geocoder
      : null

  if (analysis.houseNumberTyped) {
    if (groups.length === 1) {
      return notInRegister(
        groups[0],
        analysis.houseNumbers[0],
        geocoderStreet,
        {
          context,
          federalFailed,
        }
      )
    }
    if (groups.length > 1) return { outcome: 'needLocality', provider: null }
    if (
      geocoderStreet &&
      geocoderStreet.locationType === 'RANGE_INTERPOLATED' &&
      geocoderStreet.postalCode
    ) {
      const geoStreet: StreetContext = {
        street: geocoderStreet.route,
        postalCode: geocoderStreet.postalCode,
        city: geocoderStreet.locality,
        canton: geocoderStreet.canton,
      }
      const typed = geocoderStreet.number || analysis.houseNumbers[0]
      const chips = federalFailed
        ? []
        : await chipsFor(context, geoStreet, typed)
      return {
        outcome: 'notInRegister',
        provider: 'geocoder',
        street: geoStreet,
        typedNumber: typed,
        chips,
        point: { lat: geocoderStreet.lat, lng: geocoderStreet.lng },
        precision: 'street',
      }
    }
  } else {
    if (groups.length === 1) {
      const group = groups[0]
      const first = group.rows[0].row
      const googleOnStreet =
        geocoderStreet &&
        fold(geocoderStreet.route) === fold(group.context.street) &&
        geocoderStreet.postalCode === group.context.postalCode
      return {
        outcome: 'houseNumber',
        provider: 'federal',
        street: group.context,
        point: googleOnStreet
          ? { lat: geocoderStreet.lat, lng: geocoderStreet.lng }
          : { lat: first.lat, lng: first.lng },
        precision: 'street',
      }
    }
    if (groups.length > 1) return { outcome: 'needLocality', provider: null }
    if (
      geocoderStreet &&
      geocoderStreet.level === 'route' &&
      geocoderStreet.postalCode &&
      placeTypedForGeocoder(geocoderStreet, analysis)
    ) {
      return {
        outcome: 'houseNumber',
        provider: 'geocoder',
        street: {
          street: geocoderStreet.route,
          postalCode: geocoderStreet.postalCode,
          city: geocoderStreet.locality,
          canton: geocoderStreet.canton,
        },
        point: { lat: geocoderStreet.lat, lng: geocoderStreet.lng },
        precision: 'street',
      }
    }
  }

  const wordTokens = analysis.tokens.filter(token => !token.isNumber)
  const covered = (token: AddressToken) =>
    isCantonCode(token.value) ||
    analysis.runs.some(
      run =>
        token.index >= run.start &&
        token.index < run.end &&
        placeFolds.has(run.folded)
    )
  const onlyPlaces =
    wordTokens.length > 0 ? wordTokens.every(covered) : analysis.postcodeTyped
  if (onlyPlaces) return { outcome: 'needStreet', provider: null }

  if (inCh.some(item => item.streetExact)) {
    return { outcome: 'needLocality', provider: null }
  }

  if (geocoder && geocoder.level === 'place' && !analysis.houseNumberTyped) {
    return { outcome: 'needStreet', provider: null }
  }

  if (geocoderStreet) {
    return {
      outcome: 'notFound',
      provider: null,
      street: {
        street: geocoderStreet.route,
        postalCode: geocoderStreet.postalCode,
        city: geocoderStreet.locality,
        canton: geocoderStreet.canton,
      },
      point: { lat: geocoderStreet.lat, lng: geocoderStreet.lng },
      precision: 'street',
    }
  }
  return { outcome: 'notFound', provider: null }
}

async function chipsFor(
  context: RunContext,
  street: StreetContext,
  typed: string
): Promise<HouseNumberChip[]> {
  const rows = await lookup(
    context,
    `${street.street} ${street.postalCode}`,
    ALL_CHIP_LIMIT
  )
  if (!rows) return []
  return selectHouseNumberChips(rows, {
    street: street.street,
    postalCode: street.postalCode,
    city: street.city,
    typed,
    order: 'distance',
  })
}

async function notInRegister(
  group: StreetGroup,
  typedNumber: string,
  geocoderStreet: GeocoderView | null,
  state: { context: RunContext; federalFailed: boolean }
): Promise<Decision> {
  const { context, federalFailed } = state
  const { street, postalCode, city } = group.context
  const [verify, chipRows] = federalFailed
    ? [null, null]
    : await Promise.all([
        lookup(context, `${street} ${typedNumber} ${postalCode}`, 10),
        lookup(context, `${street} ${postalCode}`, ALL_CHIP_LIMIT),
      ])

  const found =
    (verify &&
      findExactRow(verify, street, typedNumber, postalCode, { city })) ||
    (chipRows &&
      findExactRow(chipRows, street, typedNumber, postalCode, { city }))
  if (found) {
    const preferred = matchingStreet(found, street)
    if (group.exact) {
      return {
        outcome: 'resolved',
        provider: 'federal',
        row: found,
        address: addressFromRow(found, preferred),
      }
    }
    return {
      outcome: 'candidates',
      provider: 'federal',
      candidates: [candidateFromRow(found, preferred)],
    }
  }

  const chips = chipRows
    ? selectHouseNumberChips(chipRows, {
        street,
        postalCode,
        city,
        typed: typedNumber,
        order: 'distance',
      })
    : []
  const sameRoute =
    geocoderStreet &&
    fold(geocoderStreet.route) === fold(street) &&
    (!geocoderStreet.postalCode || geocoderStreet.postalCode === postalCode)
  const nearest =
    nearestRowTo(
      chips.map(chip => chip.row),
      typedNumber
    ) ?? group.rows[0].row
  return {
    outcome: 'notInRegister',
    provider: 'federal',
    street: group.context,
    typedNumber,
    chips,
    point: sameRoute
      ? { lat: geocoderStreet.lat, lng: geocoderStreet.lng }
      : { lat: nearest.lat, lng: nearest.lng },
    precision: 'street',
  }
}

export function resolveAddress(
  text: string,
  options: ResolveOptions & ResolverDeps
): Promise<ResolveResult> {
  return runResolve(text, options)
}

export function addressCacheKey(text: string, withGeocoder: boolean): string {
  return `${withGeocoder ? 'g' : 'f'}|${cleanAddressQuery(text).toLowerCase()}`
}

interface InFlight {
  controller: AbortController
  promise: Promise<ResolveResult>
  refs: number
}

export interface AddressResolver {
  resolve(text: string, options: ResolveOptions): Promise<ResolveResult>
  isRunning(text: string, withGeocoder: boolean): boolean
  clear(): void
}

export function createAddressResolver(
  deps: ResolverDeps = {}
): AddressResolver {
  const cache = new Map<string, ResolveResult>()
  const inflight = new Map<string, InFlight>()

  const resolve = (
    text: string,
    options: ResolveOptions
  ): Promise<ResolveResult> => {
    const key = addressCacheKey(text, !!options.geocoder)
    const cached = cache.get(key)
    if (cached) {
      return Promise.resolve({ ...cached, trigger: options.trigger, ms: 0 })
    }
    if (options.signal?.aborted) return Promise.reject(abortError())

    let entry = inflight.get(key)
    if (!entry) {
      const controller = new AbortController()
      const created: InFlight = {
        controller,
        refs: 0,
        promise: runResolve(text, {
          ...deps,
          trigger: options.trigger,
          geocoder: options.geocoder,
          signal: controller.signal,
        }),
      }
      created.promise.then(
        result => {
          if (
            result.outcome !== 'networkError' &&
            !degradedResults.has(result) &&
            !created.controller.signal.aborted
          ) {
            cache.set(key, result)
          }
          if (inflight.get(key) === created) inflight.delete(key)
        },
        () => {
          if (inflight.get(key) === created) inflight.delete(key)
        }
      )
      inflight.set(key, created)
      entry = created
    }

    const current = entry
    current.refs += 1
    return new Promise<ResolveResult>((resolvePromise, reject) => {
      let settled = false
      const onAbort = () => {
        if (settled) return
        settled = true
        current.refs -= 1
        if (current.refs <= 0) {
          current.controller.abort()
          if (inflight.get(key) === current) inflight.delete(key)
        }
        reject(abortError())
      }
      options.signal?.addEventListener('abort', onAbort, { once: true })
      current.promise.then(
        result => {
          if (settled) return
          settled = true
          options.signal?.removeEventListener('abort', onAbort)
          resolvePromise({ ...result, trigger: options.trigger })
        },
        error => {
          if (settled) return
          settled = true
          options.signal?.removeEventListener('abort', onAbort)
          reject(error)
        }
      )
    })
  }

  return {
    resolve,
    isRunning: (text, withGeocoder) =>
      inflight.has(addressCacheKey(text, withGeocoder)),
    clear: () => {
      cache.clear()
      inflight.forEach(entry => entry.controller.abort())
      inflight.clear()
    },
  }
}

export interface HouseNumberResult {
  outcome: 'federalMatch' | 'geocoder' | 'notInRegister'
  number: string
  address?: ResolvedAddress
  row?: SwissAddressRow
  chips: HouseNumberChip[]
  point?: { lat: number; lng: number }
  precision?: 'street'
}

export async function resolveHouseNumber(
  input: StreetContext & { number: string },
  options: {
    geocoder?: Geocoder
    signal?: AbortSignal
  } & ResolverDeps
): Promise<HouseNumberResult> {
  const number = normalizeHouseNumber(input.number)
  const now = options.now ?? (() => Date.now())
  const signal = options.signal ?? new AbortController().signal
  const context: RunContext = {
    fetch: options.fetch,
    baseUrl: options.baseUrl,
    signal,
    startedAt: now(),
    now,
  }

  const [exactRows, chipRows] = await Promise.all([
    lookup(context, `${input.street} ${number} ${input.postalCode}`, 10),
    lookup(context, `${input.street} ${input.postalCode}`, ALL_CHIP_LIMIT),
  ])
  const prefer = { city: input.city }
  const row =
    (exactRows &&
      findExactRow(
        exactRows,
        input.street,
        number,
        input.postalCode,
        prefer
      )) ||
    (chipRows &&
      findExactRow(chipRows, input.street, number, input.postalCode, prefer))
  const chips = chipRows
    ? selectHouseNumberChips(chipRows, {
        street: input.street,
        postalCode: input.postalCode,
        city: input.city,
        typed: number,
        order: 'distance',
      })
    : []
  if (row) {
    return {
      outcome: 'federalMatch',
      number,
      row,
      address: addressFromRow(row, matchingStreet(row, input.street)),
      chips,
    }
  }

  let view: GeocoderView | null = null
  if (options.geocoder) {
    const run = startGeocoder(
      options.geocoder,
      `${input.street} ${number}, ${input.postalCode} ${input.city}, Schweiz`,
      signal
    )
    if (run) {
      await run.done
      view = run.view
    }
    if (signal.aborted) throw abortError()
    if (
      view &&
      !view.partial &&
      view.locationType === 'ROOFTOP' &&
      view.number === number &&
      fold(view.route) === fold(input.street)
    ) {
      return {
        outcome: 'geocoder',
        number,
        address: addressFromGeocoder(view),
        chips,
      }
    }
  }

  const sameRoute = !!view && fold(view.route) === fold(input.street)
  const nearest = nearestRowTo(
    chips.map(chip => chip.row),
    number
  )
  const point =
    sameRoute && view
      ? { lat: view.lat, lng: view.lng }
      : nearest
        ? { lat: nearest.lat, lng: nearest.lng }
        : undefined
  return {
    outcome: 'notInRegister',
    number,
    chips,
    point,
    precision: point ? 'street' : undefined,
  }
}
