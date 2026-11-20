import SolarModelPage from '@/components/solar-model-page/SolarModelPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { buildServiceJsonLd } from '@/lib/seo/structured-data'
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
    pathname: '/solar-direct',
    title: t('solarDirect.title') || '',
    description: t('solarDirect.description') || '',
  })
}

const SolarDirectPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'SolarDirect',
          description:
            'SolarDirect: Direkter Kauf einer schlüsselfertigen Solaranlage zum Festpreis.',
          url: 'https://www.freestate.ch/solar-direct',
          serviceType: 'Solar Direct Purchase',
        })}
      />
      <SolarModelPage model="solar-direct" locale={locale} />
    </>
  )
}

export default SolarDirectPage
