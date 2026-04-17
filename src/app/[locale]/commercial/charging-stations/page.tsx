import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
import { getTranslations } from 'next-intl/server'

const CommercialChargingStationsPage = async () => {
  const t = await getTranslations('chargingStations')
  return (
    <div>
      <PageHero
        backgroundImage="/images/solar-carport-hero.png"
        title={t('hero.title')}
        isCommercial
        className="bg-[#4F4970]"
      />
      <TopicsGrid
        namespace="chargingStations.commercialTopics"
        columns={4}
        maxWidth="1150px"
      />
      <CheckSolarPotentialCTA isCommercial />
    </div>
  )
}

export default CommercialChargingStationsPage
