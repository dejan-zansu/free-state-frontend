import PageHero from '@/components/PageHero'
import HowHeatPumpWorksSection from '@/components/heat-pumps/with-solar-system/HowHeatPumpWorksSection'
import AdvantagesSection from '@/components/heat-pumps/with-solar-system/AdvantagesSection'
import IdealCombinationSection from '@/components/heat-pumps/with-solar-system/IdealCombinationSection'
import SolarBenefitsSection from '@/components/heat-pumps/with-solar-system/SolarBenefitsSection'
import EnergyEfficiencySection from '@/components/heat-pumps/with-solar-system/EnergyEfficiencySection'
import CostsInstallationSection from '@/components/heat-pumps/with-solar-system/CostsInstallationSection'
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
    pathname: '/heat-pumps/heat-pumps-with-solar-system',
    title: t('heatPumpsWithSolarSystem.title') || '',
    description: t('heatPumpsWithSolarSystem.description') || '',
  })
}

const HeatPumpsWithSolarSystemPage = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <div>
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
    </div>
  )
}

export default HeatPumpsWithSolarSystemPage
