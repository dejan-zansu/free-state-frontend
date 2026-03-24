import SolarAboHomeCTA from '@/components/SolarAboHomeCTA'
import SolarAboHomeHero from '@/components/SolarAboHomeHero'
import SolarAboHomeHowItWorks from '@/components/SolarAboHomeHowItWorks'
import SolarAboHomeIncludes from '@/components/SolarAboHomeIncludes'
import SolarAboHomePricing from '@/components/SolarAboHomePricing'
import SolarAboHomeRightForYou from '@/components/SolarAboHomeRightForYou'

const SolarAboHomeBatteryPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHomeHero
        imageSrc="/images/illustrations/solar-abo-home-storage.png"
        imageAlt="SolarAbo Home Battery"
      />
      <SolarAboHomeIncludes showBatteryStorage={true} />
      <SolarAboHomeHowItWorks />
      <SolarAboHomePricing />
      <SolarAboHomeRightForYou />
      <SolarAboHomeCTA />
    </div>
  )
}

export default SolarAboHomeBatteryPage
