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
    pathname: '/solar-free',
    title: t('solarFree.title') || '',
    description: t('solarFree.description') || '',
  })
}

const SolarFreePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'SolarFree',
          description:
            'SolarFree: Free State AG baut und betreibt die Solaranlage auf Ihrem Dach. Sie zahlen keine Investition und nur den Solarstrom, den Sie verbrauchen.',
          url: 'https://www.freestate.ch/solar-free',
          serviceType: 'Solar Power Purchase Agreement',
        })}
      />
      <SolarModelPage model="solar-free" locale={locale} />
    </>
  )
}

export default SolarFreePage
