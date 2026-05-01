import { getTranslations } from 'next-intl/server'
import ProductShowcase from './ProductShowcase'

const HeatPumpsViessmann = async ({
  isCommercial = false,
}: {
  isCommercial?: boolean
}) => {
  const t = await getTranslations('home.heatPumpsViessmann')

  return (
    <ProductShowcase
      isCommercial={isCommercial}
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
      brandLogoSrc={
        isCommercial ? '/images/viessmann-logo-light.png' : '/images/viessmann-logo.png'
      }
      brandLogoAlt="Viessmann"
      brandLogoWidth={82}
      brandLogoHeight={49}
      exploreLabel={t('exploreViessmann')}
      exploreHref="/heat-pumps"
      imagePosition="left"
      mobileTextFirst
    />
  )
}

export default HeatPumpsViessmann
