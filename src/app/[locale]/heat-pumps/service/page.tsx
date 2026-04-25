import PageHero from '@/components/PageHero'
import ServiceHotlineSection from '@/components/heat-pumps/service/ServiceHotlineSection'
import EmergencySection from '@/components/heat-pumps/service/EmergencySection'
import ManufacturerSupportSection from '@/components/heat-pumps/service/ManufacturerSupportSection'
import HydraulicEmergencySection from '@/components/heat-pumps/service/HydraulicEmergencySection'
import ServicePartnerSection from '@/components/heat-pumps/service/ServicePartnerSection'
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
    pathname: '/heat-pumps/service',
    title: t('heatPumpsService.title') || '',
    description: t('heatPumpsService.description') || '',
  })
}

const HeatPumpsServicePage = async () => {
  const t = await getTranslations('heatPumpsService')

  return (
    <div>
      <div className="relative z-10">
        <PageHero
          backgroundImage="/images/heat-pumps/service-hero-bg.png"
          title={t('hero.title')}
        />
      </div>
      <div className="-mt-[30px]">
        <ServiceHotlineSection />
      </div>
      <EmergencySection />
      <ManufacturerSupportSection />
      <HydraulicEmergencySection />
      <ServicePartnerSection />
    </div>
  )
}

export default HeatPumpsServicePage
