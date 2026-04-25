import PageHero from '@/components/PageHero'
import CarportFAQSection from '@/components/solar-system-carport/CarportFAQSection'
import CarportHowItWorks from '@/components/solar-system-carport/CarportHowItWorks'
import CarportOverviewSection from '@/components/solar-system-carport/CarportOverviewSection'
import CustomerTestimonialSection from '@/components/solar-system-carport/CustomerTestimonialSection'
import EvChargingSection from '@/components/solar-system-carport/EvChargingSection'
import PhotovoltaicsCarportsSection from '@/components/solar-system-carport/PhotovoltaicsCarportsSection'
import SingleDoubleCarportSection from '@/components/solar-system-carport/SingleDoubleCarportSection'
import WhySolarCarportSection from '@/components/solar-system-carport/WhySolarCarportSection'
import EnergySolutionsSection from '@/components/heat-pumps/cost/EnergySolutionsSection'
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
    pathname: '/solar-system-carport',
    title: t('solarSystemCarport.title') || '',
    description: t('solarSystemCarport.description') || '',
  })
}

const SolarSystemCarportPage = async () => {
  const t = await getTranslations('solarSystemCarport')

  return (
    <div>
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
      <EnergySolutionsSection />
    </div>
  )
}

export default SolarSystemCarportPage
