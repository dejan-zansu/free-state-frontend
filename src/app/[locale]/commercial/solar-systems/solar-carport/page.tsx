import PageHero from '@/components/PageHero'
import ImageShowcaseSection from '@/components/commercial/solar-carport/ImageShowcaseSection'
import ParkingRoofsSection from '@/components/commercial/solar-carport/ParkingRoofsSection'
import GeneralContractorSection from '@/components/commercial/solar-carport/GeneralContractorSection'
import VideoShowcaseSection from '@/components/commercial/solar-carport/VideoShowcaseSection'
import CustomSolarSection from '@/components/commercial/solar-carport/CustomSolarSection'
import { getTranslations } from 'next-intl/server'

const SolarCarportPage = async () => {
  const t = await getTranslations('solarCarport')
  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/solar-carport-hero.png"
      />
      <ImageShowcaseSection />
      <ParkingRoofsSection />
      <GeneralContractorSection />
      <VideoShowcaseSection />
      <CustomSolarSection />
    </main>
  )
}

export default SolarCarportPage
