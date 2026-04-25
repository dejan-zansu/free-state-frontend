import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import PageHero from '@/components/PageHero'
import SolarSystemsTopics from '@/components/SolarSystemsTopics'
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
    pathname: '/solar-systems',
    title: t('solarSystems.title') || '',
    description: t('solarSystems.description') || '',
  })
}

const SolarSystemsPage = async () => {
  const t = await getTranslations('solarSystems')
  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'Solaranlagen Installation',
          description: 'Photovoltaikanlagen für Einfamilienhäuser in der Deutschschweiz. Planung, Installation und Inbetriebnahme.',
          url: 'https://freestate.ch/solaranlagen',
          serviceType: 'Solar Energy Installation',
        })}
      />
      <div className="w-full overflow-x-hidden">
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <SolarSystemsTopics />
      <CheckSolarPotentialCTA />
    </div>
    </>
  )
}

export default SolarSystemsPage
