import PageHero from '@/components/PageHero'
import ChargingSolutionsSection from '@/components/charging-stations/company/ChargingSolutionsSection'
import CompanySolutionSection from '@/components/charging-stations/company/CompanySolutionSection'
import FreeStateOffersSection from '@/components/charging-stations/company/FreeStateOffersSection'
import FAQSection from '@/components/charging-stations/company/FAQSection'
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
    pathname: '/commercial/charging-stations/company',
    title: t('commercialChargingCompany.title') || '',
    description: t('commercialChargingCompany.description') || '',
  })
}

const CompanyPage = async () => {
  const t = await getTranslations('chargingStationsCompany')

  return (
    <div>
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
    </div>
  )
}

export default CompanyPage
