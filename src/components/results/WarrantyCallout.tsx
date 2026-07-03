'use client'

import { useTranslations } from 'next-intl'

interface Props {
  installerYears: number
  productSummary: string
}

export function WarrantyCallout({ installerYears, productSummary }: Props) {
  const t = useTranslations('solarAboCalculator.results.warranty')
  return (
    <aside className="flex flex-col gap-2 rounded-xl border border-[#546963]/30 bg-white p-4">
      <h4 className="text-sm font-medium text-[#062E25]">{t('title')}</h4>
      <ul className="flex flex-col gap-1 text-sm text-[#062E25]/80">
        <li>• {t('installer', { years: installerYears })}</li>
        <li>• {t('product', { summary: productSummary })}</li>
        <li>• {t('maintenance')}</li>
      </ul>
    </aside>
  )
}
