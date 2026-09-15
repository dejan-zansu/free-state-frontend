import type { RoofSegment } from '@/types/sonnendach'

export const FLAT_TILT_THRESHOLD_DEG = 10
export const COVERAGE_FLAT = 0.45
export const COVERAGE_PITCHED_SOUTH = 0.8
export const COVERAGE_PITCHED_SIDE = 0.75
export const COVERAGE_PITCHED_NORTH = 0.5

export const SONNENDACH_MODULE_EFFICIENCY = 0.2
export const REFERENCE_PANEL_W = 485
export const REFERENCE_PANEL_M2 = 2.0

export const SIZING_PRODUCTION_FACTOR = 1.5
export const MIN_SYSTEM_KWP = 4

export function segmentCoverageFraction(
  tiltDeg: number,
  azimuthDeg: number
): number {
  if (tiltDeg <= FLAT_TILT_THRESHOLD_DEG) return COVERAGE_FLAT
  const normalized = ((azimuthDeg % 360) + 360) % 360
  const deviationFromSouth = normalized > 180 ? 360 - normalized : normalized
  if (deviationFromSouth <= 45) return COVERAGE_PITCHED_SOUTH
  if (deviationFromSouth <= 135) return COVERAGE_PITCHED_SIDE
  return COVERAGE_PITCHED_NORTH
}

export function grossRoofAreaM2(segments: RoofSegment[]): number {
  return segments.reduce((sum, s) => sum + s.area, 0)
}

export function usableRoofAreaM2(segments: RoofSegment[]): number {
  return segments.reduce(
    (sum, s) => sum + s.area * segmentCoverageFraction(s.tilt, s.azimuth),
    0
  )
}

export function panelYieldFactor(
  panelWattageW: number | null,
  panelAreaM2: number | null
): number {
  const wattage = panelWattageW ?? REFERENCE_PANEL_W
  const area = panelAreaM2 ?? REFERENCE_PANEL_M2
  if (!wattage || !area) return 1
  const efficiency = wattage / (area * 1000)
  return Math.min(2, Math.max(0.5, efficiency / SONNENDACH_MODULE_EFFICIENCY))
}

export function annualProductionKwh(
  segments: RoofSegment[],
  panelWattageW: number | null = null,
  panelAreaM2: number | null = null
): number {
  const factor = panelYieldFactor(panelWattageW, panelAreaM2)
  return segments.reduce((total, seg) => {
    const fraction = segmentCoverageFraction(seg.tilt, seg.azimuth)
    return total + seg.electricityYield * fraction * factor
  }, 0)
}

export function estimatedPanelCount(
  segments: RoofSegment[],
  panelAreaM2: number
): number {
  if (segments.length === 0 || !panelAreaM2) return 0
  return segments.reduce((total, seg) => {
    const fraction = segmentCoverageFraction(seg.tilt, seg.azimuth)
    return total + Math.floor((seg.area * fraction) / panelAreaM2)
  }, 0)
}

export function systemSizeKwp(
  panelCount: number,
  panelWattageW: number
): number {
  if (panelCount === 0 || !panelWattageW) return 0
  return panelCount * (panelWattageW / 1000)
}

export function sizingTargetKwh(
  annualConsumptionKwh: number | null
): number | null {
  if (!annualConsumptionKwh || annualConsumptionKwh <= 0) return null
  return annualConsumptionKwh * SIZING_PRODUCTION_FACTOR
}

export interface SizedSystem {
  panelCount: number
  systemSizeKwp: number
  annualProductionKwh: number
  roofPanelCount: number
  roofSystemSizeKwp: number
  roofAnnualProductionKwh: number
}

const EMPTY_SYSTEM: SizedSystem = {
  panelCount: 0,
  systemSizeKwp: 0,
  annualProductionKwh: 0,
  roofPanelCount: 0,
  roofSystemSizeKwp: 0,
  roofAnnualProductionKwh: 0,
}

export function sizeSystem(
  segments: RoofSegment[],
  panelAreaM2: number | null,
  panelWattageW: number | null,
  targetProductionKwh: number | null
): SizedSystem {
  if (!panelAreaM2 || !panelWattageW || segments.length === 0) {
    return EMPTY_SYSTEM
  }
  const factor = panelYieldFactor(panelWattageW, panelAreaM2)
  const kwpPerPanel = panelWattageW / 1000
  const lots = segments
    .map(seg => {
      const coverage = segmentCoverageFraction(seg.tilt, seg.azimuth)
      const panels = Math.floor((seg.area * coverage) / panelAreaM2)
      const yieldPerM2 = seg.area > 0 ? seg.electricityYield / seg.area : 0
      return { panels, yieldPerPanel: yieldPerM2 * panelAreaM2 * factor }
    })
    .filter(lot => lot.panels > 0)
    .sort((a, b) => b.yieldPerPanel - a.yieldPerPanel)

  const roofPanelCount = lots.reduce((sum, lot) => sum + lot.panels, 0)
  const roofAnnualProductionKwh = lots.reduce(
    (sum, lot) => sum + lot.panels * lot.yieldPerPanel,
    0
  )
  const roof = {
    roofPanelCount,
    roofSystemSizeKwp: roofPanelCount * kwpPerPanel,
    roofAnnualProductionKwh,
  }
  if (targetProductionKwh == null) {
    return {
      panelCount: roofPanelCount,
      systemSizeKwp: roof.roofSystemSizeKwp,
      annualProductionKwh: roofAnnualProductionKwh,
      ...roof,
    }
  }

  const minPanels = Math.ceil(MIN_SYSTEM_KWP / kwpPerPanel)
  let taken = 0
  let production = 0
  for (const lot of lots) {
    const wantForTarget =
      production >= targetProductionKwh
        ? 0
        : lot.yieldPerPanel > 0
          ? Math.ceil((targetProductionKwh - production) / lot.yieldPerPanel)
          : lot.panels
    const wantForMinimum = Math.max(0, minPanels - taken)
    const want = Math.min(lot.panels, Math.max(wantForTarget, wantForMinimum))
    if (want <= 0) break
    taken += want
    production += want * lot.yieldPerPanel
  }
  return {
    panelCount: taken,
    systemSizeKwp: taken * kwpPerPanel,
    annualProductionKwh: production,
    ...roof,
  }
}
