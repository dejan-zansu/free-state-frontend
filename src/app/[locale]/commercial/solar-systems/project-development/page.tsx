import PageHero from '@/components/PageHero'
import EPCSection from '@/components/commercial/project-development/EPCSection'
import TurnkeySection from '@/components/commercial/project-development/TurnkeySection'
import InvestBannerSection from '@/components/commercial/project-development/InvestBannerSection'
import OurApproachSection from '@/components/commercial/project-development/OurApproachSection'
import { getTranslations } from 'next-intl/server'

const ProjectDevelopmentPage = async () => {
  const t = await getTranslations('projectDevelopment')
  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/project-development-hero.png"
        isCommercial
        className="bg-[#4F4970]"
      />
      <EPCSection />
      <TurnkeySection />
      <InvestBannerSection />
      <OurApproachSection />
    </main>
  )
}

export default ProjectDevelopmentPage
