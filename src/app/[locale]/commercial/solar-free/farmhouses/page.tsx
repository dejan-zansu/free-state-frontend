import ContactPerson from '@/components/ContactPerson'
import HowPV from '@/components/HowPV'
import SolarAboMultiFamilyPublicSpaces from '@/components/SolarAboMultiFamilyPublicSpaces'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  VideoSection,
} from '@/components/solar-abo'
import { useTranslations } from 'next-intl'

const FarmhousesPage = () => {
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
        imageAlt="Farmhouses"
        isCommercial
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboAgro"
        items={items}
        isCommercial
      />
      <HowPV
        translationNamespace="solarAboAgro"
        row1Image="/images/solar-free/farmhouses-how-pv-1-248feb.webp"
        row2Image="/images/solar-free/farmhouses-how-pv-2-74df8a.webp"
      />
      <SolarAboMultiFamilyPublicSpaces translationNamespace="solarAboAgro" />
      <ContactPerson translationNamespace="solarAboAgro" />

      <SolarAboCTA translationNamespace="solarAboAgro" commercial />
    </div>
  )
}

export default FarmhousesPage
