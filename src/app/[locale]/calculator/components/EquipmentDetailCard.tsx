'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

export interface EquipmentDetail {
  category: 'PANEL' | 'INVERTER' | 'BATTERY' | 'MOUNTING' | 'EMS' | 'HEAT_PUMP'
  brand: string
  model: string
  imageUrl?: string | null
  quantity: number
  specs: Record<string, string | number>
  warranty?: { years: number; performanceYears?: number }
  datasheetUrl?: string | null
}

export function EquipmentDetailCard({ item }: { item: EquipmentDetail }) {
  const t = useTranslations('solarAboCalculator.results.equipmentCard')

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-[#546963]/40 bg-white p-4 sm:flex-row">
      {item.imageUrl ? (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md sm:h-32 sm:w-32">
          <Image src={item.imageUrl} alt={`${item.brand} ${item.model}`} fill className="object-contain" unoptimized />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-2">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-[#062E25]/60">
            {t(`category.${item.category}`)}
          </p>
          <h4 className="text-base font-medium text-[#062E25]">
            {item.brand} {item.model}
          </h4>
          <p className="text-sm text-[#062E25]/70">
            {t('quantity', { count: item.quantity })}
          </p>
        </header>

        {Object.keys(item.specs).length > 0 ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(item.specs).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-[#062E25]/60">{t(`spec.${k}`)}</dt>
                <dd className="text-[#062E25]">{String(v)}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {item.warranty ? (
          <p className="text-sm text-[#062E25]/70">
            {item.warranty.performanceYears
              ? t('warrantyWithPerformance', {
                  years: item.warranty.years,
                  perf: item.warranty.performanceYears,
                })
              : t('warranty', { years: item.warranty.years })}
          </p>
        ) : null}

        {item.datasheetUrl ? (
          <a
            href={item.datasheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#3B6B43] underline"
          >
            {t('datasheet')}
          </a>
        ) : null}
      </div>
    </article>
  )
}
