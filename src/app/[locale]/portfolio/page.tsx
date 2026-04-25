import PortfolioCTA from '@/components/PortfolioCTA'
import PortfolioHero from '@/components/PortfolioHero'
import PortfolioProjects from '@/components/PortfolioProjects'
import PortfolioStrategy from '@/components/PortfolioStrategy'
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
    pathname: '/portfolio',
    title: t('portfolio.title') || '',
    description: t('portfolio.description') || '',
  })
}

const PortfolioPage = async () => {
  return (
    <div>
      <PortfolioHero />
      <PortfolioProjects />
      <PortfolioStrategy />
      <PortfolioCTA />
    </div>
  )
}

export default PortfolioPage
