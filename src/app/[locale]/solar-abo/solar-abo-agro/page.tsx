import SolarAboAgroHowItWorks from '@/components/SolarAboAgroHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'

const SolarAboAgroPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboAgro"
        imageSrc="/images/solar-abo-agro.png"
        imageAlt="SolarAbo Agro"
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboAgro"
        showBatteryStorage
      />
      <SolarAboAgroHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboAgro"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboAgro" />
      <SolarAboCTA translationNamespace="solarAboAgro" />
    </div>
  )
}

export default SolarAboAgroPage
