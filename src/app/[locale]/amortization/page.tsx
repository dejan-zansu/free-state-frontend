import PageHero from '@/components/PageHero'
import AmortizationCTASection from '@/components/amortization/AmortizationCTASection'
import CalculatorExampleSection from '@/components/amortization/CalculatorExampleSection'
import CostOverviewSection from '@/components/amortization/CostOverviewSection'

import PaybackSection from '@/components/amortization/PaybackSection'
import SolarCalculatorCTA from '@/components/SolarCalculatorCTA'
import { getTranslations } from 'next-intl/server'
import CostFurtherTopicsSection from '@/components/cost/CostFurtherTopicsSection'

const AmortizationPage = async () => {
  const t = await getTranslations('amortization')

  return (
    <main>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/amortization-hero-bg.png"
          title={t('hero.title')}
          description={t('hero.description')}
        />
      </div>

      <AmortizationCTASection />

      <PaybackSection />
      <SolarCalculatorCTA
        translationNamespace="amortization"
        translationKey="solarCta"
        dark
      />
      <CalculatorExampleSection />
      <CostOverviewSection />
      <CostFurtherTopicsSection />
    </main>
  )
}

export default AmortizationPage
