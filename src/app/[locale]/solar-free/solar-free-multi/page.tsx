import SolarAboMultiHowItWorks from '@/components/SolarAboMultiHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'

const SolarAboMultiPage = () => {
  const t = useTranslations('solarAboMulti')
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
      image: '/images/illustrations/billing-platform.png',
      title: t('includes.items.zevBillingPlatform.title'),
      subtitle: t('includes.items.zevBillingPlatform.subtitle'),
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
      image: '/images/illustrations/battery-storage.png',
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
      />
      <VideoSection />
      <SolarAboIncludes translationNamespace="solarAboMulti" items={items} />
      <SolarAboMultiHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboMulti"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboMulti" />
      <SolarAboCTA translationNamespace="solarAboMulti" />
    </div>
  )
}

export default SolarAboMultiPage
