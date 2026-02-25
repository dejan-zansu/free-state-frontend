import PageHero from "@/components/PageHero"
import { getTranslations } from "next-intl/server"

const BidirectionalChargingStationPage = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <main>
      <PageHero
        title={t('hero.title')}
        description={t('hero.description')}
        backgroundImage="/images/bidirectional-charging-station.png"
      />
    </main>
  )
}

export default BidirectionalChargingStationPage
