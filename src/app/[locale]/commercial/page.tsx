import EvCharging from '@/components/EvCharging'
import Hero from '@/components/Hero'
import PathToEnergy from '@/components/PathToEnergy'
import FusionSolarApp from '@/components/FusionSolarApp'
import Battery from '@/components/Battery'
import HeatPumpsViessmann from '@/components/HeatPumpsViessmann'
import WhyFreeState from '@/components/WhyFreeState'
import YourBenefits from '@/components/YourBenefits'
import Reviews from '@/components/Reviews'
import CustomerStories from '@/components/CustomerStories'
import SolarModels from '@/components/SolarModels'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
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
    pathname: '/commercial',
    title: t('commercial.title') || '',
    description: t('commercial.description') || '',
  })
}

const CommercialPage = async () => {
  return (
    <div>
      <Hero isCommercial />
      <SolarModels isCommercial />
      <WhyFreeState isCommercial />
      <PathToEnergy isCommercial />
      <FusionSolarApp isCommercial />
      <Battery isCommercial />
      <HeatPumpsViessmann isCommercial />
      <EvCharging isCommercial />
      <CustomerStories isCommercial />
      <Reviews isCommercial />
      <YourBenefits isCommercial />
    </div>
  )
}

export default CommercialPage
