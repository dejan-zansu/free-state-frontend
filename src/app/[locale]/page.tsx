import Benefits from '@/components/Benefits'
import Deals from '@/components/Deals'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Portfolio from '@/components/Portfolio'
import SolarEnergyFor from '@/components/SolarEnergyFor'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import WhoWeAre from '@/components/WhoWeAre'
import YourPartner from '@/components/YourPartner'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home.portfolio')
  const locale = await getLocale()

  const portfolioTranslations = {
    title: t('title'),
    learnMore: t('learnMore'),
    items: [
      {
        number: '01',
        title: t('item1.title'),
        description: t('item1.details'),
      },
      {
        number: '02',
        title: t('item2.title'),
        description: t('item2.details'),
      },
      {
        number: '03',
        title: t('item3.title'),
        description: t('item3.details'),
      },
    ],
  }

  return (
    <div className="w-full overflow-x-hidden">
      <Hero
        title="Smart solar solutions for private homes"
        description="Clean energy, predictable costs, and full service, all without investment."
      />
      <WhoWeAre />
      <Deals />
      <SolarEnergyFor />
      <Benefits />
      <Portfolio translations={portfolioTranslations} />
      <YourPartner />
      <Testimonials />
      <Stats />
      <Partners />
    </div>
  )
}
