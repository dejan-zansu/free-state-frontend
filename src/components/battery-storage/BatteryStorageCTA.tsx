import ProductCTA from '@/components/ProductCTA'
import { getTranslations } from 'next-intl/server'

const BatteryStorageCTA = async () => {
  const t = await getTranslations('batteryStorage')

  return (
    <ProductCTA
      badge={t('cta.badge')}
      title={t('cta.title')}
      subtitle={t('cta.subtitle')}
      buttonText={t('cta.button')}
      buttonHref="/calculator"
      imageSrc="/images/battery-storage/roof-with-panels-sunny-day.png"
    />
  )
}

export default BatteryStorageCTA
