'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import type {
  AdminLeadFinancials,
  AdminLeadSolarCalculation,
} from '@/types/admin'

import { fmtChf, fmtNumber } from './format'

type Props = {
  financials: AdminLeadFinancials
  calc: AdminLeadSolarCalculation | null
}

export function FinancialsCard({ financials, calc }: Props) {
  const t = useTranslations('admin.leads')
  const isDirectLike = financials.solarModel !== 'solar-free'

  return (
    <Card className="border-[#062E25]/10 mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[#062E25] mb-4">
          {t('financials')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isDirectLike && (
            <>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('systemCost')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {fmtChf(financials.totalInvestmentChf)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('subsidies')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {fmtChf(financials.subsidiesChf)}
                </p>
              </div>
              <div className="rounded-xl bg-[#062E25] text-white p-4">
                <p className="text-base text-white/70">{t('netCost')}</p>
                <p className="text-2xl font-bold tabular-nums">
                  {fmtChf(financials.netInvestmentChf)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('paybackPeriod')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {financials.paybackYears != null
                    ? t('yearsValue', {
                        years: fmtNumber(financials.paybackYears, 1),
                      })
                    : '-'}
                </p>
              </div>
            </>
          )}
          {financials.solarModel === 'solar-abo' && (
            <>
              <div className="rounded-xl bg-[#062E25] text-white p-4">
                <p className="text-base text-white/70">{t('aboMonthly')}</p>
                <p className="text-2xl font-bold tabular-nums">
                  {fmtChf(financials.aboMonthlyChf)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('aboTotal')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {fmtChf(financials.aboTotalChf)}
                </p>
                {financials.aboTermMonths != null && (
                  <p className="text-base text-[#062E25]/50 tabular-nums">
                    {t('yearsValue', {
                      years: Math.round(financials.aboTermMonths / 12),
                    })}
                  </p>
                )}
              </div>
            </>
          )}
          {financials.solarModel === 'solar-free' && (
            <>
              <div className="rounded-xl bg-[#062E25] text-white p-4">
                <p className="text-base text-white/70">{t('ppaDiscount')}</p>
                <p className="text-2xl font-bold tabular-nums">
                  {financials.ppaDiscountPercent != null
                    ? `${financials.ppaDiscountPercent}%`
                    : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('contractTerm')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {financials.contractTermYears != null
                    ? t('yearsValue', { years: financials.contractTermYears })
                    : '-'}
                </p>
              </div>
              {calc?.systemCostChf != null && (
                <div className="rounded-xl bg-[#F5F7EE] p-4">
                  <p className="text-base text-[#062E25]/60">{t('systemCost')}</p>
                  <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                    {fmtChf(calc.systemCostChf)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {isDirectLike && (
            <div>
              <p className="text-base text-[#062E25]/60">{t('savings25y')}</p>
              <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                {fmtChf(financials.totalSavings25yChf)}
              </p>
            </div>
          )}
          <div>
            <p className="text-base text-[#062E25]/60">
              {t('electricityTariffLabel')}
            </p>
            <p className="text-xl font-semibold text-[#062E25] tabular-nums">
              {financials.electricityTariffRpKwh != null
                ? `${fmtNumber(financials.electricityTariffRpKwh, 1)} Rp/kWh`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-base text-[#062E25]/60">{t('feedInTariffLabel')}</p>
            <p className="text-xl font-semibold text-[#062E25] tabular-nums">
              {financials.feedInTariffRpKwh != null
                ? `${fmtNumber(financials.feedInTariffRpKwh, 1)} Rp/kWh`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-base text-[#062E25]/60">
              {t('electricitySupplier')}
            </p>
            <p className="text-xl font-semibold text-[#062E25]">
              {financials.electricitySupplier ?? '-'}
            </p>
          </div>
        </div>
        {financials.costSource === 'estimated' && (
          <p className="text-sm text-[#062E25]/50 mt-4">
            {t('financialsEstimated')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
