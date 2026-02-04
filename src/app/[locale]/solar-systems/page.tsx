import SolarAboHomeHowItWorks from '@/components/SolarAboHomeHowItWorks'
import SolarSystemsFeatures from '@/components/SolarSystemsFeatures'
import SolarSystemsHero from '@/components/SolarSystemsHero'
import SolarSystemsIncludes from '@/components/SolarSystemsIncludes'

const SolarSystemsPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarSystemsHero />
      <SolarSystemsFeatures />
      <SolarSystemsIncludes />
      <SolarAboHomeHowItWorks />
    </div>
  )
}

export default SolarSystemsPage
