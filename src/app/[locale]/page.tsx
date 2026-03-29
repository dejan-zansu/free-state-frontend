import Hero from '@/components/Hero'
import EvCharging from '@/components/EvCharging'
import OurPartners from '@/components/OurPartners'
import YourBenefits from '@/components/YourBenefits'
import Battery from '@/components/Battery'
import FusionSolarApp from '@/components/FusionSolarApp'
import HeatPumpsViessmann from '@/components/HeatPumpsViessmann'
import SolarModels from '@/components/SolarModels'

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <Hero />
      <SolarModels />
      <FusionSolarApp />
      <Battery />
      <HeatPumpsViessmann />
      <EvCharging />
      <YourBenefits />
      <OurPartners />
    </div>
  )
}
