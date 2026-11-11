'use client'

import { CircleCheck, Info, Loader2, MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import {
  formatChf,
  isRoofEstimatorEnabled,
  parseAddressLabel,
  suggestRoofAddress,
  type RoofSuggestion,
} from '@/components/roof-renovation/roof-renovation-api'
import { ArrowButton } from '@/components/ui/arrow-button'
import { Input } from '@/components/ui/input'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { COMPANY_MAIN_PHONE_DISPLAY } from '@/lib/company-contact'
import { cn } from '@/lib/utils'

import PvServiceForm, { type PvServicePrefill } from './PvServiceForm'
import {
  PV_SERVICE_PACKAGE_KEYS,
  PV_SERVICE_PRICE_ROWS,
  fetchPvServiceEstimate,
  formatKw,
  startYearOf,
  type PvServiceEstimate,
  type PvServiceEstimateInput,
} from './pv-service-api'

const MIN_QUERY = 3
const DEBOUNCE_MS = 250
const FIRST_PLANT_YEAR = 1980
const MAX_PLANT_KW = 100000

type Failure = 'rate_limited' | 'failed' | 'invalid'
type Source = 'address' | 'manual'
type Shown = {
  estimate: PvServiceEstimate
  source: Source
  label: string | null
  kw: number | null
  year: number | null
}

function dedupeRows(rows: RoofSuggestion[]): RoofSuggestion[] {
  const seen = new Set<string>()
  return rows.filter(row => {
    const key = `${row.egid}_${row.edid}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseNumber(value: string): number | null {
  const text = value.trim().replace(/'/g, '').replace(',', '.')
  if (!text) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
}

const lowestPrices = PV_SERVICE_PRICE_ROWS[0].annualChf

export default function PvServiceEstimator() {
  const t = useTranslations('pvService.estimator')
  const tPackages = useTranslations('pvService.packages')
  const locale = useLocale()
  const listId = useId()

  const [searchEnabled, setSearchEnabled] = useState(true)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<RoofSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState<
    'rateLimited' | 'searchFailed' | 'noResults' | null
  >(null)
  const [kwText, setKwText] = useState('')
  const [yearText, setYearText] = useState('')
  const [inputErrors, setInputErrors] = useState<{
    kw?: string
    year?: string
  }>({})
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState<Shown | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const skipSearch = useRef(false)
  const requestId = useRef(0)
  const startedRef = useRef(false)
  const scrollToForm = useRef(false)
  const formRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const markStarted = useCallback((field: string) => {
    if (startedRef.current) return
    startedRef.current = true
    trackFunnelEvent('pv_service_started', {
      meta: { placement: 'tool', field },
    })
  }, [])

  const runEstimate = useCallback(
    async (
      input: PvServiceEstimateInput,
      source: Source,
      label: string | null
    ) => {
      const id = ++requestId.current
      setLoading(true)
      setFailure(null)
      const result = await fetchPvServiceEstimate(input)
      if (id !== requestId.current) return
      setLoading(false)
      if (result.kind !== 'ok') {
        setShown(null)
        setFailure(result.kind)
        return
      }
      const estimate = result.data
      const plantKw = estimate.plant?.totalPowerKw ?? null
      const plantYear = startYearOf(
        estimate.plant?.beginningOfOperation ?? null
      )
      const kw = plantKw ?? input.kw ?? null
      const year = plantYear ?? input.year ?? null
      if (source === 'address') {
        if (plantKw != null) setKwText(formatKw(plantKw, locale))
        if (plantYear != null) setYearText(String(plantYear))
      }
      setShown({ estimate, source, label, kw, year })
    },
    [locale]
  )

  useEffect(() => {
    let cancelled = false
    isRoofEstimatorEnabled().then(result => {
      if (!cancelled && !result) setSearchEnabled(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let params: URLSearchParams
    try {
      params = new URLSearchParams(window.location.search)
    } catch {
      return
    }
    const kwParam = params.get('kw')
    const yearParam = params.get('jahr')
    const kw = kwParam ? parseNumber(kwParam) : null
    const year = yearParam ? parseNumber(yearParam) : null
    const validKw = kw != null && kw > 0 && kw <= MAX_PLANT_KW ? kw : null
    const validYear =
      year != null &&
      Number.isInteger(year) &&
      year >= FIRST_PLANT_YEAR &&
      year <= new Date().getFullYear()
        ? year
        : null
    if (validKw == null && validYear == null) return
    if (validKw != null) setKwText(formatKw(validKw, locale))
    if (validYear != null) setYearText(String(validYear))
    if (validKw != null) {
      runEstimate(
        { kw: validKw, ...(validYear != null ? { year: validYear } : {}) },
        'manual',
        null
      )
    }
  }, [locale, runEstimate])

  useEffect(() => {
    if (!searchEnabled) return
    if (skipSearch.current) {
      skipSearch.current = false
      return
    }
    const text = query.trim()
    if (text.length < MIN_QUERY) {
      setSuggestions([])
      setSearchMessage(null)
      setSearching(false)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const result = await suggestRoofAddress(text, controller.signal)
        if (controller.signal.aborted) return
        if (result.kind === 'disabled') {
          setSearchEnabled(false)
        } else if (result.kind === 'rate_limited') {
          setSuggestions([])
          setSearchMessage('rateLimited')
        } else if (result.kind === 'failed') {
          setSuggestions([])
          setSearchMessage('searchFailed')
        } else {
          const rows = dedupeRows(result.data)
          setSuggestions(rows)
          setActive(-1)
          setOpen(true)
          setSearchMessage(rows.length === 0 ? 'noResults' : null)
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
          setSearchMessage('searchFailed')
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, searchEnabled])

  useEffect(() => {
    if (!formOpen || !scrollToForm.current) return
    scrollToForm.current = false
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [formOpen])

  const pick = (row: RoofSuggestion) => {
    skipSearch.current = true
    setQuery(row.label)
    setOpen(false)
    setSearchMessage(null)
    setFormOpen(false)
    runEstimate({ egid: row.egid, address: row.label }, 'address', row.label)
  }

  const submitAddress = () => {
    if (loading) return
    const row = suggestions[active >= 0 ? active : 0]
    if (row) {
      pick(row)
      return
    }
    inputRef.current?.focus()
  }

  const submitManual = () => {
    if (loading) return
    const kw = parseNumber(kwText)
    const year = parseNumber(yearText)
    const errors: { kw?: string; year?: string } = {}
    if (kw == null || kw <= 0 || kw > MAX_PLANT_KW) {
      errors.kw = t('manual.kwInvalid')
    }
    if (
      yearText.trim() &&
      (year == null ||
        !Number.isInteger(year) ||
        year < FIRST_PLANT_YEAR ||
        year > new Date().getFullYear())
    ) {
      errors.year = t('manual.yearInvalid', { from: String(FIRST_PLANT_YEAR) })
    }
    setInputErrors(errors)
    if (errors.kw || errors.year || kw == null) return
    setFormOpen(false)
    runEstimate({ kw, ...(year != null ? { year } : {}) }, 'manual', null)
  }

  const restart = () => {
    requestId.current += 1
    skipSearch.current = query !== ''
    setQuery('')
    setSuggestions([])
    setKwText('')
    setYearText('')
    setInputErrors({})
    setShown(null)
    setFailure(null)
    setLoading(false)
    setFormOpen(false)
  }

  const requestForm = () => {
    if (formOpen) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    scrollToForm.current = true
    setFormOpen(true)
  }

  const expanded = open && suggestions.length > 0
  const kwId = `${listId}-kw`
  const yearId = `${listId}-year`

  const addressPrefill = shown?.label ? parseAddressLabel(shown.label) : null
  const prefill: PvServicePrefill = {
    ...(addressPrefill ?? {}),
    plantKw: shown?.kw ?? null,
    commissioningYear: shown?.year ?? null,
  }

  const priceText = (value: number | null) =>
    value == null
      ? t('result.onRequest')
      : t('result.chf', { value: formatChf(value) })

  const bandLabel = (estimate: PvServiceEstimate) =>
    estimate.sizeBand ? t(`bands.${estimate.sizeBand.key}`) : null

  const renderIdle = () => (
    <div className="flex h-full flex-col">
      <p className="text-base text-white/70">{t('idle.eyebrow')}</p>
      <h3 className="mt-2 text-2xl font-medium tracking-tight">
        {t('idle.title')}
      </h3>
      <ul className="mt-6 flex flex-col divide-y divide-white/15 border-y border-white/15">
        {PV_SERVICE_PACKAGE_KEYS.map(key => (
          <li
            key={key}
            className="flex items-baseline justify-between gap-4 py-4"
          >
            <span className="text-lg font-medium">
              {tPackages(`${key}.name`)}
            </span>
            <span className="text-right text-lg font-medium text-solar tabular-nums">
              {lowestPrices
                ? t('idle.from', { value: formatChf(lowestPrices[key]) })
                : t('result.onRequest')}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-base text-white/70">{t('idle.note')}</p>
      <ul className="mt-auto flex flex-col gap-2 pt-6">
        {(['register', 'free', 'anyInstaller'] as const).map(point => (
          <li key={point} className="flex items-center gap-2 text-base">
            <CircleCheck aria-hidden className="size-5 shrink-0 text-solar" />
            {t(`idle.points.${point}`)}
          </li>
        ))}
      </ul>
    </div>
  )

  const renderFailure = (kind: Failure) => (
    <div className="flex h-full flex-col">
      <h3 className="text-2xl font-medium tracking-tight">
        {t(`failure.${kind}.title`)}
      </h3>
      <p className="mt-3 text-base text-white/80">
        {t(`failure.${kind}.body`, { phone: COMPANY_MAIN_PHONE_DISPLAY })}
      </p>
      <ArrowButton
        type="button"
        variant="primary"
        onClick={requestForm}
        className="mt-6 w-full text-base"
      >
        {t('result.cta')}
      </ArrowButton>
    </div>
  )

  const renderResult = (current: Shown) => {
    const { estimate } = current
    const plant = estimate.plant
    const plantYear = startYearOf(plant?.beginningOfOperation ?? null)
    const band = bandLabel(estimate)
    const due = estimate.due
    const facts: { key: string; label: string; value: string }[] = plant
      ? [
          {
            key: 'kw',
            label: t('result.facts.kw'),
            value:
              plant.totalPowerKw != null
                ? t('result.kwValue', {
                    value: formatKw(plant.totalPowerKw, locale),
                  })
                : '-',
          },
          {
            key: 'since',
            label: t('result.facts.since'),
            value: plantYear != null ? String(plantYear) : '-',
          },
          {
            key: 'address',
            label: t('result.facts.registerAddress'),
            value: plant.registerAddress ?? '-',
          },
        ]
      : current.source === 'manual'
        ? [
            {
              key: 'kw',
              label: t('result.facts.kw'),
              value:
                current.kw != null
                  ? t('result.kwValue', { value: formatKw(current.kw, locale) })
                  : '-',
            },
            {
              key: 'since',
              label: t('result.facts.since'),
              value: current.year != null ? String(current.year) : '-',
            },
          ]
        : []

    const dueLines: string[] = []
    if (due.ageYears != null) {
      dueLines.push(t('due.age', { years: due.ageYears }))
      dueLines.push(
        due.liabilityEnded === true
          ? t('due.liabilityEnded')
          : due.liabilityEnded === false
            ? t('due.liabilityRunning')
            : t('due.liabilityOpen')
      )
      dueLines.push(
        due.inverterWarrantyLikelyEnded === true
          ? t('due.inverterEnded')
          : due.inverterWarrantyLikelyEnded === false
            ? t('due.inverterRunning')
            : t('due.inverterOpen')
      )
    }

    const hasPrices = estimate.sizeBand != null

    return (
      <div className="flex h-full flex-col">
        <p className="text-base text-white/70">
          {plant
            ? t('result.registerEyebrow')
            : current.source === 'manual'
              ? t('result.manualEyebrow')
              : t('result.addressEyebrow')}
        </p>
        <h3 className="mt-2 text-2xl font-medium tracking-tight">
          {plant
            ? t('result.registerTitle')
            : current.source === 'manual'
              ? t('result.manualTitle')
              : t('result.noPlantTitle')}
        </h3>
        {current.label && (
          <p className="mt-1 text-base text-white/80">{current.label}</p>
        )}
        {!plant && current.source === 'address' && (
          <p className="mt-3 text-base text-white/80">{t('result.noPlant')}</p>
        )}
        {facts.length > 0 && (
          <dl className="mt-5 flex flex-col gap-2.5">
            {facts.map(fact => (
              <div
                key={fact.key}
                className="flex items-baseline justify-between gap-4 border-b border-white/15 pb-2.5"
              >
                <dt className="text-base text-white/70">{fact.label}</dt>
                <dd className="text-right text-base font-medium tabular-nums md:text-lg">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {plant && (
          <p className="mt-3 flex gap-2 text-base text-white/70">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
            {plant.source === 'geoadmin_egid'
              ? t('result.registerNote')
              : t('result.registerNearbyNote')}
          </p>
        )}

        {hasPrices ? (
          <div className="mt-6">
            <h4 className="text-lg font-medium">
              {t('result.pricesTitle', { band: band ?? '' })}
            </h4>
            <ul className="mt-3 flex flex-col gap-2">
              {estimate.packages.map(item => (
                <li
                  key={item.key}
                  className="flex items-baseline justify-between gap-4 rounded-xl bg-white/[0.06] px-4 py-3"
                >
                  <span className="text-base font-medium md:text-lg">
                    {tPackages(`${item.key}.name`)}
                  </span>
                  <span className="text-right text-lg font-medium text-solar tabular-nums md:text-xl">
                    {priceText(item.priceChf)}
                    {item.priceChf != null && (
                      <span className="ml-1 text-base font-normal text-white/70">
                        {t('result.perYear')}
                      </span>
                    )}
                  </span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-4 px-4 py-2">
                <span className="text-base">{t('result.onboarding')}</span>
                <span className="text-right text-base font-medium tabular-nums">
                  {priceText(estimate.onboardingChf)}
                </span>
              </li>
            </ul>
            <p className="mt-2 text-base text-white/70">
              {t('result.priceNote')}
            </p>
          </div>
        ) : (
          <p className="mt-6 text-base text-white/80">{t('result.needKw')}</p>
        )}

        {dueLines.length > 0 && (
          <div className="mt-6 border-t border-white/15 pt-5">
            <h4 className="text-lg font-medium">{t('due.title')}</h4>
            <ul className="mt-3 flex flex-col gap-2.5">
              {dueLines.map(line => (
                <li key={line} className="flex gap-2 text-base">
                  <CircleCheck
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 text-solar"
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-6">
          {!formOpen && (
            <ArrowButton
              type="button"
              variant="primary"
              size="lg"
              onClick={requestForm}
              className="w-full text-base"
            >
              {t('result.cta')}
            </ArrowButton>
          )}
          <p className="mt-3 text-base text-white/70">{t('result.ctaNote')}</p>
          <button
            type="button"
            onClick={restart}
            className="mt-3 text-base text-white/80 underline underline-offset-4 hover:text-white"
          >
            {t('restart')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section
      id="rechner"
      className="relative z-10 -mt-[110px] scroll-mt-28 px-4 sm:px-6 md:-mt-[130px]"
    >
      <div className="mx-auto flex max-w-[1214px] flex-col gap-6">
        <div
          className="grid w-full overflow-visible rounded-[32px] bg-white text-left text-[#062E25] shadow-[0_30px_80px_rgba(6,46,37,0.3)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
          data-hj-suppress
          data-cs-mask
        >
          <div className="flex flex-col p-6 sm:p-10 lg:p-12">
            <h2 className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl md:text-[45px]">
              {t('title')}
            </h2>
            <p className="mt-3 text-base text-[#062E25]/80 md:text-lg">
              {t('intro')}
            </p>

            {searchEnabled && (
              <>
                <label
                  htmlFor={`${listId}-input`}
                  className="mt-6 block text-base font-medium tracking-tight md:text-lg"
                >
                  {t('address.title')}
                </label>
                <div className="relative mt-3">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-[#062E25]" />
                    <input
                      ref={inputRef}
                      id={`${listId}-input`}
                      type="text"
                      role="combobox"
                      aria-expanded={expanded}
                      aria-controls={`${listId}-list`}
                      aria-autocomplete="list"
                      aria-activedescendant={
                        expanded && active >= 0
                          ? `${listId}-opt-${active}`
                          : undefined
                      }
                      autoComplete="off"
                      placeholder={t('address.placeholder')}
                      value={query}
                      disabled={loading}
                      onChange={event => setQuery(event.target.value)}
                      onFocus={() => {
                        setOpen(true)
                        markStarted('address')
                      }}
                      onBlur={() => setTimeout(() => setOpen(false), 150)}
                      onKeyDown={event => {
                        if (!expanded) return
                        if (event.key === 'ArrowDown') {
                          event.preventDefault()
                          setActive(index =>
                            Math.min(index + 1, suggestions.length - 1)
                          )
                        } else if (event.key === 'ArrowUp') {
                          event.preventDefault()
                          setActive(index => Math.max(index - 1, 0))
                        } else if (event.key === 'Enter') {
                          event.preventDefault()
                          submitAddress()
                        } else if (event.key === 'Escape') {
                          setOpen(false)
                        }
                      }}
                      className="h-[64px] w-full rounded-full border-2 border-[#062E25] bg-white pl-14 pr-12 text-lg text-[#062E25] placeholder:text-[#062E25]/55 focus:outline-none focus:ring-4 focus:ring-solar/70 sm:pr-[210px]"
                    />
                    {searching && (
                      <Loader2 className="absolute right-5 top-1/2 size-5 -translate-y-1/2 animate-spin text-[#062E25]/50 sm:right-[200px]" />
                    )}
                    <ArrowButton
                      type="button"
                      variant="primary"
                      onClick={submitAddress}
                      disabled={loading}
                      className="absolute right-2 top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-base disabled:opacity-60 sm:inline-flex"
                    >
                      {t('address.cta')}
                    </ArrowButton>
                  </div>
                  <ArrowButton
                    type="button"
                    variant="primary"
                    onClick={submitAddress}
                    disabled={loading}
                    className="mt-3 w-full text-base disabled:opacity-60 sm:hidden"
                  >
                    {t('address.cta')}
                  </ArrowButton>
                  {expanded && (
                    <ul
                      id={`${listId}-list`}
                      role="listbox"
                      className="absolute left-0 right-0 top-[72px] z-40 max-h-72 overflow-auto rounded-2xl border border-[#062E25]/15 bg-white py-2 shadow-[0_20px_40px_rgba(6,46,37,0.2)]"
                    >
                      {suggestions.map((row, index) => (
                        <li
                          key={`${row.egid}_${row.edid}`}
                          id={`${listId}-opt-${index}`}
                          role="option"
                          aria-selected={index === active}
                          onMouseDown={event => {
                            event.preventDefault()
                            pick(row)
                          }}
                          className={cn(
                            'cursor-pointer px-5 py-2.5 text-base',
                            index === active
                              ? 'bg-[#EAEDDF]'
                              : 'hover:bg-[#EAEDDF]/60'
                          )}
                        >
                          {row.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="mt-3 text-base text-[#062E25]/70">
                  {searchMessage
                    ? t(`address.${searchMessage}`)
                    : t('address.hint')}
                </p>
                <div className="my-6 flex items-center gap-4 text-base text-[#062E25]/60">
                  <span className="h-px flex-1 bg-[#062E25]/15" />
                  {t('manual.divider')}
                  <span className="h-px flex-1 bg-[#062E25]/15" />
                </div>
              </>
            )}

            <div
              className={cn(
                'grid grid-cols-1 items-start gap-4 sm:grid-cols-2',
                !searchEnabled && 'mt-6'
              )}
            >
              <div>
                <label
                  htmlFor={kwId}
                  className="text-base font-medium tracking-tight"
                >
                  {t('manual.kw')}
                </label>
                <Input
                  id={kwId}
                  value={kwText}
                  inputMode="decimal"
                  autoComplete="off"
                  maxLength={10}
                  placeholder={t('manual.kwPlaceholder')}
                  disabled={loading}
                  onFocus={() => markStarted('kw')}
                  onChange={event => {
                    setKwText(event.target.value)
                    if (inputErrors.kw) {
                      setInputErrors(current => ({ ...current, kw: undefined }))
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitManual()
                    }
                  }}
                  aria-invalid={!!inputErrors.kw}
                  aria-describedby={
                    inputErrors.kw ? `${kwId}-error` : undefined
                  }
                  className={cn(
                    'mt-1.5 h-12 rounded-xl border-[#062E25]/20 bg-white px-4 text-base md:text-base',
                    inputErrors.kw && 'border-red-600'
                  )}
                />
                {inputErrors.kw && (
                  <p
                    id={`${kwId}-error`}
                    role="alert"
                    className="mt-1.5 text-base text-red-600"
                  >
                    {inputErrors.kw}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor={yearId}
                  className="text-base font-medium tracking-tight"
                >
                  {t('manual.year')}
                </label>
                <Input
                  id={yearId}
                  value={yearText}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  placeholder={t('manual.yearPlaceholder')}
                  disabled={loading}
                  onFocus={() => markStarted('year')}
                  onChange={event => {
                    setYearText(event.target.value)
                    if (inputErrors.year) {
                      setInputErrors(current => ({
                        ...current,
                        year: undefined,
                      }))
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitManual()
                    }
                  }}
                  aria-invalid={!!inputErrors.year}
                  aria-describedby={
                    inputErrors.year ? `${yearId}-error` : undefined
                  }
                  className={cn(
                    'mt-1.5 h-12 rounded-xl border-[#062E25]/20 bg-white px-4 text-base md:text-base',
                    inputErrors.year && 'border-red-600'
                  )}
                />
                {inputErrors.year && (
                  <p
                    id={`${yearId}-error`}
                    role="alert"
                    className="mt-1.5 text-base text-red-600"
                  >
                    {inputErrors.year}
                  </p>
                )}
              </div>
            </div>
            <ArrowButton
              type="button"
              variant="tertiary"
              onClick={submitManual}
              disabled={loading}
              className="mt-4 w-fit text-base disabled:opacity-60"
            >
              {t('manual.cta')}
            </ArrowButton>
          </div>

          <div className="p-3 pt-0 lg:pl-0 lg:pt-3">
            <div
              aria-live="polite"
              className="relative h-full min-h-[420px] rounded-[24px] bg-[linear-gradient(200deg,#0C5443_0%,#062E25_60%)] p-6 text-white sm:p-8"
            >
              {loading ? (
                <p
                  role="status"
                  className="flex h-full min-h-[360px] items-center justify-center gap-3 text-base text-white/80"
                >
                  <Loader2 className="size-6 animate-spin" />
                  {t('loading')}
                </p>
              ) : failure ? (
                renderFailure(failure)
              ) : shown ? (
                renderResult(shown)
              ) : (
                renderIdle()
              )}
            </div>
          </div>
        </div>

        {formOpen && (
          <div ref={formRef} className="scroll-mt-28">
            <PvServiceForm placement="estimator" prefill={prefill} />
          </div>
        )}
      </div>
    </section>
  )
}
