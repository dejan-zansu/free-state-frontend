import PortfolioCTA from '@/components/PortfolioCTA'
import PortfolioHero from '@/components/PortfolioHero'
import PortfolioProjects from '@/components/PortfolioProjects'
import PortfolioStrategy from '@/components/PortfolioStrategy'

const PortfolioPage = async () => {
  return (
    <main>
      <PortfolioHero />
      <PortfolioProjects />
      <PortfolioStrategy />
      <PortfolioCTA />
    </main>
  )
}

export default PortfolioPage
