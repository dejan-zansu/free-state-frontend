import PageHero from "@/components/PageHero"
import HowHeatPumpWorksSection from "@/components/heat-pumps/with-solar-system/HowHeatPumpWorksSection"
import IdealCombinationSection from "@/components/heat-pumps/with-solar-system/IdealCombinationSection"
import SolarBenefitsSection from "@/components/heat-pumps/with-solar-system/SolarBenefitsSection"
import EnergyEfficiencySection from "@/components/heat-pumps/with-solar-system/EnergyEfficiencySection"
import CostsInstallationSection from "@/components/heat-pumps/with-solar-system/CostsInstallationSection"
import { getTranslations } from "next-intl/server"

const HeatPumpsWithSolarSystemPage = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <main>
      <PageHero
        backgroundImage="/images/heat-pumps-with-solar-system/hero-bg.png"
        title={t('hero.title')}
      />
      <HowHeatPumpWorksSection />
      <IdealCombinationSection />
      <SolarBenefitsSection />
      <EnergyEfficiencySection />
      <CostsInstallationSection />
    </main>
  )
}

export default HeatPumpsWithSolarSystemPage