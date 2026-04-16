import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
import { getTranslations } from 'next-intl/server'

const ChargingStationsPage = async () => {
  const t = await getTranslations('chargingStations')
  return (
    <div>
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <TopicsGrid namespace="chargingStations.topics" columns={3} maxWidth="900px" />
    </div>
  )
}

export default ChargingStationsPage
