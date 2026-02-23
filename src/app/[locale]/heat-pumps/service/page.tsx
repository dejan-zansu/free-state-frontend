import PageHero from '@/components/PageHero'
import ServiceHotlineSection from '@/components/heat-pumps/service/ServiceHotlineSection'
import EmergencySection from '@/components/heat-pumps/service/EmergencySection'
import ManufacturerSupportSection from '@/components/heat-pumps/service/ManufacturerSupportSection'
import HydraulicEmergencySection from '@/components/heat-pumps/service/HydraulicEmergencySection'
import ServicePartnerSection from '@/components/heat-pumps/service/ServicePartnerSection'
import { getTranslations } from 'next-intl/server'

const HeatPumpsServicePage = async () => {
  const t = await getTranslations('heatPumpsService')

  return (
    <main>
      <PageHero
        backgroundImage="/images/heat-pumps-service/hero-bg.png"
        title={t('hero.title')}
      />
      <ServiceHotlineSection />
      <EmergencySection />
      <ManufacturerSupportSection />
      <HydraulicEmergencySection />
      <ServicePartnerSection />
    </main>
  )
}

export default HeatPumpsServicePage