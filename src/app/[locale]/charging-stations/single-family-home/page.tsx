import PageHero from '@/components/PageHero'
import IntroSection from '@/components/charging-stations/single-family-home/IntroSection'
import WeOfferSection from '@/components/charging-stations/single-family-home/WeOfferSection'
import CalculatorCTASection from '@/components/charging-stations/single-family-home/CalculatorCTASection'
import BidirectionalChargingSection from '@/components/charging-stations/single-family-home/BidirectionalChargingSection'
import FAQSection from '@/components/charging-stations/single-family-home/FAQSection'
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
    pathname: '/charging-stations/single-family-home',
    title: t('chargingStationsSingleFamily.title') || '',
    description: t('chargingStationsSingleFamily.description') || '',
  })
}

const SingleFamilyHomePage = async () => {
  const t = await getTranslations('chargingStationsSingleFamilyHome')

  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/single-family-home.png"
      />
      <IntroSection />
      <WeOfferSection />
      <CalculatorCTASection />
      <BidirectionalChargingSection />
      <FAQSection />
    </div>
  )
}

export default SingleFamilyHomePage
