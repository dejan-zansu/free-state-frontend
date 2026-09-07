import {
  SCREEN4_REFERENCE_PANEL_M2,
  SCREEN4_REFERENCE_PANEL_W,
} from '@/lib/calculator-reference-panel'
import {
  annualProductionKwh,
  estimatedPanelCount,
  grossRoofAreaM2,
  systemSizeKwp,
  usableRoofAreaM2,
} from '@/lib/roof-estimate'
import type { RoofSegment } from '@/types/sonnendach'
export type BuildingUse =
  | 'office_trade'
  | 'industry'
  | 'agriculture'
  | 'retail_gastro'
  | 'public'
  | 'multi_family'
  | 'other'

export const SELF_CONSUMPTION_RATIO_POINTS = [0.1, 0.25, 0.5, 1.0, 1.5, 2.0] as const

export interface SelfConsumptionProfile {
  shareAtRatio: readonly [number, number, number, number, number, number]
  maxCoverage: number
  defaultRatio: number
}

export const SELF_CONSUMPTION_PROFILES: Record<BuildingUse, SelfConsumptionProfile> = {
  office_trade: { shareAtRatio: [0.95, 0.8, 0.56, 0.36, 0.26, 0.2], maxCoverage: 0.4, defaultRatio: 0.6 },
  industry: { shareAtRatio: [0.97, 0.88, 0.66, 0.41, 0.31, 0.24], maxCoverage: 0.48, defaultRatio: 0.6 },
  retail_gastro: { shareAtRatio: [0.95, 0.84, 0.62, 0.39, 0.29, 0.23], maxCoverage: 0.45, defaultRatio: 0.6 },
  agriculture: { shareAtRatio: [0.85, 0.64, 0.48, 0.31, 0.23, 0.18], maxCoverage: 0.36, defaultRatio: 1.0 },
  public: { shareAtRatio: [0.92, 0.76, 0.52, 0.33, 0.24, 0.18], maxCoverage: 0.37, defaultRatio: 0.6 },
  multi_family: { shareAtRatio: [0.92, 0.76, 0.52, 0.33, 0.24, 0.19], maxCoverage: 0.38, defaultRatio: 1.0 },
  other: { shareAtRatio: [0.92, 0.72, 0.51, 0.32, 0.24, 0.19], maxCoverage: 0.38, defaultRatio: 0.6 },
}

export function selfConsumptionShare(ratio: number, use: BuildingUse | null): number {
  const profile = SELF_CONSUMPTION_PROFILES[use ?? 'other']
  const points = SELF_CONSUMPTION_RATIO_POINTS
  const shares = profile.shareAtRatio
  if (ratio <= points[0]) return shares[0]
  const last = points.length - 1
  if (ratio >= points[last]) return Math.min(shares[last], profile.maxCoverage / ratio)
  for (let k = 0; k < last; k++) {
    if (ratio <= points[k + 1]) {
      const t = (ratio - points[k]) / (points[k + 1] - points[k])
      return shares[k] + t * (shares[k + 1] - shares[k])
    }
  }
  return shares[last]
}

export function selfConsumedKwh(
  productionKwh: number,
  consumptionKwh: number | null,
  use: BuildingUse | null
): number {
  if (productionKwh <= 0) return 0
  const profile = SELF_CONSUMPTION_PROFILES[use ?? 'other']
  const ratio =
    consumptionKwh != null && consumptionKwh > 0
      ? productionKwh / consumptionKwh
      : profile.defaultRatio
  return productionKwh * selfConsumptionShare(ratio, use)
}

export const PPA_DISCOUNT = 0.3
export const CO2_KG_PER_KWH = 0.128

export const LOW_RESULT_KWP = 4.0
export const DEFAULT_SUBSIDY_TIER_MAX_KWP = 100

export const COMMERCIAL_CONSUMPTION_MIN_KWH = 2_000
export const COMMERCIAL_CONSUMPTION_MAX_KWH = 5_000_000

export type TariffCategory = 'C2' | 'C3' | 'C4' | 'C5'

export function tariffCategoryForConsumption(
  kwh: number | null
): TariffCategory {
  if (kwh == null || kwh <= 0) return 'C3'
  if (kwh <= 30_000) return 'C2'
  if (kwh <= 150_000) return 'C3'
  if (kwh <= 500_000) return 'C4'
  return 'C5'
}

export interface SubsidyTiers {
  tier1MaxKwp: number
  tier1ChfPerKwp: number
  tier2MaxKwp: number
  tier2ChfPerKwp: number
}
export function subsidyChf(
  kwp: number,
  tiers: SubsidyTiers | null
): number | null {
  if (!tiers || kwp <= 0) return null
  if (kwp > tiers.tier2MaxKwp) return null
  const tier1Kwp = Math.min(kwp, tiers.tier1MaxKwp)
  const tier2Kwp = Math.max(
    0,
    Math.min(kwp - tiers.tier1MaxKwp, tiers.tier2MaxKwp - tiers.tier1MaxKwp)
  )
  return Math.round(
    tier1Kwp * tiers.tier1ChfPerKwp + tier2Kwp * tiers.tier2ChfPerKwp
  )
}

export interface CommercialEstimateInput {
  segments: RoofSegment[]
  buildingUse: BuildingUse | null
  consumptionKwh: number | null
  tariffChfKwh: number | null
  subsidyTiers: SubsidyTiers | null
}

export interface CommercialEstimate {
  grossAreaM2: number
  usableAreaM2: number
  panelCount: number
  systemSizeKwp: number
  productionKwh: number
  co2Kg: number
  consumptionKwh: number | null
  consumptionAssumed: boolean
  selfConsumedKwh: number
  selfConsumptionShare: number
  selfConsumptionValueChf: number | null
  ppaSavingsChf: number | null
  subsidyChf: number | null
  subsidyAboveTiers: boolean
  isLowResult: boolean
}

export function computeCommercialEstimate(
  input: CommercialEstimateInput
): CommercialEstimate {
  const { segments } = input
  const panelCount = estimatedPanelCount(segments, SCREEN4_REFERENCE_PANEL_M2)
  const kwp = systemSizeKwp(panelCount, SCREEN4_REFERENCE_PANEL_W)
  const productionKwh = annualProductionKwh(segments)
  const consumptionKnown =
    input.consumptionKwh != null && input.consumptionKwh > 0
  const selfConsumed = selfConsumedKwh(
    productionKwh,
    consumptionKnown ? input.consumptionKwh : null,
    input.buildingUse
  )
  const share = productionKwh > 0 ? selfConsumed / productionKwh : 0
  const tariff = input.tariffChfKwh
  const valueChf =
    tariff != null && tariff > 0 && selfConsumed > 0
      ? Math.round(selfConsumed * tariff)
      : null
  const ppaChf =
    valueChf != null ? Math.round(selfConsumed * tariff! * PPA_DISCOUNT) : null
  const subsidy = subsidyChf(kwp, input.subsidyTiers)
  const allClassOne =
    segments.length > 0 && segments.every(s => s.suitability?.class === 1)

  return {
    grossAreaM2: grossRoofAreaM2(segments),
    usableAreaM2: usableRoofAreaM2(segments),
    panelCount,
    systemSizeKwp: kwp,
    productionKwh,
    co2Kg: Math.round(productionKwh * CO2_KG_PER_KWH),
    consumptionKwh: consumptionKnown ? input.consumptionKwh : null,
    consumptionAssumed: !consumptionKnown,
    selfConsumedKwh: selfConsumed,
    selfConsumptionShare: share,
    selfConsumptionValueChf: valueChf,
    ppaSavingsChf: ppaChf,
    subsidyChf: subsidy,
    subsidyAboveTiers:
      !!input.subsidyTiers && kwp > input.subsidyTiers.tier2MaxKwp,
    isLowResult: segments.length > 0 && (kwp < LOW_RESULT_KWP || allClassOne),
  }
}
