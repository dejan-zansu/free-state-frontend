import { LinkButton } from '@/components/ui/link-button'
import UnderlineLink from '@/components/ui/underline-link'
import { getLocale, getTranslations } from 'next-intl/server'

const Hero = async () => {
  const t = await getTranslations('home')
  const locale = await getLocale()
  return (
    <section className='relative min-h-[879px] flex justify-center overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{
            backgroundImage: "url('/images/hero-solar-panels.jpg')",
          }}
        />
      </div>

      <div className='relative z-10 max-w-360 mx-auto px-6 pt-40 pb-16'>
        <div className='flex flex-col items-center text-center'>
          <div className='mb-12 inline-flex items-center justify-center px-3.75 h-10 bg-white/20 backdrop-blur-[65px] rounded-[32px] border border-white'>
            <span className='text-white font-medium'>{t('hero.badge')}</span>
          </div>

          <h1 className='text-white text-7xl font-medium mb-4 whitespace-pre-line'>
            {t('hero.title')}
          </h1>
          <p className='text-white/80 text-xl font-medium leading-[30px] mb-12 whitespace-pre-line'>
            {t('hero.subtitle')}
          </p>

          <div className='flex items-center gap-4'>
            <LinkButton variant='primary' href='/get-started' locale={locale}>
              {t('hero.cta.primary')}
            </LinkButton>

            <LinkButton
              variant='outline-secondary'
              href='/calculator'
              locale={locale}
            >
              {t('hero.cta.secondary')}
            </LinkButton>
          </div>
        </div>
      </div>

      <div className='absolute bottom-8 left-6 right-6 z-10'>
        <div className='flex gap-6 items-end justify-between'>
          <div className='bg-white/5 backdrop-blur-[65px] border border-white/30 rounded-xl p-6 h-fit max-w-[360px]'>
            <div>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-3.5 h-3.5 border-2 border-white rounded-tl-[6.5px] rounded-br-[6.5px]' />
                <h3 className='text-white text-lg font-medium'>
                  {t('smartEnergy.title')}
                </h3>
              </div>
              <p className='text-white/70 leading-5'>
                {t('smartEnergy.description')}
              </p>
              <UnderlineLink
                href={`/${locale}/about-us`}
                className='mt-4 text-white'
              >
                {t('mission.learnMore')}
              </UnderlineLink>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-[65px] border border-white/30 rounded-xl p-8 max-w-[360px]'>
            <div>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-3.5 h-3.5 border-2 border-white rounded-tl-[6.5px] rounded-br-[6.5px]' />
                <h3 className='text-white text-lg font-medium'>
                  {t('mission.title')}
                </h3>
              </div>
              <p className='text-white/70 leading-5'>
                {t('mission.description')}
              </p>
              <UnderlineLink
                href={`/${locale}/about-us`}
                className='mt-4 text-white'
              >
                {t('mission.learnMore')}
              </UnderlineLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
