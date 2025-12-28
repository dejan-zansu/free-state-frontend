import Adventages from '@/components/Adventages'
import ForBusinesses from '@/components/ForBusinesses'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Portfolio from '@/components/Portfolio'
import Stats from '@/components/Stats'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ForBusinesses />
      <Adventages />
      <Portfolio />
      <Stats />
      <Partners />
    </main>
  )
}
