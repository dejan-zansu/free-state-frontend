import { getTranslations } from 'next-intl/server'
import ProductShowcase from './ProductShowcase'

const Battery = async ({
  isCommercial = false,
}: {
  isCommercial?: boolean
}) => {
  const t = await getTranslations('home.battery')

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
      ctaHref="/battery-storage"
      imageSrc="/images/sofar-battery.png"
      imageAlt={t('title')}
      brandLogoSrc={
        isCommercial ? '/images/sofar-logo-light.png' : '/images/sofar-logo.png'
      }
      brandLogoAlt="Sofar"
      brandLogoWidth={74}
      brandLogoHeight={14}
      exploreLabel={t('exploreHuawei')}
      exploreHref="/battery-storage"
      imagePosition="right"
    />
  )
}

export default Battery
