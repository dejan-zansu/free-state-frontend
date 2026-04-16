import CareersContactCTA from '@/components/careers/CareersContactCTA'
import CareersSplitSection from '@/components/careers/CareersSplitSection'
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
      <CareersSplitSection />
      <CareersContactCTA />
    </div>
  )
}

export default CareersPage
