import Partners from '@/components/Partners'
import PortfolioHero from '@/components/PortfolioHero'
import PortfolioProjects from '@/components/PortfolioProjects'
import PortfolioStrategy from '@/components/PortfolioStrategy'

const PortfolioPage = async () => {
  return (
    <main className='mt-[84px]'>
      <PortfolioHero />
      <PortfolioProjects />
      <PortfolioStrategy />
      <Partners />
    </main>
  )
}

export default PortfolioPage
