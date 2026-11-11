import { LearnMoreLink } from '@/components/ui/learn-more-link'
import { LinkButton } from '@/components/ui/link-button'
import { Grid2x2, Recycle, ScanSearch } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { ReactNode } from 'react'

import RoofCostChart from './RoofCostChart'
import { RoofOfferLayers } from './RoofLayers'
import { RoofEstimatorHero } from './RoofRenovationSections'
import { RoofDarkPanel, RoofIconBadge, RoofSection } from './RoofSection'

const WHY_ITEMS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'scaffold', icon: <Grid2x2 /> },
  { key: 'dismantling', icon: <Recycle /> },
  { key: 'asbestos', icon: <ScanSearch /> },
]
const CANTON_ITEMS = ['SH', 'LU', 'BE', 'SG'] as const
const OFFER_KEYS = ['roof', 'insulation', 'solar'] as const
const MOUNTING_RATES = [
  { key: 'inRoof', value: '400' },
  { key: 'onRoof', value: '360' },
] as const
const SOLAR_MODELS = [
  {
    key: 'solarFree',
    href: '/solar-free',
    image: '/images/photography/swiss-house-pv-two-roof-faces-fir-trees-0717.webp',
  },
  {
    key: 'solarDirect',
    href: '/solar-direct',
    image: '/images/photography/pv-roof-white-house-trees-skylights-1153.webp',
  },
] as const

export const RoofSolarHero = async () => {
  const t = await getTranslations('roofRenovation.solarPage.hero')
  return (
    <RoofEstimatorHero
      image="/images/photography/tiled-roof-valley-black-modules-two-faces-0715.webp"
      title={t('title')}
      subtitle={t('subtitle')}
      directLabel={t('cta')}
      pvInterest="yes"
    />
  )
}

const PhaseBlock = ({ label, color }: { label: string; color: string }) => (
  <div
    className="flex h-16 items-center justify-center rounded-[14px] px-3 text-base font-medium text-white"
    style={{ backgroundColor: color }}
  >
    {label}
  </div>
)

const Scaffold = ({ label }: { label: string }) => (
  <div>
    <div
      aria-hidden
      className="h-3 rounded-full bg-[repeating-linear-gradient(135deg,rgba(6,46,37,0.55)_0_6px,transparent_6px_12px)] ring-1 ring-[#062E25]/25"
    />
    <span className="mt-2 block text-base text-[#062E25]/70">{label}</span>
  </div>
)

const RoofTogetherDiagram = async () => {
  const t = await getTranslations('roofRenovation.solarPage.why.diagram')
  return (
    <figure className="rounded-[24px] bg-[#EAEDDF] p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-xl font-medium tracking-tight">
          {t('together')}
        </span>
        <span className="text-base font-medium text-[#036B53]">
          {t('onePhase')}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <PhaseBlock label={t('roof')} color="#C4623F" />
        <PhaseBlock label={t('solar')} color="#16324F" />
      </div>
      <div className="mt-2">
        <Scaffold label={t('scaffold')} />
      </div>

      <div className="mt-8 border-t border-[#062E25]/15 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xl font-medium tracking-tight">
            {t('later')}
          </span>
          <span className="text-base font-medium text-[#062E25]/70">
            {t('twoPhases')}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <PhaseBlock label={t('roof')} color="#C4623F" />
            <Scaffold label={t('scaffold')} />
          </div>
          <div className="flex h-16 flex-col items-center justify-center gap-1 px-2">
            <span
              aria-hidden
              className="w-full border-t-2 border-dashed border-[#062E25]/40"
            />
            <span className="text-base text-[#062E25]/70">{t('gap')}</span>
          </div>
          <div className="flex flex-col gap-2">
            <PhaseBlock label={t('solar')} color="#16324F" />
            <Scaffold label={t('scaffold')} />
          </div>
        </div>
      </div>
    </figure>
  )
}

export const RoofSolarWhySection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.why')
  return (
    <section className="bg-[#FDFFF5] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 pb-24 pt-16 sm:px-6 md:pb-32 md:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
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
        <RoofTogetherDiagram />
      </div>
    </section>
  )
}

export const RoofSolarCantonsSection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.cantons')
  return (
    <RoofDarkPanel>
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
    </RoofDarkPanel>
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
            src="/images/photography/installer-screwing-rail-clamp-cordless-drill-0667.webp"
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
      <RoofOfferLayers
        label={t('imageAlt')}
        items={OFFER_KEYS.map(key => ({
          key,
          title: t(`items.${key}.title`),
          body: t(`items.${key}.body`),
        }))}
      >
        <div className="mt-6 px-1">
          <h3 className="text-lg font-medium tracking-tight">
            {t('existingTitle')}
          </h3>
          <p className="mt-1 text-base text-[#062E25]/80">
            {t('existingBody')}
          </p>
        </div>
      </RoofOfferLayers>
    </RoofSection>
  )
}

export const RoofSolarCostSection = async () => {
  const t = await getTranslations('roofRenovation.cost')
  const tSolar = await getTranslations('roofRenovation.solarPage.cost')
  return (
    <RoofSection title={t('title')} intro={tSolar('intro')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RoofCostChart />
        <div className="flex flex-col rounded-[24px] bg-[#062E25] p-6 text-white md:p-8">
          <h3 className="text-2xl font-medium tracking-tight">
            {tSolar('solarTitle')}
          </h3>
          <p className="mt-4 text-base text-white/80 md:text-lg">
            {tSolar('solarBody')}
          </p>
          <div className="relative my-8 aspect-[16/10] w-full overflow-hidden rounded-[16px]">
            <Image
              src="/images/photography/pv-modules-around-roof-dormer-1177.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover"
            />
          </div>
          <LinkButton variant="primary" href="/cost" className="w-fit">
            {tSolar('solarLink')}
          </LinkButton>
        </div>
      </div>
    </RoofSection>
  )
}

export const RoofSolarModelsSection = async () => {
  const t = await getTranslations('roofRenovation.solarPage.models')
  return (
    <RoofSection tone="sand" title={t('title')} intro={t('intro')}>
      <div className="grid gap-6 md:grid-cols-2">
        {SOLAR_MODELS.map(model => (
          <div
            key={model.key}
            className="flex flex-col items-start gap-3 rounded-[24px] bg-white p-6 md:p-8"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[16px]">
              <Image
                src={model.image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
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
