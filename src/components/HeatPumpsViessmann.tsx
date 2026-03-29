import { getTranslations } from 'next-intl/server'
import ProductShowcase from './ProductShowcase'

const HeatPumpsViessmann = async () => {
  const t = await getTranslations('home.heatPumpsViessmann')

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
      imageSrc="/images/heat-pump-viessmann-main.png"
      imageAlt={t('title')}
      brandLogoSrc="/images/viessmann-logo.png"
      brandLogoAlt="Viessmann"
      brandLogoWidth={82}
      brandLogoHeight={49}
      exploreLabel={t('exploreViessmann')}
      exploreHref="/heat-pumps"
      imagePosition="left"
    />
  )
}

export default HeatPumpsViessmann
