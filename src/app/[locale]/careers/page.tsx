import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'

const CareersPage = async () => {
  const t = await getTranslations('careersPage')

  return (
    <div>
      <PageHero
        backgroundImage="/images/careers-page-hero-bg.png"
        title={t('title')}
        description={t('subtitle')}
      />
    </div>
  )
}

export default CareersPage
