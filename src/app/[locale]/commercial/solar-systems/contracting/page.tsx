import PageHero from '@/components/PageHero'
import ContractingModelSection from '@/components/commercial/contracting/ContractingModelSection'
import PricingSection from '@/components/commercial/contracting/PricingSection'
import SolarFutureSection from '@/components/commercial/contracting/SolarFutureSection'
import OurServicesSection from '@/components/commercial/contracting/OurServicesSection'
import RepoweringServicesSection from '@/components/commercial/contracting/RepoweringServicesSection'
import { getTranslations } from 'next-intl/server'

const ContractingPage = async () => {
  const t = await getTranslations('contracting')
  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/contracting-hero-bg.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <ContractingModelSection />
      <PricingSection />
      <SolarFutureSection />
      <OurServicesSection />
      <RepoweringServicesSection />
    </main>
  )
}

export default ContractingPage
