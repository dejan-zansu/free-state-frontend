import { LinkButton } from '@/components/ui/link-button'
import LeafIcon from '@/components/icons/LeafIcon'
import { getTranslations } from 'next-intl/server'

const items = ['costs', 'funding', 'savings', 'tariffs'] as const

const WhatYouReceiveSection = async () => {
  const t = await getTranslations('solarCalculator.whatYouReceive')

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(175deg, #07332A 23.45%, #093F35 56.41%, #158B7E 130.37%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '40px',
          top: '-256px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 pt-[100px] pb-[60px]">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="flex flex-col items-center gap-10 w-full">
                <div className="flex flex-col items-center gap-5 w-full">
                  <div
                    className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/20"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(65px)',
                      WebkitBackdropFilter: 'blur(65px)',
                    }}
                  >
                    <span className="text-white text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                      {t('eyebrow')}
                    </span>
                  </div>

                  <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize w-full">
                    {t('title')}
                  </h2>
                </div>
              </div>

              <p className="text-white/80 text-base md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[519px]">
                {t('description')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 max-w-[503px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-10 w-full">
                {items.slice(0, 2).map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <LeafIcon className="w-[13px] h-[13px] shrink-0 text-[#B7FE1A]" />
                    <span className="text-white/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                      {t(`items.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-10">
                {items.slice(2).map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <LeafIcon className="w-[13px] h-[13px] shrink-0 text-[#B7FE1A]" />
                    <span className="text-white/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                      {t(`items.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
