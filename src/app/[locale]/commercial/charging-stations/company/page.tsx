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
      <PageHero title={t('hero.title')} />
      <ChargingSolutionsSection />
      <CompanySolutionSection />
      <FreeStateOffersSection />
      <FAQSection />
    </main>
  )
}

export default CompanyPage
