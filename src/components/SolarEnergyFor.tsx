import { getLocale, getTranslations } from 'next-intl/server'
import MinimalLogoIcon from './icons/MinimalLogoIcon'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'
import { cn } from '@/lib/utils'

const SolarEnergyFor = async ({ isCommercial = false }) => {
  const t = await getTranslations('home.forBusinesses')
  const locale = await getLocale()

  const items = [
    {
      title: t('item1.title'),
      description: t('item1.description'),
    },
    {
      title: t('item2.title'),
      description: t('item2.description'),
    },
  ]

  return (
    <section className="relative pt-12 sm:pt-16 md:pt-20 lg:pt-24">
      <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
        <Badge
          variant="secondary"
          className={cn(
            'text-foreground bg-solar',
            isCommercial && 'text-white bg-energy'
          )}
        >
          {isCommercial ? t('badge.businesses') : t('badge.home')}
        </Badge>
      </div>
      <h2 className="text-foreground text-3xl sm:text-4xl md:text-5xl font-semibold text-center relative z-20 px-4">
        {t('title')}
      </h2>
      <div className="relative min-h-[300px] sm:min-h-[400px] md:min-h-175 2xl:min-h-[calc(100vw*0.50)] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-top"
            style={{
              backgroundImage: "url('/images/solar-farm.png')",
            }}
          />
        </div>

        <div className="relative z-10 max-w-145 mx-auto px-4 sm:px-6 w-full mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-20">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl md:rounded-4xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(13.2px)',
                WebkitBackdropFilter: 'blur(13.2px)',
              }}
            />
            <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4">
                  {t('contentTitle')}
                </h2>
                <p className="text-foreground font-light max-w-2xl mx-auto leading-5 sm:leading-6 text-sm sm:text-base">
                  {t('description')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {items.map((item, index) => (
                  <div key={index} className="flex-1">
                    <h3 className="text-foreground text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 flex items-center gap-2 sm:gap-2.5">
                      <MinimalLogoIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-[#9F3E4F]" />
                      {item.title}
                    </h3>
                    <p className="text-foreground font-light italic leading-5 sm:leading-6 text-sm sm:text-base">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href="/solar-abo"
            >
              {t('cta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarEnergyFor
