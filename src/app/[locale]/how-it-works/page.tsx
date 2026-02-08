import HowItWorksHero from '@/components/HowItWorksHero'
import HowItWorksSection from '@/components/how-it-works/HowItWorksSection'
import HowSolarPanelWorksSection from '@/components/how-it-works/HowSolarPanelWorksSection'
import PhotovoltaicSystemSection from '@/components/how-it-works/PhotovoltaicSystemSection'
import PricingSection from '@/components/how-it-works/PricingSection'
import SolarAboCTA from '@/components/solar-abo/SolarAboCTA'

const HowItWorksPage = () => {
  return (
    <main>
      <HowItWorksHero />
      <HowItWorksSection />
      <HowSolarPanelWorksSection />
      <PhotovoltaicSystemSection />
      <PricingSection />
      <div className="mb-[-40px]">
        <SolarAboCTA translationNamespace="howItWorks" />
      </div>
    </main>
  )
}

export default HowItWorksPage
