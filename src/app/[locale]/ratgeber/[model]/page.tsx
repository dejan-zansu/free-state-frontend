import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import LatestPostsSection from '@/components/blog/LatestPostsSection'
import {
  ActorsSection,
  AudienceSection,
  ExampleSection,
  FaqSection,
  FlowSection,
  FsaStepsSection,
  LegalSection,
  ModelHero,
  PraxismodellSection,
  RelatedModelsSection,
  RequirementsSection,
  RightsSection,
  ScenariosSection,
  StepsSection,
} from '@/components/ratgeber/ModelSections'
import RatgeberCta from '@/components/ratgeber/RatgeberCta'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  COMMUNITY_MODEL_SLUGS,
  getCommunityModel,
} from '@/data/energiegemeinschaften'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

const DE_ONLY = ['de'] as const

export function generateStaticParams() {
  return COMMUNITY_MODEL_SLUGS.map(model => ({ model }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; model: string }>
}): Promise<Metadata> {
  const { locale, model } = await params
  const m = getCommunityModel(model)
  if (!m)
    return {
      robots: { index: false, follow: false },
      title: 'Ratgeber | Free State AG',
    }
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/ratgeber/${m.slug}`,
    title: m.seo.title,
    description: m.seo.description,
    ogImage: {
      url: `${siteConfig.url}${m.hero.image}`,
      width: 1600,
      height: 1200,
      alt: m.hero.imageAlt,
    },
    availableLocales: DE_ONLY,
  })
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; model: string }>
}) {
  const { locale, model } = await params
  const m = getCommunityModel(model)
  if (!m) notFound()
  const prefix = locale === 'de' ? '' : `/${locale}`
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
          { name: m.name, href: `${prefix}/ratgeber/${m.slug}` },
        ])}
      />
      <ModelHero model={m} />
      <AudienceSection items={m.audience} />
      <StepsSection title="So funktioniert es" steps={m.steps} />
      <FlowSection model={m} />
      <LegalSection model={m} />
      <RequirementsSection items={m.requirements} />
      <ActorsSection actors={m.actors} />
      <ExampleSection example={m.example} />
      <RightsSection title={m.rightsTitle} items={m.rights} />
      <ScenariosSection items={m.scenarios} />
      {m.praxismodell && <PraxismodellSection items={m.praxismodell} />}
      <FsaStepsSection
        title="So läuft es mit Free State AG"
        steps={m.fsaSteps}
      />
      <FaqSection
        eyebrow="FAQ"
        title={
          m.slug === 'leg'
            ? 'Häufige Fragen zur LEG'
            : `Häufige Fragen zum ${m.name}`
        }
        description={`Kurz beantwortet, mit Verweis auf ${m.legal.refs[0].law} ${m.legal.refs[0].article}.`}
        items={m.faq}
      />
      <RelatedModelsSection current={m.slug} />
      <LatestPostsSection
        topic="communities"
        className="bg-[#EAEDDF] px-4 sm:px-6 pt-16 md:pt-[70px]"
      />
      <RatgeberCta />
    </div>
  )
}
