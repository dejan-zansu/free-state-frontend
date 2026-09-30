import type { SonnendachBuilding } from '@/types/sonnendach'

const MIN_SEGMENT_AREA_M2 = 5
const MIN_SUITABILITY_CLASS = 3

// The roof areas the calculator preselects for a building: every area of at
// least 5 m² rated class 3 or better, else the largest one. The outreach roof
// page highlights the same areas, so both show one building the same way.
export function autoSelectSegmentIds(building: SonnendachBuilding): string[] {
  const qualifying = building.roofSegments.filter(segment => {
    const suitClass = segment.suitability?.class || MIN_SUITABILITY_CLASS
    return (
      segment.area >= MIN_SEGMENT_AREA_M2 && suitClass >= MIN_SUITABILITY_CLASS
    )
  })
  if (qualifying.length > 0) return qualifying.map(segment => segment.id)
  if (building.roofSegments.length === 0) return []
  const largest = building.roofSegments.reduce((best, segment) =>
    segment.area > best.area ? segment : best
  )
  return [largest.id]
}
