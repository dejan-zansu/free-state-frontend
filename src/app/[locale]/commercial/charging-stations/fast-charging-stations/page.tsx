import PageHero from '@/components/PageHero'
import FastChargingOffersSection from '@/components/commercial/charging-stations/fast-charging-stations/sections/FastChargingOffersSection'
import FreeStateOffersSection from '@/components/commercial/charging-stations/fast-charging-stations/sections/FreeStateOffersSection'
import FAQSection from '@/components/commercial/charging-stations/fast-charging-stations/sections/FAQSection'
import { getTranslations } from 'next-intl/server'

const FastChargingStationsPage = async () => {
  const t = await getTranslations('fastChargingStations')

  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/apartment-building-hero-bg.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <FastChargingOffersSection />
      <FreeStateOffersSection />
      <FAQSection />
    </main>
  )
}

export default FastChargingStationsPage
