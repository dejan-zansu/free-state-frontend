'use client'

import { Calculator } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CalculationSnapshotCard } from '@/components/admin/calculation/CalculationSnapshotCard'
import { CustomerInputsCard } from '@/components/admin/calculation/CustomerInputsCard'
import { FinancialsCard } from '@/components/admin/calculation/FinancialsCard'
import { MonthlyProductionCard } from '@/components/admin/calculation/MonthlyProductionCard'
import { RoofDetailsCard } from '@/components/admin/calculation/RoofDetailsCard'
import type { SalesLeadDetail } from '@/types/sales-lead'

import { EmptyPanel, usePackageLabel } from './parts'

export function CalculationTab({ lead }: { lead: SalesLeadDetail }) {
  const t = useTranslations('admin.salesLeads.detail')
  const packageLabel = usePackageLabel()

  const project = lead.project
  const calc = project?.solarCalculation ?? null

  if (!project || !calc) {
    return (
      <EmptyPanel icon={<Calculator className="size-8" />}>
        {t('calculation.empty')}
      </EmptyPanel>
    )
  }

  return (
    <div className="sm:[&_.text-sm]:text-base">
      <CalculationSnapshotCard
        calc={calc}
        selectedPackage={project.selectedPackage}
        packageLabel={packageLabel}
      />
      {lead.financials && (
        <FinancialsCard financials={lead.financials} calc={calc} />
      )}
      <MonthlyProductionCard monthly={calc.monthlyProductionKwh ?? []} />
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CustomerInputsCard calc={calc} />
        <RoofDetailsCard calc={calc} project={project} />
      </div>
    </div>
  )
}
