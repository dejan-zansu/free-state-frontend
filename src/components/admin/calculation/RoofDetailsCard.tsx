'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import type { AdminLeadSolarCalculation } from '@/types/admin'

import { fmtNumber } from './format'

type Props = {
  calc: AdminLeadSolarCalculation
  project: {
    propertyLat: number
    propertyLng: number
    status: string
  } | null
}

export function RoofDetailsCard({ calc, project }: Props) {
  const t = useTranslations('admin.leads')
  const tl = useTranslations('admin.statusLabels')

  const roofSegments = calc.roofSegments ?? []
  const totalRoofArea = roofSegments.reduce(
    (sum, s) => sum + (typeof s.area === 'number' ? s.area : 0),
    0,
  )
  const avgTilt =
    roofSegments.length > 0
      ? roofSegments.reduce(
          (sum, s) => sum + (typeof s.tilt === 'number' ? s.tilt : 0),
          0,
        ) / roofSegments.length
      : null
  const avgAzimuth =
    roofSegments.length > 0
      ? roofSegments.reduce(
          (sum, s) => sum + (typeof s.azimuth === 'number' ? s.azimuth : 0),
          0,
        ) / roofSegments.length
      : null

  return (
    <Card className="border-[#062E25]/10">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[#062E25] mb-4">
          {t('roofDetails')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#062E25]">
              {t('totalRoofArea')}
            </label>
            <p className="font-medium text-[#062E25] tabular-nums">
              {totalRoofArea > 0 ? `${fmtNumber(totalRoofArea, 1)} m²` : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#062E25]">
              {t('roofSegments')}
            </label>
            <p className="font-medium text-[#062E25] tabular-nums">
              {roofSegments.length}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#062E25]">{t('averageTilt')}</label>
            <p className="font-medium text-[#062E25] tabular-nums">
              {avgTilt != null ? `${fmtNumber(avgTilt, 1)}°` : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#062E25]">
              {t('averageAzimuth')}
            </label>
            <p className="font-medium text-[#062E25] tabular-nums">
              {avgAzimuth != null ? `${fmtNumber(avgAzimuth, 1)}°` : '-'}
            </p>
          </div>
          {project && (
            <>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('coordinates')}
                </label>
                <p className="font-medium text-[#062E25] tabular-nums">
                  {project.propertyLat.toFixed(5)},{' '}
                  {project.propertyLng.toFixed(5)}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('projectStatus')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {tl.has(project.status)
                    ? tl(project.status)
                    : project.status.replace(/_/g, ' ')}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
