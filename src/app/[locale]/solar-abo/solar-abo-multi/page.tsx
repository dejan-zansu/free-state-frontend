import SolarAboMultiHowItWorks from '@/components/SolarAboMultiHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'

const SolarAboMultiPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboMulti"
        imageSrc="/images/illustrations/solar-abo-multi.png"
        imageAlt="SolarAbo Multi"
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboMulti"
        showBillingPlatform
      />
      <SolarAboMultiHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboMulti"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboMulti" />
      <SolarAboCTA translationNamespace="solarAboMulti" />
    </div>
  )
}

export default SolarAboMultiPage
