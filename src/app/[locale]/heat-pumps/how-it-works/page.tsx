import PageHero from '@/components/PageHero'
import ConstructionSection from '@/components/heat-pumps/how-it-works/ConstructionSection'
import HowItWorksSection from '@/components/heat-pumps/how-it-works/HowItWorksSection'
import HeatPumpTypesSection from '@/components/heat-pumps/how-it-works/HeatPumpTypesSection'
import HeatPumpTypesDetailSection from '@/components/heat-pumps/how-it-works/HeatPumpTypesDetailSection'
import InstallationSection from '@/components/heat-pumps/how-it-works/InstallationSection'
import IndoorInstallationSection from '@/components/heat-pumps/how-it-works/IndoorInstallationSection'
import OutdoorInstallationSection from '@/components/heat-pumps/how-it-works/OutdoorInstallationSection'
import SplitHeatPumpSection from '@/components/heat-pumps/how-it-works/SplitHeatPumpSection'
import WhichHeatPumpSection from '@/components/heat-pumps/how-it-works/WhichHeatPumpSection'
import ProductsSection from '@/components/heat-pumps/how-it-works/ProductsSection'
import ComparisonSection from '@/components/heat-pumps/how-it-works/ComparisonSection'
import AdvantagesSection from '@/components/heat-pumps/how-it-works/AdvantagesSection'
import WhyFreeStateSection from '@/components/heat-pumps/how-it-works/WhyFreeStateSection'
import FurtherTopicsSection from '@/components/heat-pumps/how-it-works/FurtherTopicsSection'
import SolarAboCTA from '@/components/solar-abo/SolarAboCTA'
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
    pathname: '/heat-pumps/how-it-works',
    title: t('heatPumpsHowItWorks.title') || '',
    description: t('heatPumpsHowItWorks.description') || '',
  })
}

const HeatPumpsHowItWorksPage = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <div>
      <PageHero
        backgroundImage="/images/heat-pumps-how-it-works/hero-bg.png"
        title={t('hero.title')}
        description={t('hero.subtitle')}
      />
      <ConstructionSection />
      <HowItWorksSection />
      <HeatPumpTypesSection />
      <HeatPumpTypesDetailSection />
      <SolarAboCTA translationNamespace="heatPumpsHowItWorks" />
      <InstallationSection />
      <IndoorInstallationSection />
      <OutdoorInstallationSection />
      <SplitHeatPumpSection />
      <WhichHeatPumpSection />
      <ProductsSection />
      <ComparisonSection />
      <AdvantagesSection />
      <WhyFreeStateSection />
      <FurtherTopicsSection />
    </div>
  )
}

export default HeatPumpsHowItWorksPage
