import { getLocale, getTranslations } from 'next-intl/server'
import { LinkButton } from './ui/link-button'
import YourPartnerCarousel from './YourPartnerCarousel'

const YourPartner = async ({ isCommercial = false }) => {
  const t = await getTranslations('home.yourPartner')
  const locale = await getLocale()

  const items = [
    {
      title: t('items.item1.title'),
      description: t('items.item1.description'),
      bgImage: '/images/optimize-roof-space.png',
      bgImageCommercial: '/images/optimize-roof-space.png',
    },
    {
      title: t('items.item2.title'),
      description: t('items.item2.description'),
      bgImage: '/images/reduce-energy-costs.png',
      bgImageCommercial: '/images/reduce-energy-costs.png',
    },
    {
      title: t('items.item3.title'),
      description: t('items.item3.description'),
      bgImage: '/images/reduce-carbon-footprint.png',
      bgImageCommercial: '/images/reduce-carbon-footprint.png',
    },
  ]

  return (
    <section className="relative pt-12 sm:pt-16 md:pt-20 lg:pt-24 bg-[#FDFFF5] border-b border-foreground/20">
      <div className="max-w-[1440px] mx-auto ">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-6 px-4 sm:px-6 mb-8 sm:mb-10 md:mb-14">
          <div>
            <h2 className="text-foreground text-3xl sm:text-4xl font-semibold relative">
              {t('title')}
            </h2>
            <p className="text-foreground/80 text-base sm:text-lg md:text-xl font-light max-w-2xl mt-2 sm:mt-0">
              {t('subtitle')}
            </p>
          </div>
          <LinkButton
            variant={isCommercial ? 'outline-quaternary' : 'outline-primary'}
            href="/calculator"
            locale={locale}
            className="h-fit w-full sm:w-auto bg-transparent"
          >
            {t('cta')}
          </LinkButton>
        </div>
        <div className="px-8 sm:px-12 md:px-16 lg:px-20">
          <YourPartnerCarousel
            items={items}
            learnMoreText={t('learnMore')}
            locale={locale}
            isCommercial={isCommercial}
          />
        </div>
      </div>
    </section>
  )
}

export default YourPartner
