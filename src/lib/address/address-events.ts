import {
  trackFunnelEvent,
  trackFunnelEventOnce,
} from '@/lib/analytics/funnel-events'
import { addressFlowMeta, flowVersionMeta } from '@/lib/calculator-flow'
import type { ManualCheckSource } from '@/services/residential-calculator.service'

import type {
  ResolveOutcome,
  ResolveProvider,
  ResolveTrigger,
} from './resolve-address'

type MetaValue = string | number | boolean | null

const CODE_PATTERN = /^[A-Za-z_]{1,40}$/

function code<T extends string>(value: T | null | undefined): T | null {
  return typeof value === 'string' && CODE_PATTERN.test(value) ? value : null
}

function count(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null
}

function send(name: string, meta: Record<string, MetaValue>, once = false) {
  const options = { meta: { ...meta, ...flowVersionMeta, ...addressFlowMeta } }
  if (once) trackFunnelEventOnce(name, options)
  else trackFunnelEvent(name, options)
}

export function trackAddressFallback(meta: {
  trigger: ResolveTrigger
  outcome: ResolveOutcome
  provider: ResolveProvider
  candidateCount: number
  federalRows: number
  ms: number
  typedLength: number
  predictionsSeen: boolean
}): void {
  send('calculator_address_fallback', {
    trigger: code(meta.trigger),
    outcome: code(meta.outcome),
    provider: code(meta.provider),
    candidateCount: count(meta.candidateCount),
    federalRows: count(meta.federalRows),
    ms: count(meta.ms),
    typedLength: count(meta.typedLength),
    predictionsSeen: meta.predictionsSeen === true,
  })
}

export type HouseNumberOutcome =
  | 'chip'
  | 'federalMatch'
  | 'geocoder'
  | 'notInRegister'
  | 'noNumberLink'

export type HouseNumberOpener = 'noStreetNumber' | 'resolver'

export function trackHouseNumber(meta: {
  outcome: HouseNumberOutcome
  opener: HouseNumberOpener
  chipCount: number
}): void {
  send('calculator_house_number', {
    outcome: code(meta.outcome),
    opener: code(meta.opener),
    chipCount: count(meta.chipCount),
  })
}

export type PlacesFallbackCause = 'slow' | 'loadError' | 'noKey' | 'authFailure'

export function trackPlacesFallback(meta: {
  cause: PlacesFallbackCause
  msSinceMount: number
}): void {
  send(
    'calculator_places_fallback',
    { cause: code(meta.cause), msSinceMount: count(meta.msSinceMount) },
    true
  )
}

export type NotFoundAction = 'edit' | 'map' | 'manual'

export function trackNotFoundAction(action: NotFoundAction): void {
  send('calculator_address_notfound_action', { action: code(action) })
}

export type RoofPinFrom = 'screen1' | 'houseNumber' | 'roofMiss'

export type RoofPinOutcome = 'opened' | 'buildingFound' | 'estimate' | 'miss'

let lastPinFrom: RoofPinFrom | null = null

export function trackRoofPinMode(meta: {
  from: RoofPinFrom
  outcome: RoofPinOutcome
}): void {
  if (meta.outcome === 'opened') lastPinFrom = meta.from
  send('roof_pin_mode', {
    from: code(meta.from),
    outcome: code(meta.outcome),
  })
}

export function lastRoofPinFrom(): RoofPinFrom | null {
  return lastPinFrom
}

export type RoofLookupOutcome = 'found' | 'miss' | 'error'

export function trackRoofLookupRetry(meta: {
  attempt: number
  auto: boolean
  outcome: RoofLookupOutcome
}): void {
  send('roof_lookup_retry', {
    attempt: count(meta.attempt),
    auto: meta.auto === true,
    outcome: code(meta.outcome),
  })
}

export type ManualCheckShownSource =
  | ManualCheckSource
  | 'address_not_found'
  | 'roof_unavailable'

export function trackManualCheckShown(meta: {
  source: ManualCheckShownSource
  trigger: 'click' | 'auto'
  reason?: string
}): void {
  send('manual_check_shown', {
    source: code(meta.source),
    trigger: code(meta.trigger),
    reason: code(meta.reason),
  })
}
