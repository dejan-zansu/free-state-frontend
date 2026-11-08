import RoofFaq from '@/components/roof-renovation/RoofFaq'
import {
  RoofSolarCantonsSection,
  RoofSolarCostSection,
  RoofSolarHero,
  RoofSolarModelsSection,
  RoofSolarMountingSection,
  RoofSolarOfferSection,
  RoofSolarWhySection,
} from '@/components/roof-renovation/RoofSolarSections'
import { RoofRequestSection } from '@/components/roof-renovation/RoofRenovationSections'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPathname } from '@/i18n/navigation'
import {
  ROOF_RENOVATION_LIVE,
  roofRenovationVisible,
} from '@/lib/roof-renovation-gate'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  if (!roofRenovationVisible) return {}
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/roof-renovation/solar',
    title: t('roofRenovationSolar.title'),
    description: t('roofRenovationSolar.description'),
    noIndex: !ROOF_RENOVATION_LIVE,
  })
}

const RoofRenovationSolarPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  if (!roofRenovationVisible) notFound()
  const { locale } = await params
  const siteLocale = locale as SiteLocale
  const t = await getTranslations('roofRenovation')

  return (
    <div>
      <JsonLd
        data={buildBreadcrumbsFromPath([
          {
            name: t('breadcrumb.home'),
            href: getPathname({ locale: siteLocale, href: '/' }),
          },
          {
            name: t('breadcrumb.main'),
            href: getPathname({
              locale: siteLocale,
              href: '/roof-renovation',
            }),
          },
          {
            name: t('breadcrumb.solar'),
            href: getPathname({
              locale: siteLocale,
              href: '/roof-renovation/solar',
            }),
          },
        ])}
      />
      <RoofSolarHero />
      <RoofSolarWhySection />
      <RoofSolarCantonsSection />
      <RoofSolarMountingSection />
      <RoofSolarOfferSection />
      <RoofSolarCostSection />
      <RoofSolarModelsSection />
      <RoofFaq namespace="roofRenovation.solarPage.faq" keys={FAQ_KEYS} />
      <RoofRequestSection placement="solar" defaultPvInterest="yes" />
    </div>
  )
}

export default RoofRenovationSolarPage
