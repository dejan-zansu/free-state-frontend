import {
  QuoteRequestForm,
  SolarAboCTA,
  SolarAboDetails,
  SolarAboFAQ,
  SolarAboHero,
  SolarAboService,
} from '@/components/solar-abo'
import YourBenefits from '@/components/YourBenefits'
import SolarModels from '@/components/SolarModels'
import CustomerStories from '@/components/CustomerStories'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

import { JsonLd } from '@/components/seo/JsonLd'
import { buildServiceJsonLd } from '@/lib/seo/structured-data'

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

interface SolarDirectPageProps {
  params: Promise<{ locale: string }>
}

const SolarDirectPage = async ({ params }: SolarDirectPageProps) => {
  const { locale } = await params

  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'Solar-Direct',
          description: 'Direkter Kauf einer Solaranlage mit transparentem Festpreis.',
          url: 'https://freestate.ch/solar-direct',
          serviceType: 'Solar Direct Purchase',
        })}
      />
      <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboHome"
        imageSrc="/images/solar-abo-home.png"
        imageAlt="SolarAbo Home"
      />
      <YourBenefits isCommercial={false} />
      <SolarAboDetails translationNamespace="solarAboHome" />
      <SolarAboService translationNamespace="solarAboHome" />
      <QuoteRequestForm source="SOLAR_DIRECT" locale={locale} />
      <SolarModels />
      <CustomerStories />
      <SolarAboFAQ translationNamespace="solarAboHome" />
      <SolarAboCTA translationNamespace="solarAboHome" />
    </div>
    </>
  )
}

export default SolarDirectPage
