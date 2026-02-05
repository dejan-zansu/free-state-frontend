import SolarAboHomeHowItWorks from '@/components/SolarAboHomeHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'

const SolarAboHomePage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboHome"
        imageSrc="/images/solar-abo-home.png"
        imageAlt="SolarAbo Home"
      />
      <VideoSection />
      <SolarAboIncludes translationNamespace="solarAboHome" />
      <SolarAboHomeHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboHome"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboHome" />
      <SolarAboCTA translationNamespace="solarAboHome" />
    </div>
  )
}

export default SolarAboHomePage
