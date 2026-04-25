import PageHero from '@/components/PageHero'
import BatteryStorageSection from '@/components/cost/BatteryStorageSection'
import SolarCalculatorCTA from '@/components/SolarCalculatorCTA'
import CostFinancingSection from '@/components/cost/CostFinancingSection'
import CostFurtherTopicsSection from '@/components/cost/CostFurtherTopicsSection'
import CostPricingSection from '@/components/cost/CostPricingSection'
import CostSection from '@/components/cost/CostSection'
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
    pathname: '/cost',
    title: t('cost.title') || '',
    description: t('cost.description') || '',
  })
}

const CostPage = async () => {
  const t = await getTranslations('cost')

  return (
    <div>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/cost-page-hero.png"
          title={t('hero.title')}
        />
      </div>

      <CostSection />
      <CostPricingSection />
      <BatteryStorageSection />
      <SolarCalculatorCTA translationNamespace="cost" />
      <CostFinancingSection />
      <CostFurtherTopicsSection />
    </div>
  )
}

export default CostPage
