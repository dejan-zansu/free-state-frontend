'use client'

import { Loader2, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { ArrowButton } from '@/components/ui/arrow-button'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { COMPANY_MAIN_PHONE_DISPLAY } from '@/lib/company-contact'

import RoofEstimateResult from './RoofEstimateResult'
import RoofRenovationForm, {
  type RoofEstimateEcho,
  type RoofObjectType,
  type RoofPvInterest,
} from './RoofRenovationForm'
import {
  aerialImageUrl,
  fetchRoofEstimate,
  formatChf,
  isRoofEstimatorEnabled,
  parseAddressLabel,
  suggestRoofAddress,
  type RoofAnswers,
  type RoofCoverAnswer,
  type RoofEstimateOk,
  type RoofSegment,
  type RoofSuggestion,
} from './roof-renovation-api'

const MIN_QUERY = 3
const DEBOUNCE_MS = 250
const COVER_ANSWERS: RoofCoverAnswer[] = [
  'tile',
  'fibre_cement',
  'metal',
  'unknown',
]

const OBJECT_TYPE_BY_SEGMENT: Partial<Record<RoofSegment, RoofObjectType>> = {
  house: 'house',
  multi_family: 'multi_family',
  hall: 'commercial',
  commercial: 'commercial',
  farm: 'farm',
}

type Screen = 'address' | 'chooser' | 'roof' | 'result' | 'failure'
type Failure = 'not_found' | 'lookup_failed' | 'rate_limited'

const cardClass =
  'w-full rounded-[32px] bg-white p-6 sm:p-10 text-left text-[#062E25] shadow-[0_30px_80px_rgba(6,46,37,0.24)]'
const EXAMPLE_ROOF_OUTLINE =
  '557,160 801,168 793,545 786,548 773,951 533,942 547,520 551,400'
const answerClass =
  'min-h-12 rounded-xl border border-[#062E25]/20 bg-white px-4 py-2 text-base text-[#062E25] transition-colors hover:border-[#062E25] hover:bg-[#062E25]/5 disabled:opacity-60'

function dedupeRows(rows: RoofSuggestion[]): RoofSuggestion[] {
  const seen = new Set<string>()
  return rows.filter(row => {
    const key = `${row.egid}_${row.edid}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

interface RoofEstimatorProps {
  title: string
  intro: string
  pvInterest?: RoofPvInterest
}

export default function RoofEstimator({
  title,
  intro,
  pvInterest,
}: RoofEstimatorProps) {
  const [enabled, setEnabled] = useState(true)
  const disable = useCallback(() => setEnabled(false), [])

  return (
    <section
      id="rechner"
      className="relative z-30 -mt-[110px] scroll-mt-28 px-4 sm:px-6 md:-mt-[130px]"
    >
      <div className="mx-auto max-w-[1214px]">
        {enabled ? (
          <RoofEstimatorFlow
            onDisabled={disable}
            title={title}
            intro={intro}
            pvInterest={pvInterest}
          />
        ) : (
          <RoofRenovationForm
            placement="fallback"
            className="mx-auto max-w-[720px]"
            defaultPvInterest={pvInterest}
          />
        )}
      </div>
    </section>
  )
}

function RoofExampleFigure() {
  const t = useTranslations('roofRenovation.estimator')
  return (
    <figure className="flex flex-col gap-2 p-3 lg:pl-0">
      <div className="relative aspect-[6/5] overflow-hidden rounded-[24px]">
        <Image
          src="/images/roof-renovation/example-flat-roof.webp"
          alt={t('example.alt')}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
        <style>{`@keyframes roof-outline-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
        <svg
          viewBox="0 0 1320 1100"
          aria-hidden
          className="absolute inset-0 h-full w-full"
        >
          <polygon
            points={EXAMPLE_ROOF_OUTLINE}
            pathLength={1}
            strokeDasharray={1}
            fill="rgba(183,254,26,0.14)"
            stroke="#B7FE1A"
            strokeWidth={7}
            strokeLinejoin="round"
            className="motion-safe:animate-[roof-outline-draw_1.8s_cubic-bezier(0.16,1,0.3,1)_0.3s_both]"
          />
        </svg>
        <span className="absolute left-3 top-3 rounded-full bg-[#062E25] px-3 py-1 text-base text-white">
          {t('example.badge')}
        </span>
        <ul className="absolute right-3 top-3 flex flex-col items-end gap-2 text-base font-medium text-[#062E25] tabular-nums">
          <li className="rounded-full bg-white px-3 py-1 shadow-sm">
            {t('roof.areaValue', { area: formatChf(2081) })}
          </li>
          <li className="rounded-full bg-white px-3 py-1 shadow-sm">
            {t('roof.forms.flat')}
          </li>
          <li className="rounded-full bg-white px-3 py-1 shadow-sm">
            {t('example.year', { year: '1985' })}
          </li>
        </ul>
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-[#062E25]/90 p-4 text-white backdrop-blur-[12px]">
          <p className="text-base text-white/80">{t('example.priceLabel')}</p>
          <p className="mt-1 text-lg font-medium text-solar tabular-nums md:text-xl">
            {t('result.perM2.inclVat', { low: '260', high: '415' })}
          </p>
        </div>
      </div>
      <figcaption className="px-1 text-base text-[#062E25]/60">
        {t('roof.imageCredit')}
      </figcaption>
    </figure>
  )
}

function RoofEstimatorFlow({
  onDisabled,
  title,
  intro,
  pvInterest,
}: {
  onDisabled: () => void
  title: string
  intro: string
  pvInterest?: RoofPvInterest
}) {
  const t = useTranslations('roofRenovation.estimator')
  const listId = useId()

  const [screen, setScreen] = useState<Screen>('address')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<RoofSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState<
    'rateLimited' | 'searchFailed' | 'noResults' | null
  >(null)
  const [choices, setChoices] = useState<RoofSuggestion[]>([])
  const [picked, setPicked] = useState<RoofSuggestion | null>(null)
  const [answers, setAnswers] = useState<RoofAnswers>({})
  const [estimate, setEstimate] = useState<RoofEstimateOk | null>(null)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const skipSearch = useRef(false)
  const requestId = useRef(0)
  const shownFor = useRef<RoofEstimateOk | null>(null)
  const formRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const scrollToForm = useRef(false)

  useEffect(() => {
    let cancelled = false
    isRoofEstimatorEnabled().then(result => {
      if (!cancelled && !result) onDisabled()
    })
    return () => {
      cancelled = true
    }
  }, [onDisabled])

  useEffect(() => {
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
          onDisabled()
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
  }, [query, onDisabled])

  useEffect(() => {
    if (screen !== 'result' || !estimate || shownFor.current === estimate) {
      return
    }
    shownFor.current = estimate
    trackFunnelEvent('roof_renovation_estimate_shown', {
      meta: {
        display: estimate.display,
        reason: estimate.reason,
        segment: estimate.building.segment,
      },
    })
  }, [screen, estimate])

  useEffect(() => {
    if (!formOpen || !scrollToForm.current) return
    scrollToForm.current = false
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [formOpen])

  const requestForm = () => {
    if (formOpen) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    scrollToForm.current = true
    setFormOpen(true)
  }

  const runEstimate = async (row: RoofSuggestion, next: RoofAnswers) => {
    const id = ++requestId.current
    setLoading(true)
    const result = await fetchRoofEstimate(row, next)
    if (id !== requestId.current) return
    setLoading(false)
    if (result.kind === 'disabled') {
      onDisabled()
      return
    }
    if (result.kind === 'rate_limited') {
      setFailure('rate_limited')
      setScreen('failure')
      return
    }
    if (result.kind === 'failed') {
      setFailure('lookup_failed')
      setScreen('failure')
      return
    }
    if (result.data.status !== 'ok') {
      setFailure(result.data.status)
      setScreen('failure')
      return
    }
    const data = result.data
    setFailure(null)
    setEstimate(data)
    if (data.roof.areaM2 == null) {
      setScreen('result')
      setFormOpen(data.display === 'visit_only')
    } else if (screen === 'roof' && data.questions.length === 0) {
      setScreen('result')
      setFormOpen(data.display === 'visit_only')
    } else {
      setScreen('roof')
    }
  }

  const startEstimate = (row: RoofSuggestion) => {
    setPicked(row)
    setAnswers({})
    setEstimate(null)
    setFormOpen(false)
    trackFunnelEvent('roof_renovation_estimate_address')
    runEstimate(row, {})
  }

  const pick = (row: RoofSuggestion) => {
    skipSearch.current = true
    setQuery(row.label)
    setOpen(false)
    setSearchMessage(null)
    const siblings = suggestions.filter(item => item.label === row.label)
    if (new Set(siblings.map(item => item.egid)).size > 1) {
      setChoices(siblings)
      setScreen('chooser')
      return
    }
    startEstimate(row)
  }

  const answer = (next: RoofAnswers) => {
    if (!picked) return
    const merged = { ...answers, ...next }
    setAnswers(merged)
    runEstimate(picked, merged)
  }

  const showResult = () => {
    if (!estimate) return
    setScreen('result')
    setFormOpen(estimate.display === 'visit_only')
  }

  const restart = () => {
    requestId.current += 1
    skipSearch.current = true
    setQuery('')
    setSuggestions([])
    setChoices([])
    setPicked(null)
    setAnswers({})
    setEstimate(null)
    setFailure(null)
    setLoading(false)
    setFormOpen(false)
    setScreen('address')
  }

  const prefill = picked ? parseAddressLabel(picked.label) : null
  const reference = estimate?.marketReference ?? null
  const jobReference = reference?.kind === 'chf_job' ? reference : null
  const m2Reference = reference?.kind === 'chf_m2' ? reference : null
  const echo: RoofEstimateEcho | null = estimate
    ? {
        egid: estimate.building.egid,
        areaM2: estimate.roof.areaM2,
        form: estimate.roof.form,
        buildingYear: estimate.building.buildingYear,
        display: estimate.display,
        chfLow: jobReference?.p25 ?? null,
        chfHigh: jobReference?.p75 ?? null,
        perM2Low: m2Reference?.p25 ?? estimate.price?.perM2Low ?? null,
        perM2High: m2Reference?.p75 ?? estimate.price?.perM2High ?? null,
        priceTableVersion: estimate.priceTableVersion,
      }
    : null

  const restartButton = (
    <button
      type="button"
      onClick={restart}
      className="w-fit text-base underline underline-offset-4 text-[#062E25]/70 hover:text-[#062E25]"
    >
      {t('restart')}
    </button>
  )

  const loadingLine = loading && (
    <p
      role="status"
      className="mt-4 flex items-center gap-2 text-base text-[#062E25]/80"
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      {t('loading')}
    </p>
  )

  const expanded = open && suggestions.length > 0

  const submitAddress = () => {
    if (loading) return
    const row = suggestions[active >= 0 ? active : 0]
    if (row) {
      pick(row)
      return
    }
    inputRef.current?.focus()
  }

  if (screen === 'address') {
    return (
      <div
        className="grid w-full rounded-[32px] bg-white text-left text-[#062E25] shadow-[0_30px_80px_rgba(6,46,37,0.3)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        data-hj-suppress
        data-cs-mask
      >
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <h2 className="text-3xl font-medium tracking-[-0.02em] sm:text-4xl md:text-[45px]">
            {title}
          </h2>
          <label
            htmlFor={`${listId}-input`}
            className="sr-only sm:not-sr-only sm:mt-6 sm:block sm:text-base sm:font-medium sm:tracking-tight md:text-lg"
          >
            {t('address.title')}
          </label>
          <div className="relative mt-5 sm:mt-3">
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
                onFocus={() => setOpen(true)}
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
                className="h-[68px] w-full rounded-full border-2 border-[#062E25] bg-white pl-14 pr-12 text-lg text-[#062E25] placeholder:text-[#062E25]/55 focus:outline-none focus:ring-4 focus:ring-solar/70 sm:pr-[244px]"
              />
              {searching && (
                <Loader2 className="absolute right-5 top-1/2 size-5 -translate-y-1/2 animate-spin text-[#062E25]/50 sm:right-[232px]" />
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
                className="absolute left-0 right-0 top-[76px] z-40 max-h-72 overflow-auto rounded-2xl border border-[#062E25]/15 bg-white py-2 shadow-[0_20px_40px_rgba(6,46,37,0.2)]"
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
                    className={`cursor-pointer px-5 py-2.5 text-base ${
                      index === active
                        ? 'bg-[#EAEDDF]'
                        : 'hover:bg-[#EAEDDF]/60'
                    }`}
                  >
                    {row.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-3 text-base text-[#062E25]/70">
            {searchMessage ? t(`address.${searchMessage}`) : t('address.hint')}
          </p>
          {loadingLine}
          <p className="mt-6 border-t border-[#062E25]/10 pt-6 text-base text-[#062E25]/80 md:text-lg">
            {intro}
          </p>
        </div>
        <RoofExampleFigure />
      </div>
    )
  }

  if (screen === 'chooser') {
    return (
      <div className={cardClass} data-hj-suppress data-cs-mask>
        <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
          {t('chooser.title')}
        </h3>
        <p className="mt-2 text-base">{t('chooser.body')}</p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {choices.map((row, index) => (
            <button
              key={`${row.egid}_${row.edid}`}
              type="button"
              disabled={loading}
              onClick={() => startEstimate(row)}
              className="overflow-hidden rounded-2xl border border-[#062E25]/20 text-left transition-colors hover:border-[#062E25] disabled:opacity-60"
            >
              <img
                src={aerialImageUrl(row.x, row.y, null)}
                alt={t('chooser.imageAlt', { number: String(index + 1) })}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <span className="block px-4 py-3 text-base font-medium">
                {t('chooser.option', { number: String(index + 1) })}
              </span>
            </button>
          ))}
        </div>
        {loadingLine}
        <div className="mt-5">{restartButton}</div>
      </div>
    )
  }

  if (screen === 'failure') {
    return (
      <div className="flex flex-col gap-6">
        <div className={cardClass} data-hj-suppress data-cs-mask>
          <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
            {t(`failure.${failure ?? 'lookup_failed'}.title`)}
          </h3>
          <p className="mt-2 text-base">
            {t(`failure.${failure ?? 'lookup_failed'}.body`, {
              phone: COMPANY_MAIN_PHONE_DISPLAY,
            })}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {failure === 'lookup_failed' && picked && (
              <button
                type="button"
                disabled={loading}
                onClick={() => runEstimate(picked, answers)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#062E25] px-6 text-base font-medium text-white transition-colors hover:bg-[#062E25]/90 disabled:opacity-60"
              >
                {t('failure.retry')}
              </button>
            )}
            {restartButton}
          </div>
          {loadingLine}
        </div>
        <RoofRenovationForm
          placement="estimator"
          prefill={prefill}
          defaultPvInterest={pvInterest}
        />
      </div>
    )
  }

  if (!estimate) return null

  const imageX = estimate.building.x ?? picked?.x ?? null
  const imageY = estimate.building.y ?? picked?.y ?? null

  const facts = [
    {
      key: 'area',
      label: t('roof.area'),
      value:
        estimate.roof.areaM2 != null
          ? t('roof.areaValue', { area: formatChf(estimate.roof.areaM2) })
          : '-',
    },
    {
      key: 'form',
      label: t('roof.form'),
      value: estimate.roof.form ? t(`roof.forms.${estimate.roof.form}`) : '-',
    },
    {
      key: 'year',
      label: t('roof.year'),
      value:
        estimate.building.buildingYear != null
          ? String(estimate.building.buildingYear)
          : '-',
    },
  ]
  const factList = (
    <dl className="flex flex-col gap-3">
      {facts.map(fact => (
        <div
          key={fact.key}
          className="flex items-baseline justify-between gap-4 border-b border-[#062E25]/10 pb-3"
        >
          <dt className="text-base text-[#062E25]/70">{fact.label}</dt>
          <dd className="text-lg font-medium tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
  const aerialFigure = imageX != null && imageY != null && (
    <figure>
      <img
        src={aerialImageUrl(imageX, imageY, estimate.roof.areaM2)}
        alt={t('roof.imageAlt')}
        className="aspect-square w-full rounded-2xl border border-[#062E25]/10 object-cover"
      />
      <figcaption className="mt-2 text-base text-[#062E25]/70">
        {t('roof.imageCredit')}
      </figcaption>
    </figure>
  )

  if (screen === 'roof') {
    const asksCover = estimate.questions.includes('cover_material')
    const asksWholeRoof = estimate.questions.includes('whole_roof')
    return (
      <div className={cardClass} data-hj-suppress data-cs-mask>
        <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
          {t('roof.title')}
        </h3>
        <p className="mt-2 text-base">
          {estimate.building.label ?? picked?.label}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {aerialFigure}
          <div className="flex flex-col gap-5">
            {factList}
            {estimate.roof.source === 'sonnendach_split' && (
              <p className="text-base">{t('roof.splitNote')}</p>
            )}
            {asksCover && (
              <fieldset disabled={loading}>
                <legend className="text-base font-medium">
                  {t('roof.coverQuestion')}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {COVER_ANSWERS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answer({ coverAnswer: option })}
                      className={answerClass}
                    >
                      {t(`roof.coverAnswers.${option}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            {asksWholeRoof && (
              <fieldset disabled={loading}>
                <legend className="text-base font-medium">
                  {t('roof.wholeRoofQuestion')}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => answer({ wholeRoof: true })}
                    className={answerClass}
                  >
                    {t('roof.wholeRoofYes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => answer({ wholeRoof: false })}
                    className={answerClass}
                  >
                    {t('roof.wholeRoofNo')}
                  </button>
                </div>
              </fieldset>
            )}
            {estimate.questions.length === 0 && (
              <ArrowButton
                type="button"
                variant="primary"
                size="lg"
                disabled={loading}
                onClick={showResult}
                className="w-full text-base disabled:opacity-60"
              >
                {t('roof.next')}
              </ArrowButton>
            )}
            {loadingLine}
          </div>
        </div>
        <div className="mt-5">{restartButton}</div>
      </div>
    )
  }

  const defaultPvInterest = estimate.existingPv ? 'has_pv' : pvInterest
  const defaultObjectType = OBJECT_TYPE_BY_SEGMENT[estimate.building.segment]

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass} data-hj-suppress data-cs-mask>
        <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
          {t('result.title')}
        </h3>
        <p className="mb-5 mt-2 text-base">
          {estimate.building.label ?? picked?.label}
        </p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <RoofEstimateResult
            estimate={estimate}
            onRequest={requestForm}
            showRequestButton={!formOpen}
          />
          <aside className="flex flex-col gap-5">
            {aerialFigure}
            {factList}
          </aside>
        </div>
        <div className="mt-5">{restartButton}</div>
      </div>
      {formOpen && (
        <div ref={formRef} className="scroll-mt-28">
          <RoofRenovationForm
            placement="estimator"
            prefill={prefill}
            estimate={echo}
            defaultObjectType={defaultObjectType}
            defaultPvInterest={defaultPvInterest}
          />
        </div>
      )}
    </div>
  )
}
