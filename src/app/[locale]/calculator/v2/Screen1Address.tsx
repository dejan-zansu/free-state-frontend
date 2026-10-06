'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Loader2, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import {
  type HouseNumberOpener,
  type PlacesFallbackCause,
  trackAddressFallback,
  trackNotFoundAction,
  trackPlacesFallback,
  trackRoofPinMode,
} from '@/lib/address/address-events'
import {
  addressMatchFromRow,
  clearAddressMatch,
  startAddressMatch,
} from '@/lib/address/address-match'
import {
  type AddressCandidate,
  type AddressResolver,
  type GeocodeServiceLike,
  type Geocoder,
  type HouseNumberChip,
  type ResolveResult,
  type ResolveTrigger,
  type ResolvedAddress,
  type StreetContext,
  candidateFromRow,
  createAddressResolver,
  googleGeocoderAdapter,
} from '@/lib/address/resolve-address'
import {
  type SwissAddressRow,
  isAbortError,
  searchOnce,
} from '@/lib/address/swiss-address'
import {
  getOrCreateSessionKey,
  getStoredAttribution,
  trackFunnelEvent,
  trackFunnelEventOnce,
} from '@/lib/analytics/funnel-events'
import {
  addressFlowMeta,
  flowVersionMeta,
  mapStep,
} from '@/lib/calculator-flow'
import {
  COMPANY_MAIN_PHONE_DISPLAY,
  COMPANY_MAIN_PHONE_TEL_HREF,
} from '@/lib/company-contact'
import { cn } from '@/lib/utils'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

import { useCalculatorEmbed } from '../CalculatorEmbedContext'

import AddressCandidates, { FederalAddressList } from './AddressCandidates'
import AddressNotFoundPanel from './AddressNotFoundPanel'
import HouseNumberPanel, {
  type HouseNumberPanelHandle,
} from './HouseNumberPanel'
import ManualCheckCapture from './ManualCheckCapture'

type Screen1Error =
  | 'empty'
  | 'notChosen'
  | 'noStreetNumber'
  | 'notFound'
  | 'outsideCh'

type VisibleError = 'empty' | 'outsideCh'

type Hint = 'needLocality' | 'needStreet'

type InputMode = 'google' | 'federal'

type NotFoundCause =
  | 'resolver'
  | 'candidatesRejected'
  | 'houseNumber'
  | 'prefill'
  | 'textEntered'

type ResolvedSource =
  | 'places'
  | 'houseNumberPrompt'
  | 'prefill'
  | 'federal'
  | 'geocoder'
  | 'candidate'
  | 'federalList'

type ResolvedProvider = 'places' | 'federal' | 'geocoder'

type ManualReason =
  | 'notFound'
  | 'outsideCh'
  | 'noNumber'
  | 'notInRegister'
  | 'networkError'

type Point = { lat: number; lng: number }

type MetaValue = string | number | boolean | null

type Panel =
  | { kind: 'candidates'; candidates: AddressCandidate[] }
  | {
      kind: 'house'
      key: number
      street: StreetContext
      opener: HouseNumberOpener
      initialNumber?: string
      initialChips?: HouseNumberChip[]
      notInRegister: boolean
      point?: Point
    }
  | { kind: 'notFound'; street?: StreetContext; point?: Point }

type ManualState = {
  source: 'address_not_found' | 'places_unavailable'
  trigger: 'click' | 'auto'
  reason: ManualReason
  street?: StreetContext
}

interface AcceptedAddress {
  street: string
  streetNumber: string
  postalCode: string
  city: string
  canton: string
  formatted: string
  lat: number
  lng: number
}

interface Acceptance {
  address: AcceptedAddress
  source: ResolvedSource
  provider: ResolvedProvider
  pick: 'auto' | 'user'
  trigger: ResolveTrigger | null
  row?: SwissAddressRow
}

const PLACES_SLOW_MS = 3000
const PENDING_PICK_MS = 2000
const SYNTHETIC_INPUT_DELAY_MS = 400
const BLUR_GRACE_MS = 1500

const TYPED_MIN_CHARS = 3

const FEDERAL_LIST_MIN_CHARS = 3
const FEDERAL_LIST_DEBOUNCE_MS = 250
const FEDERAL_LIST_MAX_ROWS = 6

// ?adresse= prefill, set by the homeowner roof report (/dach-check).
const PREFILL_PARAM = 'adresse'
const PREFILL_MAX_CHARS = 300

const ERROR_CODE: Record<Screen1Error, number> = {
  empty: 1,
  notChosen: 2,
  noStreetNumber: 3,
  notFound: 4,
  outsideCh: 5,
}

const INPUT_ID = 'calculator-v2-address'
const ERROR_ID = 'calculator-v2-address-error'
const HINT_ID = 'calculator-v2-address-hint'
const LIST_ID = 'calculator-v2-address-list'

const visibleSuggestionState = () => {
  const items = Array.from(
    document.querySelectorAll<HTMLElement>('.pac-container .pac-item')
  )
  const first = items.find(item => item.offsetParent !== null)
  if (!first) return null
  const container = first.closest('.pac-container')
  const selected = !!container?.querySelector('.pac-item-selected')
  return { selected }
}

const dispatchKey = (el: HTMLInputElement, key: string, keyCode: number) => {
  el.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      code: key,
      keyCode,
      which: keyCode,
      bubbles: true,
    })
  )
}

const focusAtEnd = (el: HTMLInputElement | null) => {
  if (!el) return
  el.focus()
  const end = el.value.length
  try {
    el.setSelectionRange(end, end)
  } catch {}
}

const hashSeed = (value: string) => {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return hash >>> 0
}

const callbackLinkVariant = (): 'shown' | 'hidden' => {
  let seed = ''
  try {
    seed = new URLSearchParams(window.location.search).get('gclid') ?? ''
  } catch {}
  if (!seed) seed = getStoredAttribution()?.gclid ?? ''
  if (!seed) seed = getOrCreateSessionKey() ?? ''
  if (!seed) return 'hidden'
  return hashSeed(seed) % 2 === 0 ? 'shown' : 'hidden'
}

const notFoundCause = (trigger: ResolveTrigger): NotFoundCause =>
  trigger === 'textEntered'
    ? 'textEntered'
    : trigger === 'prefill'
      ? 'prefill'
      : 'resolver'

export default function Screen1Address() {
  const t = useTranslations('calculatorV2.screen1')
  const tErrors = useTranslations('calculatorV2.screen1.errors')

  const address = useSolarAboCalculatorStore(state => state.address)
  const goToStep = useSolarAboCalculatorStore(state => state.goToStep)

  const embedded = useCalculatorEmbed()
  const Heading = embedded ? 'h3' : 'h1'

  const [mode, setMode] = useState<InputMode>('google')
  const [inputKey, setInputKey] = useState(0)
  const [placesReady, setPlacesReady] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [error, setError] = useState<VisibleError | null>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [busy, setBusy] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [manual, setManual] = useState<ManualState | null>(null)
  const [typedAddress, setTypedAddress] = useState(address)
  const [federalOptions, setFederalOptions] = useState<AddressCandidate[]>([])
  const [federalActive, setFederalActive] = useState(-1)
  const [federalOpen, setFederalOpen] = useState(false)
  const [callbackLink, setCallbackLink] = useState<'shown' | 'hidden' | null>(
    null
  )

  const mountedAtRef = useRef<number>(Date.now())
  const initialAddressRef = useRef(address)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const loaderRef = useRef<Loader | null>(null)
  const autocompleteClassRef = useRef<
    typeof google.maps.places.Autocomplete | null
  >(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const geocodeServiceRef = useRef<Promise<GeocodeServiceLike> | null>(null)
  const resolverRef = useRef<AddressResolver | null>(null)
  const runRef = useRef<AbortController | null>(null)
  const resolvedRef = useRef(false)
  const busyRef = useRef(false)
  const pendingPickRef = useRef<{ at: number; auto: boolean } | null>(null)
  const pendingTimerRef = useRef<number | null>(null)
  const predictionsSeenRef = useRef(false)
  const ownPacRef = useRef<HTMLElement | null>(null)
  const stepOneViewedRef = useRef(false)
  const modeRef = useRef<InputMode>('google')
  const placesReadyRef = useRef(false)
  const slowArmedRef = useRef(false)
  const preHydrationTypedRef = useRef(false)
  const prefillRef = useRef<string | null>(null)
  const houseRef = useRef<HouseNumberPanelHandle | null>(null)
  const houseKeyRef = useRef(0)
  const lastTriggerRef = useRef<ResolveTrigger | null>(null)
  const restoreFocusRef = useRef(false)
  const focusAfterManualRef = useRef(false)
  const callbackVariantRef = useRef<'shown' | 'hidden' | null>(null)
  const blurTimerRef = useRef<number | null>(null)
  const blurredAtRef = useRef(0)

  const ensureCallbackVariant = useCallback(() => {
    if (!callbackVariantRef.current) {
      callbackVariantRef.current = callbackLinkVariant()
    }
    return callbackVariantRef.current
  }, [])

  const getResolver = useCallback(() => {
    if (!resolverRef.current) resolverRef.current = createAddressResolver()
    return resolverRef.current
  }, [])

  const loadGeocodeService = useCallback((): Promise<GeocodeServiceLike> => {
    if (!geocodeServiceRef.current) {
      const loader = loaderRef.current
      if (!loader) return Promise.reject(new Error('maps_loader_missing'))
      const pending = loader
        .importLibrary('geocoding')
        .then(({ Geocoder }) => new Geocoder())
      pending.catch(() => {
        if (geocodeServiceRef.current === pending) {
          geocodeServiceRef.current = null
        }
      })
      geocodeServiceRef.current = pending
    }
    return geocodeServiceRef.current
  }, [])

  const geocoder = useMemo<Geocoder>(
    () => async (text, options) =>
      googleGeocoderAdapter(await loadGeocodeService())(text, options),
    [loadGeocodeService]
  )

  const setBusyState = useCallback((value: boolean) => {
    busyRef.current = value
    setBusy(value)
  }, [])

  const clearPending = useCallback(() => {
    pendingPickRef.current = null
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }
    if (!runRef.current) setBusyState(false)
  }, [setBusyState])

  const abortRun = useCallback(() => {
    runRef.current?.abort()
    runRef.current = null
  }, [])

  const emitAddressError = useCallback(
    (reason: Screen1Error, extra: Record<string, MetaValue> = {}) => {
      trackFunnelEventOnce('calculator_address_error', {
        step: ERROR_CODE[reason],
        meta: {
          reason,
          typedLength: inputRef.current?.value.trim().length ?? 0,
          ...extra,
          ...flowVersionMeta,
          ...addressFlowMeta,
        },
      })
    },
    []
  )

  const emitAddressTyped = useCallback((value: string) => {
    if (value.trim().length < TYPED_MIN_CHARS) return
    trackFunnelEventOnce('calculator_address_typed', {
      meta: { ...flowVersionMeta },
    })
  }, [])

  const emitStepOneInteraction = useCallback(() => {
    stepOneViewedRef.current = true
    trackFunnelEventOnce('calculator_step_viewed', {
      step: 1,
      meta: { ...flowVersionMeta },
    })
  }, [])

  const acceptAddress = useCallback(
    (acceptance: Acceptance) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      clearPending()
      abortRun()
      setBusyState(false)

      const accepted = acceptance.address
      trackFunnelEventOnce('address_resolved', {
        meta: {
          hasPostalCode: !!accepted.postalCode,
          hasCity: !!accepted.city,
          hasStreet: !!accepted.street,
          hasStreetNumber: !!accepted.streetNumber,
          hasCanton: !!accepted.canton,
          source: acceptance.source,
          provider: acceptance.provider,
          pick: acceptance.pick,
          trigger: acceptance.trigger,
          ...flowVersionMeta,
          ...addressFlowMeta,
        },
      })

      const store = useSolarAboCalculatorStore.getState()
      store.setParsedAddress({
        street: accepted.street,
        streetNumber: accepted.streetNumber,
        postalCode: accepted.postalCode,
        city: accepted.city,
        canton: accepted.canton,
      })
      void store.fetchElectricityPriceForAddress()
      const point = { lat: accepted.lat, lng: accepted.lng }
      store.setSelectedLocation(point)
      store.setLocationPrecision('address')
      if (acceptance.row) {
        clearAddressMatch()
        store.setAddressMatch(addressMatchFromRow(acceptance.row))
      } else {
        store.setAddressMatch(null)
        startAddressMatch(
          {
            street: accepted.street,
            streetNumber: accepted.streetNumber,
            postalCode: accepted.postalCode,
            lat: accepted.lat,
            lng: accepted.lng,
          },
          {
            onMatch: match => {
              const current = useSolarAboCalculatorStore.getState()
              const location = current.selectedLocation
              if (
                location &&
                location.lat === point.lat &&
                location.lng === point.lng
              ) {
                current.setAddressMatch(match)
              }
            },
          }
        )
      }
      store.setAddress(accepted.formatted)
      setError(null)
      setHint(null)
      setPanel(null)
      goToStep(mapStep)
    },
    [abortRun, clearPending, goToStep, setBusyState]
  )

  const openPinMode = useCallback(
    (
      from: 'screen1' | 'houseNumber',
      street: StreetContext | undefined,
      point: Point
    ) => {
      if (resolvedRef.current) return
      resolvedRef.current = true
      clearPending()
      abortRun()
      setBusyState(false)

      const typed = inputRef.current?.value.trim() ?? ''
      const fallback = street
        ? `${street.street}, ${street.postalCode} ${street.city}`.trim()
        : ''
      const store = useSolarAboCalculatorStore.getState()
      store.setParsedAddress({
        street: street?.street ?? '',
        streetNumber: '',
        postalCode: street?.postalCode ?? '',
        city: street?.city ?? '',
        canton: street?.canton ?? '',
      })
      if (street?.postalCode) void store.fetchElectricityPriceForAddress()
      store.setSelectedLocation(point)
      clearAddressMatch()
      store.setAddressMatch(null)
      store.setLocationPrecision('street')
      store.setAddress(typed || fallback)
      trackRoofPinMode({ from, outcome: 'opened' })
      setPanel(null)
      goToStep(mapStep)
    },
    [abortRun, clearPending, goToStep, setBusyState]
  )

  const showNotFound = useCallback(
    (cause: NotFoundCause, street?: StreetContext, point?: Point) => {
      setPanel({ kind: 'notFound', street, point })
      emitAddressError('notFound', { cause })
    },
    [emitAddressError]
  )

  const showOutsideCh = useCallback(
    (placeSource: 'places' | 'federal') => {
      setPanel(null)
      setError('outsideCh')
      emitAddressError('outsideCh', { placeSource })
    },
    [emitAddressError]
  )

  const openHousePanel = useCallback(
    (options: Omit<Extract<Panel, { kind: 'house' }>, 'kind' | 'key'>) => {
      houseKeyRef.current += 1
      setPanel({ kind: 'house', key: houseKeyRef.current, ...options })
    },
    []
  )

  const handleOutcome = useCallback(
    (result: ResolveResult, trigger: ResolveTrigger) => {
      switch (result.outcome) {
        case 'resolved': {
          const resolved = result.address
          if (!resolved) {
            showNotFound(notFoundCause(trigger))
            return
          }
          acceptAddress({
            address: resolved,
            source: trigger === 'prefill' ? 'prefill' : resolved.provider,
            provider: resolved.provider,
            pick: 'auto',
            trigger,
            row: result.row,
          })
          return
        }
        case 'candidates': {
          const candidates = result.candidates ?? []
          if (candidates.length === 0) {
            showNotFound(notFoundCause(trigger))
            return
          }
          setPanel({ kind: 'candidates', candidates })
          return
        }
        case 'houseNumber': {
          if (!result.street) {
            showNotFound(notFoundCause(trigger))
            return
          }
          const fromPrefill = trigger === 'prefill'
          openHousePanel({
            street: result.street,
            opener: fromPrefill ? 'noStreetNumber' : 'resolver',
            notInRegister: false,
            point: result.point,
          })
          if (fromPrefill) {
            emitAddressError('noStreetNumber', {
              ui: 'housePanel',
              placeSource: 'prefill',
            })
          }
          return
        }
        case 'notInRegister': {
          if (!result.street) {
            showNotFound(notFoundCause(trigger))
            return
          }
          openHousePanel({
            street: result.street,
            opener: 'resolver',
            initialNumber: result.typedNumber,
            initialChips: result.chips,
            notInRegister: true,
            point: result.point,
          })
          emitAddressError('notFound', { cause: 'houseNumber' })
          return
        }
        case 'needLocality':
        case 'needStreet':
          setHint(result.outcome)
          inputRef.current?.focus()
          return
        case 'networkError':
          setManual({
            source: 'places_unavailable',
            trigger: 'auto',
            reason: 'networkError',
          })
          return
        case 'outsideCh':
          showOutsideCh('federal')
          return
        default:
          showNotFound(
            notFoundCause(trigger),
            result.street,
            result.precision === 'street' ? result.point : undefined
          )
      }
    },
    [
      acceptAddress,
      emitAddressError,
      openHousePanel,
      showNotFound,
      showOutsideCh,
    ]
  )

  const runResolver = useCallback(
    async (text: string, trigger: ResolveTrigger) => {
      if (resolvedRef.current) return
      abortRun()
      if (pendingTimerRef.current !== null) {
        window.clearTimeout(pendingTimerRef.current)
        pendingTimerRef.current = null
      }
      pendingPickRef.current = null
      const controller = new AbortController()
      runRef.current = controller
      lastTriggerRef.current = trigger
      setBusyState(true)
      setHint(null)
      setError(null)
      setPanel(null)
      setFederalOpen(false)

      const withGeocoder =
        modeRef.current === 'google' && placesReadyRef.current
      const startedAt = Date.now()
      let result: ResolveResult
      try {
        result = await getResolver().resolve(text, {
          trigger,
          geocoder: withGeocoder ? geocoder : undefined,
          signal: controller.signal,
        })
      } catch (caught) {
        if (isAbortError(caught) || controller.signal.aborted) {
          if (runRef.current === controller) {
            runRef.current = null
            setBusyState(false)
          }
          return
        }
        result = {
          outcome: 'notFound',
          provider: null,
          trigger,
          federalRows: 0,
          ms: Date.now() - startedAt,
        }
      }
      if (controller.signal.aborted || runRef.current !== controller) return
      runRef.current = null
      setBusyState(false)
      if (resolvedRef.current) return

      trackAddressFallback({
        trigger,
        outcome: result.outcome,
        provider: result.provider,
        candidateCount: result.candidates?.length ?? 0,
        federalRows: result.federalRows,
        ms: result.ms,
        typedLength: text.trim().length,
        predictionsSeen: predictionsSeenRef.current,
      })
      handleOutcome(result, trigger)
    },
    [abortRun, geocoder, getResolver, handleOutcome, setBusyState]
  )

  const handlePlace = useCallback(
    (place: google.maps.places.PlaceResult | undefined) => {
      if (resolvedRef.current || modeRef.current !== 'google') return
      const pending = pendingPickRef.current

      const text = inputRef.current?.value.trim() ?? ''
      if (!place?.geometry?.location || !place.formatted_address) {
        clearPending()
        if (text) void runResolver(text, 'textEntered')
        return
      }
      abortRun()
      clearPending()

      const components = place.address_components ?? []
      const component = (type: string) =>
        components.find(entry => entry.types?.includes(type))

      const countryCode = component('country')?.short_name ?? ''
      if (countryCode && countryCode !== 'CH') {
        showOutsideCh('places')
        return
      }

      const street = component('route')?.long_name ?? ''
      const postalCode = component('postal_code')?.long_name ?? ''
      const city =
        component('locality')?.long_name ||
        component('postal_town')?.long_name ||
        component('administrative_area_level_2')?.long_name ||
        ''
      const cantonComponent = component('administrative_area_level_1')
      const canton =
        cantonComponent?.short_name || cantonComponent?.long_name || ''
      const point = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }

      const streetNumber = component('street_number')?.long_name ?? ''
      if (!streetNumber) {
        if (!street || !postalCode) {
          if (text) void runResolver(text, 'textEntered')
          return
        }
        setError(null)
        setHint(null)
        lastTriggerRef.current = null
        openHousePanel({
          street: { street, postalCode, city, canton },
          opener: 'noStreetNumber',
          notInRegister: false,
          point,
        })
        emitAddressError('noStreetNumber', {
          ui: 'housePanel',
          placeSource: 'places',
        })
        return
      }

      acceptAddress({
        address: {
          street,
          streetNumber,
          postalCode,
          city,
          canton,
          formatted: place.formatted_address,
          lat: point.lat,
          lng: point.lng,
        },
        source: 'places',
        provider: 'places',
        pick: pending?.auto ? 'auto' : 'user',
        trigger: null,
      })
    },
    [
      abortRun,
      acceptAddress,
      clearPending,
      emitAddressError,
      openHousePanel,
      runResolver,
      showOutsideCh,
    ]
  )

  const handlePlaceRef = useRef(handlePlace)
  handlePlaceRef.current = handlePlace

  const enterFederal = useCallback((cause: PlacesFallbackCause) => {
    if (modeRef.current === 'federal') return
    const el = inputRef.current
    const hadFocus =
      !!el &&
      (document.activeElement === el ||
        (el.disabled && Date.now() - blurredAtRef.current < BLUR_GRACE_MS))
    modeRef.current = 'federal'
    trackPlacesFallback({
      cause,
      msSinceMount: Date.now() - mountedAtRef.current,
    })
    setTypedAddress(el?.value ?? '')
    if (autocompleteRef.current) {
      restoreFocusRef.current = hadFocus
      setInputKey(key => key + 1)
    }
    setMode('federal')
  }, [])

  const enterFederalRef = useRef(enterFederal)
  enterFederalRef.current = enterFederal

  useEffect(() => {
    setHydrated(true)
    setCallbackLink(ensureCallbackVariant())
    const el = inputRef.current
    if (!el) return
    const value = el.value
    setTypedAddress(value)
    if (!value.trim() || value.trim() === initialAddressRef.current.trim()) {
      return
    }
    preHydrationTypedRef.current = true
    stepOneViewedRef.current = true
    trackFunnelEventOnce('calculator_step_viewed', {
      step: 1,
      meta: { ...flowVersionMeta, preHydration: true },
    })
    if (value.trim().length >= TYPED_MIN_CHARS) {
      trackFunnelEventOnce('calculator_address_typed', {
        meta: { ...flowVersionMeta, preHydration: true },
      })
    }
  }, [ensureCallbackVariant])

  // An address handed over in the URL fills the field. It is resolved only
  // when the visitor submits it unchanged, so the visitor still sees and
  // confirms the address first.
  useEffect(() => {
    if (preHydrationTypedRef.current) return
    let prefill: string | null = null
    try {
      prefill = new URLSearchParams(window.location.search).get(PREFILL_PARAM)
    } catch {
      return
    }
    const value = prefill?.trim().slice(0, PREFILL_MAX_CHARS) ?? ''
    if (!value || value === initialAddressRef.current.trim()) return
    prefillRef.current = value
    setTypedAddress(value)
    if (inputRef.current) inputRef.current.value = value
  }, [])

  useEffect(() => {
    const previousAuthFailure = window.gm_authFailure
    const onAuthFailure = () => enterFederalRef.current('authFailure')
    window.gm_authFailure = onAuthFailure
    const restoreAuthFailure = () => {
      if (window.gm_authFailure === onAuthFailure) {
        window.gm_authFailure = previousAuthFailure
      }
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      enterFederalRef.current('noKey')
      return restoreAuthFailure
    }

    let cancelled = false
    const slowTimer = window.setTimeout(() => {
      if (cancelled || placesReadyRef.current) return
      slowArmedRef.current = true
      if (inputRef.current?.value.trim()) enterFederalRef.current('slow')
    }, PLACES_SLOW_MS)

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    })
    loaderRef.current = loader
    loader
      .importLibrary('places')
      .then(({ Autocomplete }) => {
        if (cancelled) return
        window.clearTimeout(slowTimer)
        autocompleteClassRef.current = Autocomplete
        placesReadyRef.current = true
        setPlacesReady(true)
        trackFunnelEventOnce('calculator_ready', {
          meta: {
            msToPlacesReady: Date.now() - mountedAtRef.current,
            callbackLink: embedded ? null : ensureCallbackVariant(),
            ...flowVersionMeta,
          },
        })
      })
      .catch(() => {
        if (cancelled) return
        window.clearTimeout(slowTimer)
        enterFederalRef.current('loadError')
      })

    return () => {
      cancelled = true
      window.clearTimeout(slowTimer)
      restoreAuthFailure()
    }
  }, [embedded, ensureCallbackVariant])

  useEffect(() => {
    if (mode !== 'google' || !placesReady) return
    const AutocompleteClass = autocompleteClassRef.current
    const el = inputRef.current
    if (!AutocompleteClass || !el) return

    const before = new Set(
      Array.from(document.querySelectorAll<HTMLElement>('.pac-container'))
    )
    const autocomplete = new AutocompleteClass(el, {
      componentRestrictions: { country: 'ch' },
      fields: ['formatted_address', 'geometry', 'address_components'],
      types: ['address'],
    })
    autocomplete.addListener('place_changed', () => {
      handlePlaceRef.current(autocomplete.getPlace())
    })
    autocompleteRef.current = autocomplete

    let observer: MutationObserver | null = null
    const claimContainer = () => {
      if (ownPacRef.current) return
      const container = Array.from(
        document.querySelectorAll<HTMLElement>('.pac-container')
      ).find(
        node => !before.has(node) && !node.hasAttribute('data-calc-address')
      )
      if (!container) return
      container.setAttribute('data-calc-address', '')
      container.setAttribute('data-hj-suppress', '')
      container.setAttribute('data-cs-mask', '')
      ownPacRef.current = container
      const check = () => {
        if (
          container.querySelector('.pac-item') &&
          container.style.display !== 'none'
        ) {
          predictionsSeenRef.current = true
        }
      }
      observer = new MutationObserver(check)
      observer.observe(container, {
        childList: true,
        attributes: true,
        attributeFilter: ['style'],
      })
      check()
    }
    claimContainer()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      claimContainer()
      const suggestions = visibleSuggestionState()
      if (!suggestions) return
      predictionsSeenRef.current = true
      pendingPickRef.current = { at: Date.now(), auto: !suggestions.selected }
      if (!suggestions.selected) dispatchKey(el, 'ArrowDown', 40)
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('.pac-item')) {
        predictionsSeenRef.current = true
        pendingPickRef.current = { at: Date.now(), auto: false }
      }
    }
    el.addEventListener('keydown', onKeyDown, true)
    el.addEventListener('input', claimContainer)
    el.addEventListener('focus', claimContainer)
    document.addEventListener('pointerdown', onPointerDown, true)

    const syntheticTimer = window.setTimeout(() => {
      claimContainer()
      if (document.activeElement !== el || busyRef.current) return
      if (el.value.trim().length < TYPED_MIN_CHARS) return
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }, SYNTHETIC_INPUT_DELAY_MS)

    return () => {
      window.clearTimeout(syntheticTimer)
      el.removeEventListener('keydown', onKeyDown, true)
      el.removeEventListener('input', claimContainer)
      el.removeEventListener('focus', claimContainer)
      document.removeEventListener('pointerdown', onPointerDown, true)
      observer?.disconnect()
      const events = window.google?.maps?.event
      events?.clearInstanceListeners(autocomplete)
      events?.clearInstanceListeners(el)
      ownPacRef.current?.remove()
      ownPacRef.current = null
      if (autocompleteRef.current === autocomplete) {
        autocompleteRef.current = null
      }
    }
  }, [mode, placesReady])

  useEffect(() => {
    if (!restoreFocusRef.current) return
    restoreFocusRef.current = false
    focusAtEnd(inputRef.current)
  }, [inputKey])

  useEffect(() => {
    if (mode !== 'federal') return
    const text = typedAddress.trim()
    if (text.length < FEDERAL_LIST_MIN_CHARS) {
      setFederalOptions([])
      return
    }
    const decimalTyped = /\d\.\d/.test(text)
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      searchOnce(text, { limit: 10, signal: controller.signal })
        .then(rows => {
          if (controller.signal.aborted) return
          setFederalOptions(
            rows
              .filter(
                row =>
                  !row.noNumber &&
                  !row.outsideCh &&
                  (!row.decimal || decimalTyped)
              )
              .slice(0, FEDERAL_LIST_MAX_ROWS)
              .map(row => candidateFromRow(row))
          )
          setFederalActive(-1)
        })
        .catch(() => {
          if (!controller.signal.aborted) setFederalOptions([])
        })
    }, FEDERAL_LIST_DEBOUNCE_MS)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [mode, typedAddress])

  useEffect(() => {
    document.body.classList.toggle('calc-address-busy', busy || panel !== null)
  }, [busy, panel])

  useEffect(() => {
    if (manual || !focusAfterManualRef.current) return
    focusAfterManualRef.current = false
    focusAtEnd(inputRef.current)
  }, [manual])

  useEffect(() => {
    return () => {
      document.body.classList.remove('calc-address-busy')
      runRef.current?.abort()
      runRef.current = null
      if (pendingTimerRef.current !== null) {
        window.clearTimeout(pendingTimerRef.current)
        pendingTimerRef.current = null
      }
      if (blurTimerRef.current !== null) {
        window.clearTimeout(blurTimerRef.current)
        blurTimerRef.current = null
      }
      resolverRef.current?.clear()
    }
  }, [])

  const resetInteraction = () => {
    setError(null)
    setHint(null)
    setPanel(null)
    abortRun()
    pendingPickRef.current = null
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current)
      pendingTimerRef.current = null
    }
    setBusyState(false)
    resolvedRef.current = false
  }

  const waitForPendingPick = () => {
    setBusyState(true)
    setHint(null)
    setError(null)
    if (pendingTimerRef.current !== null) return
    const pending = pendingPickRef.current
    const elapsed = pending ? Date.now() - pending.at : 0
    pendingTimerRef.current = window.setTimeout(
      () => {
        pendingTimerRef.current = null
        pendingPickRef.current = null
        if (resolvedRef.current) return
        const text = inputRef.current?.value.trim() ?? ''
        if (!text) {
          setBusyState(false)
          return
        }
        void runResolver(text, 'pendingTimeout')
      },
      Math.max(0, PENDING_PICK_MS - elapsed)
    )
  }

  const pickFederal = (candidate: AddressCandidate) => {
    const el = inputRef.current
    if (el) el.value = candidate.address.formatted
    setTypedAddress(candidate.address.formatted)
    setFederalOpen(false)
    acceptAddress({
      address: candidate.address,
      source: 'federalList',
      provider: 'federal',
      pick: 'user',
      trigger: null,
      row: candidate.row,
    })
  }

  const federalListVisible =
    mode === 'federal' &&
    federalOpen &&
    federalOptions.length > 0 &&
    !busy &&
    panel === null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busyRef.current) return
    const el = inputRef.current
    const value = el?.value.trim() ?? ''
    if (!value) {
      const focusedBefore = stepOneViewedRef.current
      el?.focus()
      setPanel(null)
      setHint(null)
      setError('empty')
      emitAddressError('empty', { focusMoved: true, focusedBefore })
      return
    }

    const stored = useSolarAboCalculatorStore.getState()
    if (stored.selectedLocation && value === stored.address.trim()) {
      if (resolvedRef.current) return
      resolvedRef.current = true
      setError(null)
      goToStep(mapStep)
      return
    }

    if (panel?.kind === 'house') {
      houseRef.current?.submit()
      return
    }

    if (modeRef.current === 'federal') {
      const active = federalListVisible ? federalOptions[federalActive] : null
      if (active) {
        pickFederal(active)
        return
      }
      void runResolver(
        value,
        prefillRef.current && value === prefillRef.current
          ? 'prefill'
          : 'federalMode'
      )
      return
    }

    const pending = pendingPickRef.current
    if (pending && Date.now() - pending.at < PENDING_PICK_MS) {
      waitForPendingPick()
      return
    }

    const suggestions = el ? visibleSuggestionState() : null
    if (el && suggestions) {
      predictionsSeenRef.current = true
      const auto = !suggestions.selected
      if (auto) dispatchKey(el, 'ArrowDown', 40)
      dispatchKey(el, 'Enter', 13)
      pendingPickRef.current = { at: Date.now(), auto }
      waitForPendingPick()
      return
    }

    if (getResolver().isRunning(value, placesReadyRef.current)) return

    if (prefillRef.current && value === prefillRef.current) {
      void runResolver(value, 'prefill')
      return
    }

    emitAddressError('notChosen', { handling: 'resolver' })
    void runResolver(value, 'notChosen')
  }

  const keepInputFocusWhileSuggesting = (event: React.MouseEvent) => {
    if (visibleSuggestionState()) event.preventDefault()
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (modeRef.current !== 'federal') return
    if (!federalListVisible) {
      if (event.key === 'ArrowDown' && federalOptions.length > 0) {
        event.preventDefault()
        setFederalOpen(true)
        setFederalActive(0)
      }
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setFederalActive(index => Math.min(index + 1, federalOptions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setFederalActive(index => Math.max(index - 1, 0))
    } else if (event.key === 'Escape') {
      setFederalOpen(false)
    } else if (event.key === 'Enter' && federalOptions[federalActive]) {
      event.preventDefault()
      pickFederal(federalOptions[federalActive])
    }
  }

  const clearField = () => {
    const el = inputRef.current
    if (el) el.value = ''
    setTypedAddress('')
    setFederalOptions([])
    setFederalActive(-1)
    resetInteraction()
    focusAtEnd(el)
  }

  const openManualCheck = (reason: ManualReason, street?: StreetContext) => {
    setTypedAddress(inputRef.current?.value ?? typedAddress)
    setManual({ source: 'address_not_found', trigger: 'click', reason, street })
  }

  const backFromManual = () => {
    focusAfterManualRef.current = true
    setManual(null)
  }

  const manualCheckLink = (chunks: React.ReactNode) => (
    <button
      type="button"
      onClick={() => openManualCheck('outsideCh')}
      className="underline underline-offset-2 text-red-700 hover:text-red-800"
    >
      {chunks}
    </button>
  )

  const onHouseAccept = (
    resolved: ResolvedAddress,
    row: SwissAddressRow | undefined
  ) => {
    acceptAddress({
      address: resolved,
      source: 'houseNumberPrompt',
      provider: resolved.provider,
      pick: 'user',
      trigger: lastTriggerRef.current,
      row,
    })
  }

  const describedBy = error ? ERROR_ID : hint ? HINT_ID : undefined

  return (
    <div className="flex flex-col items-center px-4 py-12 sm:py-16">
      {manual && (
        <div className="flex w-full flex-col items-center">
          <ManualCheckCapture
            source={manual.source}
            trigger={manual.trigger}
            reason={manual.reason}
            focusHeading
            prefill={{
              address: typedAddress || address,
              postalCode: manual.street?.postalCode,
              city: manual.street?.city,
            }}
          />
          <button
            type="button"
            onClick={backFromManual}
            className="mt-6 min-h-[44px] text-base text-[#062E25] underline underline-offset-2"
          >
            {t('backToAddress')}
          </button>
        </div>
      )}

      <div
        className={cn('flex w-full flex-col items-center', manual && 'hidden')}
      >
        <div className="w-full max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#B7FE1A] px-4 py-1.5 text-base font-medium text-[#062E25]">
            {t('badge')}
          </span>
          <Heading className="mt-4 text-2xl sm:text-[34px] font-medium text-[#062E25]">
            {t('headline')}
          </Heading>
          <p className="mt-3 text-base sm:text-lg text-[#062E25]/80 tracking-tight">
            {t('subline')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 w-full max-w-md"
        >
          <label
            htmlFor={INPUT_ID}
            className="text-base text-[#062E25] tracking-tight"
          >
            {t('fieldLabel')}
          </label>
          <div className="relative mt-1.5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#062E25]/30 pointer-events-none" />
            <Input
              key={inputKey}
              id={INPUT_ID}
              ref={inputRef}
              type="text"
              defaultValue={typedAddress}
              onFocus={() => {
                emitStepOneInteraction()
                if (modeRef.current === 'federal') setFederalOpen(true)
              }}
              onBlur={() => {
                blurredAtRef.current = Date.now()
                if (modeRef.current !== 'federal') return
                if (blurTimerRef.current !== null) {
                  window.clearTimeout(blurTimerRef.current)
                }
                blurTimerRef.current = window.setTimeout(() => {
                  blurTimerRef.current = null
                  setFederalOpen(false)
                }, 150)
              }}
              onChange={event => {
                const value = event.target.value
                emitStepOneInteraction()
                emitAddressTyped(value)
                setTypedAddress(value)
                resetInteraction()
                if (
                  modeRef.current === 'google' &&
                  slowArmedRef.current &&
                  !placesReadyRef.current
                ) {
                  enterFederal('slow')
                }
                if (modeRef.current === 'federal') {
                  setFederalOpen(true)
                  setFederalActive(-1)
                }
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={t('placeholder')}
              autoComplete={mode === 'federal' ? 'off' : 'street-address'}
              role={mode === 'federal' ? 'combobox' : undefined}
              aria-expanded={
                mode === 'federal' ? federalListVisible : undefined
              }
              aria-controls={mode === 'federal' ? LIST_ID : undefined}
              aria-autocomplete={mode === 'federal' ? 'list' : undefined}
              aria-activedescendant={
                federalListVisible && federalActive >= 0
                  ? `${LIST_ID}-opt-${federalActive}`
                  : undefined
              }
              aria-invalid={!!error}
              aria-describedby={describedBy}
              className={cn(
                'h-14 text-base md:text-base pl-12 pr-4 rounded-xl border-[#062E25]/20 bg-white shadow-sm focus-visible:border-[#062E25]/40',
                typedAddress && 'pr-14',
                error && 'border-red-500 focus-visible:border-red-500'
              )}
            />
            {typedAddress && (
              <button
                type="button"
                aria-label={t('clearInput')}
                onMouseDown={event => event.preventDefault()}
                onClick={clearField}
                className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg text-[#062E25]/50 hover:text-[#062E25]"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {federalListVisible && (
              <FederalAddressList
                id={LIST_ID}
                options={federalOptions}
                activeIndex={federalActive}
                onPick={pickFederal}
              />
            )}
          </div>

          <p role="status" className="sr-only">
            {busy ? t('resolving') : ''}
          </p>

          {error && (
            <p
              id={ERROR_ID}
              role="alert"
              className="mt-2 text-base text-red-600"
            >
              {error === 'outsideCh'
                ? tErrors.rich('outsideCh', { link: manualCheckLink })
                : tErrors(error)}
            </p>
          )}

          {hint && (
            <p
              id={HINT_ID}
              role="status"
              className="mt-2 text-base text-[#062E25]"
            >
              {tErrors(hint)}
            </p>
          )}

          {panel?.kind === 'candidates' && (
            <AddressCandidates
              candidates={panel.candidates}
              headingAs={embedded ? 'h4' : 'h2'}
              onPick={candidate =>
                acceptAddress({
                  address: candidate.address,
                  source: 'candidate',
                  provider: 'federal',
                  pick: 'user',
                  trigger: lastTriggerRef.current,
                  row: candidate.row,
                })
              }
              onNone={() => showNotFound('candidatesRejected')}
            />
          )}

          {panel?.kind === 'house' && (
            <HouseNumberPanel
              key={panel.key}
              ref={houseRef}
              street={panel.street}
              opener={panel.opener}
              initialNumber={panel.initialNumber}
              initialChips={panel.initialChips}
              notInRegister={panel.notInRegister}
              point={panel.point}
              geocoder={mode === 'google' && placesReady ? geocoder : undefined}
              onAccept={onHouseAccept}
              onNotInRegister={() =>
                emitAddressError('notFound', { cause: 'houseNumber' })
              }
              onShowMap={point =>
                openPinMode('houseNumber', panel.street, point)
              }
              onManualCheck={reason => openManualCheck(reason, panel.street)}
            />
          )}

          {panel?.kind === 'notFound' && (
            <AddressNotFoundPanel
              onEdit={() => {
                trackNotFoundAction('edit')
                focusAtEnd(inputRef.current)
              }}
              onMap={
                panel.point
                  ? () => {
                      const point = panel.point
                      if (!point) return
                      trackNotFoundAction('map')
                      openPinMode('screen1', panel.street, point)
                    }
                  : undefined
              }
              onManual={() => {
                trackNotFoundAction('manual')
                openManualCheck('notFound', panel.street)
              }}
            />
          )}

          <Button
            type="submit"
            disabled={!hydrated}
            aria-disabled={busy || undefined}
            onMouseDown={keepInputFocusWhileSuggesting}
            className="mt-6 h-12 w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90 disabled:opacity-100"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? t('resolving') : t('button')}
          </Button>

          {!embedded && callbackLink === 'shown' && (
            <div className="mt-2 flex justify-center md:hidden">
              <Link
                href="/offer-request"
                onClick={() =>
                  trackFunnelEvent('callback_link_clicked', {
                    meta: { ...flowVersionMeta },
                  })
                }
                className="inline-flex min-h-[44px] items-center text-base text-[#062E25] underline underline-offset-2"
              >
                {t('callbackLink')}
              </Link>
            </div>
          )}

          {!embedded && (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-6 text-base text-[#062E25]/80">
              <a
                href={COMPANY_MAIN_PHONE_TEL_HREF}
                className="inline-flex min-h-[44px] items-center underline underline-offset-2"
              >
                {t('contactLine.phone', { phone: COMPANY_MAIN_PHONE_DISPLAY })}
              </a>
              <Link
                href="/impressum"
                className="inline-flex min-h-[44px] items-center underline underline-offset-2"
              >
                {t('contactLine.legalNotice')}
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
