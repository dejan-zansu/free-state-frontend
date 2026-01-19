'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

const ContactHero = () => {
  const t = useTranslations('contactHero')

  return (
    <section className='relative h-[409px] w-full overflow-hidden'>
      <div className='absolute inset-0'>
        <Image
          src='/images/contact-drawing.webp'
          alt='Contact background'
          fill
          className='object-cover'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-b from-foreground via-foreground/20 to-transparent' />
        <div className='absolute inset-0 bg-black/20' />
      </div>

      <div className='relative z-10 max-w-[1310px] mx-auto px-6 h-full flex'>
        <div className='flex flex-col gap-5 pt-[133px]'>
          <div className='w-fit'>
            <button className='inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white bg-white/20 backdrop-blur-[65px] text-white text-base font-medium'>
              {t('badge')}
            </button>
          </div>

          <h1 className='text-solar text-[70px] font-medium leading-[1em]'>
            {t('title')}
          </h1>

          <p className='text-white/50 text-[22px] font-normal max-w-[400px]'>
            {t('subtitle')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContactHero
