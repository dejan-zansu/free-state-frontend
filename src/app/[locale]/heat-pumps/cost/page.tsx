import PageHero from '@/components/PageHero'
import CostIntroSection from '@/components/heat-pumps/cost/CostIntroSection'
import CostComparisonSection from '@/components/heat-pumps/cost/CostComparisonSection'
import FundingSection from '@/components/heat-pumps/cost/FundingSection'
import SupportSection from '@/components/heat-pumps/cost/SupportSection'
import TaxDeductionSection from '@/components/heat-pumps/cost/TaxDeductionSection'
import QuoteCTASection from '@/components/heat-pumps/cost/QuoteCTASection'
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
    pathname: '/heat-pumps/cost',
    title: t('heatPumpsCost.title') || '',
    description: t('heatPumpsCost.description') || '',
  })
}

const HeatPumpsCostPage = async () => {
  const t = await getTranslations('heatPumpsCost')

  return (
    <div>
      <PageHero
        backgroundImage="/images/heat-pumps/heat-pumps-cost-hero-bg.png"
        title={t('hero.title')}
        className="bg-[#EAEDDF]"
      />

      <CostIntroSection />
      <CostComparisonSection />
      <FundingSection />
      <SupportSection />
      <TaxDeductionSection />
      <QuoteCTASection />
      <EnergySolutionsSection />
    </div>
  )
}

export default HeatPumpsCostPage
