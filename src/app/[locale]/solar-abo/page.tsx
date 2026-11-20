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
    pathname: '/solar-abo',
    title: t('solarAbo.title') || '',
    description: t('solarAbo.description') || '',
  })
}

const SolarAboPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'SolarAbo',
          description:
            'SolarAbo: Sie kaufen die Solaranlage und bezahlen sie ohne Anzahlung in festen Monatsraten über 25 Jahre.',
          url: 'https://www.freestate.ch/solar-abo',
          serviceType: 'Solar Instalment Purchase',
        })}
      />
      <SolarModelPage model="solar-abo" locale={locale} />
    </>
  )
}

export default SolarAboPage
