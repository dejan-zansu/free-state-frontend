import PageHero from '@/components/PageHero'
import HowHeatPumpWorksSection from '@/components/heat-pumps/with-solar-system/HowHeatPumpWorksSection'
import AdvantagesSection from '@/components/heat-pumps/with-solar-system/AdvantagesSection'
import IdealCombinationSection from '@/components/heat-pumps/with-solar-system/IdealCombinationSection'
import SolarBenefitsSection from '@/components/heat-pumps/with-solar-system/SolarBenefitsSection'
import EnergyEfficiencySection from '@/components/heat-pumps/with-solar-system/EnergyEfficiencySection'
import CostsInstallationSection from '@/components/heat-pumps/with-solar-system/CostsInstallationSection'
import { getTranslations } from 'next-intl/server'

const HeatPumpsWithSolarSystemPage = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <main>
      <div className="bg-[#F2F4E8]">
        <PageHero
          backgroundImage="/images/heat-pumps/heat-pump-with-solar-system.png"
          title={t('hero.title')}
        />
      </div>
      <HowHeatPumpWorksSection />
      <AdvantagesSection />
      <IdealCombinationSection />
      <SolarBenefitsSection />
      <EnergyEfficiencySection />
      <CostsInstallationSection />
    </main>
  )
}

export default HeatPumpsWithSolarSystemPage
