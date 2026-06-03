'use client'

import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  residentialCalculatorService,
  type CalculatorPackage,
} from '@/services/residential-calculator.service'

import PackageCard, {
  type SolarModelKey,
} from '@/components/order/PackageCard'

const MODEL_TO_FILTER: Record<SolarModelKey, 'SOLAR_FREE' | 'SOLAR_DIRECT'> = {
  'solar-free': 'SOLAR_FREE',
  'solar-direct': 'SOLAR_DIRECT',
  'solar-abo': 'SOLAR_DIRECT',
}

export default function PackageCatalogSection() {
  const t = useTranslations('packageCatalog')
  const locale = useLocale()
  const language = (
    ['en', 'de', 'fr', 'it'].includes(locale) ? locale : 'de'
  ) as 'en' | 'de' | 'fr' | 'it'

  const [model, setModel] = useState<SolarModelKey>('solar-free')

  const {
    data: packages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CalculatorPackage[]>({
    queryKey: ['catalog-packages', model, language],
    queryFn: () =>
      residentialCalculatorService.getPackages(language, MODEL_TO_FILTER[model]),
    staleTime: 60_000,
  })

  return (
    <section className="py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-[1080px]">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-[36px] font-medium text-[#062E25]">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-[#062E25]/80">{t('subtitle')}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white border border-[#D8DCD5] p-1">
            {(['solar-free', 'solar-direct'] as SolarModelKey[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={cn(
                  'px-5 py-2 rounded-full text-base font-medium transition-colors',
                  model === m ? 'bg-[#062E25] text-white' : 'text-[#062E25]'
                )}
              >
                {t(`toggle.${m}`)}
              </button>
            ))}
          </div>
        </div>

        {isError && (
          <p className="text-center text-base text-red-600">
            {t('errorLoading')}{' '}
            <button onClick={() => refetch()} className="underline">
              {t('retry')}
            </button>
          </p>
        )}
        {!isLoading && !isError && packages.length === 0 && (
          <p className="text-center text-base text-[#062E25]/80">
            {t('empty')}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {packages.map(p => (
            <PackageCard key={p.id} pkg={p} model={model} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
