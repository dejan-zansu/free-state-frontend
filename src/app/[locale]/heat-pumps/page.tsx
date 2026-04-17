import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
import { getTranslations } from 'next-intl/server'

const HeatPumpsPage = async () => {
  const t = await getTranslations('heatPumps')
  return (
    <div>
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <TopicsGrid namespace="heatPumps.topics" columns={5} maxWidth="1440px" />
      <CheckSolarPotentialCTA />
    </div>
  )
}

export default HeatPumpsPage
