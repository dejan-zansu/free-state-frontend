import SolarAboPublicHowItWorks from '@/components/SolarAboPublicHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'

const SolarAboPublicPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboPublic"
        imageSrc="/images/solar-abo-public.png"
        imageAlt="SolarAbo Public"
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboPublic"
        showBatteryStorage
      />
      <SolarAboPublicHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboPublic"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboPublic" />
      <SolarAboCTA translationNamespace="solarAboPublic" />
    </div>
  )
}

export default SolarAboPublicPage
