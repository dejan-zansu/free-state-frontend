import AboutFreeState from '@/components/about-us/AboutFreeState'
import FounderSection from '@/components/about-us/FounderSection'
import LocationsCTA from '@/components/about-us/LocationsCTA'
import PartnersSection from '@/components/about-us/PartnersSection'
import SolutionsSection from '@/components/about-us/SolutionsSection'
import VisionMission from '@/components/about-us/VisionMission'
import CostSection from '@/components/cost/CostSection'
import PageHero from '@/components/PageHero'
import { LinkButton } from '@/components/ui/link-button'
import { useTranslations } from 'next-intl'

const AboutUsPage = () => {
  const t = useTranslations('aboutUs')
  return (
    <main>
      <div className="bg-[#EAEDDF]">
        <PageHero
          backgroundImage="/images/about-us-hero.png"
          title={t('hero.title')}
          description={t('hero.description')}
          contentClassName="[&_p]:max-w-[70%]"
        >
          <div className="mt-8">
            <LinkButton href="/portfolio" variant="primary">
              {t('hero.cta')}
            </LinkButton>
          </div>
        </PageHero>
      </div>

      <AboutFreeState />
      <VisionMission />
      <FounderSection />
      <SolutionsSection />
      <PartnersSection />
      <LocationsCTA />
      <CostSection />
    </main>
  )
}

export default AboutUsPage
