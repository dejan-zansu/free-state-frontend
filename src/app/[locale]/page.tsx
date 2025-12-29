import Benefits from '@/components/Benefits'
import Deals from '@/components/Deals'
import ForBusinesses from '@/components/ForBusinesses'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Portfolio from '@/components/Portfolio'
import Stats from '@/components/Stats'
import YourPartner from '@/components/YourPartner'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Deals />
      <ForBusinesses />
      <Benefits />
      <YourPartner />
      <Portfolio />
      <Stats />
      <Partners />
    </main>
  )
}
