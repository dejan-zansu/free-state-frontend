'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  type HouseNumberOpener,
  trackHouseNumber,
} from '@/lib/address/address-events'
import {
  type Geocoder,
  type HouseNumberChip,
  type ResolvedAddress,
  type StreetContext,
  fetchHouseNumberChips,
  normalizeHouseNumber,
  resolveHouseNumber,
} from '@/lib/address/resolve-address'
import { type SwissAddressRow, isAbortError } from '@/lib/address/swiss-address'

export interface HouseNumberPanelHandle {
  submit: () => void
}

export type HouseNumberAcceptHow = 'chip' | 'federalMatch' | 'geocoder'

type Point = { lat: number; lng: number }

const HOUSE_NUMBER_ID = 'calculator-v2-house-number'
const REQUIRED_ID = 'calculator-v2-house-number-required'
const MISSING_ID = 'calculator-v2-house-number-missing'
const LIVE_CHIPS_DEBOUNCE_MS = 250

const ACTION_CLASS =
  'min-h-12 w-full whitespace-normal rounded-xl border-[#062E25]/25 bg-white text-base text-[#062E25] hover:bg-[#062E25]/5'

export default function HouseNumberPanel({
  ref,
  street,
  opener,
  initialNumber = '',
  initialChips,
  notInRegister = false,
  point,
  geocoder,
  onAccept,
  onNotInRegister,
  onShowMap,
  onManualCheck,
}: {
  ref?: Ref<HouseNumberPanelHandle>
  street: StreetContext
  opener: HouseNumberOpener
  initialNumber?: string
  initialChips?: HouseNumberChip[]
  notInRegister?: boolean
  point?: Point
  geocoder?: Geocoder
  onAccept: (
    address: ResolvedAddress,
    row: SwissAddressRow | undefined,
    how: HouseNumberAcceptHow
  ) => void
  onNotInRegister: () => void
  onShowMap: (point: Point) => void
  onManualCheck: (reason: 'noNumber' | 'notInRegister') => void
}) {
  const t = useTranslations('calculatorV2.screen1')

  const [number, setNumber] = useState(initialNumber)
  const [userTyped, setUserTyped] = useState(false)
  const [chips, setChips] = useState<HouseNumberChip[]>(initialChips ?? [])
  const [missing, setMissing] = useState<{
    number: string
    point?: Point
  } | null>(
    notInRegister
      ? { number: normalizeHouseNumber(initialNumber), point }
      : null
  )
  const [searching, setSearching] = useState(false)
  const [required, setRequired] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const searchRef = useRef<AbortController | null>(null)
  const searchingRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    inputRef.current?.scrollIntoView({ block: 'nearest' })
  }, [])

  useEffect(() => {
    return () => searchRef.current?.abort()
  }, [])

  useEffect(() => {
    if (!notInRegister || (initialChips && initialChips.length > 0)) return
    const typed = normalizeHouseNumber(initialNumber)
    if (!typed) return
    const controller = new AbortController()
    fetchHouseNumberChips(
      {
        street: street.street,
        postalCode: street.postalCode,
        city: street.city,
        typed,
        mode: 'all',
      },
      { signal: controller.signal }
    )
      .then(result => {
        if (!controller.signal.aborted) setChips(result)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [notInRegister, initialChips, initialNumber, street])

  useEffect(() => {
    if (!userTyped) return
    const typed = normalizeHouseNumber(number)
    if (!typed) {
      setChips([])
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      fetchHouseNumberChips(
        {
          street: street.street,
          postalCode: street.postalCode,
          city: street.city,
          typed,
          mode: 'live',
        },
        { signal: controller.signal }
      )
        .then(result => {
          if (!controller.signal.aborted) setChips(result)
        })
        .catch(() => {})
    }, LIVE_CHIPS_DEBOUNCE_MS)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [userTyped, number, street])

  const submit = useCallback(async () => {
    if (searchingRef.current) return
    const typed = normalizeHouseNumber(number)
    if (!typed) {
      setRequired(true)
      inputRef.current?.focus()
      return
    }
    setRequired(false)
    searchRef.current?.abort()
    const controller = new AbortController()
    searchRef.current = controller
    searchingRef.current = true
    setSearching(true)
    try {
      const result = await resolveHouseNumber(
        { ...street, number: typed },
        { geocoder, signal: controller.signal }
      )
      if (controller.signal.aborted) return
      if (result.outcome !== 'notInRegister' && result.address) {
        trackHouseNumber({
          outcome: result.outcome,
          opener,
          chipCount: chips.length,
        })
        onAccept(result.address, result.row, result.outcome)
        return
      }
      trackHouseNumber({
        outcome: 'notInRegister',
        opener,
        chipCount: result.chips.length,
      })
      setChips(result.chips)
      setMissing({ number: typed, point: result.point ?? point })
      onNotInRegister()
    } catch (error) {
      if (isAbortError(error) || controller.signal.aborted) return
      trackHouseNumber({ outcome: 'notInRegister', opener, chipCount: 0 })
      setMissing({ number: typed, point })
      onNotInRegister()
    } finally {
      if (searchRef.current === controller) {
        searchRef.current = null
        searchingRef.current = false
        setSearching(false)
      }
    }
  }, [
    number,
    street,
    geocoder,
    opener,
    chips.length,
    point,
    onAccept,
    onNotInRegister,
  ])

  useImperativeHandle(ref, () => ({ submit: () => void submit() }), [submit])

  const pickChip = (chip: HouseNumberChip) => {
    trackHouseNumber({ outcome: 'chip', opener, chipCount: chips.length })
    onAccept(chip.address, chip.row, 'chip')
  }

  const describedBy = required ? REQUIRED_ID : missing ? MISSING_ID : undefined

  return (
    <div data-hj-suppress data-cs-mask className="mt-4">
      <p className="text-base font-medium text-[#062E25]">
        {`${street.street}, ${street.postalCode} ${street.city}`.trim()}
      </p>
      <label
        htmlFor={HOUSE_NUMBER_ID}
        className="mt-3 block text-base text-[#062E25] tracking-tight"
      >
        {t('houseNumber.label')}
      </label>
      <p className="mt-1 text-base text-[#062E25]/80 tracking-tight">
        {t('houseNumber.helper')}
      </p>
      <div className="mt-1.5 flex gap-2">
        <Input
          id={HOUSE_NUMBER_ID}
          ref={inputRef}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          value={number}
          onChange={event => {
            setNumber(event.target.value)
            setUserTyped(true)
            setRequired(false)
            setMissing(null)
          }}
          onKeyDown={event => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            void submit()
          }}
          aria-invalid={required}
          aria-describedby={describedBy}
          className="h-14 w-32 text-base md:text-base px-4 rounded-xl border-[#062E25]/20 bg-white shadow-sm focus-visible:border-[#062E25]/40"
        />
        <Button
          type="button"
          aria-disabled={searching || undefined}
          onClick={() => void submit()}
          className="h-14 flex-1 bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
        >
          {searching && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('houseNumber.button')}
        </Button>
      </div>

      {required && (
        <p
          id={REQUIRED_ID}
          role="alert"
          className="mt-2 text-base text-red-600"
        >
          {t('houseNumber.required')}
        </p>
      )}

      {missing && (
        <p
          id={MISSING_ID}
          role="status"
          className="mt-2 text-base text-[#062E25]"
        >
          {t(
            missing.point
              ? 'houseNumber.notFound'
              : 'houseNumber.notFoundNoMap',
            { number: missing.number }
          )}
        </p>
      )}

      {chips.length > 0 && (
        <div className="mt-3">
          <p className="text-base text-[#062E25]/80 tracking-tight">
            {t('houseNumber.chips')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {chips.map(chip => (
              <button
                key={chip.row.featureId || chip.number}
                type="button"
                aria-label={chip.label}
                onClick={() => pickChip(chip)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#062E25]/25 bg-white px-4 text-base text-[#062E25] hover:border-[#062E25]/50 hover:bg-[#062E25]/5"
              >
                {chip.number}
              </button>
            ))}
          </div>
          <p className="mt-2 text-base text-[#062E25]/70">
            {t('candidates.attribution')}
          </p>
        </div>
      )}

      {missing && (
        <div className="mt-4 flex flex-col gap-2">
          {missing.point && (
            <Button
              type="button"
              variant="outline"
              onClick={() => missing.point && onShowMap(missing.point)}
              className={ACTION_CLASS}
            >
              {t('notFound.map')}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onManualCheck('notInRegister')}
            className={ACTION_CLASS}
          >
            {t('notFound.manual')}
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          trackHouseNumber({
            outcome: 'noNumberLink',
            opener,
            chipCount: chips.length,
          })
          onManualCheck('noNumber')
        }}
        className="mt-3 inline-flex min-h-11 items-center text-base text-[#062E25] underline underline-offset-2"
      >
        {t('houseNumber.noNumber')}
      </button>
    </div>
  )
}
