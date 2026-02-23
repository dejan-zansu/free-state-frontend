import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'

const ApartmentBuildingPage = async () => {
  const t = await getTranslations('apartmentBuilding')
  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
      />
    </div>
  )
}

export default ApartmentBuildingPage
