import { LinkButton } from '@/components/ui/link-button'
import { getLocale, getTranslations } from 'next-intl/server'

const SolarAboHomeCTA = async () => {
  const t = await getTranslations('solarAboHome.cta')
  const locale = await getLocale()

  return (
    <section className='relative w-full min-h-[543px] bg-[#158B7E] overflow-hidden'>
      <div
        className='absolute w-full h-[543px]'
        style={{
          backgroundImage: "url('/images/top-of-the-roof.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }}
      />


      {/* Content Container */}
      <div className='relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 pt-[131px] pb-12'>
        <div className='flex flex-col items-center gap-10  mx-auto'>
          {/* Top Section with Button and Heading */}
          <div className='flex flex-col items-center gap-5 w-full'>
            {/* Outline Button */}
            <div
              className='flex items-center justify-center px-4 py-[10.54px] rounded-[31.63px] border border-white'
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(32.5px)',
                WebkitBackdropFilter: 'blur(32.5px)',
              }}
            >
              <span className='text-white text-base font-medium leading-[16px] text-center tracking-[-0.02em] whitespace-nowrap'>
                {t('topButton')}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className='text-white text-4xl sm:text-5xl lg:text-[65px] font-medium leading-[103%] text-center capitalize max-w-[900px]'>
              {t('heading')}
            </h2>
          </div>

          {/* CTA Button */}
          <LinkButton
            variant='primary'
            href={t('ctaLink')}
          >
            {t('ctaText')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default SolarAboHomeCTA

