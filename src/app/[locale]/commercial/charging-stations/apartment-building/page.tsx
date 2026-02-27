import PageHero from '@/components/PageHero'
import EvChargingIntroSection from '@/components/commercial/charging-stations/apartment-building/sections/EvChargingIntroSection'
import CalculatorCTASection from '@/components/commercial/charging-stations/apartment-building/sections/CalculatorCTASection'
import FreeStateOffersSection from '@/components/commercial/charging-stations/apartment-building/sections/FreeStateOffersSection'
import FAQSection from '@/components/commercial/charging-stations/apartment-building/sections/FAQSection'
import { getTranslations } from 'next-intl/server'

const ApartmentBuildingPage = async () => {
  const t = await getTranslations('apartmentBuilding')

  return (
    <main>
      <PageHero
        isCommercial
        title={t('hero.title')}
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
