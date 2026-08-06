'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import type { AdminLeadSolarCalculation } from '@/types/admin'

import { fmtChf, fmtNumber } from './format'

type Props = {
  calc: AdminLeadSolarCalculation
  selectedPackage: string | null
  packageLabel: (code: string | null | undefined) => string
}

export function CalculationSnapshotCard({
  calc,
  selectedPackage,
  packageLabel,
}: Props) {
  const t = useTranslations('admin.leads')

  const selfConsumptionPct =
    calc.selfConsumptionRate != null
      ? Math.round(calc.selfConsumptionRate * 100)
      : null

  return (
    <Card className="border-[#062E25]/10 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#062E25]">
            {t('calculatorSnapshot')}
          </h2>
          {calc.solarModel && (
            <span className="text-base font-medium px-3 py-1 rounded-full bg-[#062E25]/5 text-[#062E25]">
              {calc.solarModel === 'solar-free'
                ? t('solarModelFree')
                : calc.solarModel === 'solar-abo'
                  ? t('solarModelAbo')
                  : t('solarModelDirect')}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-[#F5F7EE] p-4">
            <p className="text-base text-[#062E25]/60">{t('systemSize')}</p>
            <p className="text-2xl font-bold text-[#062E25] tabular-nums">
              {calc.totalSystemCapacityKw != null
                ? `${fmtNumber(calc.totalSystemCapacityKw, 1)} kWp`
                : '-'}
            </p>
            {calc.panelCount != null && (
              <p className="text-base text-[#062E25]/50 tabular-nums">
                {t('panelsCount', { count: calc.panelCount })}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-[#F5F7EE] p-4">
            <p className="text-base text-[#062E25]/60">{t('annualProduction')}</p>
            <p className="text-2xl font-bold text-[#062E25] tabular-nums">
              {calc.annualProductionKwh != null
                ? `${fmtNumber(calc.annualProductionKwh)} kWh`
                : '-'}
            </p>
          </div>
          <div className="rounded-xl bg-[#062E25] text-white p-4">
            <p className="text-base text-white/70">{t('annualSavings')}</p>
            <p className="text-2xl font-bold tabular-nums">
              {fmtChf(calc.annualSavingsChf)}
            </p>
          </div>
          <div className="rounded-xl bg-[#F5F7EE] p-4">
            <p className="text-base text-[#062E25]/60">{t('co2Offset')}</p>
            <p className="text-2xl font-bold text-[#062E25] tabular-nums">
              {calc.carbonOffsetKg != null
                ? `${fmtNumber(calc.carbonOffsetKg)} kg`
                : '-'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-base text-[#062E25]/60">{t('selfConsumption')}</p>
            <p className="text-xl font-semibold text-[#062E25] tabular-nums">
              {selfConsumptionPct != null ? `${selfConsumptionPct}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-base text-[#062E25]/60">{t('annualConsumption')}</p>
            <p className="text-xl font-semibold text-[#062E25] tabular-nums">
              {calc.annualConsumptionKwh != null
                ? `${fmtNumber(calc.annualConsumptionKwh)} kWh`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-base text-[#062E25]/60">{t('ppaDiscount')}</p>
            <p className="text-xl font-semibold text-[#062E25] tabular-nums">
              {calc.ppaDiscountPercent != null
                ? `${calc.ppaDiscountPercent}%`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-base text-[#062E25]/60">{t('recommendedPackage')}</p>
            <p className="text-xl font-semibold text-[#062E25]">
              {packageLabel(calc.recommendedPackage || selectedPackage)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
