import Benefits from '@/components/Benefits'
import Deals from '@/components/Deals'
import Hero from '@/components/Hero'
import Partners from '@/components/Partners'
import Portfolio from '@/components/Portfolio'
import SolarEnergyFor from '@/components/SolarEnergyFor'
import Stats from '@/components/Stats'
import YourPartner from '@/components/YourPartner'

const CommercialPage = () => {
  return (
    <main>
      <Hero
        title='Scalable solar solutions for commercial properties'
        description='From planning to operation, we deliver long-term performance, price stability, and sustainable impact.'
        showCTAs={false}
        isCommercial
      />
       <Deals isCommercial />
      <SolarEnergyFor isCommercial />
      <Benefits isCommercial />
      <YourPartner isCommercial />
      <Portfolio isCommercial />
      <Stats />
      <Partners />  
    </main>
  )
}

export default CommercialPage
