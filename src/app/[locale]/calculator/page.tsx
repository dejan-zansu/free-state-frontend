import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import CalculatorClient from './CalculatorClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/calculator',
    title: t('calculator.title') || '',
    description: t('calculator.description') || '',
  })
}

export default function SolarAboCalculatorPage() {
  return <CalculatorClient />
}
