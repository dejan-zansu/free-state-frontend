import PageHero from '@/components/PageHero'
import EvChargingIntroSection from '@/components/commercial/charging-stations/apartment-building/sections/EvChargingIntroSection'
import CalculatorCTASection from '@/components/commercial/charging-stations/apartment-building/sections/CalculatorCTASection'
import FreeStateOffersSection from '@/components/commercial/charging-stations/apartment-building/sections/FreeStateOffersSection'
import FAQSection from '@/components/commercial/charging-stations/apartment-building/sections/FAQSection'
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
    pathname: '/commercial/charging-stations/apartment-building',
    title: t('commercialChargingApartment.title') || '',
    description: t('commercialChargingApartment.description') || '',
  })
}

const ApartmentBuildingPage = async () => {
  const t = await getTranslations('apartmentBuilding')

  return (
    <div>
      <PageHero
        isCommercial
        title={t('hero.title')}
        backgroundImage="/images/apartment-building.png"
      />
      <EvChargingIntroSection />
      <CalculatorCTASection />
      <FreeStateOffersSection />
      <FAQSection />
    </div>
  )
}

export default ApartmentBuildingPage
