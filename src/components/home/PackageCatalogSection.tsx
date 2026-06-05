'use client'

import { useQueries } from '@tanstack/react-query'
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

const PACKAGE_FILTERS = ['SOLAR_FREE', 'SOLAR_DIRECT'] as const

const MODEL_TO_FILTER: Record<SolarModelKey, (typeof PACKAGE_FILTERS)[number]> =
  {
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

  const results = useQueries({
    queries: PACKAGE_FILTERS.map(filter => ({
      queryKey: ['catalog-packages', filter, language],
      queryFn: (): Promise<CalculatorPackage[]> =>
        residentialCalculatorService.getPackages(language, filter),
      staleTime: 60_000,
    })),
  })

  const {
    data: packages = [],
    isLoading,
    isError,
    refetch,
  } = results[PACKAGE_FILTERS.indexOf(MODEL_TO_FILTER[model])]

  return (
    <section className="py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-[1290px]">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-[36px] font-medium text-[#062E25]">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-[#062E25]/80">{t('subtitle')}</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white border border-[#D8DCD5] p-1">
            {(['solar-free', 'solar-direct', 'solar-abo'] as SolarModelKey[]).map(m => (
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

        <div className="flex flex-wrap justify-center gap-6">
          {packages.map(p => (
            <div
              key={p.id}
              className="w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <PackageCard pkg={p} model={model} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
