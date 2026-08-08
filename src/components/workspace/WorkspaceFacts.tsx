'use client'

import { useTranslations } from 'next-intl'

import EnergyFlowDiagram from '@/components/results/EnergyFlowDiagram'
import { groupNumber, kwh, kwp, rpPerKwh } from '@/lib/format-chf'
import type { WorkspacePayload } from '@/services/customer-portal.service'

export function WorkspaceFacts({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace.facts')
  const calc = data.calculation

  if (calc.systemSizeKwp <= 0 || calc.annualProductionKwh <= 0) return null

  const hasPanelCount = calc.panelCount != null && calc.panelCount > 0

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium text-pine tracking-tight sm:text-2xl">{t('title')}</h2>

      <EnergyFlowDiagram
        annualProduction={calc.annualProductionKwh}
        estimatedConsumption={calc.annualConsumptionKwh}
        selfConsumptionRate={calc.selfConsumptionRate}
      />

      <div className="max-w-2xl space-y-2">
        <p className="text-base text-pine tracking-tight">
          {hasPanelCount
            ? t('system', {
                kwp: kwp(calc.systemSizeKwp),
                panels: calc.panelCount ?? 0,
                production: kwh(calc.annualProductionKwh),
                selfConsumption: Math.round(calc.selfConsumptionRate * 100),
              })
            : t('systemNoPanels', {
                kwp: kwp(calc.systemSizeKwp),
                production: kwh(calc.annualProductionKwh),
                selfConsumption: Math.round(calc.selfConsumptionRate * 100),
              })}
        </p>
        <p className="text-base text-pine tracking-tight">
          {t('co2', { co2: groupNumber(calc.carbonOffsetKg) })}
        </p>
        <p className="text-base font-light text-pine/75 tracking-tight">
          {t('tariff', { rate: rpPerKwh(data.rates.electricityChfPerKwh) })}
        </p>
        <p className="text-base font-light text-pine/75 tracking-tight">{t('estimate')}</p>
      </div>
    </section>
  )
}
