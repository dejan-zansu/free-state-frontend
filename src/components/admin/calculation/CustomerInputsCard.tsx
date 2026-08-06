'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import type { AdminLeadSolarCalculation } from '@/types/admin'

type Props = {
  calc: AdminLeadSolarCalculation
}

export function CustomerInputsCard({ calc }: Props) {
  const t = useTranslations('admin.leads')

  const devices = calc.devices ?? null
  const activeDeviceKeys = devices
    ? (Object.keys(devices) as (keyof typeof devices)[]).filter(k => devices[k])
    : []

  return (
    <Card className="border-[#062E25]/10">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[#062E25] mb-4">
          {t('customerInputs')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-[#062E25]/60">
              {t('householdSize')}
            </label>
            <p className="font-medium text-[#062E25] tabular-nums">
              {calc.householdSize ?? '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#062E25]/60">
              {t('buildingType')}
            </label>
            <p className="font-medium text-[#062E25]">
              {calc.buildingType
                ? t.has(`buildingTypes.${calc.buildingType}`)
                  ? t(`buildingTypes.${calc.buildingType}`)
                  : calc.buildingType
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#062E25]/60">
              {t('roofCovering')}
            </label>
            <p className="font-medium text-[#062E25]">
              {calc.roofCovering
                ? t.has(`roofCoverings.${calc.roofCovering}`)
                  ? t(`roofCoverings.${calc.roofCovering}`)
                  : calc.roofCovering
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#062E25]/60">{t('devices')}</label>
            {activeDeviceKeys.length === 0 ? (
              <p className="font-medium text-[#062E25]">{t('noDevices')}</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {activeDeviceKeys.map(key => (
                  <li key={key} className="text-base font-medium text-[#062E25]">
                    • {t(`deviceNames.${key}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
