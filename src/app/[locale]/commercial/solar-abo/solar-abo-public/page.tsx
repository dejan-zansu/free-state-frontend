import SolarAboPublicHowItWorks from '@/components/SolarAboPublicHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'

const SolarAboPublicPage = () => {
  const t = useTranslations('solarAboPublic')
  const items = [
    {
      image: '/images/illustrations/solar-modules.png',
      title: t('includes.items.solarModules.title'),
      subtitle: t('includes.items.solarModules.subtitle'),
    },
    {
      image: '/images/illustrations/inverter.png',
      title: t('includes.items.inverter.title'),
      subtitle: t('includes.items.inverter.subtitle'),
    },
    {
      image: '/images/illustrations/monitoring-app.png',
      title: t('includes.items.monitoringApp.title'),
      subtitle: t('includes.items.monitoringApp.subtitle'),
    },
    {
      image: '/images/illustrations/installation.png',
      title: t('includes.items.installation.title'),
      subtitle: t('includes.items.installation.subtitle'),
    },
    {
      image: '/images/illustrations/service-insurance.png',
      title: t('includes.items.serviceInsurance.title'),
      subtitle: t('includes.items.serviceInsurance.subtitle'),
    },
    {
      image: '/images/illustrations/battery-storage.png',
      title: t('includes.items.batteryStorage.title'),
      subtitle: t('includes.items.batteryStorage.subtitle'),
    },
  ]
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboPublic"
        imageSrc="/images/solar-abo-public.png"
        imageAlt="SolarAbo Public"
        isCommercial
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboPublic"
        items={items}
        isCommercial
      />
      <SolarAboPublicHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboPublic"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboPublic" commercial />
      <SolarAboCTA translationNamespace="solarAboPublic" commercial />
    </div>
  )
}

export default SolarAboPublicPage
