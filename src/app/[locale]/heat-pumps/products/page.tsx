import PageHero from '@/components/PageHero'
import ProductShowcaseSection from '@/components/heat-pumps/products/ProductShowcaseSection'
import OutdoorProductsSection from '@/components/heat-pumps/products/OutdoorProductsSection'
import IndoorHeroSection from '@/components/heat-pumps/products/IndoorHeroSection'
import GroundSourceProductsSection from '@/components/heat-pumps/products/GroundSourceProductsSection'
import NibeFeatureSection from '@/components/heat-pumps/products/NibeFeatureSection'
import { getTranslations } from 'next-intl/server'

const HeatPumpsProductsPage = async () => {
  const t = await getTranslations('heatPumpsProducts')

  return (
    <main>
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
    </main>
  )
}

export default HeatPumpsProductsPage
