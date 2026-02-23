import PageHero from '@/components/PageHero'
import { getTranslations } from 'next-intl/server'

const SingleFamilyHomePage = async () => {
  const t = await getTranslations('singleFamilyHome')

  return (
    <div>
      <PageHero
        backgroundImage="/images/single-family-home/hero-bg.png"
        title={t('hero.title')}
      />
    </div>
  )
}

export default SingleFamilyHomePage
