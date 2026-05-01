import IndustryCommercialHowItWorks from '@/components/IndustryCommercialHowItWorks'
import ContactPerson from '@/components/ContactPerson'
import HowPV from '@/components/HowPV'
import SolarAboMultiFamilyPublicSpaces from '@/components/SolarAboMultiFamilyPublicSpaces'
import {
  FullWidthVideo,
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
    pathname: '/commercial/solar-free/industry-commercial',
    title: t('commercialSolarFreeIndustry.title') || '',
    description: t('commercialSolarFreeIndustry.description') || '',
  })
}

const IndustryCommercialPage = () => {
  const t = useTranslations('solarAboBusiness')
  const items = [
    {
      image: '/images/illustrations/solar-modules-commercial.png',
      title: t('includes.items.solarModules.title'),
      subtitle: t('includes.items.solarModules.subtitle'),
    },
    {
      image: '/images/illustrations/inverter-commercial.png',
      title: t('includes.items.inverter.title'),
      subtitle: t('includes.items.inverter.subtitle'),
    },
    {
      image: '/images/illustrations/monitoring-app-commercial.png',
      title: t('includes.items.monitoringApp.title'),
      subtitle: t('includes.items.monitoringApp.subtitle'),
    },
    {
      image: '/images/illustrations/installation-commercial.png',
      title: t('includes.items.installation.title'),
      subtitle: t('includes.items.installation.subtitle'),
    },
    {
      image: '/images/illustrations/service-insurance.png',
      title: t('includes.items.serviceInsurance.title'),
      subtitle: t('includes.items.serviceInsurance.subtitle'),
    },
    {
      image: '/images/illustrations/battery-storage-commercial.png',
      title: t('includes.items.batteryStorage.title'),
      subtitle: t('includes.items.batteryStorage.subtitle'),
    },
  ]
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboBusiness"
        imageSrc="/images/solar-abo-business.png"
        imageAlt="Industry / Commercial"
        isCommercial
      />
      <FullWidthVideo src="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos/FreeState%20-%20Industrial.mp4" />
      <SolarAboIncludes
        translationNamespace="solarAboBusiness"
        items={items}
        isCommercial
      />
      <HowPV
        translationNamespace="solarAboBusiness"
        row1Image="/images/solar-free/industry-commercial-how-pv-1-26f787.webp"
        row2Image="/images/solar-free/industry-commercial-how-pv-2-483935.webp"
      />
      <IndustryCommercialHowItWorks />
      <SolarAboMultiFamilyPublicSpaces translationNamespace="solarAboBusiness" />
      <ContactPerson translationNamespace="solarAboBusiness" />

      <SolarAboCTA translationNamespace="solarAboBusiness" commercial />
    </div>
  )
}

export default IndustryCommercialPage
