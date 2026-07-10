import Hero from '@/components/Hero'
import EvCharging from '@/components/EvCharging'
import OurPartners from '@/components/OurPartners'
import YourBenefits from '@/components/YourBenefits'
import Battery from '@/components/Battery'
import FusionSolarApp from '@/components/FusionSolarApp'
import HeatPumpsViessmann from '@/components/HeatPumpsViessmann'
import SolarModels from '@/components/SolarModels'
import ExperienceTimeline from '@/components/ExperienceTimeline'
import PackageCatalogSection from '@/components/home/PackageCatalogSection'
import PromoSection from '@/components/home/PromoSection'
import WhyFreeState from '@/components/WhyFreeState'
import PathToEnergy from '@/components/PathToEnergy'
import CustomerStories from '@/components/CustomerStories'
import Reviews from '@/components/Reviews'
import StackedPanels from '@/components/motion/StackedPanels'

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-clip">
      <Hero />
      <ExperienceTimeline />
      <PromoSection />
      <SolarModels />
      <PackageCatalogSection />
      <WhyFreeState />
      <PathToEnergy />
      <FusionSolarApp />
      <StackedPanels>
        <Battery />
        <HeatPumpsViessmann />
        <EvCharging />
      </StackedPanels>
      <YourBenefits />
      <CustomerStories isCommercial />
      <Reviews />
      <OurPartners />
    </div>
  )
}
