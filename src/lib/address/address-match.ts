import {
  type FederalOptions,
  type SwissAddressRow,
  type SwissIdentifyRow,
  abortError,
  distanceMeters,
  identifyAddresses,
  isAbortError,
  search,
} from './swiss-address'
import { fold, normalizeHouseNumber } from './resolve-address'

export interface AddressMatchInput {
  street: string
  streetNumber: string
  postalCode: string
  lat: number
  lng: number
}

export type AddressMatchVia = 'search' | 'identify'

export interface AddressMatch {
  egid: string
  gwrId: string
  e: number
  n: number
  lat: number
  lng: number
  via: AddressMatchVia
}

export type AddressMatchState = AddressMatchVia | 'none' | 'pending'

export const ADDRESS_MATCH_MAX_DISTANCE_M = 50
export const ADDRESS_MATCH_IDENTIFY_RADIUS_M = 30
export const ADDRESS_MATCH_WAIT_MS = 500

function streetEquals(streets: string[], route: string): boolean {
  const target = fold(route)
  return !!target && streets.some(street => fold(street) === target)
}

function searchRowMatches(
  row: SwissAddressRow,
  input: AddressMatchInput,
  number: string
): boolean {
  return (
    !row.outsideCh &&
    !row.noNumber &&
    !!row.egid &&
    row.number === number &&
    row.postalCode === input.postalCode &&
    streetEquals(row.streets, input.street) &&
    distanceMeters(input, row) <= ADDRESS_MATCH_MAX_DISTANCE_M
  )
}

function identifyRowMatches(
  row: SwissIdentifyRow,
  input: AddressMatchInput,
  number: string
): boolean {
  return (
    row.number === number &&
    row.postalCode === input.postalCode &&
    streetEquals(row.streets, input.street) &&
    row.distanceM <= ADDRESS_MATCH_IDENTIFY_RADIUS_M
  )
}

export function addressMatchFromRow(row: SwissAddressRow): AddressMatch | null {
  if (!row.egid || !row.gwrId) return null
  return {
    egid: row.egid,
    gwrId: row.gwrId,
    e: row.e,
    n: row.n,
    lat: row.lat,
    lng: row.lng,
    via: 'search',
  }
}

export function fromIdentifyRow(row: SwissIdentifyRow): AddressMatch {
  return {
    egid: row.egid,
    gwrId: row.gwrId,
    e: row.e,
    n: row.n,
    lat: row.lat,
    lng: row.lng,
    via: 'identify',
  }
}

function canMatch(input: AddressMatchInput): boolean {
  return (
    !!input.street.trim() &&
    !!normalizeHouseNumber(input.streetNumber) &&
    /^\d{4}$/.test(input.postalCode.trim()) &&
    Number.isFinite(input.lat) &&
    Number.isFinite(input.lng)
  )
}

export async function matchAddress(
  input: AddressMatchInput,
  options: FederalOptions = {}
): Promise<AddressMatch | null> {
  if (!canMatch(input)) return null
  if (options.signal?.aborted) throw abortError()

  const number = normalizeHouseNumber(input.streetNumber)
  const normalized = { ...input, postalCode: input.postalCode.trim() }
  const identifyController = new AbortController()
  const onAbort = () => identifyController.abort()
  options.signal?.addEventListener('abort', onAbort, { once: true })

  const identify = identifyAddresses(
    normalized.lat,
    normalized.lng,
    ADDRESS_MATCH_IDENTIFY_RADIUS_M,
    { ...options, signal: identifyController.signal }
  ).catch(() => [] as SwissIdentifyRow[])

  try {
    let rows: SwissAddressRow[] = []
    try {
      rows = await search(
        `${normalized.street} ${number} ${normalized.postalCode}`,
        { ...options, limit: 10 }
      )
    } catch (error) {
      if (isAbortError(error)) throw error
    }
    const searchRow = rows
      .filter(row => searchRowMatches(row, normalized, number))
      .sort(
        (a, b) => distanceMeters(normalized, a) - distanceMeters(normalized, b)
      )[0]
    if (searchRow) {
      identifyController.abort()
      return addressMatchFromRow(searchRow)
    }

    const identified = await identify
    if (options.signal?.aborted) throw abortError()
    const identifyRow = identified.find(row =>
      identifyRowMatches(row, normalized, number)
    )
    return identifyRow ? fromIdentifyRow(identifyRow) : null
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
  }
}

export interface AddressMatchTask {
  startedAt: number
  promise: Promise<AddressMatch | null>
  result(): AddressMatch | null | undefined
  abort(): void
}

let currentTask: AddressMatchTask | null = null

export function startAddressMatch(
  input: AddressMatchInput,
  options: FederalOptions & {
    onMatch?: (match: AddressMatch) => void
    now?: () => number
  } = {}
): AddressMatchTask {
  currentTask?.abort()
  const controller = new AbortController()
  const outer = options.signal
  if (outer) {
    if (outer.aborted) controller.abort()
    else
      outer.addEventListener('abort', () => controller.abort(), { once: true })
  }

  let settled: AddressMatch | null | undefined
  const promise = matchAddress(input, {
    fetch: options.fetch,
    baseUrl: options.baseUrl,
    signal: controller.signal,
  })
    .catch(() => null)
    .then(match => {
      if (controller.signal.aborted) {
        settled = null
        return null
      }
      settled = match
      if (match) options.onMatch?.(match)
      return match
    })

  const task: AddressMatchTask = {
    startedAt: (options.now ?? Date.now)(),
    promise,
    result: () => settled,
    abort: () => controller.abort(),
  }
  currentTask = task
  return task
}

export function currentAddressMatch(): AddressMatchTask | null {
  return currentTask
}

export function clearAddressMatch(): void {
  currentTask?.abort()
  currentTask = null
}

export async function awaitAddressMatch(
  deadline?: number,
  options: { now?: () => number; task?: AddressMatchTask | null } = {}
): Promise<{ state: AddressMatchState; match: AddressMatch | null }> {
  const task = options.task === undefined ? currentTask : options.task
  if (!task) return { state: 'none', match: null }
  const done = task.result()
  if (done !== undefined) {
    return done
      ? { state: done.via, match: done }
      : { state: 'none', match: null }
  }

  const now = options.now ?? Date.now
  const until = deadline ?? task.startedAt + ADDRESS_MATCH_WAIT_MS
  const wait = Math.max(0, until - now())
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>(resolve => {
    timer = setTimeout(() => resolve('timeout'), wait)
  })
  const outcome = await Promise.race([task.promise, timeout])
  if (timer !== undefined) clearTimeout(timer)
  if (outcome === 'timeout') return { state: 'pending', match: null }
  return outcome
    ? { state: outcome.via, match: outcome }
    : { state: 'none', match: null }
}
