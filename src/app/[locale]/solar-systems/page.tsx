import SolarSystemsFeatures from '@/components/SolarSystemsFeatures'
import SolarSystemsHero from '@/components/SolarSystemsHero'
import SolarSystemsQuality from '@/components/SolarSystemsQuality'

const SolarSystemsPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarSystemsHero />
      <SolarSystemsFeatures />
      <SolarSystemsQuality />
    </div>
  )
}

export default SolarSystemsPage
