import {
  QuoteRequestForm,
  SolarAboCTA,
  SolarAboDetails,
  SolarAboFAQ,
  SolarAboHero,
  SolarAboService,
  FullWidthVideo,
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
    pathname: '/solar-abo',
    title: t('solarAbo.title') || '',
    description: t('solarAbo.description') || '',
  })
}

interface SolarAboPageProps {
  params: Promise<{ locale: string }>
}

const SolarAboPage = async ({ params }: SolarAboPageProps) => {
  const { locale } = await params

  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'SolarAbo',
          description:
            'Solaranlage im monatlichen Abo mit Rundum-Service und fester Monatsrate.',
          url: 'https://www.freestate.ch/solar-abo',
          serviceType: 'Solar Monthly Subscription',
        })}
      />
      <div className="w-full overflow-x-hidden">
        <SolarAboHero
          translationNamespace="solarAboPlanHome"
          imageSrc="/images/solar-abo-home.png"
          imageAlt="SolarAbo"
        />
        <FullWidthVideo src="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos/FreeState%20-%20Solar%20Direct.mp4" />
        <YourBenefits isCommercial={false} />
        <SolarAboDetails translationNamespace="solarAboPlanHome" />
        <SolarAboService translationNamespace="solarAboPlanHome" />
        <QuoteRequestForm source="SOLAR_DIRECT" locale={locale} />
        <SolarModels />
        <CustomerStories />
        <SolarAboFAQ translationNamespace="solarAboPlanHome" />
        <SolarAboCTA translationNamespace="solarAboPlanHome" />
      </div>
    </>
  )
}

export default SolarAboPage
