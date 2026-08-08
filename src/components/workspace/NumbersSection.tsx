'use client'

import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'
import { PurchaseFinancialSummary } from '@/components/results/PurchaseFinancialSummary'
import { chf, groupNumber, kwp as fmtKwp, rpPerKwh } from '@/lib/format-chf'
import { cn } from '@/lib/utils'
import type { WorkspacePayload } from '@/services/customer-portal.service'

export function NumbersSection({ data }: { data: WorkspacePayload }) {
  const tf = useTranslations('dashboard.workspace.financial')
  const tn = useTranslations('dashboard.workspace.numbers')
  const tAbo = useTranslations('solarAboCalculator.results.solarAboPlan')
  const tPicker = useTranslations('solarAboCalculator.results.evChargerPicker')

  const fin = data.financials
  const model = fin.solarModel
  const rates = data.rates
  const subsidy = rates.subsidy

  const costSourceNote =
    fin.costSource === 'estimated'
      ? tn('costSourceEstimated')
      : fin.costSource === 'snapshot'
        ? tn('costSourceSnapshot')
        : null

  function renderSummary() {
    if (model === 'solar-direct') {
      return (
        <PurchaseFinancialSummary
          grossPriceChf={fin.grossPriceChf}
          estimatedSubsidyChf={fin.subsidiesChf ?? null}
          estimatedNetPriceChf={fin.netPriceChf}
          annualSavingsChf={fin.annualSavingsChf}
          paybackYears={fin.paybackYears ?? Infinity}
          lifetimeSavings25y={fin.lifetimeSavings25yChf}
          addOnLabel={data.evCharger?.displayName}
          addOnChf={fin.evChargerTotalChf}
        />
      )
    }

    if (model === 'solar-abo') {
      const includedItems = tAbo.raw('included') as string[]
      const excludedItems = tAbo.raw('excluded') as string[]
      const included =
        data.evCharger != null
          ? [...includedItems, tPicker('title', { brand: data.evCharger.manufacturerName })]
          : includedItems
      return (
        <section className="flex flex-col gap-4 rounded-xl bg-[#0F2A24] p-5 text-white">
          <div className="flex flex-col gap-2">
            <span className="text-base font-medium text-white/90">{tAbo('includedTitle')}</span>
            {included.map(item => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#B7FE1A]" />
                <span className="text-base text-white/80">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base font-medium text-white/90">{tAbo('excludedTitle')}</span>
            {excludedItems.map(item => (
              <div key={item} className="flex items-center gap-2">
                <X className="h-4 w-4 shrink-0 text-white/50" />
                <span className="text-base text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )
    }

    const discount = fin.ppaDiscountPercent ?? 30
    const term = fin.contractTermYears ?? data.package?.contractTermYears ?? 35
    return (
      <section className="flex flex-col gap-3 rounded-xl bg-[#0F2A24] p-5 text-white">
        <h3 className="text-base font-medium">{tf('freeTitle')}</h3>
        <FreeRow label={tf('freeDiscount')} value={`${discount}%`} />
        <FreeRow label={tf('freeTerm')} value={tf('freeTermYears', { years: term })} />
        <hr className="border-white/20" />
        <FreeRow label={tf('freeInvestment')} value={chf(0)} bold />
        <hr className="border-white/20" />
        <FreeRow label={tf('freeSavings')} value={chf(fin.annualSavingsChf)} />
      </section>
    )
  }

  return (
    <div className="space-y-4">
      {renderSummary()}

      <div className="rounded-xl border border-[#062E25]/10 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3">
          <RateRow
            label={tn('electricityPrice')}
            value={tn('rpPerKwh', { rate: rpPerKwh(rates.electricityChfPerKwh) })}
          />
          {rates.feedIn && (
            <RateRow
              label={tn('feedInTariff')}
              value={tn('rpPerKwh', { rate: rpPerKwh(rates.feedIn.chfPerKwh) })}
            />
          )}
          {subsidy && (
            <>
              <RateRow
                label={tn('subsidyTier1', { kwp: fmtKwp(subsidy.tier1MaxKwp) })}
                value={tn('chfPerKwp', { amount: groupNumber(subsidy.tier1ChfPerKwp) })}
              />
              <RateRow
                label={tn('subsidyTier2', { kwp: fmtKwp(subsidy.tier1MaxKwp) })}
                value={tn('chfPerKwp', { amount: groupNumber(subsidy.tier2ChfPerKwp) })}
              />
            </>
          )}
        </div>
        {costSourceNote && <p className="mt-4 text-base text-pine/75">{costSourceNote}</p>}
      </div>
    </div>
  )
}

function FreeRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-base text-white/80">{label}</span>
      <span className={cn('text-base', bold ? 'text-xl font-medium' : '')}>{value}</span>
    </div>
  )
}

function RateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#062E25]/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-base text-pine">{label}</span>
      <span className="text-base font-medium text-pine tabular-nums">{value}</span>
    </div>
  )
}
