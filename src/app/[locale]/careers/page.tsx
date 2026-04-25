import CareersContactCTA from '@/components/careers/CareersContactCTA'
import CareersSplitSection from '@/components/careers/CareersSplitSection'
import CareersStayInformed from '@/components/careers/CareersStayInformed'
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
    pathname: '/careers',
    title: t('careers.title') || '',
    description: t('careers.description') || '',
  })
}

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
      <CareersStayInformed />
      <CareersContactCTA />
    </div>
  )
}

export default CareersPage
