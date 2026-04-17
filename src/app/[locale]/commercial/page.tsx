import EvCharging from '@/components/EvCharging'
import Hero from '@/components/Hero'
import PathToEnergy from '@/components/PathToEnergy'
import FusionSolarApp from '@/components/FusionSolarApp'
import Battery from '@/components/Battery'
import HeatPumpsViessmann from '@/components/HeatPumpsViessmann'
import WhyFreeState from '@/components/WhyFreeState'
import YourBenefits from '@/components/YourBenefits'
import Reviews from '@/components/Reviews'
import CustomerStories from '@/components/CustomerStories'
import SolarModels from '@/components/SolarModels'

const CommercialPage = async () => {
  return (
    <div>
      <Hero isCommercial />
      <SolarModels isCommercial />
      <WhyFreeState isCommercial />
      <PathToEnergy isCommercial />
      <FusionSolarApp isCommercial />
      <Battery isCommercial />
      <HeatPumpsViessmann isCommercial />
      <EvCharging isCommercial />
      <CustomerStories isCommercial />
      <Reviews isCommercial />
      <YourBenefits isCommercial />
    </div>
  )
}

export default CommercialPage
