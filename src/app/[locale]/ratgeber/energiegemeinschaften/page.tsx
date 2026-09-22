import type { Metadata } from 'next'

import LatestPostsSection from '@/components/blog/LatestPostsSection'
import CommunityScene from '@/components/ratgeber/CommunityScene'
import {
  ComparisonSection,
  DecisionSection,
  HubHero,
  ModelCardsSection,
} from '@/components/ratgeber/HubSections'
import {
  FaqSection,
  FsaStepsSection,
} from '@/components/ratgeber/ModelSections'
import RatgeberCta from '@/components/ratgeber/RatgeberCta'
import Section from '@/components/ratgeber/Section'
import { JsonLd } from '@/components/seo/JsonLd'
import { HUB, SCENE_ZONE_COPY } from '@/data/energiegemeinschaften'
import { getPathname } from '@/i18n/navigation'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

const DE_ONLY = ['de'] as const
const POSTER = '/ratgeber/energiegemeinschaften.webp'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/ratgeber/energiegemeinschaften',
    title: HUB.seo.title,
    description: HUB.seo.description,
    ogImage: {
      url: `${siteConfig.url}${POSTER}`,
      width: 2400,
      height: 1500,
      alt: HUB.sceneTitle,
    },
    availableLocales: DE_ONLY,
  })
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const typedLocale = locale as SiteLocale
  const prefix = locale === 'de' ? '' : `/${locale}`
  const zones = SCENE_ZONE_COPY.map(zone => {
    const model = zone.id === 'praxismodell' ? 'vzev' : zone.id
    const base = getPathname({
      locale: typedLocale,
      href: { pathname: '/ratgeber/[model]', params: { model } },
    })
    return {
      ...zone,
      href: zone.id === 'praxismodell' ? `${base}#praxismodell` : base,
    }
  })
  return (
    <div>
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: 'Home', href: prefix || '/' },
          { name: 'Ratgeber', href: `${prefix}/ratgeber` },
          {
            name: 'Energiegemeinschaften',
            href: `${prefix}/ratgeber/energiegemeinschaften`,
          },
        ])}
      />
      <HubHero title={HUB.hero.title} lead={HUB.hero.lead} />
      <Section title={HUB.sceneTitle} tone="sand" className="pt-0">
        <CommunityScene
          zones={zones}
          alt="Isometrische Ansicht eines Quartiers mit vier Modellen, ZEV, vZEV, LEG und Praxismodell"
          overviewLabel="Übersicht"
          loadingLabel="3D-Ansicht wird geladen"
          stepsTitle="Schritt für Schritt"
          allStepsLabel="Alle Flüsse"
        />
      </Section>
      <DecisionSection title={HUB.decisionTitle} steps={HUB.decision} />
      <ComparisonSection title={HUB.comparisonTitle} rows={HUB.comparison} />
      <ModelCardsSection />
      <FsaStepsSection title={HUB.fsaTitle} steps={HUB.fsaSteps} />
      <FaqSection
        eyebrow="FAQ"
        title="Häufige Fragen zu ZEV, vZEV und LEG"
        description="Die kurzen Antworten. Die Details stehen auf den drei Modellseiten."
        items={HUB.faq}
      />
      <LatestPostsSection
        topic="communities"
        className="bg-[#EAEDDF] px-4 sm:px-6 pt-16 md:pt-[70px]"
      />
      <RatgeberCta />
    </div>
  )
}
