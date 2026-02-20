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

const ServicePage = async () => {
  const t = await getTranslations('service')

  return (
    <main>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/service-hero-bg.png"
          title={t('hero.title')}
        />
      </div>

      <SolarSeasonSection />
      <ServiceHighestLevelSection />
      <SelfCheckSection />
      <ServicePricingSection />
      <MaintenanceServicesSection />
      <MonitoringSection />
      <MaintenanceInquirySection />
      <ServiceHotlineSection />
    </main>
  )
}

export default ServicePage
