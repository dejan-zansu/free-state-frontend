import { cn } from '@/lib/utils'
import { getLocale, getTranslations } from 'next-intl/server'
import { AllInclusiveIcon, HouseWithSunIcon, SolarSystemIcon } from './icons'
import { LinkButton } from './ui/link-button'

const Benefits = async ({isCommercial = false}) => {
  const locale = await getLocale()
  const t = await getTranslations('home.benefits')

  const features = [
    {
      icon: HouseWithSunIcon,
      title: t('noInvestment.title'),
      description: t('noInvestment.description'),
    },
    {
      icon: AllInclusiveIcon,
      title: t('fullService.title'),
      description: t('fullService.description'),
    },
    {
      icon: SolarSystemIcon,
      title: t('longTerm.title'),
      description: t('longTerm.description'),
    },
  ]

  return (
    <section className='relative pt-12 sm:pt-16 md:pt-20 lg:pt-24 bg-background'>
      <div className='max-w-[1111px] mx-auto px-4 sm:px-6'>
        <div className='text-center mb-8 sm:mb-10'>
          <h2 className='text-foreground text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4'>
            {t('title')}
          </h2>
          <p className='text-foreground/80 text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto px-2'>
            {t('subtitle')}
          </p>
        </div>
        <div className='flex justify-center mb-8 sm:mb-10'>
          <LinkButton
            variant={isCommercial ? 'secondary' : 'outline-primary'}
            href='/solar-abo'
            locale={locale}
          >
            {t('learnMore')}
          </LinkButton>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className='relative bg-[#0D4841] rounded-[16px] sm:rounded-[20px] pt-6 sm:pt-8 flex flex-col items-center text-center min-h-[300px] sm:min-h-[350px] md:min-h-[372px] overflow-hidden'
              >
                <div
                  className='absolute inset-0 rounded-[16px] sm:rounded-[20px]'
                  style={{
                    backgroundImage: isCommercial ? "url('/images/solar-adventages-commercial.png')" : "url('/images/solar-adventages.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(4px)',
                  }}
                />

                <div className='relative z-10 mb-6 sm:mb-8 flex items-center justify-center'>
                  <div className='relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[142px] md:h-[142px] flex items-center justify-center'>
                    <div className={cn('absolute inset-0 rounded-full bg-white/10 border border-solar', isCommercial && 'border-white')} />
                    <div className='relative z-10'>
                      <Icon className={cn('w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[83px] md:h-[83px] text-solar', isCommercial && 'text-white')} />
                    </div>
                  </div>
                </div>

                <div className='relative z-10 flex-1 flex flex-col justify-end w-full'>
                  <div className='relative px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10 pt-2.5'>
                    <div
                      className='absolute inset-0'
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(13.2px)',
                        WebkitBackdropFilter: 'blur(13.2px)',
                      }}
                    />
                    <div className='relative z-10'>
                      <h3 className={cn('text-solar text-lg sm:text-xl font-bold uppercase mb-3 sm:mb-4', isCommercial && 'text-energy')}>
                        {feature.title}
                      </h3>
                      <p className='text-white/80 text-sm sm:text-base font-light leading-normal text-start'>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Benefits
