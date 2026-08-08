'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2, Pencil, X } from 'lucide-react'

import MonthlyAnalysisChart from '@/components/results/MonthlyAnalysisChart'
import { groupNumber } from '@/lib/format-chf'
import { cn } from '@/lib/utils'
import type { WorkspacePayload } from '@/services/customer-portal.service'
import { residentialCalculatorService } from '@/services/residential-calculator.service'

export function WorkspaceCharts({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const t = useTranslations('dashboard.workspace.config')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const saveConsumption = async (kwh: number | null) => {
    const clamped = kwh == null ? null : Math.min(50000, Math.max(500, Math.round(kwh)))
    setSaving(true)
    setError(null)
    try {
      await residentialCalculatorService.updateCalculation({
        projectId: data.project.id,
        calculation: { consumptionOverrideKwh: clamped },
      })
      await onRefresh()
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const startConsumptionEdit = () => {
    setDraft(String(Math.round(data.calculation.annualConsumptionKwh)))
    setEditing(true)
  }

  const commitConsumptionEdit = () => {
    const parsed = Number(draft.replace(/[^\d]/g, ''))
    setEditing(false)
    if (Number.isFinite(parsed) && parsed > 0) void saveConsumption(parsed)
  }

  const consumptionIsOverride = data.calculation.consumptionOverrideKwh != null

  return (
    <div className="space-y-6">
      <div className="relative">
        <div
          className={cn(
            'rounded-xl bg-white border border-[#062E25]/10 px-5 py-6 sm:px-6',
            saving && 'opacity-60 pointer-events-none'
          )}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-base font-medium text-pine">{t('consumptionTitle')}</span>
            {editing ? (
              <div className="inline-flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  value={draft}
                  onChange={e => setDraft(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitConsumptionEdit()
                    if (e.key === 'Escape') setEditing(false)
                  }}
                  className="w-28 border-b border-[#062E25]/40 bg-transparent text-right text-2xl font-medium text-pine tabular-nums outline-none focus:border-[#062E25]"
                />
                <span className="text-base text-pine/75">{t('consumptionUnit')}</span>
                <button
                  type="button"
                  onClick={commitConsumptionEdit}
                  aria-label={t('consumptionSave')}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  aria-label={t('consumptionCancel')}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#062E25]/30 text-pine hover:bg-[#062E25]/5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startConsumptionEdit}
                className="group inline-flex items-baseline gap-2 text-pine hover:text-[#062E25]"
              >
                <span className="text-2xl font-medium tabular-nums">
                  {groupNumber(data.calculation.annualConsumptionKwh)}
                </span>
                <span className="text-base text-pine/75">{t('consumptionUnit')}</span>
                <Pencil className="h-4 w-4 self-center opacity-60 group-hover:opacity-100" />
              </button>
            )}
            {consumptionIsOverride && !editing && (
              <button
                type="button"
                onClick={() => void saveConsumption(null)}
                className="text-base text-pine/75 underline underline-offset-4 hover:text-pine"
              >
                {t('consumptionReset')}
              </button>
            )}
          </div>
        </div>

        {saving && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pine" />
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700">
            {error}
          </p>
        )}
      </div>

      <MonthlyAnalysisChart
        monthlyProduction={data.calculation.monthlyProductionKwh}
        estimatedConsumption={data.calculation.annualConsumptionKwh}
        selfConsumptionRate={data.calculation.selfConsumptionRate}
      />
    </div>
  )
}
