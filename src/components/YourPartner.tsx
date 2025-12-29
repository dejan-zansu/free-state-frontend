import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { LinkButton } from './ui/link-button'

const YourPartner = async () => {
  const t = await getTranslations('home.yourPartner')
  const locale = await getLocale()

  const items = [
    {
      title: t('items.item1.title'),
      description: t('items.item1.description'),
      bgImage: '/images/partner-1.png',
    },
    {
      title: t('items.item2.title'),
      description: t('items.item2.description'),
      bgImage: '/images/partner-2.png',
    },
    {
      title: t('items.item3.title'),
      description: t('items.item3.description'),
      bgImage: '/images/partner-3.png',
    },
  ]

  return (
    <section className='relative pt-24 max-w-[1440px] mx-auto'>
      <div className='flex justify-between px-6'>
        <div>
          <h2 className='text-foreground text-5xl font-semibold relative'>
            {t('title')}
          </h2>
          <p className='text-foreground/80 text-xl font-light max-w-2xl mx-auto'>
            {t('subtitle')}
          </p>
        </div>
        <LinkButton
          variant='outline-primary'
          href='/get-started'
          locale={locale}
          className='h-fit'
        >
          {t('cta')}
        </LinkButton>
      </div>
      <div className='flex flex-row gap-6 mt-14 px-6'>
        {items.map((item) => (
          <div
            key={item.title}
            className='flex-1 relative aspect-464/439 overflow-hidden'
            style={{
              backgroundImage: `url(${item.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#154138',
            }}
          >
            <div className='absolute bottom-6 left-0 right-0 p-6'>
              <h3 className='text-solar text-2xl font-semibold mb-2'>
                {item.title}
              </h3>
              <p className='text-white/80 font-light'>{item.description}</p>

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
