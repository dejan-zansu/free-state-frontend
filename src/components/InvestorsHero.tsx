import { getLocale, getTranslations } from 'next-intl/server'

const InvestorsHero = async () => {
  const t = await getTranslations('investorsPage')
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
          <h1 className='text-foreground text-7xl font-medium mb-4 whitespace-pre-line'>
            {t('title')}
          </h1>
          <p className='text-white/80 text-xl font-medium leading-[30px] mb-12 whitespace-pre-line'>
            {t('subtitle')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default InvestorsHero
