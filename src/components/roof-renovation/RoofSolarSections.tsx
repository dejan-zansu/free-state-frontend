import PageHero from '@/components/PageHero'
import { arrowButtonVariants } from '@/components/ui/arrow-button'
import { LearnMoreLink } from '@/components/ui/learn-more-link'
import { cn } from '@/lib/utils'
import { ArrowRight, Grid2x2, Recycle, ScanSearch } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { RoofIconBadge, RoofSection } from './RoofSection'

const WHY_ITEMS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'scaffold', icon: <Grid2x2 /> },
  { key: 'dismantling', icon: <Recycle /> },
  { key: 'asbestos', icon: <ScanSearch /> },
]
const CANTON_ITEMS = ['SH', 'LU', 'BE', 'SG'] as const
const OFFER_BLOCKS = [
  { key: 'roof', color: '#C4623F' },
  { key: 'insulation', color: '#EFCB4F' },
  { key: 'solar', color: '#16324F' },
] as const
const MOUNTING_RATES = [
  { key: 'inRoof', value: '400' },
  { key: 'onRoof', value: '360' },
] as const
const SOLAR_MODELS = [
  {
    key: 'solarFree',
    href: '/solar-free',
    image: '/images/about-us-solution-1-d14fce.webp',
  },
  {
    key: 'solarDirect',
    href: '/solar-direct',
    image: '/images/about-us-solution-2-12d056.webp',
  },
] as const

export const RoofSolarHero = async () => {
  const t = await getTranslations('roofRenovation.solarPage.hero')
  return (
    <PageHero
      backgroundImage="/images/roof-renovation/hero-tile-roofs.webp"
      overlayClassName="bg-[linear-gradient(180deg,rgba(6,46,37,0.78)_0%,rgba(6,46,37,0.5)_60%,rgba(6,46,37,0.4)_100%)]"
      title={t('title')}
      titleClassName="normal-case max-w-[1040px]"
      description={t('subtitle')}
      descriptionClassName="max-w-[860px] text-lg text-white/90 md:text-[22px]"
      className="min-h-[640px] pb-[80px]"
    >
      <a
        href="#anfrage"
        className={cn(
          arrowButtonVariants({ variant: 'primary', size: 'lg' }),
          'mt-8 text-base'
        )}
      >
        {t('cta')}
        <span className="flex size-12 items-center justify-center rounded-full bg-[#062E25]">
          <ArrowRight aria-hidden className="size-5 -rotate-45 text-white" />
        </span>
      </a>
    </PageHero>
  )
}

export const RoofSolarWhySection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.why')
  return (
    <section className="grid bg-[#FDFFF5] text-[#062E25] lg:grid-cols-2">
      <div className="relative min-h-[420px] lg:min-h-[680px]">
        <Image
          src="/images/history/timeline-firstProjects-422f69.webp"
          alt={t('imageAlt')}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="px-4 py-16 sm:px-6 md:py-24 lg:px-16 xl:px-20">
        <div className="max-w-[600px]">
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <p className="mt-5 text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
            {t('intro')}
          </p>
          <ul className="mt-10 flex flex-col gap-6">
            {WHY_ITEMS.map(item => (
              <li key={item.key} className="flex items-start gap-4">
                <RoofIconBadge>{item.icon}</RoofIconBadge>
                <div>
                  <h3 className="text-lg font-medium tracking-tight">
                    {t(`items.${item.key}.title`)}
                  </h3>
                  <p className="mt-1 text-base text-[#062E25]/80">
                    {t(`items.${item.key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export const RoofSolarCantonsSection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.cantons')
  return (
    <section className="bg-[#FDFFF5]">
      <div className="rounded-[40px] bg-[linear-gradient(200deg,#0C5443_0%,#062E25_55%)] text-white">
        <div className="mx-auto max-w-[1214px] px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-[820px]">
            <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
              {t('title')}
            </h2>
            <p className="mt-5 text-lg tracking-[-0.02em] text-white/80 md:text-[22px]">
              {t('intro')}
            </p>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {CANTON_ITEMS.map(item => (
              <div key={item} className="border-t border-white/20 pt-6">
                <span className="text-5xl font-medium tracking-[-0.03em] text-solar md:text-[64px]">
                  {item}
                </span>
                <h3 className="mt-3 text-lg font-medium tracking-tight">
                  {t(`items.${item}.title`)}
                </h3>
                <p className="mt-2 text-base text-white/80">
                  {t(`items.${item}.body`)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-base md:text-lg">{t('note')}</p>
        </div>
      </div>
    </section>
  )
}

export const RoofSolarMountingSection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.mounting')
  return (
    <section className="bg-[#FDFFF5] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {MOUNTING_RATES.map(rate => (
              <div key={rate.key} className="rounded-[24px] bg-[#EAEDDF] p-6">
                <span className="text-lg font-medium tracking-tight">
                  {t(rate.key)}
                </span>
                <span className="mt-3 block text-[28px] font-medium tracking-[-0.03em] tabular-nums">
                  {t('perKw', { value: rate.value })}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base md:text-lg">{t('body1')}</p>
          <p className="mt-4 text-base md:text-lg">{t('body2')}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
          <Image
            src="/images/commercial/how-large-plants-works/in-roof-on-roof-illustration.webp"
            alt={t('imageAlt')}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export const RoofSolarOfferSection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.offer')
  return (
    <RoofSection tone="sand" title={t('title')} intro={t('intro')}>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="relative mx-auto aspect-[530/429] w-full max-w-[520px]">
          <Image
            src="/images/two-solar-panels-on-roof.png"
            alt={t('imageAlt')}
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-contain"
          />
        </div>
        <div>
          <ul className="flex flex-col divide-y divide-[#062E25]/10 rounded-[24px] bg-white">
            {OFFER_BLOCKS.map(block => (
              <li key={block.key} className="flex items-start gap-4 p-6">
                <span
                  aria-hidden
                  className="mt-1 size-5 shrink-0 rounded-[5px]"
                  style={{ backgroundColor: block.color }}
                />
                <div>
                  <h3 className="text-xl font-medium tracking-tight">
                    {t(`items.${block.key}.title`)}
                  </h3>
                  <p className="mt-1 text-base text-[#062E25]/80">
                    {t(`items.${block.key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 px-1">
            <h3 className="text-lg font-medium tracking-tight">
              {t('existingTitle')}
            </h3>
            <p className="mt-1 text-base text-[#062E25]/80">
              {t('existingBody')}
            </p>
          </div>
        </div>
      </div>
    </RoofSection>
  )
}

export const RoofSolarModelsSection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.models')
  return (
    <RoofSection title={t('title')} intro={t('intro')}>
      <div className="grid gap-6 md:grid-cols-2">
        {SOLAR_MODELS.map(model => (
          <div
            key={model.key}
            className="flex flex-col items-start gap-3 rounded-[24px] bg-[#EAEDDF] p-6 md:p-8"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={model.image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
              />
            </div>
            <h3 className="mt-2 text-2xl font-medium tracking-tight">
              {t(`${model.key}.title`)}
            </h3>
            <p className="text-base text-[#062E25]/80 md:text-lg">
              {t(`${model.key}.body`)}
            </p>
            {model.key === 'solarFree' && (
              <p className="text-base text-[#062E25]/80 md:text-lg">
                {t('solarFree.clause')}
              </p>
            )}
            <LearnMoreLink href={model.href}>
              {t(`${model.key}.link`)}
            </LearnMoreLink>
          </div>
        ))}
      </div>
    </RoofSection>
  )
}
