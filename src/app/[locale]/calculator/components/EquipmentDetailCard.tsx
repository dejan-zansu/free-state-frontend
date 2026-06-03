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
    <article className="flex items-center gap-3 rounded-xl border border-[#546963]/40 bg-white p-3">
      {item.imageUrl ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
          <Image
            src={item.imageUrl}
            alt={`${item.brand} ${item.model}`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm uppercase tracking-wide text-[#062E25]/60">
          {t(`category.${item.category}`)}
        </p>
        <h4 className="text-base font-medium text-[#062E25]">
          {item.quantity > 1 ? `${item.quantity}× ` : ''}
          {item.brand} {item.model}
        </h4>

        {Object.keys(item.specs).length > 0 ? (
          <dl className="flex flex-wrap gap-x-2 text-sm">
            {Object.entries(item.specs).map(([k, v]) => (
              <div key={k} className="flex gap-1">
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
