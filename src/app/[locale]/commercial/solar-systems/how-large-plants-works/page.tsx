import PageHero from '@/components/PageHero'
import HowItWorksSection from '@/components/commercial/how-large-plants-works/HowItWorksSection'
import SolarPanelWorksSection from '@/components/commercial/how-large-plants-works/SolarPanelWorksSection'
import InRoofOnRoofSection from '@/components/commercial/how-large-plants-works/InRoofOnRoofSection'
import StorageSelfConsumptionSection from '@/components/commercial/how-large-plants-works/StorageSelfConsumptionSection'
import SelfConsumptionControlSection from '@/components/commercial/how-large-plants-works/SelfConsumptionControlSection'
import InstallationSection from '@/components/commercial/how-large-plants-works/InstallationSection'
import MonitoringSection from '@/components/commercial/how-large-plants-works/MonitoringSection'
import QuoteCTASection from '@/components/commercial/how-large-plants-works/QuoteCTASection'
import { getTranslations } from 'next-intl/server'

const HowLargePlantsWorksPage = async () => {
  const t = await getTranslations('howLargePlantsWorks')
  return (
    <main>
      <PageHero
        title={t('hero.title')}
        backgroundImage="/images/how-large-plants-works-hero.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <HowItWorksSection />
      <SolarPanelWorksSection />
      <InRoofOnRoofSection />
      <StorageSelfConsumptionSection />
      <SelfConsumptionControlSection />
      <InstallationSection />
      <MonitoringSection />
      <QuoteCTASection />
    </main>
  )
}

export default HowLargePlantsWorksPage
