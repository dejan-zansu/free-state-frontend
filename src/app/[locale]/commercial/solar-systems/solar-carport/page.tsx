import PageHero from '@/components/PageHero'
import ImageShowcaseSection from '@/components/commercial/solar-carport/ImageShowcaseSection'
import ParkingRoofsSection from '@/components/commercial/solar-carport/ParkingRoofsSection'
import GeneralContractorSection from '@/components/commercial/solar-carport/GeneralContractorSection'
import VideoShowcaseSection from '@/components/commercial/solar-carport/VideoShowcaseSection'
import CustomSolarSection from '@/components/commercial/solar-carport/CustomSolarSection'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/commercial/solar-systems/solar-carport',
    title: t('commercialSolarSystemsCarport.title') || '',
    description: t('commercialSolarSystemsCarport.description') || '',
  })
}

const SolarCarportPage = async () => {
  const t = await getTranslations('solarCarport')
  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/solar-carport-hero.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <ImageShowcaseSection />
      <ParkingRoofsSection />
      <GeneralContractorSection />
      <VideoShowcaseSection />
      <CustomSolarSection />
    </div>
  )
}

export default SolarCarportPage
