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

const EnergyStoragePage = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <main>
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
    </main>
  )
}

export default EnergyStoragePage
