'use client'

import { useQueries } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import PackageCard from '@/components/order/PackageCard'
import { groupPackages } from '@/lib/products/package-groups'
import {
  SOLAR_MODELS,
  SOLAR_MODEL_KEYS,
  type SolarModelKey,
  type SolarModelPackageFilter,
} from '@/lib/solar-models'
import { cn } from '@/lib/utils'
import {
  residentialCalculatorService,
  type CalculatorPackage,
} from '@/services/residential-calculator.service'

const PACKAGE_FILTERS: readonly SolarModelPackageFilter[] = [
  'SOLAR_FREE',
  'SOLAR_DIRECT',
]

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
  } = results[PACKAGE_FILTERS.indexOf(SOLAR_MODELS[model].packageFilter)]

  const groups = groupPackages(packages)

  return (
    <section
      id="pakete"
      className="scroll-mt-24 bg-[#FDFFF5] px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mx-auto max-w-[820px] text-center">
          <RevealText
            as="h2"
            className="text-3xl font-medium text-[#062E25] md:text-[45px]"
          >
            {t('title')}
          </RevealText>
          <Reveal
            as="p"
            delay={0.2}
            className="mt-5 text-lg tracking-tight text-[#062E25]/80 md:text-[22px]"
          >
            {t('subtitle')}
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-base text-[#062E25]/70">{t('priceFor')}</p>
          <div
            role="group"
            aria-label={t('priceFor')}
            className="inline-flex flex-wrap justify-center rounded-full border border-[#D8DCD5] bg-white p-1"
          >
            {SOLAR_MODEL_KEYS.map(m => (
              <button
                key={m}
                type="button"
                aria-pressed={model === m}
                onClick={() => setModel(m)}
                className={cn(
                  'rounded-full px-5 py-2 text-base font-medium transition-colors',
                  model === m ? 'bg-[#062E25] text-white' : 'text-[#062E25]'
                )}
              >
                {t(`toggle.${m}`)}
              </button>
            ))}
          </div>
        </div>

        {isError && (
          <p className="mt-8 text-center text-base text-red-600">
            {t('errorLoading')}{' '}
            <button onClick={() => refetch()} className="underline">
              {t('retry')}
            </button>
          </p>
        )}
        {!isLoading && !isError && groups.length === 0 && (
          <p className="mt-8 text-center text-base text-[#062E25]/80">
            {t('empty')}
          </p>
        )}

        {isLoading ? (
          <div
            aria-hidden
            className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className="h-[520px] animate-pulse rounded-[24px] bg-[#062E25]/5"
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'mt-10 grid gap-6 md:grid-cols-2',
              groups.length >= 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'
            )}
          >
            {groups.map(group => (
              <PackageCard key={group.key} group={group} model={model} />
            ))}
          </div>
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-base text-[#062E25]">
          <span
            aria-hidden
            className="relative flex size-5 items-center justify-center rounded-[3px] bg-[#D8232A]"
          >
            <span className="absolute h-[2px] w-[10px] rounded-[1px] bg-white" />
            <span className="absolute h-[10px] w-[2px] rounded-[1px] bg-white" />
          </span>
          {t('swiss')}
        </p>
      </div>
    </section>
  )
}
