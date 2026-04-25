import PageHero from '@/components/PageHero'
import ContractingModelSection from '@/components/commercial/contracting/ContractingModelSection'
import PricingSection from '@/components/commercial/contracting/PricingSection'
import SolarFutureSection from '@/components/commercial/contracting/SolarFutureSection'
import OurServicesSection from '@/components/commercial/contracting/OurServicesSection'
// import RepoweringServicesSection from '@/components/commercial/contracting/RepoweringServicesSection'
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
    pathname: '/commercial/solar-systems/contracting',
    title: t('commercialSolarSystemsContracting.title') || '',
    description: t('commercialSolarSystemsContracting.description') || '',
  })
}

const ContractingPage = async () => {
  const t = await getTranslations('contracting')
  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/contracting-hero-bg.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <ContractingModelSection />
      <PricingSection />
      <SolarFutureSection />
      <OurServicesSection />
      {/* <RepoweringServicesSection /> */}
    </div>
  )
}

export default ContractingPage
