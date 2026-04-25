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
    pathname: '/heat-pumps',
    title: t('heatPumps.title') || '',
    description: t('heatPumps.description') || '',
  })
}

const HeatPumpsPage = async () => {
  const t = await getTranslations('heatPumps')
  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'Wärmepumpen Installation',
          description: 'Luft/Wasser und Sole/Wasser Wärmepumpen.',
          url: 'https://www.freestate.ch/waermepumpen',
          serviceType: 'Heat Pump Installation',
        })}
      />
      <div>
      <PageHero
        backgroundImage="/images/how-solar-power-system-works.png"
        title={t('hero.title')}
      />
      <TopicsGrid namespace="heatPumps.topics" columns={5} maxWidth="1440px" />
      <CheckSolarPotentialCTA />
    </div>
    </>
  )
}

export default HeatPumpsPage
