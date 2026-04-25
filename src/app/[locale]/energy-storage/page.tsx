import PageHero from '@/components/PageHero'
import BatteryInstallationSection from '@/components/energy-storage/BatteryInstallationSection'
import EnergyStorageBenefitsSection from '@/components/energy-storage/EnergyStorageBenefitsSection'
import EnergyStorageCTASection from '@/components/energy-storage/EnergyStorageCTASection'
import HowItWorksSection from '@/components/energy-storage/HowItWorksSection'
import StorageComparisonSection from '@/components/energy-storage/StorageComparisonSection'
import StorageSolutionsSection from '@/components/energy-storage/StorageSolutionsSection'
import WhatIsEnergyStorageSection from '@/components/energy-storage/WhatIsEnergyStorageSection'
import WhenStorageMakesSenseSection from '@/components/energy-storage/WhenStorageMakesSenseSection'
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
    pathname: '/energy-storage',
    title: t('energyStorage.title') || '',
    description: t('energyStorage.description') || '',
  })
}

const EnergyStoragePage = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <div>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/energy-storage-hero-bg.png"
          title={t('hero.title')}
        />
      </div>

      <WhatIsEnergyStorageSection />
      <EnergyStorageBenefitsSection />
      <StorageComparisonSection />
      <EnergyStorageCTASection />
      <WhenStorageMakesSenseSection />
      <HowItWorksSection />
      <BatteryInstallationSection />
      <StorageSolutionsSection />
    </div>
  )
}

export default EnergyStoragePage
