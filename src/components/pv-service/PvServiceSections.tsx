import PageHero from '@/components/PageHero'
import {
  RoofDarkPanel,
  RoofIconBadge,
  RoofSection,
} from '@/components/roof-renovation/RoofSection'
import { formatChf } from '@/components/roof-renovation/roof-renovation-api'
import { LinkButton } from '@/components/ui/link-button'
import { StatTile } from '@/components/ui/stat-tile'
import {
  COMPANY_MAIN_PHONE_DISPLAY,
  COMPANY_MAIN_PHONE_TEL_HREF,
} from '@/lib/company-contact'
import { roofRenovationVisible } from '@/lib/roof-renovation-gate'
import { cn } from '@/lib/utils'
import {
  ArrowLeftRight,
  CircleCheck,
  Droplets,
  KeyRound,
  Minus,
  Router,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import type { ReactNode } from 'react'

import PvServiceEstimator from './PvServiceEstimator'
import PvServiceForm from './PvServiceForm'
import {
  PV_SERVICE_INVERTER_BRANDS,
  PV_SERVICE_PACKAGE_KEYS,
  PV_SERVICE_PRICE_ROWS,
  type PvServicePackageKey,
} from './pv-service-api'

export const PV_SERVICE_IMAGES = {
  hero: '/images/pv-service/hero-commercial-flat-roof-pv.webp',
  building: '/images/pv-service/tiled-roof-pv-array.webp',
  technician: '/images/pv-service/technicians-module-on-roof.webp',
  care: '/images/pv-service/inverter-industrial-roof.webp',
  roof: '/images/pv-service/building-tiled-roof-pv.webp',
  request: '/images/pv-service/commercial-roof-pv-portrait.webp',
} as const

const HERO_POINTS = ['free', 'anyInstaller', 'wholeSwitzerland'] as const

const STATS = ['plants', 'inverters', 'liability'] as const

type Coverage =
  | 'yes'
  | 'every3'
  | 'yearly'
  | 'onRequest'
  | 'onRequestRecommended'
  | null

const PACKAGE_ROWS: readonly {
  key: string
  values: Record<PvServicePackageKey, Coverage>
}[] = [
  {
    key: 'monitoring',
    values: { monitoring: 'yes', wartung: 'yes', wartung_plus: 'yes' },
  },
  {
    key: 'report',
    values: { monitoring: 'yes', wartung: 'yes', wartung_plus: 'yes' },
  },
  {
    key: 'visit',
    values: { monitoring: null, wartung: 'yes', wartung_plus: 'yes' },
  },
  {
    key: 'strings',
    values: { monitoring: null, wartung: 'every3', wartung_plus: 'yearly' },
  },
  {
    key: 'thermography',
    values: { monitoring: null, wartung: null, wartung_plus: 'every3' },
  },
  {
    key: 'cleaning',
    values: {
      monitoring: 'onRequest',
      wartung: 'onRequestRecommended',
      wartung_plus: 'onRequestRecommended',
    },
  },
  {
    key: 'sina',
    values: { monitoring: null, wartung: null, wartung_plus: 'yes' },
  },
]

const ACCESS_ROUTES: readonly { key: string; icon: ReactNode }[] = [
  { key: 'portal', icon: <KeyRound /> },
  { key: 'transfer', icon: <ArrowLeftRight /> },
  { key: 'logger', icon: <Router /> },
]

const PORTAL_BRANDS: readonly (typeof PV_SERVICE_INVERTER_BRANDS)[number][] = [
  'SMA',
  'Fronius',
  'Huawei',
  'SolarEdge',
]

const PROCESS_STEPS = ['check', 'survey', 'contract', 'operation'] as const

const CARE_ITEMS: readonly { key: string; icon: ReactNode }[] = [
  { key: 'cleaning', icon: <Droplets /> },
  { key: 'thermography', icon: <ScanSearch /> },
  { key: 'sina', icon: <ShieldCheck /> },
]

const REQUEST_STEPS = ['call', 'check', 'offer'] as const

export const PvServiceHero = async () => {
  const t = await getTranslations('pvService.hero')
  return (
    <div className="bg-[#EAEDDF]">
      <PageHero
        backgroundImage={PV_SERVICE_IMAGES.hero}
        overlayClassName="bg-[linear-gradient(180deg,rgba(6,46,37,0.82)_0%,rgba(6,46,37,0.62)_60%,rgba(6,46,37,0.5)_100%)]"
        title={t('title')}
        titleClassName="normal-case max-w-[1040px]"
        description={t('subtitle')}
        descriptionClassName="max-w-[980px] text-lg text-white/90 md:text-[22px]"
        className="min-h-[560px] pb-[140px] md:min-h-[620px] md:pb-[190px]"
        overlappedBelow
      />
      <PvServiceEstimator />
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
          {t('direct')}
        </a>
      </div>
    </div>
  )
}

export const PvServiceStatsSection = async () => {
  const t = await getTranslations('pvService.stats')
  return (
    <section className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto max-w-[1214px] px-4 pb-16 sm:px-6 md:pb-24">
        <div className="flex max-w-[820px] flex-col gap-5">
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <p className="text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
            {t('intro')}
          </p>
        </div>
        <div className="mt-10 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-6">
          {STATS.map(stat => (
            <figure key={stat} className="flex flex-col gap-3">
              <StatTile
                variant="glass"
                value={t(`items.${stat}.value`)}
                subtitle={t(`items.${stat}.label`)}
              />
              <figcaption className="text-base text-[#062E25]/70">
                {t(`items.${stat}.source`)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export const PvServicePackagesSection = async () => {
  const t = await getTranslations('pvService.packages')
  const lowest = PV_SERVICE_PRICE_ROWS[0].annualChf
  return (
    <RoofDarkPanel below="sand">
      <div id="pakete" className="max-w-[820px] scroll-mt-28">
        <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
          {t('title')}
        </h2>
        <p className="mt-5 text-lg tracking-[-0.02em] text-white/80 md:text-[22px]">
          {t('intro')}
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-3">
        {PV_SERVICE_PACKAGE_KEYS.map(key => (
          <article
            key={key}
            className="flex flex-col rounded-[24px] border border-white/15 bg-white/[0.06] p-6 backdrop-blur-[20px] md:p-8"
          >
            <h3 className="text-2xl font-medium tracking-tight">
              {t(`${key}.name`)}
            </h3>
            <p className="mt-2 text-base text-white/75 lg:min-h-[4.5rem]">
              {t(`${key}.tagline`)}
            </p>
            <p className="mt-6 text-base text-white/70">{t('fromLabel')}</p>
            <p className="text-[36px] font-medium tracking-[-0.03em] text-solar tabular-nums xl:text-[42px]">
              {lowest
                ? t('price', { value: formatChf(lowest[key]) })
                : t('onRequest')}
            </p>
            <p className="text-base text-white/70">{t('priceUnit')}</p>
            <ul className="mt-6 flex flex-col gap-4 border-t border-white/15 pt-6">
              {PACKAGE_ROWS.map(row => {
                const value = row.values[key]
                return (
                  <li
                    key={row.key}
                    className={cn(
                      'flex gap-3',
                      value === null && 'text-white/40'
                    )}
                  >
                    {value === null ? (
                      <Minus aria-hidden className="mt-0.5 size-5 shrink-0" />
                    ) : (
                      <CircleCheck
                        aria-hidden
                        className="mt-0.5 size-5 shrink-0 text-solar"
                      />
                    )}
                    <span className="flex flex-col">
                      <span className="text-base font-medium">
                        {t(`rows.${row.key}.title`)}
                        {value === null && (
                          <span className="sr-only">
                            {` ${t('notIncluded')}`}
                          </span>
                        )}
                      </span>
                      {value !== null && value !== 'yes' && (
                        <span className="text-base text-solar">
                          {t(`coverage.${value}`)}
                        </span>
                      )}
                      {value !== null && (
                        <span className="text-base text-white/70">
                          {t(`rows.${row.key}.detail`)}
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>
    </RoofDarkPanel>
  )
}

export const PvServicePriceTableSection = async () => {
  const t = await getTranslations('pvService.packages')
  const tBands = await getTranslations('pvService.estimator.bands')
  return (
    <RoofSection tone="sand" title={t('table.title')} intro={t('table.intro')}>
      <div className="overflow-x-auto rounded-[20px] border border-[#062E25]/10 bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-base">
          <thead>
            <tr className="bg-[#062E25]/[0.04]">
              <th scope="col" className="px-4 py-3 font-medium">
                {t('table.service')}
              </th>
              {PV_SERVICE_PRICE_ROWS.map(row => (
                <th
                  key={row.band}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-right font-medium"
                >
                  {tBands(row.band)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {PV_SERVICE_PACKAGE_KEYS.map(key => (
              <tr key={key} className="border-t border-[#062E25]/10">
                <th scope="row" className="px-4 py-3 font-medium">
                  {t(`${key}.name`)}
                </th>
                {PV_SERVICE_PRICE_ROWS.map(row => (
                  <td key={row.band} className="px-4 py-3 text-right">
                    {row.annualChf
                      ? formatChf(row.annualChf[key])
                      : t('onRequest')}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-[#062E25]/10 text-[#062E25]/75">
              <th scope="row" className="px-4 py-3 font-medium">
                {t('table.onboarding')}
              </th>
              {PV_SERVICE_PRICE_ROWS.map(row => (
                <td key={row.band} className="px-4 py-3 text-right">
                  {row.onboardingChf != null
                    ? formatChf(row.onboardingChf)
                    : t('onRequest')}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 md:gap-8">
        <p className="text-base text-[#062E25]/75">{t('table.note')}</p>
        <p className="text-base text-[#062E25]/75">{t('table.extra')}</p>
      </div>
    </RoofSection>
  )
}

export const PvServiceOtherInstallersSection = async () => {
  const t = await getTranslations('pvService.otherInstallers')
  return (
    <section className="grid bg-[#FDFFF5] text-[#062E25] lg:grid-cols-2">
      <div className="relative min-h-[420px] lg:min-h-[640px]">
        <Image
          src={PV_SERVICE_IMAGES.building}
          alt={t('imageAlt')}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-white/25 bg-[#062E25]/75 p-6 text-white backdrop-blur-[20px] sm:inset-x-8 sm:bottom-8 md:p-8">
          <p className="text-lg font-medium tracking-tight">
            {t('brandsTitle')}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PORTAL_BRANDS.map(brand => (
              <li
                key={brand}
                className="rounded-full border border-white/30 px-4 py-1.5 text-base"
              >
                {brand}
              </li>
            ))}
          </ul>
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
          <ul className="mt-10 flex flex-col gap-6">
            {ACCESS_ROUTES.map(route => (
              <li key={route.key} className="flex items-start gap-4">
                <RoofIconBadge>{route.icon}</RoofIconBadge>
                <div>
                  <h3 className="text-lg font-medium tracking-tight md:text-xl">
                    {t(`routes.${route.key}.title`)}
                  </h3>
                  <p className="mt-1 text-base text-[#062E25]/80">
                    {t(`routes.${route.key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-[20px] bg-[#EAEDDF] p-6">
            <h3 className="text-lg font-medium tracking-tight">
              {t('goneTitle')}
            </h3>
            <p className="mt-2 text-base text-[#062E25]/80">{t('gone')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export const PvServiceProcessSection = async () => {
  const t = await getTranslations('pvService.process')
  return (
    <section className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <p className="mt-5 text-lg tracking-[-0.02em] text-[#062E25]/80">
            {t('intro')}
          </p>
          <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[24px]">
            <Image
              src={PV_SERVICE_IMAGES.technician}
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

export const PvServiceCareSection = async () => {
  const t = await getTranslations('pvService.care')
  return (
    <section className="grid bg-[#062E25] text-white lg:grid-cols-2">
      <div className="order-2 px-4 py-16 sm:px-6 md:py-24 lg:order-1 lg:px-16 xl:px-20">
        <div className="ml-auto max-w-[580px]">
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('title')}
          </h2>
          <p className="mt-5 text-lg tracking-[-0.02em] text-white/80 md:text-[22px]">
            {t('intro')}
          </p>
          <ul className="mt-10 flex flex-col gap-8">
            {CARE_ITEMS.map(item => (
              <li key={item.key} className="flex items-start gap-4">
                <RoofIconBadge tone="dark">{item.icon}</RoofIconBadge>
                <div>
                  <h3 className="text-xl font-medium tracking-tight">
                    {t(`items.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 text-base text-white/80">
                    {t(`items.${item.key}.body`)}
                  </p>
                  <p className="mt-2 text-base text-solar">
                    {t(`items.${item.key}.price`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative order-1 min-h-[420px] lg:order-2 lg:min-h-[720px]">
        <Image
          src={PV_SERVICE_IMAGES.care}
          alt={t('imageAlt')}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}

export const PvServiceRoofSection = async () => {
  if (!roofRenovationVisible) return null
  const t = await getTranslations('pvService.roof')
  return (
    <RoofSection title={t('title')} intro={t('intro')}>
      <div className="grid overflow-hidden rounded-[24px] bg-[#EAEDDF] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative min-h-[260px] md:min-h-[360px]">
          <Image
            src={PV_SERVICE_IMAGES.roof}
            alt={t('imageAlt')}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <h3 className="text-2xl font-medium tracking-tight">
            {t('cardTitle')}
          </h3>
          <p className="text-base md:text-lg">{t('cardBody')}</p>
          <LinkButton
            variant="tertiary"
            href="/roof-renovation"
            className="mt-2 w-fit"
          >
            {t('link')}
          </LinkButton>
        </div>
      </div>
    </RoofSection>
  )
}

export const PvServiceRequestSection = async () => {
  const t = await getTranslations('pvService.request')
  return (
    <section
      id="anfrage"
      className="scroll-mt-28 bg-[#EAEDDF] px-4 py-16 sm:px-6 md:py-24"
    >
      <div className="mx-auto grid max-w-[1214px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[24px] lg:sticky lg:top-28 lg:block">
          <Image
            src={PV_SERVICE_IMAGES.request}
            alt=""
            fill
            sizes="500px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,46,37,0.35)_0%,rgba(6,46,37,0.92)_100%)]" />
          <div className="absolute inset-x-8 bottom-8 text-white">
            <p className="text-2xl font-medium tracking-tight">
              {t('nextTitle')}
            </p>
            <ol className="mt-5 flex flex-col gap-3">
              {REQUEST_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-base">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-solar text-base font-medium text-[#062E25] tabular-nums">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{t(`next.${step}`)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-lg font-medium">{t('call')}</p>
            <LinkButton
              variant="primary"
              href={COMPANY_MAIN_PHONE_TEL_HREF}
              className="mt-3"
            >
              {COMPANY_MAIN_PHONE_DISPLAY}
            </LinkButton>
          </div>
        </div>
        <PvServiceForm placement="final" />
      </div>
    </section>
  )
}
