'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { MODEL_LABEL_KEYS } from '@/lib/model-label'
import type { SolarModelKey } from '@/components/order/PackageCard'

export const PAYMENT_MODELS: SolarModelKey[] = ['solar-direct', 'solar-free', 'solar-abo']

export function PaymentModelTabs({
  active,
  onSelect,
  disabled,
  panelId,
}: {
  active: SolarModelKey
  onSelect: (model: SolarModelKey) => void
  disabled: boolean
  panelId: string
}) {
  const t = useTranslations('dashboard.workspace.money')
  const tModels = useTranslations('dashboard.project.models')

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-medium text-pine tracking-tight sm:text-2xl">
        {t('question')}
      </h2>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label={t('question')}
          className="inline-flex w-max rounded-full border border-[#D8DCD5] bg-white p-1"
        >
          {PAYMENT_MODELS.map(model => (
            <button
              key={model}
              type="button"
              role="tab"
              id={`${panelId}-tab-${model}`}
              aria-selected={model === active}
              aria-controls={panelId}
              disabled={disabled}
              onClick={() => onSelect(model)}
              className={cn(
                'whitespace-nowrap rounded-full px-5 py-2 text-base font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]/30',
                'disabled:cursor-not-allowed',
                model === active ? 'bg-[#062E25] text-white' : 'text-[#062E25]',
              )}
            >
              {tModels(MODEL_LABEL_KEYS[model])}
            </button>
          ))}
        </div>
      </div>

      <p className="max-w-2xl text-base font-light text-pine/75 tracking-tight">{t('helper')}</p>
    </div>
  )
}
