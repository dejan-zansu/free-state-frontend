import SolarAboBusinessHowItWorks from '@/components/SolarAboBusinessHowItWorks'
import {
  SolarAboCTA,
  SolarAboHero,
  SolarAboIncludes,
  SolarAboPricing,
  SolarAboRightForYou,
  VideoSection,
} from '@/components/solar-abo'

const SolarAboBusinessPage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <SolarAboHero
        translationNamespace="solarAboBusiness"
        imageSrc="/images/solar-abo-business.png"
        imageAlt="SolarAbo Business"
      />
      <VideoSection />
      <SolarAboIncludes
        translationNamespace="solarAboBusiness"
        showBatteryStorage
      />
      <SolarAboBusinessHowItWorks />
      <SolarAboPricing
        translationNamespace="solarAboBusiness"
        backgroundImage="/images/solar-abo-home-roof.png"
      />
      <SolarAboRightForYou translationNamespace="solarAboBusiness" />
      <SolarAboCTA translationNamespace="solarAboBusiness" />
    </div>
  )
}

export default SolarAboBusinessPage
