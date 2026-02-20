import PageHero from '@/components/PageHero'
import CarportFAQSection from '@/components/solar-system-carport/CarportFAQSection'
import CarportHowItWorks from '@/components/solar-system-carport/CarportHowItWorks'
import CarportOverviewSection from '@/components/solar-system-carport/CarportOverviewSection'
import CustomerTestimonialSection from '@/components/solar-system-carport/CustomerTestimonialSection'
import EvChargingSection from '@/components/solar-system-carport/EvChargingSection'
import PhotovoltaicsCarportsSection from '@/components/solar-system-carport/PhotovoltaicsCarportsSection'
import SingleDoubleCarportSection from '@/components/solar-system-carport/SingleDoubleCarportSection'
import WhySolarCarportSection from '@/components/solar-system-carport/WhySolarCarportSection'
import { getTranslations } from 'next-intl/server'

const SolarSystemCarportPage = async () => {
  const t = await getTranslations('solarSystemCarport')

  return (
    <main>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/carport-hero-bg.png"
          title={t('hero.title')}
          description={t('hero.description')}
        />
      </div>
      <CarportOverviewSection />
      <PhotovoltaicsCarportsSection />
      <SingleDoubleCarportSection />
      <WhySolarCarportSection />
      <EvChargingSection />
      <CarportHowItWorks />
      <CarportFAQSection />
      <CustomerTestimonialSection />
    </main>
  )
}

export default SolarSystemCarportPage
