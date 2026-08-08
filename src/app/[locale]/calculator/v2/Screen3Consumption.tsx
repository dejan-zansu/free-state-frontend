'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { flowVersionMeta } from '@/lib/calculator-flow'
import {
  annualCostBandChfFromKwh,
  annualCostChfFromKwh,
  annualKwhFromBillChf,
  formatChfWhole,
  isApplicableBillEntry,
  isPlausibleHouseholdKwh,
  isUsableTariffInputs,
  monthlyEquivalentBillChf,
  roundChfForBandDisplay,
  roundKwhForDisplay,
  suggestPlausibleBillPeriod,
  BILL_MIN_CHF_PER_MONTH,
  CONSUMPTION_MIN_KWH,
  type BillPeriod,
  type TariffInputs,
} from '@/lib/consumption-cost'
import { groupNumber } from '@/lib/format-chf'
import { cn } from '@/lib/utils'
import {
  applianceEstimateConsumptionKwh,
  useSolarAboCalculatorStore,
  type ConsumptionInputMode,
  type HighPowerDevices,
} from '@/stores/solar-abo-calculator.store'

import { useCalculatorEmbed } from '../CalculatorEmbedContext'

const deviceOptions: {
  key: keyof HighPowerDevices
  labelKey: string
  image: string
}[] = [
  {
    key: 'heatPumpHeating',
    labelKey: 'heatPump',
    image: '/images/calculator/devices/heat-pump.webp',
  },
  {
    key: 'evChargingStation',
    labelKey: 'ev',
    image: '/images/calculator/devices/ev-station.webp',
  },
  {
    key: 'electricBoiler',
    labelKey: 'boiler',
    image: '/images/calculator/devices/electric-boiler.webp',
  },
]

const KWH_INPUT_ID = 'verbrauch-kwh'
const KWH_HELPER_ID = 'verbrauch-kwh-helper'
const CHF_INPUT_ID = 'verbrauch-chf'
const CHF_HELPER_ID = 'verbrauch-chf-helper'
const LIVE_ID = 'verbrauch-live'

const COMMIT_DEBOUNCE_MS = 400

const modeOptions: { mode: ConsumptionInputMode; labelKey: string }[] = [
  { mode: 'kwh', labelKey: 'modeKwh' },
  { mode: 'chf', labelKey: 'modeChf' },
]

const periodOptions: { period: BillPeriod; labelKey: string }[] = [
  { period: 'month', labelKey: 'periodMonth' },
  { period: 'quarter', labelKey: 'periodQuarter' },
  { period: 'year', labelKey: 'periodYear' },
]

type EntryNotice = 'kwhOutOfRange' | 'outOfRangeLow' | 'outOfRangeHigh'

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

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center w-[22px] h-[22px] shrink-0 rounded-full border transition-all',
        checked
          ? 'bg-[#B7FE1A] border-[#B7FE1A]'
          : 'bg-white border-[#809792]'
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

export default function Screen3Consumption() {
  const t = useTranslations('calculatorV2.screen3')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const store = useSolarAboCalculatorStore()
  const {
    devices,
    householdSize,
    consumptionOverrideKwh,
    consumptionInputMode,
    consumptionBillChf,
    consumptionBillPeriod,
    electricityPriceLoading,
    electricityPriceFallback,
    electricityPriceMunicipality,
    electricityVariableChfKwh,
    electricityTariffYear,
    setDevice,
    setConsumptionOverride,
    setConsumptionInputMode,
    setConsumptionBill,
    fetchElectricityPriceForAddress,
    prevStep,
    nextStep,
  } = store
  const embedded = useCalculatorEmbed()
  const Heading = embedded ? 'h3' : 'h1'

  const [open, setOpen] = useState(false)
  const [kwhDraft, setKwhDraft] = useState('')
  const [chfDraft, setChfDraft] = useState('')
  const [notice, setNotice] = useState<EntryNotice | null>(null)
  const [suggestedPeriod, setSuggestedPeriod] = useState<BillPeriod | null>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    void fetchElectricityPriceForAddress()
  }, [fetchElectricityPriceForAddress])

  useEffect(
    () => () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    },
    []
  )

  const displayKwh = store.getEstimatedConsumption()
  const applianceKwh = applianceEstimateConsumptionKwh(householdSize, devices)
  const tariff: TariffInputs = {
    variableChfKwh: store.getVariableChfKwh(),
    fixedAnnualChf: store.getFixedAnnualChf(),
  }

  const tariffUsable = isUsableTariffInputs(tariff)
  const tariffKnown = electricityVariableChfKwh !== null
  const tariffPending = electricityPriceLoading && !tariffKnown
  const tariffResolved =
    tariffKnown && !electricityPriceFallback && !!electricityPriceMunicipality
  const showCost = !tariffPending && tariffKnown && tariffUsable

  const mode: ConsumptionInputMode = consumptionInputMode ?? 'kwh'
  const period = consumptionBillPeriod
  const hasOverride = consumptionOverrideKwh != null

  const divergenceRatio =
    consumptionOverrideKwh != null && applianceKwh > 0
      ? consumptionOverrideKwh / applianceKwh
      : null
  const divergenceKey =
    divergenceRatio == null
      ? null
      : divergenceRatio > 2
        ? 'divergenceHigher'
        : divergenceRatio < 0.5
          ? 'divergenceLower'
          : null

  const costBand = annualCostBandChfFromKwh(displayKwh)
  const tariffBasisLine = tariffResolved
    ? t('tariffBasis', {
        municipality: electricityPriceMunicipality ?? '',
        year: String(electricityTariffYear ?? new Date().getFullYear()),
      })
    : t('tariffBasisFallback')
  const kwhParsed = parseKwhDraft(kwhDraft)
  const chfParsed = parseChfDraft(chfDraft)

  const clearDebounce = () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }

  const trackCorrection = (
    correctionMode: ConsumptionInputMode,
    derivedKwh: number,
    statedChf: number | null,
    billPeriod: BillPeriod
  ) => {
    trackFunnelEvent('consumption_corrected', {
      step: 3,
      meta: {
        mode: correctionMode,
        statedChf,
        period: billPeriod,
        derivedKwh,
        estimateKwh: applianceKwh,
        ratio:
          applianceKwh > 0
            ? Math.round((derivedKwh / applianceKwh) * 100) / 100
            : null,
        tariffFallback: !tariffResolved,
        ...flowVersionMeta,
      },
    })
  }

  const commitKwhDraft = (raw: string) => {
    const parsed = parseKwhDraft(raw)
    setSuggestedPeriod(null)
    if (parsed === null) {
      setNotice(null)
      return
    }
    if (!isPlausibleHouseholdKwh(parsed)) {
      setNotice('kwhOutOfRange')
      setConsumptionOverride(null)
      return
    }
    setNotice(null)
    setConsumptionInputMode('kwh')
    setConsumptionBill(null, period)
    setConsumptionOverride(parsed)
    trackCorrection('kwh', parsed, null, period)
  }

  const commitChfDraft = (raw: string, billPeriod: BillPeriod) => {
    const parsed = parseChfDraft(raw)
    if (parsed === null) {
      setNotice(null)
      setSuggestedPeriod(null)
      return
    }
    if (!isApplicableBillEntry(parsed, billPeriod, tariff)) {
      const monthlyChf = monthlyEquivalentBillChf(parsed, billPeriod)
      const derivedKwh = annualKwhFromBillChf(parsed, billPeriod, tariff)
      const tooLow =
        monthlyChf < BILL_MIN_CHF_PER_MONTH || derivedKwh < CONSUMPTION_MIN_KWH
      setNotice(tooLow ? 'outOfRangeLow' : 'outOfRangeHigh')
      setSuggestedPeriod(
        suggestPlausibleBillPeriod(parsed, billPeriod, tariff)
      )
      setConsumptionOverride(null)
      return
    }
    const derivedKwh = roundKwhForDisplay(
      annualKwhFromBillChf(parsed, billPeriod, tariff)
    )
    setNotice(null)
    setSuggestedPeriod(null)
    setConsumptionInputMode('chf')
    setConsumptionBill(parsed, billPeriod)
    setConsumptionOverride(derivedKwh)
    trackCorrection('chf', derivedKwh, parsed, billPeriod)
  }

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
    clearDebounce()
    setNotice(null)
    setSuggestedPeriod(null)
    setConsumptionInputMode(next)
  }

  const selectPeriod = (next: BillPeriod) => {
    clearDebounce()
    setConsumptionBill(consumptionBillChf, next)
    commitChfDraft(chfDraft, next)
  }

  const resetToEstimate = () => {
    clearDebounce()
    setNotice(null)
    setSuggestedPeriod(null)
    setConsumptionOverride(null)
    setConsumptionBill(null, period)
    setChfDraft('')
    setKwhDraft(String(Math.round(applianceKwh)))
  }

  const openDialog = (next: boolean) => {
    if (next) {
      setKwhDraft(String(Math.round(consumptionOverrideKwh ?? applianceKwh)))
      setChfDraft(consumptionBillChf != null ? String(consumptionBillChf) : '')
    }
    setOpen(next)
  }

  const echoText = (() => {
    if (mode === 'chf') {
      if (chfParsed === null) return null
      if (!isApplicableBillEntry(chfParsed, period, tariff)) return null
      return t('echoFromChf', {
        kwh: groupNumber(
          roundKwhForDisplay(annualKwhFromBillChf(chfParsed, period, tariff))
        ),
      })
    }
    if (kwhParsed === null || !isPlausibleHouseholdKwh(kwhParsed)) return null
    if (!tariffKnown || !tariffUsable) return null
    return t('echoFromKwh', {
      chf: formatChfWhole(annualCostChfFromKwh(kwhParsed, tariff)),
    })
  })()

  return (
    <div className="flex flex-col items-center px-4 py-4 sm:py-12">
      <div className="text-center mb-4 sm:mb-10 max-w-[833px]">
        <Heading className="text-2xl sm:text-[34px] font-medium text-[#062E25]">
          {t('headline')}
        </Heading>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg text-[#062E25] tracking-tight">
          {t('helper')}
        </p>
      </div>

      <div className="w-full max-w-md sm:max-w-[820px] grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        {deviceOptions.map(option => {
          const isSelected = devices[option.key]
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setDevice(option.key, !isSelected)}
              className={cn(
                'relative flex items-center gap-3 rounded-[14px] border bg-white px-4 py-1.5 sm:flex-col sm:gap-4 sm:px-6 sm:py-7 transition-all',
                'hover:border-[#062E25] hover:shadow-md',
                isSelected
                  ? 'border-[#062E25] shadow-md'
                  : 'border-[#809792]/60'
              )}
            >
              <span className="absolute right-3 top-1/2 -translate-y-1/2 sm:top-4 sm:translate-y-0">
                <CheckMark checked={isSelected} />
              </span>
              <span
                className={cn(
                  'h-10 w-10 sm:h-[120px] sm:w-[120px] shrink-0 overflow-hidden rounded-full border transition-colors',
                  isSelected ? 'border-[#B7FE1A]' : 'border-[#062E25]/15'
                )}
              >
                <Image
                  src={option.image}
                  alt=""
                  width={120}
                  height={120}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </span>
              <span className="pr-8 text-base text-[#062E25] text-left sm:pr-0 sm:text-center">
                {t(option.labelKey)}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'mt-2 sm:mt-7 w-full max-w-md sm:max-w-[560px]',
          open && !embedded && 'pb-24'
        )}
      >
        <div className="flex flex-wrap items-baseline justify-center gap-x-2">
          <span className="text-base text-[#062E25] tracking-tight">
            {hasOverride ? t('consumptionLabelOverride') : t('consumptionLabel')}
          </span>
          <span className="text-lg sm:text-xl font-medium text-[#062E25] whitespace-nowrap">
            {groupNumber(displayKwh)} kWh
          </span>
        </div>

        {tariffPending && (
          <div
            aria-hidden
            className="mx-auto mt-2 h-5 w-56 animate-pulse rounded-md bg-[#062E25]/10"
          />
        )}

        {showCost && (
          <>
            <p className="mt-1 text-center text-base text-[#062E25] tracking-tight">
              {tariffResolved
                ? t('costLine', {
                    chf: formatChfWhole(annualCostChfFromKwh(displayKwh, tariff)),
                  })
                : t('costLineRange', {
                    low: formatChfWhole(roundChfForBandDisplay(costBand.lowChf)),
                    high: formatChfWhole(
                      roundChfForBandDisplay(costBand.highChf)
                    ),
                  })}
            </p>
            <p className="mt-1 hidden text-center text-base text-[#062E25] tracking-tight sm:block">
              {tariffBasisLine}
            </p>
          </>
        )}

        {hasOverride && (
          <p className="mt-2 text-center text-base text-[#062E25] tracking-tight">
            {t('deviceNoteWithOverride')}
          </p>
        )}

        {divergenceKey && (
          <p className="mt-1 text-center text-base text-[#062E25] tracking-tight">
            {t(divergenceKey, { estimate: groupNumber(applianceKwh) })}
          </p>
        )}

        <div className="flex justify-center sm:mt-1">
          <button
            type="button"
            onClick={() => openDialog(true)}
            className="inline-flex min-h-[40px] items-center px-2 text-base text-[#062E25] underline underline-offset-4 tracking-tight hover:text-[#062E25] sm:min-h-[44px]"
          >
            {t('correctTrigger')}
          </button>
        </div>

        <Dialog open={open} onOpenChange={openDialog}>
          <DialogContent className="sm:max-w-md max-h-[88svh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-[#062E25]">
                {t('correctTrigger')}
              </DialogTitle>
              {showCost && (
                <DialogDescription className="text-base text-[#062E25]">
                  {tariffBasisLine}
                </DialogDescription>
              )}
            </DialogHeader>
            <div role="radiogroup" className="flex gap-2">
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
                    aria-describedby={`${KWH_HELPER_ID} ${LIVE_ID}`}
                    className="h-11 w-full min-w-0 rounded-[10px] border border-[#809792]/60 bg-white px-3 text-base tabular-nums text-[#062E25] outline-none focus:border-[#062E25]"
                  />
                  <span className="shrink-0 text-base text-[#062E25] tracking-tight">
                    {t('kwhUnit')}
                  </span>
                </div>
                <p
                  id={KWH_HELPER_ID}
                  className="mt-1.5 text-base text-[#062E25] tracking-tight"
                >
                  {t('kwhHelper')}
                </p>
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
                  <span className="shrink-0 text-base text-[#062E25]">
                    CHF
                  </span>
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
                    aria-describedby={`${CHF_HELPER_ID} ${LIVE_ID}`}
                    className="h-11 w-full min-w-0 rounded-[10px] border border-[#809792]/60 bg-white px-3 text-base tabular-nums text-[#062E25] outline-none focus:border-[#062E25]"
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
                <p
                  id={CHF_HELPER_ID}
                  className="mt-1.5 text-base text-[#062E25] tracking-tight"
                >
                  {t('chfHelper')}
                </p>
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

              {notice && suggestedPeriod && chfParsed !== null && (
                <button
                  type="button"
                  onClick={() => {
                    clearDebounce()
                    commitChfDraft(chfDraft, suggestedPeriod)
                  }}
                  className="inline-flex min-h-[44px] items-center text-base text-[#062E25] underline underline-offset-4 tracking-tight hover:text-[#062E25]"
                >
                  {suggestedPeriod === 'year'
                    ? t('periodSuggestionYear', {
                        amount: formatChfWhole(chfParsed),
                      })
                    : t('periodSuggestionQuarter', {
                        amount: formatChfWhole(chfParsed),
                      })}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {hasOverride ? (
                <button
                  type="button"
                  onClick={resetToEstimate}
                  className="inline-flex min-h-[44px] items-center text-base text-[#062E25] underline underline-offset-4 tracking-tight hover:text-[#062E25]"
                >
                  {t('resetToEstimate')}
                </button>
              ) : (
                <span />
              )}
              <Button
                onClick={() => openDialog(false)}
                className="min-h-[44px] bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
              >
                {t('correctClose')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className={cn(
          'flex justify-end gap-4 px-6 py-4',
          embedded
            ? 'mt-8 w-full max-w-[820px] rounded-2xl'
            : 'fixed bottom-0 left-0 right-0 z-50'
        )}
        style={{
          background: 'rgba(234, 237, 223, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Button
          variant="outline"
          onClick={prevStep}
          style={{ borderColor: '#062E25', color: '#062E25' }}
        >
          {tNav('back')}
        </Button>
        <Button
          className="bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
          onClick={nextStep}
        >
          {t('button')}
        </Button>
      </div>
    </div>
  )
}
