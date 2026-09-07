import type { RoofSegment } from '@/types/sonnendach'

export const FLAT_TILT_THRESHOLD_DEG = 10
export const COVERAGE_FLAT = 0.45
export const COVERAGE_PITCHED_SOUTH = 0.8
export const COVERAGE_PITCHED_SIDE = 0.75
export const COVERAGE_PITCHED_NORTH = 0.5

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

export function annualProductionKwh(segments: RoofSegment[]): number {
  return segments.reduce((total, seg) => {
    const fraction = segmentCoverageFraction(seg.tilt, seg.azimuth)
    return total + seg.electricityYield * fraction
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
