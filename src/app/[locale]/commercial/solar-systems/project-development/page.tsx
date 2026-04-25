import PageHero from '@/components/PageHero'
import EPCSection from '@/components/commercial/project-development/EPCSection'
import TurnkeySection from '@/components/commercial/project-development/TurnkeySection'
import InvestBannerSection from '@/components/commercial/project-development/InvestBannerSection'
import OurApproachSection from '@/components/commercial/project-development/OurApproachSection'
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
    pathname: '/commercial/solar-systems/project-development',
    title: t('commercialSolarSystemsProjectDev.title') || '',
    description: t('commercialSolarSystemsProjectDev.description') || '',
  })
}

const ProjectDevelopmentPage = async () => {
  const t = await getTranslations('projectDevelopment')
  return (
    <div>
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
    </div>
  )
}

export default ProjectDevelopmentPage
