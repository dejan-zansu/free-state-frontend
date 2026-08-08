'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import type { CommercialLeadDetail } from '@/types/commercial-lead'

export default function SnapshotTab({ lead }: { lead: CommercialLeadDetail }) {
  const t = useTranslations('admin.commercialLeads.detail')
  const fmt = (v: string | number) => Number(v).toLocaleString('de-CH', { maximumFractionDigits: 1 })
  return (
    <Card><CardContent className="p-6">
      <h3 className="text-sm font-semibold text-[#062E25]/75 uppercase tracking-wide mb-4">{t('snapshot')}</h3>
      <dl className="grid grid-cols-2 gap-y-3 gap-x-6">
        <dt className="text-sm text-[#062E25]">{t('systemKwp')}</dt><dd className="font-medium">{fmt(lead.estimatedSystemKwp)} kWp</dd>
        <dt className="text-sm text-[#062E25]">{t('panels')}</dt><dd className="font-medium">{lead.estimatedPanelCount}</dd>
        <dt className="text-sm text-[#062E25]">{t('annualProduction')}</dt><dd className="font-medium">{fmt(lead.estimatedAnnualProductionKwh)} kWh</dd>
        <dt className="text-sm text-[#062E25]">{t('roofArea')}</dt><dd className="font-medium">{fmt(lead.roofAreaM2)} m²</dd>
        <dt className="text-sm text-[#062E25]">{t('investment')}</dt><dd className="font-medium">CHF {fmt(lead.estimatedInvestmentChf)}</dd>
        <dt className="text-sm text-[#062E25]">{t('subsidy')}</dt><dd className="font-medium">CHF {fmt(lead.estimatedSubsidyChf)}</dd>
        <dt className="text-sm text-[#062E25]">{t('netInvestment')}</dt><dd className="font-medium">CHF {fmt(lead.estimatedNetInvestmentChf)}</dd>
        <dt className="text-sm text-[#062E25]">{t('annualSavings')}</dt><dd className="font-medium">CHF {fmt(lead.estimatedAnnualSavingsChf)}</dd>
        <dt className="text-sm text-[#062E25]">{t('payback')}</dt><dd className="font-medium">{fmt(lead.estimatedPaybackYears)} {t('years')}</dd>
        <dt className="text-sm text-[#062E25]">{t('co2')}</dt><dd className="font-medium">{fmt(lead.estimatedCo2ReductionKg)} kg</dd>
      </dl>
    </CardContent></Card>
  )
}
