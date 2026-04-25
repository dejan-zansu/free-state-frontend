import PageHero from '@/components/PageHero'
import ProductShowcaseSection from '@/components/heat-pumps/products/ProductShowcaseSection'
import OutdoorProductsSection from '@/components/heat-pumps/products/OutdoorProductsSection'
import IndoorHeroSection from '@/components/heat-pumps/products/IndoorHeroSection'
import GroundSourceProductsSection from '@/components/heat-pumps/products/GroundSourceProductsSection'
import NibeFeatureSection from '@/components/heat-pumps/products/NibeFeatureSection'
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
    pathname: '/heat-pumps/products',
    title: t('heatPumpsProducts.title') || '',
    description: t('heatPumpsProducts.description') || '',
  })
}

const HeatPumpsProductsPage = async () => {
  const t = await getTranslations('heatPumpsProducts')

  return (
    <div>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/heat-pumps/products-hero-bg.png"
      />
      <ProductShowcaseSection />
      <OutdoorProductsSection />
      <IndoorHeroSection />
      <GroundSourceProductsSection />
      <NibeFeatureSection />
    </div>
  )
}

export default HeatPumpsProductsPage
