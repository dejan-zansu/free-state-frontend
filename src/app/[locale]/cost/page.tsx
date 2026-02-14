import PageHero from '@/components/PageHero'
import BatteryStorageSection from '@/components/cost/BatteryStorageSection'
import SolarCalculatorCTA from '@/components/SolarCalculatorCTA'
import CostFinancingSection from '@/components/cost/CostFinancingSection'
import CostFurtherTopicsSection from '@/components/cost/CostFurtherTopicsSection'
import CostPricingSection from '@/components/cost/CostPricingSection'
import CostSection from '@/components/cost/CostSection'
import { getTranslations } from 'next-intl/server'

const CostPage = async () => {
  const t = await getTranslations('cost')

  return (
    <main>
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
    </main>
  )
}

export default CostPage
