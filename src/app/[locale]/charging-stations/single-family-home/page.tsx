import PageHero from '@/components/PageHero'
import IntroSection from '@/components/charging-stations/single-family-home/IntroSection'
import WeOfferSection from '@/components/charging-stations/single-family-home/WeOfferSection'
import CalculatorCTASection from '@/components/charging-stations/single-family-home/CalculatorCTASection'
import BidirectionalChargingSection from '@/components/charging-stations/single-family-home/BidirectionalChargingSection'
import FAQSection from '@/components/charging-stations/single-family-home/FAQSection'
import { getTranslations } from 'next-intl/server'

const SingleFamilyHomePage = async () => {
  const t = await getTranslations('chargingStationsSingleFamilyHome')

  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/single-family-home.png"
      />
      <IntroSection />
      <WeOfferSection />
      <CalculatorCTASection />
      <BidirectionalChargingSection />
      <FAQSection />
    </main>
  )
}

export default SingleFamilyHomePage
