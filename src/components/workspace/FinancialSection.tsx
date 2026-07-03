'use client'

import { useTranslations } from 'next-intl'
import { PurchaseFinancialSummary } from '@/components/results/PurchaseFinancialSummary'
import { AboFinancialSummary } from '@/components/results/AboFinancialSummary'
import { SubsidyAssistanceCallout } from '@/components/results/SubsidyAssistanceCallout'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'
import type { WorkspacePayload } from '@/services/customer-portal.service'

function fmtChf(n: number): string {
  return `CHF ${n.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`
}

export function FinancialSection({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace')
  const tf = useTranslations('dashboard.workspace.financial')
  const tAbo = useTranslations('solarAboCalculator.results.solarAboPlan')
  const tPicker = useTranslations('solarAboCalculator.results.evChargerPicker')

  const fin = data.financials
  const model = data.calculation.solarModel

  function renderSummary() {
    if (model === 'solar-direct') {
      return (
        <div className="flex flex-col gap-4">
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
          <SubsidyAssistanceCallout />
        </div>
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
        <AboFinancialSummary
          monthlyChf={fin.aboMonthlyChf ?? 0}
          totalChf={fin.aboTotalChf ?? 0}
          included={included}
          excluded={excludedItems}
          addOnLabel={data.evCharger?.displayName}
          addOnChf={fin.evChargerTotalChf}
        />
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
        <FreeRow label={tf('freeInvestment')} value={fmtChf(0)} bold />
        <hr className="border-white/20" />
        <FreeRow label={tf('freeSavings')} value={fmtChf(fin.annualSavingsChf)} />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <SectionHeader title={t('financialTitle')} />
      {renderSummary()}
    </section>
  )
}

function FreeRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-white/80">{label}</span>
      <span className={cn('text-base', bold ? 'text-xl font-medium' : '')}>{value}</span>
    </div>
  )
}
