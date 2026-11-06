import {
  RoofContractSection,
  RoofCostSection,
  RoofDueSection,
  RoofFinancingSection,
  RoofProcessSection,
  RoofRenovationHero,
  RoofRequestSection,
  RoofServicesSection,
  RoofSolarTeaserSection,
  RoofSubsidyTaxSection,
} from '@/components/roof-renovation/RoofRenovationSections'
import RoofFaq from '@/components/roof-renovation/RoofFaq'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPathname } from '@/i18n/navigation'
import {
  ROOF_RENOVATION_LIVE,
  roofFinancingVisible,
  roofRenovationVisible,
} from '@/lib/roof-renovation-gate'
import { buildCanonicalUrl, generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import {
  buildBreadcrumbsFromPath,
  buildServiceJsonLd,
} from '@/lib/seo/structured-data'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const

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
    pathname: '/roof-renovation',
    title: t('roofRenovation.title'),
    description: t('roofRenovation.description'),
    noIndex: !ROOF_RENOVATION_LIVE,
  })
}

const RoofRenovationPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  if (!roofRenovationVisible) notFound()
  const { locale } = await params
  const siteLocale = locale as SiteLocale
  const t = await getTranslations('roofRenovation')
  const homeHref = getPathname({ locale: siteLocale, href: '/' })
  const pageHref = getPathname({
    locale: siteLocale,
    href: '/roof-renovation',
  })

  return (
    <div>
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: t('breadcrumb.home'), href: homeHref },
          { name: t('breadcrumb.main'), href: pageHref },
        ])}
      />
      <JsonLd
        data={buildServiceJsonLd({
          name: t('jsonLd.name'),
          description: t('jsonLd.description'),
          url: buildCanonicalUrl({
            pathname: '/roof-renovation',
            locale: siteLocale,
          }),
          serviceType: 'Roof renovation',
          areaServed: [{ '@type': 'Country', name: 'Switzerland' }],
        })}
      />
      <RoofRenovationHero />
      <RoofDueSection />
      <RoofServicesSection />
      <RoofCostSection />
      <RoofSubsidyTaxSection />
      <RoofSolarTeaserSection />
      {roofFinancingVisible && <RoofFinancingSection />}
      <RoofProcessSection />
      <RoofContractSection />
      <RoofFaq namespace="roofRenovation.faq" keys={FAQ_KEYS} />
      <RoofRequestSection placement="final" />
    </div>
  )
}

export default RoofRenovationPage
