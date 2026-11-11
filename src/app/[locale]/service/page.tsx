/*
 * Photos (Free State AG photographer, Google Drive folder 10SgbXXqK0YtJb2Dbj61p2uMToCinHPGk), looked at before use:
 * hero-commercial-flat-roof-pv.webp, DSC_0771.JPG (top sky cropped)
 * building-tiled-roof-pv.webp (roof cross-link), DSC_0717.JPG
 * technicians-module-on-roof.webp, DSC_1227.JPG (right edge cropped)
 * inverter-industrial-roof.webp, DSC_0789.JPG
 * tiled-roof-pv-array.webp (other installers), DSC_1140.JPG
 * commercial-roof-pv-portrait.webp, DSC_0774.JPG
 * roof-pv-mounting-work.webp (home panel), DSC_1184.JPG
 */
import PageHero from '@/components/PageHero'
import {
  PvServiceCareSection,
  PvServiceHero,
  PvServiceOtherInstallersSection,
  PvServicePackagesSection,
  PvServicePriceTableSection,
  PvServiceProcessSection,
  PvServiceRequestSection,
  PvServiceRoofSection,
  PvServiceStatsSection,
} from '@/components/pv-service/PvServiceSections'
import RoofFaq from '@/components/roof-renovation/RoofFaq'
import { JsonLd } from '@/components/seo/JsonLd'
import MaintenanceInquirySection from '@/components/service/MaintenanceInquirySection'
import MaintenanceServicesSection from '@/components/service/MaintenanceServicesSection'
import MonitoringSection from '@/components/service/MonitoringSection'
import SelfCheckSection from '@/components/service/SelfCheckSection'
import ServiceHighestLevelSection from '@/components/service/ServiceHighestLevelSection'
import ServiceHotlineSection from '@/components/service/ServiceHotlineSection'
import ServicePricingSection from '@/components/service/ServicePricingSection'
import SolarSeasonSection from '@/components/service/SolarSeasonSection'
import { getPathname } from '@/i18n/navigation'
import { pvServiceVisible } from '@/lib/pv-service-gate'
import { buildCanonicalUrl, generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import {
  buildBreadcrumbsFromPath,
  buildServiceJsonLd,
} from '@/lib/seo/structured-data'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  if (pvServiceVisible) {
    return generateSEOMetadata({
      locale: locale as SiteLocale,
      pathname: '/service',
      title: t('pvService.title'),
      description: t('pvService.description'),
    })
  }
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/service',
    title: t('service.title') || '',
    description: t('service.description') || '',
  })
}

const PvServicePage = async ({ locale }: { locale: SiteLocale }) => {
  const t = await getTranslations('pvService')
  const homeHref = getPathname({ locale, href: '/' })
  const pageHref = getPathname({ locale, href: '/service' })

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
          url: buildCanonicalUrl({ pathname: '/service', locale }),
          serviceType: 'Photovoltaic operation and maintenance',
          areaServed: [{ '@type': 'Country', name: 'Switzerland' }],
        })}
      />
      <PvServiceHero />
      <PvServiceStatsSection />
      <PvServicePackagesSection />
      <PvServicePriceTableSection />
      <PvServiceOtherInstallersSection />
      <PvServiceProcessSection />
      <PvServiceCareSection />
      <PvServiceRoofSection />
      <RoofFaq namespace="pvService.faq" keys={FAQ_KEYS} />
      <PvServiceRequestSection />
    </div>
  )
}

const ServicePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  if (pvServiceVisible) {
    const { locale } = await params
    return <PvServicePage locale={locale as SiteLocale} />
  }

  const t = await getTranslations('service')

  return (
    <div>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/service-page-hero-bg.webp"
          title={t('hero.title')}
        />
      </div>
      <SolarSeasonSection />
      <ServiceHotlineSection />
      <ServiceHighestLevelSection />
      <SelfCheckSection />
      <ServicePricingSection />
      <MaintenanceServicesSection />
      <MonitoringSection />
      <MaintenanceInquirySection />
    </div>
  )
}

export default ServicePage
