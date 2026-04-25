import ContactPerson from '@/components/ContactPerson'
import HowPV from '@/components/HowPV'
import SolarAboMultiFamilyHowItWorks from '@/components/SolarAboMultiFamilyHowItWorks'
import SolarAboMultiFamilyPublicSpaces from '@/components/SolarAboMultiFamilyPublicSpaces'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
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
    pathname: '/commercial/solar-free/solar-free-multi-family',
    title: t('commercialSolarFreeMultiFamily.title') || '',
    description: t('commercialSolarFreeMultiFamily.description') || '',
  })
}

const SolarAboMultiFamilyPage = () => {
  const t = useTranslations('solarAboMulti')
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
      image: '/images/illustrations/billing-platform.png',
      title: t('includes.items.zevBillingPlatform.title'),
      subtitle: t('includes.items.zevBillingPlatform.subtitle'),
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
      image: '/images/illustrations/battery-storage-commercial.png',
      title: t('includes.items.batteryStorage.title'),
      subtitle: t('includes.items.batteryStorage.subtitle'),
    },
  ]
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboMulti"
        imageSrc="/images/solar-abo-multi.png"
        imageAlt="SolarAbo Multi"
        isCommercial
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboMulti"
        items={items}
        isCommercial
      />
      <HowPV
        translationNamespace="solarAboMulti"
        row1Image="/images/solar-free/multi-family-how-pv-1-5c41b2.webp"
        row2Image="/images/solar-free/multi-family-how-pv-2-71b467.webp"
      />
      <SolarAboMultiFamilyHowItWorks />
      <SolarAboMultiFamilyPublicSpaces />
      <ContactPerson />

      <SolarAboCTA translationNamespace="solarAboMulti" commercial />
    </div>
  )
}

export default SolarAboMultiFamilyPage
