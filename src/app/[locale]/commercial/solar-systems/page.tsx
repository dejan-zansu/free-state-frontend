import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
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
    pathname: '/commercial/solar-systems',
    title: t('commercialSolarSystems.title') || '',
    description: t('commercialSolarSystems.description') || '',
  })
}

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
      <CheckSolarPotentialCTA isCommercial />
    </div>
  )
}

export default CommercialSolarSystemsPage
