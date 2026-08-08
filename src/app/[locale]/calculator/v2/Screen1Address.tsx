'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackFunnelEventOnce } from '@/lib/analytics/funnel-events'
import { flowVersionMeta } from '@/lib/calculator-flow'
import { cn } from '@/lib/utils'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

import { useCalculatorEmbed } from '../CalculatorEmbedContext'

import ManualCheckCapture from './ManualCheckCapture'

type Screen1Error =
  | 'empty'
  | 'notChosen'
  | 'noStreetNumber'
  | 'notFound'
  | 'outsideCh'

const PLACES_SLOW_MS = 3000
const PLACES_UNAVAILABLE_MS = 8000

const INPUT_ID = 'calculator-v2-address'
const ERROR_ID = 'calculator-v2-address-error'
const STATUS_ID = 'calculator-v2-address-status'

export default function Screen1Address() {
  const t = useTranslations('calculatorV2.screen1')
  const tErrors = useTranslations('calculatorV2.screen1.errors')

  const {
    address,
    selectedLocation,
    setAddress,
    setSelectedLocation,
    setParsedAddress,
    fetchElectricityPriceForAddress,
    nextStep,
  } = useSolarAboCalculatorStore()

  const embedded = useCalculatorEmbed()
  const Heading = embedded ? 'h3' : 'h1'

  const [placesReady, setPlacesReady] = useState(false)
  const [placesSlow, setPlacesSlow] = useState(false)
  const [placesUnavailable, setPlacesUnavailable] = useState(false)
  const [showManualCheck, setShowManualCheck] = useState(false)
  const [error, setError] = useState<Screen1Error | null>(null)
  const [typedAddress, setTypedAddress] = useState(address)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteClassRef = useRef<
    typeof google.maps.places.Autocomplete | null
  >(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const lastFailedTextRef = useRef<string | null>(null)

  const handlePlace = useCallback(
    (place: google.maps.places.PlaceResult | undefined) => {
      if (!place?.geometry?.location || !place.formatted_address) {
        lastFailedTextRef.current = inputRef.current?.value.trim() ?? null
        setError('notFound')
        return
      }

      const components = place.address_components ?? []
      const component = (type: string) =>
        components.find(entry => entry.types?.includes(type))

      const countryCode = component('country')?.short_name ?? ''
      if (countryCode && countryCode !== 'CH') {
        setError('outsideCh')
        return
      }

      const streetNumber = component('street_number')?.long_name ?? ''
      if (!streetNumber) {
        setError('noStreetNumber')
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

      trackFunnelEventOnce('address_resolved', {
        meta: {
          hasPostalCode: !!postalCode,
          hasCity: !!city,
          hasStreet: !!street,
          hasStreetNumber: !!streetNumber,
          hasCanton: !!canton,
          ...flowVersionMeta,
        },
      })

      setError(null)
      setParsedAddress({ street, streetNumber, postalCode, city, canton })
      void fetchElectricityPriceForAddress()
      setSelectedLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      })
      setAddress(place.formatted_address)
      nextStep()
    },
    [
      setParsedAddress,
      fetchElectricityPriceForAddress,
      setSelectedLocation,
      setAddress,
      nextStep,
    ]
  )

  const handlePlaceRef = useRef(handlePlace)
  handlePlaceRef.current = handlePlace

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setPlacesUnavailable(true)
      return
    }

    let cancelled = false
    const slowTimer = window.setTimeout(() => {
      if (!cancelled) setPlacesSlow(true)
    }, PLACES_SLOW_MS)
    const failTimer = window.setTimeout(() => {
      if (!cancelled) setPlacesUnavailable(true)
    }, PLACES_UNAVAILABLE_MS)

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    })
    loader
      .importLibrary('places')
      .then(({ Autocomplete }) => {
        if (cancelled) return
        window.clearTimeout(slowTimer)
        window.clearTimeout(failTimer)
        autocompleteClassRef.current = Autocomplete
        setPlacesSlow(false)
        setPlacesReady(true)
      })
      .catch(() => {
        if (cancelled) return
        window.clearTimeout(slowTimer)
        window.clearTimeout(failTimer)
        setPlacesUnavailable(true)
      })

    return () => {
      cancelled = true
      window.clearTimeout(slowTimer)
      window.clearTimeout(failTimer)
    }
  }, [])

  useEffect(() => {
    const AutocompleteClass = autocompleteClassRef.current
    const el = inputRef.current
    if (!placesReady || !AutocompleteClass || !el || autocompleteRef.current) {
      return
    }
    const autocomplete = new AutocompleteClass(el, {
      componentRestrictions: { country: 'ch' },
      fields: ['formatted_address', 'geometry', 'address_components'],
      types: ['address'],
    })
    autocomplete.addListener('place_changed', () => {
      handlePlaceRef.current(autocomplete.getPlace())
    })
    autocompleteRef.current = autocomplete
  }, [placesReady])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = inputRef.current?.value.trim() ?? ''
    if (!value) {
      setError('empty')
      return
    }
    if (selectedLocation && value === address.trim()) {
      setError(null)
      nextStep()
      return
    }
    if (value === lastFailedTextRef.current) {
      setError('notFound')
      return
    }
    lastFailedTextRef.current = value
    setError('notChosen')
  }

  const openManualCheck = useCallback(() => {
    setShowManualCheck(true)
  }, [])

  const emitStepOneInteraction = useCallback(() => {
    trackFunnelEventOnce('calculator_step_viewed', {
      step: 1,
      meta: { ...flowVersionMeta },
    })
  }, [])

  if (placesUnavailable || showManualCheck) {
    return (
      <div className="flex flex-col items-center px-4 py-12 sm:py-16">
        <ManualCheckCapture
          source="places_unavailable"
          prefill={{ address: typedAddress || address }}
        />
      </div>
    )
  }

  const manualCheckLink = (chunks: React.ReactNode) => (
    <button
      type="button"
      onClick={openManualCheck}
      className="underline underline-offset-2 text-red-700 hover:text-red-800"
    >
      {chunks}
    </button>
  )

  return (
    <div className="flex flex-col items-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-2xl text-center">
        <span className="inline-block rounded-full bg-[#B7FE1A] px-4 py-1.5 text-base font-medium text-[#062E25]">
          {t('badge')}
        </span>
        <Heading className="mt-4 text-2xl sm:text-[34px] font-medium text-[#062E25]">
          {t('headline')}
        </Heading>
        <p className="mt-4 text-base sm:text-lg text-[#062E25] tracking-tight">
          {t('helper')}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-10 w-full max-w-md">
        <label
          htmlFor={INPUT_ID}
          className="text-base text-[#062E25] tracking-tight"
        >
          {t('fieldLabel')}
        </label>
        <div className="relative mt-1.5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#062E25]/30 pointer-events-none" />
          <Input
            id={INPUT_ID}
            ref={inputRef}
            type="text"
            defaultValue={address}
            onFocus={emitStepOneInteraction}
            onChange={event => {
              emitStepOneInteraction()
              setTypedAddress(event.target.value)
            }}
            placeholder={t('placeholder')}
            autoComplete="street-address"
            aria-invalid={!!error}
            aria-describedby={
              error ? ERROR_ID : placesSlow && !placesReady ? STATUS_ID : undefined
            }
            className={cn(
              'h-14 text-base md:text-base pl-12 pr-4 rounded-xl border-[#062E25]/20 bg-white shadow-sm focus-visible:border-[#062E25]/40',
              error && 'border-red-500 focus-visible:border-red-500'
            )}
          />
        </div>

        {placesSlow && !placesReady && (
          <p
            id={STATUS_ID}
            role="status"
            className="mt-2 text-base text-[#062E25]"
          >
            {tErrors('placesSlow')}
          </p>
        )}

        {error && (
          <p id={ERROR_ID} role="alert" className="mt-2 text-base text-red-600">
            {error === 'notFound' || error === 'outsideCh'
              ? tErrors.rich(error, { link: manualCheckLink })
              : tErrors(error)}
          </p>
        )}

        <Button
          type="submit"
          className="mt-6 h-12 w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
        >
          {t('button')}
        </Button>

        <p className="mt-6 text-center text-base text-[#062E25] tracking-tight">
          {t('reassurance1')}
        </p>
      </form>
    </div>
  )
}
