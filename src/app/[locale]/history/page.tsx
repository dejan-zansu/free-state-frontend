import EnergyTransition from '@/components/history/EnergyTransition'
import FoundingSection from '@/components/history/FoundingSection'
import FutureVision from '@/components/history/FutureVision'
import Timeline from '@/components/history/Timeline'
import VisionSection from '@/components/history/VisionSection'
import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'

const HistoryPage = async () => {
  const t = await getTranslations('history')
  return (
    <main>
      <PageHero
        backgroundImage="/images/history-page-hero.png"
        title={t('hero.title')}
        description={t('hero.description')}
        contentClassName="[&_p]:max-w-[70%]"
      />

      <EnergyTransition />
      <Timeline />
      <FoundingSection />
      <FutureVision />
      <VisionSection />
    </main>
  )
}

export default HistoryPage
