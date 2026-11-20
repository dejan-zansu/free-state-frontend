import PageHero from '@/components/PageHero'
import { formatChf } from '@/components/roof-renovation/roof-renovation-api'
import {
  RoofDarkPanel,
  RoofSection,
} from '@/components/roof-renovation/RoofSection'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { getSolarDirectFromPriceChf } from '@/lib/pricing/solar-direct-from-price'
import { pvServiceVisible } from '@/lib/pv-service-gate'
import { roofRenovationVisible } from '@/lib/roof-renovation-gate'
import {
  SOLAR_MODELS,
  SOLAR_MODEL_ROWS,
  calculatorHref,
  type SolarModelKey,
} from '@/lib/solar-models'
import { ArrowRight, CircleCheck, Minus } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const VIDEO_BASE = 'https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos'

const MODEL_MEDIA: Record<
  SolarModelKey,
  { hero: string; facts: string; video: string | null }
> = {
  'solar-free': {
    hero: '/images/roof-renovation/chalet-solar-hillside.webp',
    facts: '/images/pv-service/building-tiled-roof-pv.webp',
    video: `${VIDEO_BASE}/FreeState%20-%20Solar%20Free.mp4`,
  },
  'solar-abo': {
    hero: '/images/roof-renovation/village-solar-roofs.webp',
    facts: '/images/pv-service/tiled-roof-pv-array.webp',
    video: null,
  },
  'solar-direct': {
    hero: '/images/roof-renovation/solar-tile-roof-rainbow.webp',
    facts: '/images/pv-service/building-tiled-roof-pv.webp',
    video: `${VIDEO_BASE}/FreeState%20-%20Solar%20Direct.mp4`,
  },
}

const STEPS_IMAGE = '/images/pv-service/technicians-module-on-roof.webp'

const HERO_POINTS = ['1', '2', '3'] as const
const STEP_KEYS = ['1', '2', '3', '4'] as const
const COST_KEYS = ['1', '2', '3'] as const

type FitTarget =
  | { kind: 'model'; model: SolarModelKey }
  | { kind: 'roof' }

const FIT_TARGETS: Record<SolarModelKey, readonly [FitTarget, FitTarget]> = {
  'solar-free': [{ kind: 'model', model: 'solar-direct' }, { kind: 'roof' }],
  'solar-abo': [
    { kind: 'model', model: 'solar-direct' },
    { kind: 'model', model: 'solar-free' },
  ],
  'solar-direct': [
    { kind: 'model', model: 'solar-free' },
    { kind: 'model', model: 'solar-abo' },
  ],
}

interface SectionProps {
  model: SolarModelKey
}

export const SolarModelHero = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}.hero`)
  const tShared = await getTranslations('solarModelPage.shared')
  const tModels = await getTranslations('solarModels')
  return (
    <div className="bg-[#EAEDDF]">
      <PageHero
        backgroundImage={MODEL_MEDIA[model].hero}
        overlayClassName="bg-[linear-gradient(180deg,rgba(6,46,37,0.82)_0%,rgba(6,46,37,0.62)_60%,rgba(6,46,37,0.5)_100%)]"
        title={t('title')}
        titleClassName="normal-case max-w-[1040px]"
        description={t('subtitle')}
        descriptionClassName="max-w-[860px] text-lg text-white/90 md:text-[22px]"
        className="min-h-[560px] pb-16 md:min-h-[640px] md:pb-24"
      >
        <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row">
          <LinkButton variant="primary" href={calculatorHref(model)}>
            {tModels(`${key}.cta`)}
          </LinkButton>
          <a
            href="#anfrage"
            className="text-base font-medium text-white underline underline-offset-4 hover:opacity-80 md:text-lg"
          >
            {tShared('secondaryCta')}
          </a>
        </div>
      </PageHero>
      <ul className="mx-auto flex max-w-[1214px] flex-col gap-x-10 gap-y-3 px-4 py-8 text-[#062E25] sm:flex-row sm:flex-wrap sm:justify-center sm:px-6 md:py-10">
        {HERO_POINTS.map(point => (
          <li key={point} className="flex items-center gap-2 text-base md:text-lg">
            <CircleCheck
              aria-hidden
              className="size-5 shrink-0 text-[#036B53]"
            />
            {t(`points.${point}`)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const SolarModelFactsSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations('solarModels')
  const tShared = await getTranslations('solarModelPage.shared')
  const tHero = await getTranslations(`solarModelPage.${key}.hero`)
  const name = t(`${key}.name`)
  const media = MODEL_MEDIA[model]
  const directFromPrice =
    model === 'solar-direct' ? await getSolarDirectFromPriceChf() : null

  const investment =
    model === 'solar-direct'
      ? directFromPrice != null
        ? t('direct.values.investment', { price: formatChf(directFromPrice) })
        : t('direct.values.investmentNoPrice')
      : t(`${key}.values.investment`)

  return (
    <section className="bg-[#FDFFF5] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
            {tShared('factsTitle', { model: name })}
          </h2>
          <p className="mt-5 text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
            {t(`${key}.tagline`)}
          </p>
          <dl className="mt-8">
            {SOLAR_MODEL_ROWS.map(row => (
              <div
                key={row}
                className="grid gap-1 border-t border-[#062E25]/12 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="text-base text-[#062E25]/65">
                  {t(`rows.${row}`)}
                </dt>
                <dd className="text-base font-medium md:text-lg">
                  {row === 'investment' ? investment : t(`${key}.values.${row}`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-[#062E25]">
          {media.video ? (
            <video
              src={media.video}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label={tShared('videoTitle', { model: name })}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <Image
              src={media.facts}
              alt={tHero('imageAlt')}
              fill
              sizes="(min-width: 1024px) 580px, 100vw"
              className="object-cover"
            />
          )}
        </div>
      </div>
    </section>
  )
}

export const SolarModelStepsSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}.steps`)
  const tShared = await getTranslations('solarModelPage.shared')
  const tModels = await getTranslations('solarModels')
  return (
    <section className="bg-[#EAEDDF] pb-10 text-[#062E25]">
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
              src={STEPS_IMAGE}
              alt={tShared('stepsImageAlt')}
              fill
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <ol>
            {STEP_KEYS.map((step, index) => (
              <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
                {index < STEP_KEYS.length - 1 && (
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
                    {t(`items.${step}.title`)}
                  </h3>
                  <p className="mt-1 text-base text-[#062E25]/80">
                    {t(`items.${step}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <LinkButton
            variant="tertiary"
            href={calculatorHref(model)}
            className="mt-10"
          >
            {tModels(`${key}.cta`)}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export const SolarModelCostsSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}.costs`)
  const directFromPrice =
    model === 'solar-direct' ? await getSolarDirectFromPriceChf() : null

  const valueFor = (item: (typeof COST_KEYS)[number]) => {
    if (model === 'solar-direct' && item === '1') {
      return directFromPrice != null
        ? t('items.1.value', { price: formatChf(directFromPrice) })
        : t('items.1.valueNoPrice')
    }
    return t(`items.${item}.value`)
  }

  return (
    <RoofDarkPanel below="light">
      <div className="max-w-[820px]">
        <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
          {t('title')}
        </h2>
        <p className="mt-5 text-lg tracking-[-0.02em] text-white/80 md:text-[22px]">
          {t('intro')}
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-3">
        {COST_KEYS.map(item => (
          <article
            key={item}
            className="flex flex-col rounded-[24px] border border-white/15 bg-white/[0.06] p-6 md:p-8"
          >
            <p className="text-[32px] font-medium tracking-[-0.03em] text-solar tabular-nums xl:text-[38px]">
              {valueFor(item)}
            </p>
            <h3 className="mt-1 text-lg font-medium">
              {t(`items.${item}.label`)}
            </h3>
            <p className="mt-4 border-t border-white/15 pt-4 text-base text-white/75">
              {t(`items.${item}.body`)}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-8 max-w-[820px] text-base text-white/75">{t('note')}</p>
    </RoofDarkPanel>
  )
}

export const SolarModelIncludedSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}`)
  const tShared = await getTranslations('solarModelPage.shared')
  const included = t.raw('included') as string[]
  const notIncluded = t.raw('notIncluded') as string[]
  const showServiceLink = !SOLAR_MODELS[model].serviceIncluded && pvServiceVisible

  return (
    <section className="bg-[#FDFFF5] text-[#062E25]">
      <div className="mx-auto grid max-w-[1214px] gap-6 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#062E25]/12 bg-white p-6 md:p-10">
          <h2 className="text-2xl font-medium tracking-tight md:text-[32px]">
            {tShared('includedTitle')}
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {included.map(item => (
              <li key={item} className="flex gap-3 text-base md:text-lg">
                <CircleCheck
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-[#036B53] md:mt-1"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[24px] bg-[#EAEDDF] p-6 md:p-10">
          <h2 className="text-2xl font-medium tracking-tight md:text-[32px]">
            {tShared('notIncludedTitle')}
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {notIncluded.map(item => (
              <li
                key={item}
                className="flex gap-3 text-base text-[#062E25]/80 md:text-lg"
              >
                <Minus
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-[#062E25]/50 md:mt-1"
                />
                {item}
              </li>
            ))}
          </ul>
          {showServiceLink && (
            <Link
              href="/service"
              className="mt-6 inline-flex items-center gap-1.5 text-base font-medium underline underline-offset-4 hover:opacity-80"
            >
              {tShared('seeService')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

export const SolarModelFitSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}.fit`)
  const tShared = await getTranslations('solarModelPage.shared')
  const tModels = await getTranslations('solarModels')
  const name = tModels(`${key}.name`)
  const yes = t.raw('yes') as string[]
  const no = t.raw('no') as string[]
  const targets = FIT_TARGETS[model]

  return (
    <RoofSection
      tone="sand"
      title={tShared('fitYesTitle', { model: name })}
      className="[&_h2]:max-w-none"
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ul className="flex flex-col gap-4">
          {yes.map(item => (
            <li key={item} className="flex gap-3 text-lg md:text-xl">
              <CircleCheck
                aria-hidden
                className="mt-1 size-6 shrink-0 text-[#036B53]"
              />
              {item}
            </li>
          ))}
        </ul>
        <div className="rounded-[24px] bg-[#FDFFF5] p-6 md:p-8">
          <h3 className="text-xl font-medium tracking-tight md:text-2xl">
            {tShared('fitNoTitle')}
          </h3>
          <ul className="mt-5 flex flex-col gap-5">
            {no.map((item, index) => {
              const target = targets[index]
              const link =
                target?.kind === 'model'
                  ? {
                      href: SOLAR_MODELS[target.model].href,
                      label: tShared('seeModel', {
                        model: tModels(
                          `${SOLAR_MODELS[target.model].messageKey}.name`
                        ),
                      }),
                    }
                  : target?.kind === 'roof' && roofRenovationVisible
                    ? {
                        href: '/roof-renovation/solar' as const,
                        label: tShared('seeRoof'),
                      }
                    : null
              return (
                <li key={item} className="flex flex-col gap-1.5">
                  <span className="text-base text-[#062E25]/85 md:text-lg">
                    {item}
                  </span>
                  {link && (
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1.5 self-start text-base font-medium underline underline-offset-4 hover:opacity-80"
                    >
                      {link.label}
                      <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </RoofSection>
  )
}
