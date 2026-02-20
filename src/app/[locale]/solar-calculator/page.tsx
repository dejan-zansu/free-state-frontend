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

const SolarCalculatorPage = async () => {
  const t = await getTranslations('solarCalculator')

  return (
    <main>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/calculator-hero-bg.png"
          title={t('hero.title')}
          description={t('hero.description')}
        >
          <div className="mt-8">
            <LinkButton variant="primary" href="/solar-abo-calculator">
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
    </main>
  )
}

export default SolarCalculatorPage
