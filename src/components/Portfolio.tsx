import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

const Portfolio = async () => {
  const t = await getTranslations('home.portfolio')
  const locale = await getLocale()

  const portfolioItems = [
    {
      number: '02',
      title: t('item2.title'),
      details: t('item2.details'),
      image: '/images/portfolio/portfolio-2.png',
    },
    {
      number: '01',
      title: t('item1.title'),
      details: t('item1.details'),
      image: '/images/portfolio/portfolio-1.png',
    },
    {
      number: '03',
      title: t('item3.title'),
      details: t('item3.details'),
      image: '/images/portfolio/portfolio-3.png',
    },
  ]

  return (
    <section className='relative py-24 bg-background'>
      <div className='max-w-327.5 mx-auto px-6'>
        <div className='text-center mb-4'>
          <h2 className='text-foreground text-5xl font-semibold'>
            {t('title')}
          </h2>
        </div>

        <div className='text-center mb-17.5'>
          <p className='text-foreground/80 text-xl font-light max-w-2xl mx-auto'>
            {t('subtitle')}
          </p>
        </div>

        <div className='flex gap-6 justify-center'>
          {portfolioItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                'group relative overflow-hidden rounded-2xl bg-[#062E25] w-full max-w-xs h-128 flex flex-col',
                index === 1 ? '-mt-8' : ''
              )}
            >
              <div className='px-4 pt-10 pb-8'>
                <div className='flex items-start gap-3'>
                  <div
                    className={cn(
                      'text-white opacity-80 text-8xl font-bold uppercase leading-[80px] tracking-tighter',
                      index === 1 && 'text-[#9EE028]'
                    )}
                  >
                    {item.number}
                  </div>

                  <div>
                    <h3 className='text-white opacity-80 text-base font-bold uppercase mb-2'>
                      {item.title}
                    </h3>
                    <p className='text-white opacity-80 text-xs font-light whitespace-pre-line'>
                      {item.details}
                    </p>
                  </div>
                </div>
              </div>

              <div className='relative w-full flex-1 overflow-hidden'>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className='object-cover '
                />

                <div className='absolute bottom-6 left-6'>
                  <Link
                    href={`/${locale}/portfolio`}
                    className='inline-flex items-center gap-2 text-white font-medium group/link transition-opacity duration-300 hover:opacity-80'
                  >
                    <span className='inline-flex items-center gap-2 border-b border-white pb-0.5'>
                      <span>{t('learnMore')}</span>
                      <ArrowRight className='w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1' />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Portfolio
