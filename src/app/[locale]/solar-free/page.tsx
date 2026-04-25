import {
  QuoteRequestForm,
  SolarAboCTA,
  SolarAboDetails,
  SolarAboFAQ,
  SolarAboHero,
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
    pathname: '/solar-free',
    title: t('solarFree.title') || '',
    description: t('solarFree.description') || '',
  })
}

interface SolarFreePageProps {
  params: Promise<{ locale: string }>
}

const SolarFreePage = async ({ params }: SolarFreePageProps) => {
  const { locale } = await params

  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'Solar-Abo (PPA)',
          description: 'Solar-Abo Modell ohne Eigeninvestition. Monatliche Rate statt Kauf.',
          url: 'https://www.freestate.ch/solar-free',
          serviceType: 'Solar Power Purchase Agreement',
        })}
      />
      <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarFreeHome"
        imageSrc="/images/solar-abo-home.png"
        imageAlt="SolarAbo Home"
        ctaVariant="solar-dark"
        statIconBgClassName="bg-[#036B53]"
        statIconClassName="text-white"
      />
      <YourBenefits isCommercial={false} />
      <SolarAboDetails translationNamespace="solarAboHome" />
      <QuoteRequestForm source="SOLAR_FREE" locale={locale} />
      <SolarModels />
      <CustomerStories />
      <SolarAboFAQ translationNamespace="solarAboHome" />
      <SolarAboCTA translationNamespace="solarAboHome" />
    </div>
    </>
  )
}

export default SolarFreePage
