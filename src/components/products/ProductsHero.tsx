import { Box } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import HeroNavLight from '@/components/HeroNavLight'
import { EyebrowPill } from '@/components/ui/eyebrow-pill'

/** Light page header for the product catalogue, same shell as ProductHeroLight. */
export default async function ProductsHero({ productCount }: { productCount: number }) {
  const t = await getTranslations('products.hero')

  return (
    <section className="relative overflow-hidden bg-[#EBEDDF]">
      <HeroNavLight />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pt-44 lg:px-8 lg:pb-20 lg:pt-56">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full"
          style={{ backgroundColor: 'rgba(183, 254, 26, 0.55)', filter: 'blur(140px)' }}
        />
        <nav aria-label={t('breadcrumb')} className="mb-6 text-sm uppercase tracking-[0.08em] text-pine/60 sm:text-base">
          freestate.ch / {t('breadcrumb')}
        </nav>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <EyebrowPill>
              <Box className="mr-2 h-4 w-4" aria-hidden />
              {t('eyebrow')}
            </EyebrowPill>
            <h1 className="mt-5 text-4xl font-medium leading-[1.05] tracking-tight text-[#17302A] sm:text-5xl lg:text-6xl">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#17302A]/80 sm:text-xl">
              {t('subtitle')}
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-base text-pine/80 lg:max-w-sm lg:flex-col lg:gap-y-3">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" />
              {t('trust.count', { count: productCount })}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" />
              {t('trust.scale')}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-deep" />
              {t('trust.sources')}
            </li>
          </ul>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{ background: 'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)' }}
      />
    </section>
  )
}
