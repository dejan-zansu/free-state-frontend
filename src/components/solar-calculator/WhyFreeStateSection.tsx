import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const cards = [
  { key: 'experience', icon: '/images/star-icon.png' },
  { key: 'localPresence', icon: '/images/map-pin-icon.png' },
  { key: 'comprehensiveService', icon: '/images/note-icon.png' },
  { key: 'exclusiveTariffs', icon: '/images/market-up-icon.png' },
] as const

const WhyFreeStateSection = async () => {
  const t = await getTranslations('solarCalculator.whyFreeState')

  return (
    <section className="relative w-full overflow-hidden bg-[#E8EADD] py-[50px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium tracking-[-0.02em] mb-10 md:mb-[50px]">
          {t('title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ key, icon }) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-xl border border-[#062E25] overflow-hidden"
              style={{
                background: '#062E25',
                boxShadow:
                  '0px 4px 24px 0px rgba(0, 0, 0, 0.45), inset 0px 0px 44px 0px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="flex flex-col items-center gap-5 pt-[30px] pb-8 px-6 w-full">
                <div
                  className="flex items-center justify-center w-[132px] h-[132px] rounded-full bg-[#F3F4EE] overflow-hidden"
                  style={{
                    boxShadow: '0px 0px 44px 0px rgba(183, 254, 26, 0.3)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt="" />
                </div>
                <div className="flex flex-col items-center gap-[10px] w-full">
                  <h3 className="text-white text-lg md:text-[22px] font-medium tracking-[-0.02em] text-center">
                    {t(`cards.${key}.title`)}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base font-light tracking-[-0.02em] text-center">
                    {t(`cards.${key}.subtitle`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyFreeStateSection
