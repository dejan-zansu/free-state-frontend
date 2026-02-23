import PageHero from "@/components/PageHero"
import { getTranslations } from "next-intl/server"

const BidirectionalChargingStationPage = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <div>
      <PageHero
        backgroundImage="/images/bidirectional-charging-station/hero-bg.png"
        title={t('hero.title')}
      />
    </div>
  )
}

export default BidirectionalChargingStationPage
