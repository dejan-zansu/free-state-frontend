import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
import { getTranslations } from 'next-intl/server'

const CommercialSolarSystemsPage = async () => {
  const t = await getTranslations('solarSystems')
  return (
    <div className="w-full overflow-x-hidden">
      <PageHero
        backgroundImage="/images/solar-carport-hero.png"
        title={t('hero.title')}
        isCommercial
        className="bg-[#4F4970]"
      />
      <TopicsGrid namespace="solarSystems.commercialTopics" columns={5} maxWidth="1440px" />
    </div>
  )
}

export default CommercialSolarSystemsPage
