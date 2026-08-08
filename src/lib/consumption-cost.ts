import { groupNumber } from './format-chf'

export const PERIOD_FACTOR = { month: 12, quarter: 4, year: 1 } as const

export type BillPeriod = keyof typeof PERIOD_FACTOR

export type TariffInputs = {
  variableChfKwh: number
  fixedAnnualChf: number
}

export type AnnualCostBandChf = {
  lowChf: number
  highChf: number
}

const RAPPEN_PER_CHF = 100

export const CH_VAT_RATE = 0.081
export const ELCOM_H4_REFERENCE_KWH = 4500
export const CH_FALLBACK_ALLIN_RP_KWH = 27.7
export const CH_FALLBACK_FIXED_ANNUAL_CHF = 74.4

export const CH_FALLBACK_VARIABLE_CHF_KWH =
  (CH_FALLBACK_ALLIN_RP_KWH -
    CH_FALLBACK_FIXED_ANNUAL_CHF / (ELCOM_H4_REFERENCE_KWH / RAPPEN_PER_CHF)) /
  RAPPEN_PER_CHF

export const CH_FALLBACK_TARIFF_INPUTS: TariffInputs = {
  variableChfKwh: CH_FALLBACK_VARIABLE_CHF_KWH,
  fixedAnnualChf: CH_FALLBACK_FIXED_ANNUAL_CHF,
}

export const CH_VARIABLE_P5_CHF_KWH = 0.22802
export const CH_VARIABLE_P95_CHF_KWH = 0.3203
export const CH_FIXED_P5_ANNUAL_CHF = 48.02
export const CH_FIXED_P95_ANNUAL_CHF = 90

export const CONSUMPTION_MIN_KWH = 800
export const CONSUMPTION_MAX_KWH = 35000
export const BILL_MIN_CHF_PER_MONTH = 20
export const BILL_MAX_CHF_PER_MONTH = 900
export const IMPLIED_ALLIN_RATE_MIN_CHF_KWH = 0.15
export const IMPLIED_ALLIN_RATE_MAX_CHF_KWH = 0.45
export const MAX_PLAUSIBLE_FIXED_ANNUAL_CHF = 400

export const DERIVED_KWH_ROUNDING_STEP = 50
export const BAND_CHF_ROUNDING_STEP = 10

const SUGGESTABLE_PERIODS: readonly BillPeriod[] = ['year', 'quarter']

export function isUsableTariffInputs(tariff: TariffInputs): boolean {
  return (
    Number.isFinite(tariff.variableChfKwh) &&
    tariff.variableChfKwh > 0 &&
    Number.isFinite(tariff.fixedAnnualChf) &&
    tariff.fixedAnnualChf >= 0 &&
    tariff.fixedAnnualChf <= MAX_PLAUSIBLE_FIXED_ANNUAL_CHF
  )
}

export function annualCostChfFromKwh(
  annualKwh: number,
  tariff: TariffInputs
): number {
  return (
    (annualKwh * tariff.variableChfKwh + tariff.fixedAnnualChf) *
    (1 + CH_VAT_RATE)
  )
}

export function annualCostBandChfFromKwh(annualKwh: number): AnnualCostBandChf {
  return {
    lowChf: annualCostChfFromKwh(annualKwh, {
      variableChfKwh: CH_VARIABLE_P5_CHF_KWH,
      fixedAnnualChf: CH_FIXED_P5_ANNUAL_CHF,
    }),
    highChf: annualCostChfFromKwh(annualKwh, {
      variableChfKwh: CH_VARIABLE_P95_CHF_KWH,
      fixedAnnualChf: CH_FIXED_P95_ANNUAL_CHF,
    }),
  }
}

export function annualBillChfInclVat(
  billChf: number,
  period: BillPeriod
): number {
  return billChf * PERIOD_FACTOR[period]
}

export function annualKwhFromBillChf(
  billChf: number,
  period: BillPeriod,
  tariff: TariffInputs
): number {
  const annualBillExclVat =
    annualBillChfInclVat(billChf, period) / (1 + CH_VAT_RATE)
  return (annualBillExclVat - tariff.fixedAnnualChf) / tariff.variableChfKwh
}

export function impliedAllInRateChfKwh(
  annualCostChfInclVat: number,
  annualKwh: number
): number {
  return annualCostChfInclVat / (1 + CH_VAT_RATE) / annualKwh
}

export function isPlausibleHouseholdKwh(annualKwh: number): boolean {
  return (
    Number.isFinite(annualKwh) &&
    annualKwh >= CONSUMPTION_MIN_KWH &&
    annualKwh <= CONSUMPTION_MAX_KWH
  )
}

export function monthlyEquivalentBillChf(
  billChf: number,
  period: BillPeriod
): number {
  return annualBillChfInclVat(billChf, period) / PERIOD_FACTOR.month
}

export function isPlausibleMonthlyBillChf(
  billChf: number,
  period: BillPeriod
): boolean {
  const monthlyChf = monthlyEquivalentBillChf(billChf, period)
  return (
    Number.isFinite(monthlyChf) &&
    monthlyChf >= BILL_MIN_CHF_PER_MONTH &&
    monthlyChf <= BILL_MAX_CHF_PER_MONTH
  )
}

export function isPlausibleAllInRate(rateChfKwh: number): boolean {
  return (
    Number.isFinite(rateChfKwh) &&
    rateChfKwh >= IMPLIED_ALLIN_RATE_MIN_CHF_KWH &&
    rateChfKwh <= IMPLIED_ALLIN_RATE_MAX_CHF_KWH
  )
}

export function isApplicableBillEntry(
  billChf: number,
  period: BillPeriod,
  tariff: TariffInputs
): boolean {
  if (!isUsableTariffInputs(tariff)) return false
  if (!isPlausibleMonthlyBillChf(billChf, period)) return false
  const derivedKwh = annualKwhFromBillChf(billChf, period, tariff)
  if (!isPlausibleHouseholdKwh(derivedKwh)) return false
  return isPlausibleAllInRate(
    impliedAllInRateChfKwh(annualBillChfInclVat(billChf, period), derivedKwh)
  )
}

export function suggestPlausibleBillPeriod(
  billChf: number,
  rejectedPeriod: BillPeriod,
  tariff: TariffInputs
): BillPeriod | null {
  for (const candidate of SUGGESTABLE_PERIODS) {
    if (candidate === rejectedPeriod) continue
    if (isApplicableBillEntry(billChf, candidate, tariff)) return candidate
  }
  return null
}

export function roundKwhForDisplay(annualKwh: number): number {
  return (
    Math.round(annualKwh / DERIVED_KWH_ROUNDING_STEP) *
    DERIVED_KWH_ROUNDING_STEP
  )
}

export function roundChfForBandDisplay(chf: number): number {
  return Math.round(chf / BAND_CHF_ROUNDING_STEP) * BAND_CHF_ROUNDING_STEP
}

export const formatChfWhole = groupNumber
