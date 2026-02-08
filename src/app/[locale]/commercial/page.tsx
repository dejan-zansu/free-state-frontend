import Benefits from '@/components/Benefits'
import Deals from '@/components/Deals'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Portfolio from '@/components/Portfolio'
import SolarEnergyFor from '@/components/SolarEnergyFor'
import Stats from '@/components/Stats'
import Testimonials from '@/components/Testimonials'
import YourPartner from '@/components/YourPartner'
import { getLocale, getTranslations } from 'next-intl/server'

const CommercialPage = async () => {
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
    <main>
      <Hero
        title="Scalable solar solutions for commercial properties"
        description="From planning to operation, we deliver long-term performance, price stability, and sustainable impact."
        showCTAs={false}
        isCommercial
      />
      <Deals isCommercial />
      <SolarEnergyFor isCommercial />
      <Benefits isCommercial />
      <Portfolio
        isCommercial
        translations={portfolioTranslations}
      />
      <YourPartner isCommercial />
      <Testimonials />
      <Stats />
      <Partners />
    </main>
  )
}

export default CommercialPage
