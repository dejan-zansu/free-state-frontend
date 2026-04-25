import PageHero from '@/components/PageHero'
import { LinkButton } from '@/components/ui/link-button'
import HowItWorksSection from '@/components/solar-calculator/HowItWorksSection'
import WhatYouReceiveSection from '@/components/solar-calculator/WhatYouReceiveSection'
import WhyFreeStateSection from '@/components/solar-calculator/WhyFreeStateSection'
import SolarAboShowcaseSection from '@/components/solar-calculator/SolarAboShowcaseSection'
import SolarAboCardsSection from '@/components/solar-calculator/SolarAboCardsSection'
import FAQSection from '@/components/solar-calculator/FAQSection'
import BottomCTASection from '@/components/solar-calculator/BottomCTASection'
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
    pathname: '/solar-calculator',
    title: t('solarCalculator.title') || '',
    description: t('solarCalculator.description') || '',
  })
}

const SolarCalculatorPage = async () => {
  const t = await getTranslations('solarCalculator')

  return (
    <div>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/calculator-hero-bg.png"
          title={t('hero.title')}
          description={t('hero.description')}
        >
          <div className="mt-8">
            <LinkButton variant="primary" href="/calculator">
              Start the Solar Calculator
            </LinkButton>
          </div>
        </PageHero>
      </div>

      <HowItWorksSection />
      <WhatYouReceiveSection />
      <WhyFreeStateSection />
      <SolarAboShowcaseSection />
      <SolarAboCardsSection />
      <FAQSection />
      <BottomCTASection />
    </div>
  )
}

export default SolarCalculatorPage
