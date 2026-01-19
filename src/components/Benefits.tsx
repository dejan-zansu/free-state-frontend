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
    <section className='relative pt-24 bg-background'>
      <div className='max-w-[1111px] mx-auto px-6'>
        <div className='text-center mb-10'>
          <h2 className='text-foreground text-5xl font-semibold mb-4'>
            {t('title')}
          </h2>
          <p className='text-foreground/80 text-xl font-light max-w-2xl mx-auto'>
            {t('subtitle')}
          </p>
        </div>
        <div className='flex justify-center mb-10'>
          <LinkButton
            variant={isCommercial ? 'secondary' : 'outline-primary'}
            href='/calculator'
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
                className='relative bg-[#0D4841] rounded-[20px] pt-8 flex flex-col items-center text-center min-h-[372px] overflow-hidden'
              >
                <div
                  className='absolute inset-0 rounded-[20px]'
                  style={{
                    backgroundImage: isCommercial ? "url('/images/solar-adventages-commercial.png')" : "url('/images/solar-adventages.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'blur(4px)',
                  }}
                />

                <div className='relative z-10 mb-8 flex items-center justify-center'>
                  <div className='relative w-[142px] h-[142px] flex items-center justify-center'>
                    <div className={cn('absolute inset-0 rounded-full bg-white/10 border border-solar', isCommercial && 'border-white')} />
                    <div className='relative z-10'>
                      <Icon className={cn('w-[83px] h-[83px] text-solar', isCommercial && 'text-white')} />
                    </div>
                  </div>
                </div>

                <div className='relative z-10 flex-1 flex flex-col justify-end w-full'>
                  <div className='relative px-8 pb-10 pt-2.5'>
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
                      <h3 className={cn('text-solar text-xl font-bold uppercase mb-4', isCommercial && 'text-energy')}>
                        {feature.title}
                      </h3>
                      <p className='text-white/80 text-base font-light leading-normal text-start'>
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
