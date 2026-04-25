import PageHero from '@/components/PageHero'
import EvChargingIntroSection from '@/components/charging-stations/apartment-building/sections/EvChargingIntroSection'
import CalculatorCTASection from '@/components/charging-stations/apartment-building/sections/CalculatorCTASection'
import FreeStateOffersSection from '@/components/charging-stations/apartment-building/sections/FreeStateOffersSection'
import FAQSection from '@/components/charging-stations/apartment-building/sections/FAQSection'
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
    pathname: '/charging-stations/apartment-building',
    title: t('chargingStationsApartment.title') || '',
    description: t('chargingStationsApartment.description') || '',
  })
}

const ApartmentBuildingPage = async () => {
  const t = await getTranslations('chargingStationsApartmentBuilding')

  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
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
