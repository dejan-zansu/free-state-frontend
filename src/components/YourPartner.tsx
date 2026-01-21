import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LinkButton } from './ui/link-button'

const YourPartner = async ({isCommercial = false}) => {
  const t = await getTranslations('home.yourPartner')
  const locale = await getLocale()

  const items = [
    {
      title: t('items.item1.title'),
      description: t('items.item1.description'),
      bgImage: '/images/partner-1.png',
      bgImageCommercial: '/images/partner-1-commercial.png',
    },
    {
      title: t('items.item2.title'),
      description: t('items.item2.description'),
      bgImage: '/images/partner-2.png',
      bgImageCommercial: '/images/partner-2-commercial.png',
    },
    {
      title: t('items.item3.title'),
      description: t('items.item3.description'),
      bgImage: '/images/partner-3.png',
      bgImageCommercial: '/images/partner-3-commercial.png',
    },
  ]

  return (
    <section className='relative pt-12 sm:pt-16 md:pt-20 lg:pt-24 max-w-[1440px] mx-auto'>
      <div className='flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-6 px-4 sm:px-6'>
        <div>
          <h2 className='text-foreground text-3xl sm:text-4xl md:text-5xl font-semibold relative'>
            {t('title')}
          </h2>
          <p className='text-foreground/80 text-base sm:text-lg md:text-xl font-light max-w-2xl mt-2 sm:mt-0'>
            {t('subtitle')}
          </p>
        </div>
        <LinkButton
          variant='outline-primary'
          href='/calculator'
          locale={locale}
          className='h-fit w-full sm:w-auto'
        >
          {t('cta')}
        </LinkButton>
      </div>
      <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 mt-8 sm:mt-10 md:mt-14 px-4 sm:px-6'>
        {items.map((item) => (
          <div
            key={item.title}
            className='flex-1 relative aspect-464/439 overflow-hidden min-h-[300px] sm:min-h-[400px]'
            style={{
              backgroundImage: `url(${isCommercial ? item.bgImageCommercial : item.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#154138',
            }}
          >
            <div className='absolute bottom-4 sm:bottom-6 left-0 right-0 p-4 sm:p-6'>
              <h3 className={cn('text-solar text-xl sm:text-2xl font-semibold mb-2', isCommercial && 'text-white')}>
                {item.title}
              </h3>
              <p className='text-white/80 font-light text-sm sm:text-base'>{item.description}</p>

              <Link
                href={`/${locale}/learn-more`}
                className='inline-flex items-center gap-2 text-white font-medium group/link transition-opacity duration-300 hover:opacity-80 mt-6'
              >
                <span className='inline-flex items-center gap-2 border-b border-white pb-0.5'>
                  <span>{t('learnMore')}</span>
                  <ArrowRight className='w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1' />
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default YourPartner
