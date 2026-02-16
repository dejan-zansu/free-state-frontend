import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const items = ['costs', 'funding', 'savings', 'tariffs'] as const

const WhatYouReceiveSection = async () => {
  const t = await getTranslations('solarCalculator.whatYouReceive')

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-5">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(32.5px)',
                WebkitBackdropFilter: 'blur(32.5px)',
              }}
            >
              <span className="text-white text-base font-medium tracking-[-0.02em] whitespace-nowrap">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
              {t('title')}
            </h2>

            <p className="text-white/80 text-lg md:text-[22px] font-light text-center max-w-[550px]">
              {t('description')}
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-[400px]">
            {items.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-[3px] h-6 rounded-full bg-[#B7FE1A]" />
                <span className="text-white text-base md:text-lg font-medium">
                  {t(`items.${item}`)}
                </span>
              </div>
            ))}
          </div>

          <LinkButton
            variant="primary"
            href={t('ctaLink') as '/solar-abo-calculator'}
          >
            {t('cta')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default WhatYouReceiveSection
