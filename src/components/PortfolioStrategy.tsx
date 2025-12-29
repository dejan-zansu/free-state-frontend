import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const PortfolioStrategy = async () => {
  const t = await getTranslations('portfolioPage.strategy')

  return (
    <section className='relative py-12 bg-background'>
      <div className='max-w-[1400px] mx-auto px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <h2 className='text-foreground text-4xl font-semibold mb-6'>
              {t('title')}
            </h2>

            <div className='space-y-6'>
              <p className='text-foreground/80 text-lg font-light leading-relaxed'>
                {t('description')}
              </p>

              <p className='text-foreground/80 text-lg font-light leading-relaxed'>
                {t('diversification')}
              </p>

              <p className='text-foreground/80 text-lg font-light leading-relaxed'>
                {t('future')}
              </p>

              <p className='text-foreground/80 text-lg font-light leading-relaxed'>
                {t('synergies')}
              </p>
            </div>
          </div>

          <div className='relative w-full h-[617px] overflow-hidden'>
            <Image
              src='/images/free-state-strategy.png'
              alt='Free State Strategy'
              fill
              className='object-cover'
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default PortfolioStrategy
