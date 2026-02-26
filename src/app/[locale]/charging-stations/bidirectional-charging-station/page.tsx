import PageHero from '@/components/PageHero'
import HowItWorksSection from '@/components/charging-stations/bidirectional-charging-station/sections/HowItWorksSection'
import BenefitsComparisonSection from '@/components/charging-stations/bidirectional-charging-station/sections/BenefitsComparisonSection'
import MarketingFlexibilitySection from '@/components/charging-stations/bidirectional-charging-station/sections/MarketingFlexibilitySection'
import KeyFactsSection from '@/components/charging-stations/bidirectional-charging-station/sections/KeyFactsSection'
import CarBatteryCTASection from '@/components/charging-stations/bidirectional-charging-station/sections/CarBatteryCTASection'
import HomeIndependenceSection from '@/components/charging-stations/bidirectional-charging-station/sections/HomeIndependenceSection'
import ChargingPaysOffSection from '@/components/charging-stations/bidirectional-charging-station/sections/ChargingPaysOffSection'
import FundingSection from '@/components/charging-stations/bidirectional-charging-station/sections/FundingSection'
import PersonalizedOfferSection from '@/components/charging-stations/bidirectional-charging-station/sections/PersonalizedOfferSection'
import VehicleListSection from '@/components/charging-stations/bidirectional-charging-station/sections/VehicleListSection'
import ChargingTypesSection from '@/components/charging-stations/bidirectional-charging-station/sections/ChargingTypesSection'
import StandardsSection from '@/components/charging-stations/bidirectional-charging-station/sections/StandardsSection'
import NewsletterSection from '@/components/charging-stations/bidirectional-charging-station/sections/NewsletterSection'
import FAQSection from '@/components/charging-stations/bidirectional-charging-station/sections/FAQSection'
import { getTranslations } from 'next-intl/server'

const BidirectionalChargingStationPage = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/bidirectional-charging-station.png"
      />
      <HowItWorksSection />
      <BenefitsComparisonSection />
      <MarketingFlexibilitySection />
      <KeyFactsSection />
      <CarBatteryCTASection />
      <HomeIndependenceSection />
      <ChargingPaysOffSection />
      <FundingSection />
      <PersonalizedOfferSection />
      <VehicleListSection />
      <ChargingTypesSection />
      <StandardsSection />
      <NewsletterSection />
      <FAQSection />
    </main>
  )
}

export default BidirectionalChargingStationPage
