'use client'

import { useTranslations } from 'next-intl'
import EnergyFlowDiagram from '@/components/results/EnergyFlowDiagram'
import MonthlyAnalysisChart from '@/components/results/MonthlyAnalysisChart'
import { SectionHeader } from '@/components/ui/section-header'
import type { WorkspacePayload } from '@/services/customer-portal.service'

export function WorkspaceCharts({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace')

  return (
    <section className="space-y-6">
      <SectionHeader title={t('chartsTitle')} subtitle={t('chartsSubtitle')} />
      <EnergyFlowDiagram
        annualProduction={data.calculation.annualProductionKwh}
        estimatedConsumption={data.calculation.annualConsumptionKwh}
        selfConsumptionRate={data.calculation.selfConsumptionRate}
      />
      <MonthlyAnalysisChart
        monthlyProduction={data.calculation.monthlyProductionKwh}
        estimatedConsumption={data.calculation.annualConsumptionKwh}
        selfConsumptionRate={data.calculation.selfConsumptionRate}
      />
    </section>
  )
}
