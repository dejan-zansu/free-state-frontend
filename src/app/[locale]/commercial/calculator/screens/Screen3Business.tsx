'use client'

import {
  Building,
  Building2,
  Factory,
  Landmark,
  LayoutGrid,
  Store,
  Tractor,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { commercialFlowMeta } from '@/lib/commercial-calculator-flow'
import {
  COMMERCIAL_CONSUMPTION_MAX_KWH,
  COMMERCIAL_CONSUMPTION_MIN_KWH,
  type TariffCategory,
} from '@/lib/commercial-estimate'
import { PERIOD_FACTOR, type BillPeriod } from '@/lib/consumption-cost'
import { cn } from '@/lib/utils'
import {
  useCommercialCalculatorStore,
  type BuildingUse,
} from '@/stores/commercial-calculator.store'

type ConsumptionInputMode = 'kwh' | 'chf'
type EntryNotice = 'kwhOutOfRange' | 'chfOutOfRange'

const useOptions: { use: BuildingUse; icon: LucideIcon }[] = [
  { use: 'office_trade', icon: Building2 },
  { use: 'industry', icon: Factory },
  { use: 'agriculture', icon: Tractor },
  { use: 'retail_gastro', icon: Store },
  { use: 'public', icon: Landmark },
  { use: 'multi_family', icon: Building },
  { use: 'other', icon: LayoutGrid },
]

const modeOptions: { mode: ConsumptionInputMode; labelKey: string }[] = [
  { mode: 'kwh', labelKey: 'modeKwh' },
  { mode: 'chf', labelKey: 'modeChf' },
]

const periodOptions: { period: BillPeriod; labelKey: string }[] = [
  { period: 'month', labelKey: 'periodMonth' },
  { period: 'quarter', labelKey: 'periodQuarter' },
  { period: 'year', labelKey: 'periodYear' },
]

const KWH_INPUT_ID = 'betrieb-kwh'
const CHF_INPUT_ID = 'betrieb-chf'
const CONSUMPTION_HELPER_ID = 'betrieb-verbrauch-helper'
const LIVE_ID = 'betrieb-verbrauch-live'

const COMMIT_DEBOUNCE_MS = 400

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('de-CH')
}

function parseKwhDraft(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return null
  const parsed = Number(digits)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseChfDraft(raw: string): number | null {
  const normalized = raw.replace(/[^\d.,]/g, '').replace(',', '.')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function isPlausibleCommercialKwh(kwh: number): boolean {
  return (
    kwh >= COMMERCIAL_CONSUMPTION_MIN_KWH &&
    kwh <= COMMERCIAL_CONSUMPTION_MAX_KWH
  )
}

function annualKwhFromBill(
  chf: number,
  period: BillPeriod,
  chfKwh: number
): number {
  return Math.round((chf * PERIOD_FACTOR[period]) / chfKwh)
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center w-[22px] h-[22px] shrink-0 rounded-full border transition-all',
        checked ? 'bg-[#B7FE1A] border-[#B7FE1A]' : 'bg-white border-[#809792]'
      )}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="#062E25"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

export default function Screen3Business() {
  const t = useTranslations('commercialCalculator.screen3')

  const buildingUse = useCommercialCalculatorStore(s => s.buildingUse)
  const mode = useCommercialCalculatorStore(s => s.consumptionInputMode)
  const consumptionKwh = useCommercialCalculatorStore(s => s.consumptionKwh)
  const consumptionBillChf = useCommercialCalculatorStore(
    s => s.consumptionBillChf
  )
  const period = useCommercialCalculatorStore(s => s.consumptionBillPeriod)
  const hasExistingPv = useCommercialCalculatorStore(s => s.hasExistingPv)
  const tariff = useCommercialCalculatorStore(s => s.tariff)
  const tariffLoading = useCommercialCalculatorStore(s => s.tariffLoading)
  const setBuildingUse = useCommercialCalculatorStore(s => s.setBuildingUse)
  const setConsumptionInputMode = useCommercialCalculatorStore(
    s => s.setConsumptionInputMode
  )
  const setConsumptionKwh = useCommercialCalculatorStore(
    s => s.setConsumptionKwh
  )
  const setConsumptionBill = useCommercialCalculatorStore(
    s => s.setConsumptionBill
  )
  const setHasExistingPv = useCommercialCalculatorStore(s => s.setHasExistingPv)
  const fetchTariff = useCommercialCalculatorStore(s => s.fetchTariff)
  const fetchSubsidyRate = useCommercialCalculatorStore(s => s.fetchSubsidyRate)
  const prevStep = useCommercialCalculatorStore(s => s.prevStep)
  const nextStep = useCommercialCalculatorStore(s => s.nextStep)

  const [kwhDraft, setKwhDraft] = useState('')
  const [chfDraft, setChfDraft] = useState('')
  const [notice, setNotice] = useState<EntryNotice | null>(null)
  const debounceRef = useRef<number | null>(null)
  const chfDraftRef = useRef('')
  chfDraftRef.current = chfDraft
  const hydratedRef = useRef(false)

  useEffect(() => {
    void fetchTariff()
    void fetchSubsidyRate()
  }, [fetchTariff, fetchSubsidyRate])

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    setKwhDraft(consumptionKwh != null ? String(consumptionKwh) : '')
    setChfDraft(consumptionBillChf != null ? String(consumptionBillChf) : '')
  }, [consumptionKwh, consumptionBillChf])

  useEffect(
    () => () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    },
    []
  )

  const tariffRate = tariff && tariff.chfKwh > 0 ? tariff.chfKwh : null
  const kwhParsed = parseKwhDraft(kwhDraft)
  const chfParsed = parseChfDraft(chfDraft)

  const clearDebounce = () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }

  const currentCategory = (): TariffCategory =>
    useCommercialCalculatorStore.getState().getTariffCategory()

  const lastEmittedKwhRef = useRef<number | null | undefined>(undefined)

  const afterCommit = (
    categoryBefore: TariffCategory,
    commitMode: ConsumptionInputMode
  ) => {
    const state = useCommercialCalculatorStore.getState()
    if (state.getTariffCategory() !== categoryBefore) void fetchTariff()
    const derivedKwh = state.getConsumptionKwh()
    if (lastEmittedKwhRef.current === derivedKwh) return
    lastEmittedKwhRef.current = derivedKwh
    trackFunnelEvent('consumption_corrected', {
      step: 3,
      meta: {
        ...commercialFlowMeta,
        mode: commitMode,
        derivedKwh,
      },
    })
  }

  const commitKwhDraft = (raw: string) => {
    const parsed = parseKwhDraft(raw)
    if (parsed === null) {
      setNotice(null)
      setConsumptionKwh(null)
      return
    }
    if (!isPlausibleCommercialKwh(parsed)) {
      setNotice('kwhOutOfRange')
      setConsumptionKwh(null)
      return
    }
    const categoryBefore = currentCategory()
    setNotice(null)
    setConsumptionKwh(parsed)
    afterCommit(categoryBefore, 'kwh')
  }

  const commitChfDraft = (raw: string, billPeriod: BillPeriod) => {
    const parsed = parseChfDraft(raw)
    if (parsed === null) {
      setNotice(null)
      setConsumptionBill(null, billPeriod)
      return
    }
    const rate = useCommercialCalculatorStore.getState().tariff?.chfKwh ?? null
    if (rate === null || rate <= 0) {
      setNotice(null)
      setConsumptionBill(parsed, billPeriod)
      return
    }
    const derivedKwh = annualKwhFromBill(parsed, billPeriod, rate)
    if (!isPlausibleCommercialKwh(derivedKwh)) {
      setNotice('chfOutOfRange')
      setConsumptionBill(null, billPeriod)
      return
    }
    const categoryBefore = currentCategory()
    setNotice(null)
    setConsumptionBill(parsed, billPeriod)
    afterCommit(categoryBefore, 'chf')
  }

  useEffect(() => {
    if (!tariff || mode !== 'chf') return
    const parsed = parseChfDraft(chfDraftRef.current)
    if (parsed === null) return
    const rate = tariff.chfKwh
    if (rate <= 0) return
    const derivedKwh = annualKwhFromBill(parsed, period, rate)
    if (!isPlausibleCommercialKwh(derivedKwh)) {
      setNotice('chfOutOfRange')
      setConsumptionBill(null, period)
    }
  }, [tariff, mode, period, setConsumptionBill])

  const handleKwhChange = (value: string) => {
    setKwhDraft(value)
    clearDebounce()
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      commitKwhDraft(value)
    }, COMMIT_DEBOUNCE_MS)
  }

  const handleChfChange = (value: string) => {
    setChfDraft(value)
    clearDebounce()
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      commitChfDraft(value, period)
    }, COMMIT_DEBOUNCE_MS)
  }

  const selectMode = (next: ConsumptionInputMode) => {
    if (next === mode) return
    clearDebounce()
    setNotice(null)
    const categoryBefore = currentCategory()
    setConsumptionInputMode(next)
    if (currentCategory() !== categoryBefore) void fetchTariff()
  }

  const selectPeriod = (next: BillPeriod) => {
    if (next === period) return
    clearDebounce()
    commitChfDraft(chfDraft, next)
  }

  const selectUse = (use: BuildingUse) => {
    if (buildingUse === use) {
      setBuildingUse(null)
      return
    }
    setBuildingUse(use)
    trackFunnelEvent('building_use_selected', {
      step: 3,
      meta: { ...commercialFlowMeta, buildingUse: use },
    })
  }

  const echoText = (() => {
    if (mode === 'chf') {
      if (chfParsed === null) return null
      if (tariffRate === null) return t('echoNoTariff')
      const derivedKwh = annualKwhFromBill(chfParsed, period, tariffRate)
      if (!isPlausibleCommercialKwh(derivedKwh)) return null
      return t('echoFromChf', { kwh: formatNumber(derivedKwh) })
    }
    if (kwhParsed === null || !isPlausibleCommercialKwh(kwhParsed)) return null
    if (tariffRate === null) return null
    return t('echoFromKwh', { chf: formatNumber(kwhParsed * tariffRate) })
  })()

  const tariffBasisLine = tariff
    ? tariff.fallback
      ? t('tariffBasisFallback')
      : t('tariffBasis', {
          municipality: tariff.municipality,
          year: String(tariff.year),
        })
    : null

  const inputClass =
    'h-11 w-full min-w-0 rounded-[10px] border border-[#809792]/60 bg-white px-3 text-base tabular-nums text-[#062E25] outline-none focus:border-[#062E25]'

  return (
    <div className="flex flex-col items-center px-4 py-4 pb-28 sm:py-12 sm:pb-32">
      <div className="text-center mb-4 sm:mb-10 max-w-[833px]">
        <h1 className="text-2xl sm:text-[34px] font-medium text-[#062E25]">
          {t('headline')}
        </h1>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg text-[#062E25] tracking-tight">
          {t('helper')}
        </p>
      </div>

      <div className="w-full max-w-md sm:max-w-[820px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        {useOptions.map(option => {
          const isSelected = buildingUse === option.use
          const Icon = option.icon
          return (
            <button
              key={option.use}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectUse(option.use)}
              className={cn(
                'relative flex min-h-[56px] items-center gap-3 rounded-[14px] border bg-white px-4 py-1.5 text-left transition-all sm:min-h-0 sm:flex-col sm:gap-3 sm:px-4 sm:py-6 sm:text-center',
                'hover:border-[#062E25] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25] focus-visible:ring-offset-2',
                isSelected
                  ? 'border-[#062E25] shadow-md'
                  : 'border-[#809792]/60'
              )}
            >
              <span className="absolute right-3 top-1/2 -translate-y-1/2 sm:top-3 sm:translate-y-0">
                <CheckMark checked={isSelected} />
              </span>
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-16 sm:w-16',
                  isSelected
                    ? 'border-[#B7FE1A] bg-[#B7FE1A]/20'
                    : 'border-[#062E25]/15 bg-[#EAEDDF]'
                )}
              >
                <Icon
                  aria-hidden
                  className="h-5 w-5 text-[#062E25] sm:h-7 sm:w-7"
                  strokeWidth={1.5}
                />
              </span>
              <span className="pr-8 text-base text-[#062E25] sm:pr-0">
                {t(`uses.${option.use}`)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 sm:mt-8 w-full max-w-md sm:max-w-[560px] rounded-[14px] border border-[#809792]/60 bg-white px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-lg font-medium text-[#062E25] tracking-tight">
          {t('consumptionLabel')}
        </p>
        <p
          id={CONSUMPTION_HELPER_ID}
          className="mt-1 text-base text-[#062E25] tracking-tight"
        >
          {t('consumptionHelper')}
        </p>

        <div role="radiogroup" className="mt-4 flex gap-2">
          {modeOptions.map(option => {
            const active = mode === option.mode
            return (
              <button
                key={option.mode}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectMode(option.mode)}
                className={cn(
                  'min-h-[44px] flex-1 rounded-full border px-4 text-base transition-colors',
                  active
                    ? 'border-[#062E25] bg-[#062E25] text-white'
                    : 'border-[#809792]/60 bg-white text-[#062E25] hover:border-[#062E25]'
                )}
              >
                {t(option.labelKey)}
              </button>
            )
          })}
        </div>

        {mode === 'kwh' ? (
          <div className="mt-4">
            <label
              htmlFor={KWH_INPUT_ID}
              className="block text-base text-[#062E25] tracking-tight"
            >
              {t('kwhLabel')}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id={KWH_INPUT_ID}
                type="text"
                inputMode="numeric"
                value={kwhDraft}
                onChange={event => handleKwhChange(event.target.value)}
                onBlur={() => {
                  clearDebounce()
                  commitKwhDraft(kwhDraft)
                }}
                aria-describedby={`${CONSUMPTION_HELPER_ID} ${LIVE_ID}`}
                className={inputClass}
              />
              <span className="shrink-0 text-base text-[#062E25] tracking-tight">
                {t('kwhUnit')}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label
              htmlFor={CHF_INPUT_ID}
              className="block text-base text-[#062E25] tracking-tight"
            >
              {t('chfLabel')}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="shrink-0 text-base text-[#062E25]">CHF</span>
              <input
                id={CHF_INPUT_ID}
                type="text"
                inputMode="decimal"
                value={chfDraft}
                onChange={event => handleChfChange(event.target.value)}
                onBlur={() => {
                  clearDebounce()
                  commitChfDraft(chfDraft, period)
                }}
                aria-describedby={`${CONSUMPTION_HELPER_ID} ${LIVE_ID}`}
                className={inputClass}
              />
            </div>
            <div role="radiogroup" className="mt-2 flex gap-2">
              {periodOptions.map(option => {
                const active = period === option.period
                return (
                  <button
                    key={option.period}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectPeriod(option.period)}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-full border px-3 text-base transition-colors',
                      active
                        ? 'border-[#062E25] bg-[#062E25] text-white'
                        : 'border-[#809792]/60 bg-white text-[#062E25] hover:border-[#062E25]'
                    )}
                  >
                    {t(option.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div id={LIVE_ID} aria-live="polite">
          {notice ? (
            <p className="mt-2 text-base text-[#062E25] tracking-tight">
              {t(notice)}
            </p>
          ) : echoText ? (
            <p className="mt-2 text-base text-[#062E25] tracking-tight">
              {echoText}
            </p>
          ) : null}
        </div>

        {tariffLoading && !tariff && (
          <div
            aria-hidden
            className="mt-3 h-5 w-56 animate-pulse rounded-md bg-[#062E25]/10"
          />
        )}

        {tariffBasisLine && (
          <p className="mt-3 text-base text-[#062E25]/80 tracking-tight">
            {tariffBasisLine}
          </p>
        )}
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-md sm:max-w-[560px]">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-1">
          <input
            type="checkbox"
            checked={hasExistingPv}
            onChange={event => setHasExistingPv(event.target.checked)}
            className="peer sr-only"
          />
          <span className="rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-[#062E25] peer-focus-visible:ring-offset-2">
            <CheckMark checked={hasExistingPv} />
          </span>
          <span className="text-base text-[#062E25] tracking-tight">
            {t('existingPv')}
          </span>
        </label>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4"
        style={{
          background: 'rgba(234, 237, 223, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Button
          variant="outline"
          onClick={prevStep}
          className="min-h-[44px] text-base"
          style={{ borderColor: '#062E25', color: '#062E25' }}
        >
          {t('back')}
        </Button>
        <Button
          className="min-h-[44px] bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
          onClick={nextStep}
        >
          {t('button')}
        </Button>
      </div>
    </div>
  )
}
