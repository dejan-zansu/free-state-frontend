import PageHero from '@/components/PageHero'
import HowItWorksSection from '@/components/commercial/how-large-plants-works/HowItWorksSection'
import SolarPanelWorksSection from '@/components/commercial/how-large-plants-works/SolarPanelWorksSection'
import InRoofOnRoofSection from '@/components/commercial/how-large-plants-works/InRoofOnRoofSection'
import StorageSelfConsumptionSection from '@/components/commercial/how-large-plants-works/StorageSelfConsumptionSection'
import SelfConsumptionControlSection from '@/components/commercial/how-large-plants-works/SelfConsumptionControlSection'
import InstallationSection from '@/components/commercial/how-large-plants-works/InstallationSection'
import MonitoringSection from '@/components/commercial/how-large-plants-works/MonitoringSection'
import QuoteCTASection from '@/components/commercial/how-large-plants-works/QuoteCTASection'
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
    pathname: '/commercial/solar-systems/how-large-plants-works',
    title: t('commercialSolarSystemsHow.title') || '',
    description: t('commercialSolarSystemsHow.description') || '',
  })
}

const HowLargePlantsWorksPage = async () => {
  const t = await getTranslations('howLargePlantsWorks')
  return (
    <div>
      <PageHero
        title={t('hero.title')}
        backgroundImage="/images/how-large-plants-works-hero.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <HowItWorksSection />
      <SolarPanelWorksSection />
      <InRoofOnRoofSection />
      <StorageSelfConsumptionSection />
      <SelfConsumptionControlSection />
      <InstallationSection />
      <MonitoringSection />
      <QuoteCTASection />
    </div>
  )
}

export default HowLargePlantsWorksPage
