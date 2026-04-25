import PageHero from '@/components/PageHero'
import MaintenanceInquirySection from '@/components/service/MaintenanceInquirySection'
import MaintenanceServicesSection from '@/components/service/MaintenanceServicesSection'
import MonitoringSection from '@/components/service/MonitoringSection'
import SelfCheckSection from '@/components/service/SelfCheckSection'
import ServiceHighestLevelSection from '@/components/service/ServiceHighestLevelSection'
import ServiceHotlineSection from '@/components/service/ServiceHotlineSection'
import ServicePricingSection from '@/components/service/ServicePricingSection'
import SolarSeasonSection from '@/components/service/SolarSeasonSection'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/service',
    title: t('service.title') || '',
    description: t('service.description') || '',
  })
}

const ServicePage = async () => {
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
