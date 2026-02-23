import PageHero from '@/components/PageHero'
import CostIntroSection from '@/components/heat-pumps/cost/CostIntroSection'
import CostComparisonSection from '@/components/heat-pumps/cost/CostComparisonSection'
import FundingSection from '@/components/heat-pumps/cost/FundingSection'
import SupportSection from '@/components/heat-pumps/cost/SupportSection'
import TaxDeductionSection from '@/components/heat-pumps/cost/TaxDeductionSection'
import QuoteCTASection from '@/components/heat-pumps/cost/QuoteCTASection'
import EnergySolutionsSection from '@/components/heat-pumps/cost/EnergySolutionsSection'
import { getTranslations } from 'next-intl/server'

const HeatPumpsCostPage = async () => {
  const t = await getTranslations('heatPumpsCost')

  return (
    <main>
      <PageHero
        backgroundImage="/images/heat-pumps-cost/hero-bg.png"
        title={t('hero.title')}
      />
      <CostIntroSection />
      <CostComparisonSection />
      <FundingSection />
      <SupportSection />
      <TaxDeductionSection />
      <QuoteCTASection />
      <EnergySolutionsSection />
    </main>
  )
}

export default HeatPumpsCostPage
