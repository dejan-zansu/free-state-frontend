import BatteryStorageHero from '@/components/battery-storage/BatteryStorageHero'
import BatteryStorageRevenue from '@/components/battery-storage/BatteryStorageRevenue'
import BatteryStorageFeatures from '@/components/battery-storage/BatteryStorageFeatures'
import BatteryStorageGridServices from '@/components/battery-storage/BatteryStorageGridServices'
import BatteryStoragePredictableReturns from '@/components/battery-storage/BatteryStoragePredictableReturns'
import BatteryStorageLandLease from '@/components/battery-storage/BatteryStorageLandLease'
import BatteryStorageCTA from '@/components/battery-storage/BatteryStorageCTA'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
    pathname: '/battery-storage',
    title: t('batteryStorage.title') || '',
    description: t('batteryStorage.description') || '',
  })
}

const BatteryStoragePage = () => {
  return (
    <>
      <JsonLd
        data={buildServiceJsonLd({
          name: 'Batteriespeicher Installation',
          description: 'Stromspeicher für Photovoltaikanlagen.',
          url: 'https://www.freestate.ch/batteriespeicher',
          serviceType: 'Battery Storage Installation',
        })}
      />
      <div>
      <BatteryStorageHero />
      <BatteryStorageRevenue />
      <BatteryStorageFeatures />
      <BatteryStorageGridServices />
      <BatteryStoragePredictableReturns />
      <BatteryStorageLandLease />
      <BatteryStorageCTA />
    </div>
    </>
  )
}

export default BatteryStoragePage
