import PortfolioCTA from '@/components/PortfolioCTA'
import PortfolioHero from '@/components/PortfolioHero'
import PortfolioProjects from '@/components/PortfolioProjects'
import PortfolioStrategy from '@/components/PortfolioStrategy'

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
