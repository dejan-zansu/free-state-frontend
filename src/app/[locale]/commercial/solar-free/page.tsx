import HowPV from '@/components/HowPV'
import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
import { SolarAboCTA } from '@/components/solar-abo'
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
    pathname: '/commercial/solar-free',
    title: t('commercialSolarFree.title') || '',
    description: t('commercialSolarFree.description') || '',
  })
}

const CommercialSolarFreePage = async () => {
  const t = await getTranslations('commercialSolarFreeHub')
  return (
    <div className="w-full overflow-x-hidden">
      <PageHero
        backgroundImage="/images/solar-carport-hero.png"
        title={t('hero.title')}
        description={t('hero.description')}
        isCommercial
        className="bg-[#4F4970]"
      />
      <TopicsGrid
        namespace="commercialSolarFreeHub.topics"
        columns={4}
        maxWidth="1150px"
      />
      <HowPV
        translationNamespace="commercialSolarFreeHub"
        row1Image="/images/solar-free/industry-commercial-how-pv-1-26f787.webp"
      />
      <SolarAboCTA translationNamespace="commercialSolarFreeHub" commercial />
    </div>
  )
}

export default CommercialSolarFreePage
