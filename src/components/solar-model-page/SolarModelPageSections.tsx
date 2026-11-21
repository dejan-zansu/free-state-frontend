import { formatChf } from '@/components/roof-renovation/roof-renovation-api'
import { getSolarDirectFromPriceChf } from '@/lib/pricing/solar-direct-from-price'
import { pvServiceVisible } from '@/lib/pv-service-gate'
import { roofRenovationVisible } from '@/lib/roof-renovation-gate'
import {
  SOLAR_MODELS,
  SOLAR_MODEL_ROWS,
  calculatorHref,
  type SolarModelKey,
} from '@/lib/solar-models'
import { getTranslations } from 'next-intl/server'
import {
  OfferCosts,
  OfferFacts,
  OfferFit,
  OfferHero,
  OfferIncluded,
  OfferSteps,
  type OfferLink,
} from './SolarOfferBlocks'

const VIDEO_BASE = 'https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos'

const MODEL_MEDIA: Record<
  SolarModelKey,
  { hero: string; facts: string; video: string | null }
> = {
  'solar-free': {
    hero: '/images/photography/pv-house-gable-green-hills-countryside-1151.webp',
    facts: '/images/pv-service/building-tiled-roof-pv.webp',
    video: `${VIDEO_BASE}/FreeState%20-%20Solar%20Free.mp4`,
  },
  'solar-abo': {
    hero: '/images/photography/house-roof-black-pv-two-faces-clouds-0709.webp',
    facts: '/images/pv-service/tiled-roof-pv-array.webp',
    video: null,
  },
  'solar-direct': {
    hero: '/images/photography/pv-modules-dark-tile-roof-corner-white-house-1140.webp',
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
    <OfferHero
      image={MODEL_MEDIA[model].hero}
      title={t('title')}
      subtitle={t('subtitle')}
      primary={{ href: calculatorHref(model), label: tModels(`${key}.cta`) }}
      secondary={{ href: '#anfrage', label: tShared('secondaryCta') }}
      points={HERO_POINTS.map(point => t(`points.${point}`))}
    />
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
    <OfferFacts
      title={tShared('factsTitle', { model: name })}
      intro={t(`${key}.tagline`)}
      rows={SOLAR_MODEL_ROWS.map(row => ({
        label: t(`rows.${row}`),
        value: row === 'investment' ? investment : t(`${key}.values.${row}`),
      }))}
      media={
        media.video
          ? { video: media.video, label: tShared('videoTitle', { model: name }) }
          : { image: media.facts, alt: tHero('imageAlt') }
      }
    />
  )
}

export const SolarModelStepsSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}.steps`)
  const tShared = await getTranslations('solarModelPage.shared')
  const tModels = await getTranslations('solarModels')
  return (
    <OfferSteps
      title={t('title')}
      intro={t('intro')}
      image={STEPS_IMAGE}
      imageAlt={tShared('stepsImageAlt')}
      steps={STEP_KEYS.map(step => ({
        title: t(`items.${step}.title`),
        body: t(`items.${step}.body`),
      }))}
      cta={{ href: calculatorHref(model), label: tModels(`${key}.cta`) }}
    />
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
    <OfferCosts
      title={t('title')}
      intro={t('intro')}
      items={COST_KEYS.map(item => ({
        value: valueFor(item),
        label: t(`items.${item}.label`),
        body: t(`items.${item}.body`),
      }))}
      note={t('note')}
    />
  )
}

export const SolarModelIncludedSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}`)
  const tShared = await getTranslations('solarModelPage.shared')
  const showServiceLink = !SOLAR_MODELS[model].serviceIncluded && pvServiceVisible

  return (
    <OfferIncluded
      includedTitle={tShared('includedTitle')}
      included={t.raw('included') as string[]}
      notIncludedTitle={tShared('notIncludedTitle')}
      notIncluded={t.raw('notIncluded') as string[]}
      link={
        showServiceLink
          ? { href: '/service', label: tShared('seeService') }
          : null
      }
    />
  )
}

export const SolarModelFitSection = async ({ model }: SectionProps) => {
  const key = SOLAR_MODELS[model].messageKey
  const t = await getTranslations(`solarModelPage.${key}.fit`)
  const tShared = await getTranslations('solarModelPage.shared')
  const tModels = await getTranslations('solarModels')
  const name = tModels(`${key}.name`)
  const no = t.raw('no') as string[]
  const targets = FIT_TARGETS[model]

  const linkFor = (target: FitTarget | undefined): OfferLink | null => {
    if (target?.kind === 'model') {
      return {
        href: SOLAR_MODELS[target.model].href,
        label: tShared('seeModel', {
          model: tModels(`${SOLAR_MODELS[target.model].messageKey}.name`),
        }),
      }
    }
    if (target?.kind === 'roof' && roofRenovationVisible) {
      return { href: '/roof-renovation/solar', label: tShared('seeRoof') }
    }
    return null
  }

  return (
    <OfferFit
      title={tShared('fitYesTitle', { model: name })}
      yes={t.raw('yes') as string[]}
      noTitle={tShared('fitNoTitle')}
      no={no.map((text, index) => ({ text, link: linkFor(targets[index]) }))}
    />
  )
}
