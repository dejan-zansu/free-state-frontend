'use client'

import { useTranslations } from 'next-intl'

import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

export default function RoofSegmentList({ idPrefix }: { idPrefix: string }) {
  const t = useTranslations('calculatorV2.screen2')

  const building = useSolarAboCalculatorStore(state => state.building)
  const selectedSegmentIds = useSolarAboCalculatorStore(
    state => state.selectedSegmentIds
  )
  const toggleSegment = useSolarAboCalculatorStore(state => state.toggleSegment)

  if (!building || building.roofSegments.length === 0) return null

  const suitabilityLabel = (suitClass: number) => {
    switch (suitClass) {
      case 1:
        return t('gering')
      case 2:
        return t('mittel')
      case 4:
        return t('sehrGut')
      case 5:
        return t('hervorragend')
      default:
        return t('gut')
    }
  }

  const sortedSegments = [...building.roofSegments].sort(
    (a, b) => b.area - a.area
  )
  const titleId = `${idPrefix}-roof-segment-list-title`

  return (
    <div>
      <p id={titleId} className="text-base font-medium text-[#EAEDDF]">
        {t('segmentListTitle')}
      </p>
      <p className="mt-1 text-base font-light text-[#EAEDDF]/70">
        {t('segmentListHelper')}
      </p>
      <ul
        aria-labelledby={titleId}
        className="mt-2 max-h-48 overflow-y-auto pr-1"
      >
        {sortedSegments.map((segment, index) => {
          const checkboxId = `${idPrefix}-roof-segment-${segment.id}`
          const suitClass = segment.suitability?.class || 3
          const swatch =
            segment.suitability?.color || SUITABILITY_CLASSES[suitClass]?.color
          return (
            <li key={segment.id}>
              <label
                htmlFor={checkboxId}
                className="flex cursor-pointer items-start gap-2.5 py-1.5"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={selectedSegmentIds.includes(segment.id)}
                  onChange={() => toggleSegment(segment.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-[4px] accent-[#B7FE1A]"
                />
                <span
                  aria-hidden
                  className="mt-1.5 h-3 w-3 shrink-0 rounded-full border border-white/30"
                  style={{ backgroundColor: swatch }}
                />
                <span className="text-base text-[#EAEDDF]">
                  {t('segmentRow', {
                    n: index + 1,
                    m: Math.round(segment.area),
                    eignung: suitabilityLabel(suitClass),
                  })}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
