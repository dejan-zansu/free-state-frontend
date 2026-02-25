import PageHero from '@/components/PageHero'
import ChargingSolutionsSection from '@/components/charging-stations/company/ChargingSolutionsSection'
import CompanySolutionSection from '@/components/charging-stations/company/CompanySolutionSection'
import FreeStateOffersSection from '@/components/charging-stations/company/FreeStateOffersSection'
import FAQSection from '@/components/charging-stations/company/FAQSection'
import { getTranslations } from 'next-intl/server'

const CompanyPage = async () => {
  const t = await getTranslations('chargingStationsCompany')

  return (
    <main>
      <PageHero
        isCommercial
        title={t('hero.title')}
        backgroundImage="/images/charging-stations-company-hero.png"
        className="bg-[#4F4970]"
      />
      <ChargingSolutionsSection />
      <CompanySolutionSection />
      <FreeStateOffersSection />
      <FAQSection />
    </main>
  )
}

export default CompanyPage
