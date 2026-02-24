import PageHero from '@/components/PageHero'
import IntroSection from '@/components/charging-stations/single-family-home/IntroSection'
import WeOfferSection from '@/components/charging-stations/single-family-home/WeOfferSection'
import BidirectionalChargingSection from '@/components/charging-stations/single-family-home/BidirectionalChargingSection'
import FAQSection from '@/components/charging-stations/single-family-home/FAQSection'
import { getTranslations } from 'next-intl/server'

const SingleFamilyHomePage = async () => {
  const t = await getTranslations('singleFamilyHome')

  return (
    <main>
      <PageHero
        backgroundImage="/images/single-family-home/hero-bg.png"
        title={t('hero.title')}
      />
      <IntroSection />
      <WeOfferSection />
      <BidirectionalChargingSection />
      <FAQSection />
    </main>
  )
}

export default SingleFamilyHomePage
