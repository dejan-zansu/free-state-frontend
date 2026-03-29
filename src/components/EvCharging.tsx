import { getTranslations } from 'next-intl/server'
import ProductShowcase from './ProductShowcase'

const EvCharging = async () => {
  const t = await getTranslations('home.evCharging')

  return (
    <ProductShowcase
      title={t('title')}
      subtitle={t('subtitle')}
      steps={[
        { number: '1', text: t('step1') },
        { number: '2', text: t('step2') },
        { number: '3', text: t('step3') },
      ]}
      cta={t('cta')}
      ctaHref="/heat-pumps"
      imageSrc="/images/ev-charger-huawei-479789.png"
      imageAlt={t('title')}
      brandLogoSrc="/images/huawei-logo-4686a6.png"
      brandLogoAlt="Huawei"
      brandLogoWidth={74}
      brandLogoHeight={14}
      exploreLabel={t('exploreHuawei')}
      exploreHref="/heat-pumps"
      imagePosition="right"
    />
  )
}

export default EvCharging
