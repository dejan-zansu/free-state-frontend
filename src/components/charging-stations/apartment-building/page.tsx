import PageHero from '@/components/PageHero'
import EvChargingIntroSection from '@/components/charging-stations/apartment-building/sections/EvChargingIntroSection'
import CalculatorCTASection from '@/components/charging-stations/apartment-building/sections/CalculatorCTASection'
import FreeStateOffersSection from '@/components/charging-stations/apartment-building/sections/FreeStateOffersSection'
import FAQSection from '@/components/charging-stations/apartment-building/sections/FAQSection'
import { getTranslations } from 'next-intl/server'

const ApartmentBuildingPage = async () => {
  const t = await getTranslations('chargingStationsApartmentBuilding')

  return (
    <main>
      <PageHero
        backgroundImage="/images/apartment-building/hero-bg.png"
        title={t('hero.title')}
      />
      <EvChargingIntroSection />
      <CalculatorCTASection />
      <FreeStateOffersSection />
      <FAQSection />
    </main>
  )
}

export default ApartmentBuildingPage
