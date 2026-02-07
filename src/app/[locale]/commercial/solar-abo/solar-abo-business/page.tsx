import SolarAboBusinessHowItWorks from '@/components/SolarAboBusinessHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'

const SolarAboBusinessPage = () => {
  const t = useTranslations('solarAboBusiness')
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
        translationNamespace="solarAboBusiness"
        imageSrc="/images/solar-abo-business.png"
        imageAlt="SolarAbo Business"
        isCommercial
      />
      <VideoSection />
      <SolarAboIncludes translationNamespace="solarAboBusiness" items={items} />
      <SolarAboBusinessHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboBusiness"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboBusiness" />
      <SolarAboCTA translationNamespace="solarAboBusiness" />
    </div>
  )
}

export default SolarAboBusinessPage
