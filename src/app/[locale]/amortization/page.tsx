import PageHero from '@/components/PageHero'
import AmortizationCTASection from '@/components/amortization/AmortizationCTASection'
import CalculatorExampleSection from '@/components/amortization/CalculatorExampleSection'
import CostOverviewSection from '@/components/amortization/CostOverviewSection'

import PaybackSection from '@/components/amortization/PaybackSection'
import SolarCalculatorCTA from '@/components/SolarCalculatorCTA'
import { getTranslations } from 'next-intl/server'
import CostFurtherTopicsSection from '@/components/cost/CostFurtherTopicsSection'
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
    pathname: '/amortization',
    title: t('amortization.title') || '',
    description: t('amortization.description') || '',
  })
}

const AmortizationPage = async () => {
  const t = await getTranslations('amortization')

  return (
    <div>
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
    </div>
  )
}

export default AmortizationPage
