import Partners from '@/components/Partners'
import PortfolioHero from '@/components/PortfolioHero'
import PortfolioProjects from '@/components/PortfolioProjects'
import PortfolioStrategy from '@/components/PortfolioStrategy'

const PortfolioPage = async () => {
  return (
    <main>
      <PortfolioHero />
      <PortfolioProjects />
      <PortfolioStrategy />
      <Partners />
    </main>
  )
}

export default PortfolioPage
