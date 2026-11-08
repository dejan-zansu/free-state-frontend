import PageHero from '@/components/PageHero'
import { LinkButton } from '@/components/ui/link-button'
import {
  COMPANY_MAIN_PHONE_DISPLAY,
  COMPANY_MAIN_PHONE_TEL_HREF,
} from '@/lib/company-contact'
import {
  CircleCheck,
  CloudRain,
  Construction,
  Droplets,
  FileCheck2,
  FileSignature,
  Grid3x3,
  HardHat,
  Landmark,
  Layers,
  Maximize2,
  MoveUpRight,
  ScanSearch,
  ShieldCheck,
  ThermometerSun,
  Wrench,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { ReactNode } from 'react'

import RoofCostChart from './RoofCostChart'
import RoofEstimator from './RoofEstimator'
import RoofLayers from './RoofLayers'
import RoofRenovationForm, { type RoofPvInterest } from './RoofRenovationForm'
import { formatChf } from './roof-renovation-api'
import { RoofDarkPanel, RoofIconBadge, RoofSection } from './RoofSection'

const SUBSIDY_ROWS = [
  { canton: 'ZH', rate: 40, addOn: 20 },
  { canton: 'SH', rate: 50, addOn: 30 },
  { canton: 'TG', rate: 40, addOn: 20 },
  { canton: 'SG', rate: 40, addOn: null },
  { canton: 'AG', rate: 40, addOn: null },
] as const

const DUE_SIGNS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'leak', icon: <Droplets /> },
  { key: 'tiles', icon: <Grid3x3 /> },
  { key: 'sealing', icon: <CloudRain /> },
  { key: 'flashing', icon: <Wrench /> },
  { key: 'climate', icon: <ThermometerSun /> },
]

const LIFE_BARS = [
  { key: 'lifeSteep', years: 50 },
  { key: 'lifeFlat', years: 30 },
] as const

const SERVICE_PHASES = [
  { key: 'before', items: ['check', 'offer', 'permit'] },
  { key: 'site', items: ['scaffold', 'hall'] },
  { key: 'after', items: ['handover', 'repair'] },
] as const

const COST_DRIVERS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'fixed', icon: <Construction /> },
  { key: 'size', icon: <Maximize2 /> },
  { key: 'buildup', icon: <Layers /> },
  { key: 'access', icon: <MoveUpRight /> },
]

const PRICE_STAGES = [
  { key: 'orientation', width: '100%' },
  { key: 'draft', width: '48%' },
  { key: 'fixed', width: '12px' },
] as const

const FINANCING_AUDIENCES = [
  {
    key: 'owners',
    image: '/images/roof-renovation/chalet-solar-hillside.webp',
  },
  {
    key: 'condominium',
    image: '/images/roof-renovation/apartment-buildings-street.webp',
  },
  {
    key: 'companies',
    image: '/images/roof-renovation/flat-roof-solar-hall.webp',
  },
] as const

const FINANCING_NOTES: readonly { key: string; icon: ReactNode }[] = [
  { key: 'offer', icon: <FileCheck2 /> },
  { key: 'subsidies', icon: <Landmark /> },
]

const PROCESS_STEPS = [
  'request',
  'callback',
  'visit',
  'offer',
  'subsidy',
  'execution',
] as const

const CONTRACT_ITEMS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'contract', icon: <FileSignature /> },
  { key: 'safety', icon: <HardHat /> },
  { key: 'warranty', icon: <ShieldCheck /> },
  { key: 'asbestos', icon: <ScanSearch /> },
]

const HERO_POINTS = ['offer', 'fixedPrice', 'onePartner'] as const
const SOLAR_REASONS = ['scaffold', 'dismantling', 'asbestos'] as const

export const RoofEstimatorHero = async ({
  image,
  title,
  subtitle,
  directLabel,
  pvInterest,
}: {
  image: string
  title: string
  subtitle: string
  directLabel?: string
  pvInterest?: RoofPvInterest
}) => {
  const t = await getTranslations('roofRenovation.hero')
  const tSection = await getTranslations('roofRenovation.estimatorSection')
  const tAddress = await getTranslations('roofRenovation.estimator.address')
  return (
    <div className="bg-[#EAEDDF]">
      <PageHero
        backgroundImage={image}
        overlayClassName="bg-[linear-gradient(180deg,rgba(6,46,37,0.8)_0%,rgba(6,46,37,0.58)_60%,rgba(6,46,37,0.42)_100%)]"
        title={title}
        titleClassName="normal-case max-w-[1040px]"
        description={subtitle}
        descriptionClassName="max-w-[980px] text-lg text-white/90 md:text-[22px]"
        className="min-h-[560px] pb-[140px] md:min-h-[620px] md:pb-[190px]"
      />
      <RoofEstimator
        title={tSection('title')}
        intro={tSection('intro')}
        pvInterest={pvInterest}
      />
      <div className="mx-auto flex max-w-[1214px] flex-col gap-4 px-4 pb-14 pt-8 text-[#062E25] sm:px-6 md:flex-row md:items-center md:justify-between md:pb-20">
        <ul className="flex flex-col gap-x-8 gap-y-3 sm:flex-row sm:flex-wrap">
          {HERO_POINTS.map(point => (
            <li
              key={point}
              className="flex items-center gap-2 text-base md:text-lg"
            >
              <CircleCheck
                aria-hidden
                className="size-5 shrink-0 text-[#036B53]"
              />
              {t(`points.${point}`)}
            </li>
          ))}
        </ul>
        <a
          href="#anfrage"
          className="w-fit shrink-0 text-base font-medium underline underline-offset-4 md:text-lg"
        >
          {directLabel ?? tAddress('direct')}
        </a>
      </div>
    </div>
  )
}

export const RoofRenovationHero = async () => {
  const t = await getTranslations('roofRenovation.hero')
  return (
    <RoofEstimatorHero
      image="/images/roof-renovation/hero-bern-roofs.webp"
      title={t('title')}
      subtitle={t('subtitle')}
    />
  )
}

export const RoofDueSection = async () => {
  const t = await getTranslations('roofRenovation.due')
  return (
    <section className="grid bg-[#FDFFF5] text-[#062E25] lg:grid-cols-2">
      <div className="relative min-h-[560px]">
        <Image
          src="/images/roof-renovation/old-tile-roofs.webp"
          alt={t('imageAlt')}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-white/25 bg-[#062E25]/75 p-6 text-white backdrop-blur-[20px] sm:inset-x-8 sm:bottom-8 md:p-8 lg:bottom-16">
          <h3 className="text-xl font-medium tracking-tight">
            {t('lifeTitle')}
          </h3>
          <div className="mt-5 flex flex-col gap-4">
            {LIFE_BARS.map(bar => (
              <div key={bar.key}>
                <div className="flex items-baseline justify-between gap-4 text-base">
                  <span>{t(bar.key)}</span>
                  <span className="font-medium tabular-nums">
                    {t('years', { years: String(bar.years) })}
                  </span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-white/15">
                  <div
                    className="h-2.5 rounded-full bg-solar"
                    style={{ width: `${(bar.years / 50) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-16 sm:px-6 md:py-24 lg:px-16 xl:px-20">
        <div className="max-w-[600px]">
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <p className="mt-5 text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
            {t('intro')}
          </p>
          <ul className="mt-10 flex flex-col gap-5">
            {DUE_SIGNS.map(sign => (
              <li key={sign.key} className="flex items-center gap-4">
                <RoofIconBadge>{sign.icon}</RoofIconBadge>
                <span className="text-base md:text-lg">
                  {t(`signs.${sign.key}`)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-[#062E25]/15 pt-8">
            <h3 className="text-xl font-medium tracking-tight">
              {t('ageTitle')}
            </h3>
            <p className="mt-3 text-base">{t('age')}</p>
            <p className="mt-3 text-base">{t('flatRoof')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export const RoofServicesSection = async () => {
  const t = await getTranslations('roofRenovation.services')
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
      <div className="mt-10 md:mt-12">
        <RoofLayers />
      </div>
      <div className="mt-14 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-3">
        {SERVICE_PHASES.map(phase => (
          <div key={phase.key}>
            <h3 className="text-lg font-medium text-solar">
              {t(`phases.${phase.key}`)}
            </h3>
            <dl className="mt-5 flex flex-col gap-5">
              {phase.items.map(item => (
                <div key={item}>
                  <dt className="text-lg font-medium tracking-tight">
                    {t(`items.${item}.title`)}
                  </dt>
                  <dd className="mt-1 text-base text-white/75">
                    {t(`items.${item}.body`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </RoofDarkPanel>
  )
}

export const RoofCostSection = async () => {
  const t = await getTranslations('roofRenovation.cost')
  return (
    <RoofSection title={t('title')} intro={t('intro')}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <RoofCostChart />
        <div className="flex flex-col rounded-[24px] bg-solar p-6 text-[#062E25] md:p-8">
          <h3 className="text-2xl font-medium tracking-tight">
            {t('ownPrice.heading')}
          </h3>
          <p className="mt-8 text-[36px] font-medium tracking-[-0.03em] tabular-nums xl:text-[46px]">
            {t('ownPrice.value')}
          </p>
          <p className="mt-1 text-lg">{t('ownPrice.unit')}</p>
          <p className="mt-6 text-base md:text-lg">{t('ownPrice.scope')}</p>
          <div className="relative my-6 aspect-[16/10] w-full overflow-hidden rounded-[16px]">
            <Image
              src="/images/roof-renovation/flat-roof-membrane.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 border-t border-[#062E25]/25 pt-6">
            <p className="text-base">{t('ownPrice.onTop')}</p>
            <p className="text-base">{t('ownPrice.recover')}</p>
          </div>
        </div>
      </div>

      <h3 className="mt-14 text-2xl font-medium tracking-tight">
        {t('driversTitle')}
      </h3>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {COST_DRIVERS.map(driver => (
          <div
            key={driver.key}
            className="flex items-start gap-4 lg:flex-col lg:gap-3"
          >
            <RoofIconBadge>{driver.icon}</RoofIconBadge>
            <div>
              <h4 className="text-lg font-medium tracking-tight">
                {t(`drivers.${driver.key}.title`)}
              </h4>
              <p className="mt-1 text-base text-[#062E25]/80">
                {t(`drivers.${driver.key}.body`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-[24px] bg-[#EAEDDF] p-6 md:p-10">
        <h3 className="text-2xl font-medium tracking-tight">
          {t('stagesTitle')}
        </h3>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {PRICE_STAGES.map(stage => (
            <li key={stage.key} className="flex flex-col gap-3">
              <div
                aria-hidden
                className="flex h-3 items-center justify-center rounded-full bg-[#062E25]/10"
              >
                <div
                  className="h-3 rounded-full bg-[#062E25]"
                  style={{ width: stage.width }}
                />
              </div>
              <span className="mt-2 text-xl font-medium tracking-tight">
                {t(`stages.${stage.key}.title`)}
              </span>
              <span className="text-base text-[#062E25]/80">
                {t(`stages.${stage.key}.body`)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </RoofSection>
  )
}

export const RoofSubsidyTaxSection = async () => {
  const t = await getTranslations('roofRenovation.subsidy')
  return (
    <RoofSection tone="sand" title={t('title')} intro={t('intro')}>
      <div className="grid divide-y divide-[#062E25]/10 rounded-[24px] bg-white md:grid-cols-5 md:divide-x md:divide-y-0">
        {SUBSIDY_ROWS.map(row => (
          <div
            key={row.canton}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 p-5 md:flex md:flex-col md:p-6"
          >
            <span className="text-lg font-medium tracking-tight">
              {t(`table.cantons.${row.canton}`)}
            </span>
            <span className="row-span-2 text-right md:mt-5 md:text-left">
              <span className="block text-[28px] font-medium tracking-[-0.03em] tabular-nums md:text-[40px]">
                {t('table.value', { value: formatChf(row.rate) })}
              </span>
              <span className="block text-base text-[#062E25]/70">
                {t('table.unit')}
              </span>
            </span>
            <span className="text-base text-[#062E25]/80 md:mt-5 md:w-full md:border-t md:border-[#062E25]/10 md:pt-4">
              <span className="block font-medium text-[#062E25]">
                {t('table.addOn')}
              </span>
              {row.addOn != null
                ? t('table.perM2', { value: formatChf(row.addOn) })
                : row.canton === 'SG'
                  ? t('table.requiresPv')
                  : t('table.addOnAg')}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <p className="text-base">{t('conditions')}</p>
        <p className="text-base text-[#062E25]/70">{t('table.note')}</p>
      </div>
      <div className="mt-10 grid items-center gap-8 rounded-[24px] bg-[#062E25] p-6 text-white md:p-10 lg:grid-cols-[auto_1fr] lg:gap-14">
        <div>
          <h3 className="text-xl font-medium tracking-tight">
            {t('taxTitle')}
          </h3>
          <p className="mt-2 text-5xl font-medium tracking-[-0.03em] text-solar tabular-nums md:text-[64px]">
            {t('taxDate')}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-base md:text-lg">{t('tax1')}</p>
          <p className="text-base md:text-lg">{t('tax2')}</p>
          <p className="text-base md:text-lg">{t('tax3')}</p>
          <p className="text-base text-white/65">{t('taxSource')}</p>
        </div>
      </div>
    </RoofSection>
  )
}

export const RoofSolarTeaserSection = async () => {
  const t = await getTranslations('roofRenovation.solarTeaser')
  const tWhy = await getTranslations('roofRenovation.solarPage.why')
  return (
    <section className="grid bg-[#062E25] text-white lg:grid-cols-2">
      <div className="order-2 px-4 py-16 sm:px-6 md:py-24 lg:order-1 lg:px-16 xl:px-20">
        <div className="ml-auto max-w-[560px]">
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <p className="mt-5 text-lg tracking-[-0.02em] text-white/80 md:text-[22px]">
            {t('body')}
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {SOLAR_REASONS.map(reason => (
              <li
                key={reason}
                className="flex items-center gap-3 text-base md:text-lg"
              >
                <CircleCheck
                  aria-hidden
                  className="size-5 shrink-0 text-solar"
                />
                {tWhy(`items.${reason}.title`)}
              </li>
            ))}
          </ul>
          <LinkButton
            variant="primary"
            href="/roof-renovation/solar"
            className="mt-10"
          >
            {t('link')}
          </LinkButton>
        </div>
      </div>
      <div className="relative order-1 min-h-[420px] lg:order-2 lg:min-h-[680px]">
        <Image
          src="/images/roof-renovation/village-solar-roofs.webp"
          alt={t('imageAlt')}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}

export const RoofFinancingSection = async () => {
  const t = await getTranslations('roofRenovation.financing')
  return (
    <RoofSection title={t('title')}>
      <div className="grid gap-6 md:grid-cols-3">
        {FINANCING_AUDIENCES.map(audience => (
          <div key={audience.key} className="flex flex-col">
            <div className="relative aspect-[2/1] overflow-hidden rounded-[24px] md:aspect-[4/3]">
              <Image
                src={audience.image}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <h3 className="mt-5 text-xl font-medium tracking-tight">
              {t(`blocks.${audience.key}.title`)}
            </h3>
            <p className="mt-2 text-base text-[#062E25]/80">
              {t(`blocks.${audience.key}.body`)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-12 grid gap-8 border-t border-[#062E25]/15 pt-8 md:grid-cols-2">
        {FINANCING_NOTES.map(note => (
          <div key={note.key} className="flex items-start gap-4">
            <RoofIconBadge>{note.icon}</RoofIconBadge>
            <div>
              <h3 className="text-lg font-medium tracking-tight">
                {t(`blocks.${note.key}.title`)}
              </h3>
              <p className="mt-1 text-base text-[#062E25]/80">
                {t(`blocks.${note.key}.body`)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-base font-medium md:text-lg">{t('closing')}</p>
    </RoofSection>
  )
}

export const RoofProcessSection = async () => {
  const t = await getTranslations('roofRenovation.process')
  return (
    <section className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[24px]">
            <Image
              src="/images/roof-renovation/roofer-scaffold-red-tiles.webp"
              alt={t('imageAlt')}
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <ol>
          {PROCESS_STEPS.map((step, index) => (
            <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
              {index < PROCESS_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[21px] top-11 w-0.5 bg-[#062E25]/20"
                />
              )}
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#062E25] text-lg font-medium text-solar tabular-nums">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-xl font-medium tracking-tight">
                  {t(`steps.${step}.title`)}
                </h3>
                <p className="mt-1 text-base text-[#062E25]/80">
                  {t(`steps.${step}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export const RoofContractSection = async () => {
  const t = await getTranslations('roofRenovation.contract')
  return (
    <RoofSection title={t('title')}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {CONTRACT_ITEMS.map(item => (
          <div
            key={item.key}
            className="flex items-start gap-4 lg:flex-col lg:gap-3"
          >
            <RoofIconBadge>{item.icon}</RoofIconBadge>
            <div>
              <h3 className="text-lg font-medium tracking-tight">
                {t(`items.${item.key}.title`)}
              </h3>
              <p className="mt-1 text-base text-[#062E25]/80">
                {t(`items.${item.key}.body`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </RoofSection>
  )
}

export const RoofRequestSection = async ({
  placement,
  defaultPvInterest,
}: {
  placement: 'final' | 'solar'
  defaultPvInterest?: 'yes'
}) => {
  const t = await getTranslations('roofRenovation.form')
  return (
    <section
      id="anfrage"
      className="scroll-mt-28 bg-[#EAEDDF] px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto grid max-w-[1214px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[24px] lg:sticky lg:top-28 lg:block">
          <Image
            src="/images/roof-renovation/hero-tile-roofs.webp"
            alt=""
            fill
            sizes="500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,46,37,0)_45%,rgba(6,46,37,0.85)_100%)]" />
          <div className="absolute inset-x-8 bottom-8 text-white">
            <p className="text-2xl font-medium tracking-tight">{t('call')}</p>
            <LinkButton
              variant="primary"
              href={COMPANY_MAIN_PHONE_TEL_HREF}
              className="mt-4"
            >
              {COMPANY_MAIN_PHONE_DISPLAY}
            </LinkButton>
          </div>
        </div>
        <RoofRenovationForm
          placement={placement}
          defaultPvInterest={defaultPvInterest}
          detailsOpen
        />
      </div>
    </section>
  )
}
