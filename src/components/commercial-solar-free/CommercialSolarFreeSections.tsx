import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import RoofFaq from '@/components/roof-renovation/RoofFaq'
import {
  RoofIconBadge,
  RoofSection,
} from '@/components/roof-renovation/RoofSection'
import {
  OfferCosts,
  OfferFacts,
  OfferFit,
  OfferHero,
  OfferIncluded,
  OfferSteps,
} from '@/components/solar-model-page/SolarOfferBlocks'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import {
  COMMERCIAL_CALCULATOR_HREF,
  COMMERCIAL_HUB_MEDIA,
  COMMERCIAL_PURCHASE_HREF,
  COMMERCIAL_SEGMENTS,
  COMMERCIAL_SEGMENT_KEYS,
  type CommercialSegmentKey,
} from '@/lib/commercial-solar-free'
import { roofRenovationVisible } from '@/lib/roof-renovation-gate'
import { SOLAR_MODEL_ROWS } from '@/lib/solar-models'
import {
  ArrowRight,
  ArrowUpRight,
  Landmark,
  Leaf,
  LineChart,
  Mail,
  Phone,
  ReceiptText,
  Sprout,
  TrendingUp,
  Wallet,
  Warehouse,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const STEPS_IMAGE = '/images/pv-service/technicians-module-on-roof.webp'
const CONTACT_IMAGE = '/images/solar-free/multi-family-contact-person-63995f.webp'

const POINT_KEYS = ['1', '2', '3'] as const
const STEP_KEYS = ['1', '2', '3', '4'] as const
const COST_KEYS = ['1', '2', '3'] as const
const BENEFIT_KEYS = ['1', '2', '3'] as const
const FAQ_KEYS = ['1', '2', '3', '4', '5', '6'] as const

const BENEFIT_ICONS: Record<
  CommercialSegmentKey,
  readonly [LucideIcon, LucideIcon, LucideIcon]
> = {
  multiFamily: [Zap, ReceiptText, TrendingUp],
  industry: [Wallet, LineChart, Leaf],
  farm: [Warehouse, Zap, Sprout],
  public: [Wallet, LineChart, Landmark],
}

interface SegmentProps {
  segment?: CommercialSegmentKey
}

export const CommercialHero = async ({ segment }: SegmentProps) => {
  const t = await getTranslations('commercialSolarFree')
  const base = segment ? `segments.${segment}` : 'hub'
  return (
    <OfferHero
      image={segment ? COMMERCIAL_SEGMENTS[segment].image : COMMERCIAL_HUB_MEDIA.hero}
      title={t(`${base}.hero.title`)}
      subtitle={t(`${base}.hero.subtitle`)}
      primary={{
        href: COMMERCIAL_CALCULATOR_HREF,
        label: t('shared.primaryCta'),
      }}
      secondary={{ href: '/contact', label: t('shared.secondaryCta') }}
      points={POINT_KEYS.map(point => t(`shared.points.${point}`))}
    />
  )
}

export const CommercialSegmentGrid = async () => {
  const t = await getTranslations('commercialSolarFree')
  return (
    <RoofSection
      tone="light"
      title={t('hub.segments.title')}
      intro={t('hub.segments.intro')}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {COMMERCIAL_SEGMENT_KEYS.map(segment => (
          <Link
            key={segment}
            href={COMMERCIAL_SEGMENTS[segment].href}
            className="group flex flex-col overflow-hidden rounded-[24px] border border-[#062E25]/12 bg-white transition-colors hover:border-[#062E25]/40"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#062E25]">
              <Image
                src={COMMERCIAL_SEGMENTS[segment].image}
                alt={t(`segments.${segment}.hero.imageAlt`)}
                fill
                sizes="(min-width: 1024px) 290px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                {t(`segments.${segment}.name`)}
              </h3>
              <p className="text-base text-[#062E25]/80">
                {t(`segments.${segment}.card`)}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-base font-medium underline underline-offset-4">
                {t('hub.segments.cta')}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </RoofSection>
  )
}

export const CommercialFacts = async ({ segment }: SegmentProps) => {
  const t = await getTranslations('commercialSolarFree')
  const tModels = await getTranslations('solarModels')
  const config = segment ? COMMERCIAL_SEGMENTS[segment] : null
  const media = !config
    ? { image: COMMERCIAL_HUB_MEDIA.facts, alt: t('hub.hero.imageAlt') }
    : config.video
      ? { video: config.video, label: t('shared.videoLabel') }
      : {
          image: config.factsImage,
          alt: t(`segments.${segment}.factsImageAlt`),
        }
  return (
    <OfferFacts
      tone={segment ? 'light' : 'sand'}
      title={t('shared.factsTitle')}
      intro={tModels('free.taglineBusiness')}
      rows={SOLAR_MODEL_ROWS.map(row => ({
        label: tModels(`rows.${row}`),
        value: tModels(`free.values.${row}`),
      }))}
      media={media}
    />
  )
}

export const CommercialBenefits = async ({
  segment,
}: {
  segment: CommercialSegmentKey
}) => {
  const t = await getTranslations(
    `commercialSolarFree.segments.${segment}.benefits`
  )
  const icons = BENEFIT_ICONS[segment]
  return (
    <RoofSection tone="sand" title={t('title')} className="[&_h2]:max-w-none">
      <div className="grid gap-6 lg:grid-cols-3">
        {BENEFIT_KEYS.map((key, index) => {
          const Icon = icons[index]
          return (
            <article
              key={key}
              className="flex flex-col gap-4 rounded-[24px] bg-[#FDFFF5] p-6 md:p-8"
            >
              <RoofIconBadge>
                <Icon />
              </RoofIconBadge>
              <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-base text-[#062E25]/80 md:text-lg">
                {t(`items.${key}.body`)}
              </p>
            </article>
          )
        })}
      </div>
    </RoofSection>
  )
}

export const CommercialSteps = async () => {
  const t = await getTranslations('commercialSolarFree.shared')
  return (
    <OfferSteps
      tone="light"
      title={t('steps.title')}
      intro={t('steps.intro')}
      image={STEPS_IMAGE}
      imageAlt={t('steps.imageAlt')}
      steps={STEP_KEYS.map(step => ({
        title: t(`steps.items.${step}.title`),
        body: t(`steps.items.${step}.body`),
      }))}
      cta={{ href: COMMERCIAL_CALCULATOR_HREF, label: t('primaryCta') }}
    />
  )
}

export const CommercialCosts = async () => {
  const t = await getTranslations('commercialSolarFree.shared.costs')
  return (
    <OfferCosts
      title={t('title')}
      intro={t('intro')}
      items={COST_KEYS.map(item => ({
        value: t(`items.${item}.value`),
        label: t(`items.${item}.label`),
        body: t(`items.${item}.body`),
      }))}
      note={t('note')}
    />
  )
}

export const CommercialIncluded = async ({ segment }: SegmentProps) => {
  const t = await getTranslations('commercialSolarFree')
  const base = segment ? `segments.${segment}` : 'hub'
  return (
    <OfferIncluded
      includedTitle={t('shared.includedTitle')}
      included={t.raw(`${base}.included`) as string[]}
      notIncludedTitle={t('shared.notIncludedTitle')}
      notIncluded={t.raw('shared.notIncluded') as string[]}
    />
  )
}

export const CommercialFit = async ({ segment }: SegmentProps) => {
  const t = await getTranslations('commercialSolarFree')
  const base = segment ? `segments.${segment}` : 'hub'
  return (
    <OfferFit
      title={t('shared.fitYesTitle')}
      yes={t.raw(`${base}.fitYes`) as string[]}
      noTitle={t('shared.fitNoTitle')}
      no={[
        {
          text: t('shared.fitNo.own'),
          link: {
            href: COMMERCIAL_PURCHASE_HREF,
            label: t('shared.seePurchase'),
          },
        },
        {
          text: t('shared.fitNo.roof'),
          link: roofRenovationVisible
            ? { href: '/roof-renovation/solar', label: t('shared.seeRoof') }
            : null,
        },
      ]}
    />
  )
}

export const CommercialCommunitiesLink = async () => {
  const t = await getTranslations('commercialSolarFree.communitiesLink')
  return (
    <section className="bg-[#EAEDDF] px-4 pb-16 text-[#062E25] sm:px-6 md:pb-24">
      <div className="mx-auto flex max-w-[1214px] flex-col gap-5 rounded-[24px] border border-[#062E25]/12 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <h2 className="text-2xl font-medium tracking-tight">{t('title')}</h2>
          <p className="mt-2 max-w-2xl text-base text-[#062E25]/80 md:text-lg">
            {t('text')}
          </p>
        </div>
        <Link
          href="/ratgeber/energiegemeinschaften"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#062E25] px-5 py-2.5 text-base font-medium text-white hover:bg-[#062E25]/90 md:self-auto"
        >
          {t('cta')}
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export const CommercialFaq = async ({ segment }: SegmentProps) => {
  if (!segment) {
    return <RoofFaq namespace="commercialSolarFree.shared.faq" keys={FAQ_KEYS} />
  }
  const t = await getTranslations('commercialSolarFree.shared.faq')
  return (
    <div className="bg-[#FDFFF5]">
      <FAQAccordionSection
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        items={FAQ_KEYS.map(key => ({
          question: t(`items.${key}.question`),
          answer: t(`items.${key}.answer`),
        }))}
      />
    </div>
  )
}

export const CommercialClosing = async () => {
  const t = await getTranslations('commercialSolarFree.shared')
  const tPerson = await getTranslations('commercialSolarFree.contactPerson')
  return (
    <section className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {t('closing.title')}
          </h2>
          <p className="mt-5 max-w-[560px] text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
            {t('closing.body')}
          </p>
          <LinkButton
            variant="tertiary"
            href={COMMERCIAL_CALCULATOR_HREF}
            className="mt-8"
          >
            {t('primaryCta')}
          </LinkButton>
        </div>
        <div className="rounded-[24px] border border-[#062E25]/12 bg-white p-6 md:p-8">
          <p className="text-base text-[#062E25]/65">
            {t('closing.contactTitle')}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-[#EAEDDF]">
              <Image
                src={CONTACT_IMAGE}
                alt={tPerson('name')}
                fill
                sizes="80px"
                className="object-cover object-top"
              />
            </div>
            <div>
              <p className="text-xl font-medium tracking-tight">
                {tPerson('name')}
              </p>
              <p className="text-base text-[#062E25]/75">{tPerson('role')}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-[#062E25]/12 pt-6">
            <a
              href={`tel:${tPerson('phoneHref')}`}
              className="inline-flex items-center gap-3 text-base font-medium hover:opacity-80 md:text-lg"
            >
              <Phone aria-hidden className="size-5 shrink-0 text-[#036B53]" />
              {tPerson('phone')}
            </a>
            <a
              href={`mailto:${tPerson('email')}`}
              className="inline-flex items-center gap-3 break-all text-base font-medium hover:opacity-80 md:text-lg"
            >
              <Mail aria-hidden className="size-5 shrink-0 text-[#036B53]" />
              {tPerson('email')}
            </a>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center gap-1.5 self-start text-base font-medium underline underline-offset-4 hover:opacity-80"
            >
              {t('closing.contactCta')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
