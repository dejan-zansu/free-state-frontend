import EnergyTransition from '@/components/history/EnergyTransition'
import FoundingSection from '@/components/history/FoundingSection'
import FutureVision from '@/components/history/FutureVision'
import Timeline from '@/components/history/Timeline'
import VisionSection from '@/components/history/VisionSection'
import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/history',
    title: t('history.title') || '',
    description: t('history.description') || '',
  })
}

const HistoryPage = async () => {
  const t = await getTranslations('history')
  return (
    <div>
      <PageHero
        backgroundImage="/images/history-page-hero.png"
        title={t('hero.title')}
        description={t('hero.description')}
        descriptionClassName="max-w-[680px]"
      />

      <EnergyTransition />
      <Timeline />
      <FoundingSection />
      <FutureVision />
      <VisionSection />
    </div>
  )
}

export default HistoryPage
