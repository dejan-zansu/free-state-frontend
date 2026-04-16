import PageHero from '@/components/PageHero'
import SolarSystemsTopics from '@/components/SolarSystemsTopics'
import { getTranslations } from 'next-intl/server'

const SolarSystemsPage = async () => {
  const t = await getTranslations('solarSystems')
  return (
    <div className="w-full overflow-x-hidden">
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <SolarSystemsTopics />
    </div>
  )
}

export default SolarSystemsPage
