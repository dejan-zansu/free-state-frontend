import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import Hero from '@/components/Hero'
import EvCharging from '@/components/EvCharging'
import OurPartners from '@/components/OurPartners'
import YourBenefits from '@/components/YourBenefits'
import Battery from '@/components/Battery'
import FusionSolarApp from '@/components/FusionSolarApp'
import HeatPumpsViessmann from '@/components/HeatPumpsViessmann'
import SolarModels from '@/components/SolarModels'
import ExperienceTimeline from '@/components/ExperienceTimeline'
import CalculatorSection from '@/components/home/CalculatorSection'
import PackageCatalogSection from '@/components/home/PackageCatalogSection'
import PromoSection from '@/components/home/PromoSection'
import WhyFreeState from '@/components/WhyFreeState'
import PathToEnergy from '@/components/PathToEnergy'
import CustomerStories from '@/components/CustomerStories'
import Reviews from '@/components/Reviews'
import StackedPanels from '@/components/motion/StackedPanels'
import LatestPostsSection from '@/components/blog/LatestPostsSection'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/',
    title: t('home.title') || '',
    description: t('home.description') || '',
  })
}

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-clip">
      <Hero />
      <ExperienceTimeline />
      <PromoSection />
      <SolarModels />
      <PackageCatalogSection />
      <WhyFreeState />
      <PathToEnergy />
      <FusionSolarApp />
      <StackedPanels>
        <Battery />
        <HeatPumpsViessmann />
        <EvCharging />
      </StackedPanels>
      <YourBenefits />
      <CustomerStories isCommercial />
      <CalculatorSection />
      <Reviews />
      <LatestPostsSection className="bg-[#F2F4E8] py-16 md:py-24 px-4 sm:px-6" />
      <OurPartners />
    </div>
  )
}
