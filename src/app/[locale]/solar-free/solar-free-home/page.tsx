import SolarAboHomeHowItWorks from '@/components/SolarAboHomeHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'

const SolarAboHomePage = () => {
  const t = useTranslations('solarAboHome')
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
      image: '/images/illustrations/battery-storage.png',
      title: t('includes.items.batteryStorage.title'),
      subtitle: t('includes.items.batteryStorage.subtitle'),
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
  ]
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboHome"
        imageSrc="/images/solar-abo-home.png"
        imageAlt="SolarAbo Home"
      />
      <VideoSection />
      <SolarAboIncludes translationNamespace="solarAboHome" items={items} />
      <SolarAboHomeHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboHome"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboHome" />
      <SolarAboCTA translationNamespace="solarAboHome" />
    </div>
  )
}

export default SolarAboHomePage
