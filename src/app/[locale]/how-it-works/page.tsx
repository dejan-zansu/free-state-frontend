import PageHero from '@/components/PageHero'
import HowItWorksSection from '@/components/how-it-works/HowItWorksSection'
import HowSolarPanelWorksSection from '@/components/how-it-works/HowSolarPanelWorksSection'
import InstallationSection from '@/components/how-it-works/InstallationSection'
import PhotovoltaicSystemSection from '@/components/how-it-works/PhotovoltaicSystemSection'
import PricingSection from '@/components/how-it-works/PricingSection'
import SelectionCriteriaSection from '@/components/how-it-works/SelectionCriteriaSection'
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
    pathname: '/how-it-works',
    title: t('howItWorks.title') || '',
    description: t('howItWorks.description') || '',
  })
}

const HowItWorksPage = async () => {
  const t = await getTranslations('howItWorks')

  return (
    <div>
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <HowItWorksSection />
      <HowSolarPanelWorksSection />
      <PhotovoltaicSystemSection />
      <PricingSection />
      <SolarAboCTA translationNamespace="howItWorks" />
      <SelectionCriteriaSection />
      <InstallationSection />
    </div>
  )
}

export default HowItWorksPage
