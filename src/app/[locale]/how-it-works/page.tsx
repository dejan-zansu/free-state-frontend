import HowItWorksHero from '@/components/HowItWorksHero'
import HowItWorksSection from '@/components/how-it-works/HowItWorksSection'
import HowSolarPanelWorksSection from '@/components/how-it-works/HowSolarPanelWorksSection'
import InstallationSection from '@/components/how-it-works/InstallationSection'
import PhotovoltaicSystemSection from '@/components/how-it-works/PhotovoltaicSystemSection'
import PricingSection from '@/components/how-it-works/PricingSection'
import SelectionCriteriaSection from '@/components/how-it-works/SelectionCriteriaSection'
import SolarAboCTA from '@/components/solar-abo/SolarAboCTA'

const HowItWorksPage = () => {
  return (
    <main>
      <HowItWorksHero />
      <HowItWorksSection />
      <HowSolarPanelWorksSection />
      <PhotovoltaicSystemSection />
      <PricingSection />
      <SolarAboCTA translationNamespace="howItWorks" />
      <SelectionCriteriaSection />
      <InstallationSection />
    </main>
  )
}

export default HowItWorksPage
