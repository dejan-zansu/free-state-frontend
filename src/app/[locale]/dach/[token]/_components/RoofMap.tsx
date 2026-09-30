'use client'

import SonnendachRoofMap from '@/components/calculator/SonnendachRoofMap'
import { autoSelectSegmentIds } from '@/components/calculator/roof-selection'
import type { SonnendachBuilding } from '@/types/sonnendach'

// The calculator's roof map, read-only: the recipient sees the same aerial
// view with the same roof areas highlighted as in the calculator flow. Taps do
// nothing, the page is not a selection step.

const noop = () => {}
const noopAsync = async () => {}

export default function RoofMap({ building, ariaLabel }: { building: SonnendachBuilding; ariaLabel: string }) {
  return (
    <SonnendachRoofMap
      building={building}
      selectedSegmentIds={autoSelectSegmentIds(building)}
      center={null}
      onToggleSegment={noop}
      onTapBuildingAt={noopAsync}
      onTapMiss={noop}
      ariaLabel={ariaLabel}
      zoomInLabel="Vergrössern"
      zoomOutLabel="Verkleinern"
      className="absolute inset-0"
    />
  )
}
