'use client'

import { useTranslations } from 'next-intl'

export function SubsidyAssistanceCallout() {
  const t = useTranslations('solarAboCalculator.results.subsidyAssistance')
  return (
    <aside className="flex items-start gap-3 rounded-xl border border-[#B7FE1A]/60 bg-[#F5F7EE] p-4">
      <span aria-hidden className="text-2xl">🌿</span>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium text-[#062E25]">{t('title')}</h4>
        <p className="text-sm text-[#062E25]/80">{t('body')}</p>
      </div>
    </aside>
  )
}
