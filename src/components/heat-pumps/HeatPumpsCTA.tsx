import ProductCTA from '@/components/ProductCTA'
import { getTranslations } from 'next-intl/server'

const HeatPumpsCTA = async () => {
  const t = await getTranslations('heatPumps')

  return (
    <ProductCTA
      badge={t('cta.badge')}
      title={t('cta.title')}
      subtitle={t('cta.subtitle')}
      buttonText={t('cta.button')}
      buttonHref="/calculator"
      imageSrc="/images/heat-pumps/roof-with-solar-panels.png"
      containerClassName="max-w-[560px]"
    />
  )
}

export default HeatPumpsCTA
