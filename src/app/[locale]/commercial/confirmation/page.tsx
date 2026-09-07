import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import ConfirmationClient from './ConfirmationClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/commercial/confirmation',
    title: t('commercialCalculator.title') || '',
    description: t('commercialCalculator.description') || '',
    noIndex: true,
  })
}

export default function CommercialConfirmationPage() {
  return <ConfirmationClient />
}
