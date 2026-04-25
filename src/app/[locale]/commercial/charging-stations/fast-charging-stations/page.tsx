import PageHero from '@/components/PageHero'
import FastChargingOffersSection from '@/components/commercial/charging-stations/fast-charging-stations/sections/FastChargingOffersSection'
import FreeStateOffersSection from '@/components/commercial/charging-stations/fast-charging-stations/sections/FreeStateOffersSection'
import FAQSection from '@/components/commercial/charging-stations/fast-charging-stations/sections/FAQSection'
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
    pathname: '/commercial/charging-stations/fast-charging-stations',
    title: t('commercialChargingFast.title') || '',
    description: t('commercialChargingFast.description') || '',
  })
}

const FastChargingStationsPage = async () => {
  const t = await getTranslations('fastChargingStations')

  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/fast-cgarging-stations-hero-bg.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <FastChargingOffersSection />
      <FreeStateOffersSection />
      <FAQSection />
    </div>
  )
}

export default FastChargingStationsPage
