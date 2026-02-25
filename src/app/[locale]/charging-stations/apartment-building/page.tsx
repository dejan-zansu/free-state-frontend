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
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/apartment-building.png"
      />
      <EvChargingIntroSection />
      <CalculatorCTASection />
      <FreeStateOffersSection />
      <FAQSection />
    </main>
  )
}

export default ApartmentBuildingPage
