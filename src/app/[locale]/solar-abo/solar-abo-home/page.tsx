import SolarAboHomeCTA from '@/components/SolarAboHomeCTA'
import SolarAboHomeHero from '@/components/SolarAboHomeHero'
import SolarAboHomeHowItWorks from '@/components/SolarAboHomeHowItWorks'
import SolarAboHomeIncludes from '@/components/SolarAboHomeIncludes'
import SolarAboHomePricing from '@/components/SolarAboHomePricing'
import SolarAboHomeRightForYou from '@/components/SolarAboHomeRightForYou'

const SolarAboHomePage = () => {
  return (
    <div className='w-full overflow-x-hidden'>
      <SolarAboHomeHero />
      <SolarAboHomeIncludes />
      <SolarAboHomeHowItWorks />
      <SolarAboHomePricing />
      <SolarAboHomeRightForYou />
      <SolarAboHomeCTA />
    </div>
  )
}

export default SolarAboHomePage