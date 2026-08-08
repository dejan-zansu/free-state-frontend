'use client'

import { useId, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ModelComparison } from '@/components/workspace/ModelComparison'
import { ModelPricePanel } from '@/components/workspace/ModelPricePanel'
import { PaymentModelTabs } from '@/components/workspace/PaymentModelTabs'
import type { SolarModelKey } from '@/components/order/PackageCard'
import type { WorkspacePayload } from '@/services/customer-portal.service'
import { residentialCalculatorService } from '@/services/residential-calculator.service'

export function WorkspaceMoney({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const t = useTranslations('dashboard.workspace.money')
  const panelId = useId()
  const [pending, setPending] = useState<SolarModelKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  const persisted = data.financials.solarModel as SolarModelKey
  const active = pending ?? persisted

  const select = async (model: SolarModelKey) => {
    if (pending != null || model === persisted) return
    setPending(model)
    setError(null)
    try {
      await residentialCalculatorService.updateCalculation({
        projectId: data.project.id,
        calculation: { solarModel: model },
      })
      await onRefresh()
    } catch {
      setError(t('switchError'))
    } finally {
      setPending(null)
    }
  }

  return (
    <section className="space-y-8">
      <PaymentModelTabs
        active={active}
        onSelect={model => void select(model)}
        disabled={pending != null}
        panelId={panelId}
      />

      <div className="relative">
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${panelId}-tab-${active}`}
          className={cn(pending != null && 'opacity-40')}
        >
          <ModelPricePanel data={data} />
        </div>

        {pending != null && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
            <Loader2 className="mt-16 h-8 w-8 animate-spin text-pine" aria-hidden />
          </div>
        )}
      </div>

      {error && (
        <p className="max-w-2xl rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700">
          {error}
        </p>
      )}

      <ModelComparison />
    </section>
  )
}
