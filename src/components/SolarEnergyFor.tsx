import { getLocale, getTranslations } from 'next-intl/server'
import MinimalLogoIcon from './icons/MinimalLogoIcon'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'

const SolarEnergyFor = async ({isCommercial = false}) => {
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
    <section className='relative pt-24'>
      <div className='flex justify-center mb-10'>
      <Badge variant='secondary'>{isCommercial ? 'For businesses' : 'For home'}</Badge>
      </div>
      <h2 className='text-foreground text-5xl font-semibold text-center relative z-20'>
        {t('title')}
      </h2>
      <div className='relative min-h-175 2xl:min-h-[calc(100vw*0.50)] flex flex-col items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 z-0'>
          <div
            className='absolute inset-0 bg-cover bg-top'
            style={{
              backgroundImage: isCommercial ? "url('/images/solar-farm-commercial.png')" : "url('/images/solar-farm.png')",
            }}
          />
        </div>

        <div className='relative z-10 max-w-145 mx-auto px-6 w-full mt-12 md:mt-16 lg:mt-20'>
          <div className='relative'>
            <div
              className='absolute inset-0 rounded-4xl'
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(13.2px)',
                WebkitBackdropFilter: 'blur(13.2px)',
              }}
            />
            <div className='relative z-10 px-8 py-10'>
              <div className='mb-8'>
                <h2 className='text-white text-4xl font-semibold mb-4'>
                  {t('contentTitle')}
                </h2>
                <p className='text-white/80 font-light max-w-2xl mx-auto leading-6'>
                  {t('description')}
                </p>
              </div>

              <div className='flex flex-row gap-6'>
                {items.map((item, index) => (
                  <div key={index} className='flex-1'>
                    <h3 className='text-white text-2xl font-semibold mb-3 flex items-center gap-2.5'>
                      <MinimalLogoIcon />
                      {item.title}
                    </h3>
                    <p className='text-white/80 font-light italic leading-6'>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='mt-10 flex justify-center'>
            <LinkButton variant={isCommercial ? 'secondary' : 'primary'} href='/solar-abo' locale={locale}>
              {t('cta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarEnergyFor
