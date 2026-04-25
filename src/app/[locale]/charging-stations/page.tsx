import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import PageHero from '@/components/PageHero'
import TopicsGrid from '@/components/TopicsGrid'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

import { JsonLd } from '@/components/seo/JsonLd'
import { buildServiceJsonLd } from '@/lib/seo/structured-data'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/charging-stations',
    title: t('chargingStations.title') || '',
    description: t('chargingStations.description') || '',
  })
}

const ChargingStationsPage = async () => {
  const t = await getTranslations('chargingStations')
  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'Ladestationen für Elektroautos',
          description: 'Wallbox für zuhause, bidirektionales Laden verfügbar.',
          url: 'https://www.freestate.ch/ladestationen',
          serviceType: 'EV Charging Station Installation',
        })}
      />
      <div>
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <TopicsGrid namespace="chargingStations.topics" columns={3} maxWidth="900px" />
      <CheckSolarPotentialCTA />
    </div>
    </>
  )
}

export default ChargingStationsPage
