import CommercialSolarFreePage from '@/components/commercial-solar-free/CommercialSolarFreePage'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/commercial/solar-free/industry-commercial',
    title: t('commercialSolarFreeIndustry.title') || '',
    description: t('commercialSolarFreeIndustry.description') || '',
  })
}

const IndustryCommercialPage = () => <CommercialSolarFreePage segment="industry" />

export default IndustryCommercialPage
