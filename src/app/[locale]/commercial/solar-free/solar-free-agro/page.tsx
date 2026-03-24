import SolarAboAgroHowItWorks from '@/components/SolarAboAgroHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'

const SolarAboAgroPage = () => {
  const t = useTranslations('solarAboAgro')
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
      image: '/images/illustrations/h-p-inverter.png',
      title: t('includes.items.heatPump.title'),
      subtitle: t('includes.items.heatPump.subtitle'),
    },
  ]
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboAgro"
        imageSrc="/images/solar-abo-agro.png"
        imageAlt="SolarAbo Agro"
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboAgro"
        items={items}
        isCommercial
      />
      <SolarAboAgroHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboAgro"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboAgro" commercial />
      <SolarAboCTA translationNamespace="solarAboAgro" commercial />
    </div>
  )
}

export default SolarAboAgroPage
