import { getTranslations } from 'next-intl/server'
import ProductShowcase from './ProductShowcase'

const HeatPumps = async () => {
  const t = await getTranslations('home.heatPumps')

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
      imageSrc="/images/heat-pump-viessmann-303bcb.png"
      imageAlt={t('title')}
      brandLogoSrc="/images/nibe-logo-631fb3.png"
      brandLogoAlt="NIBE"
      exploreLabel={t('exploreNibe')}
      exploreHref="/heat-pumps"
      imagePosition="left"
    />
  )
}

export default HeatPumps
