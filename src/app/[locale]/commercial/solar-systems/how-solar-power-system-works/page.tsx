import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'

const HowSolarPowerSystemWorksPage = async () => {
  const t = await getTranslations('howSolarPowerSystemWorks')
  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/how-solar-power-system-works-hero.png"
      />
    </main>
  )
}

export default HowSolarPowerSystemWorksPage
