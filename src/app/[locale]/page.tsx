import Benefits from '@/components/Benefits'
import Deals from '@/components/Deals'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Portfolio from '@/components/Portfolio'
import SolarEnergyFor from '@/components/SolarEnergyFor'
import Stats from '@/components/Stats'
import WhoWeAre from '@/components/WhoWeAre'
import YourPartner from '@/components/YourPartner'

export default function HomePage() {
  return (
    <div className='w-full overflow-x-hidden'>
      <Hero
        title='Smart solar solutions for private homes'
        description='Clean energy, predictable costs, and full service, all without investment.'
      />
      <WhoWeAre />
      <Deals />
      <SolarEnergyFor />
      <Benefits />
      <YourPartner />
      <Portfolio />
      <Stats />
      <Partners />
    </div>
  )
}
