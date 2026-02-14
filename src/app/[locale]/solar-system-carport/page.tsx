import PageHero from '@/components/PageHero'
import CarportOverviewSection from '@/components/solar-system-carport/CarportOverviewSection'
import PhotovoltaicsCarportsSection from '@/components/solar-system-carport/PhotovoltaicsCarportsSection'
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
    </main>
  )
}

export default SolarSystemCarportPage
