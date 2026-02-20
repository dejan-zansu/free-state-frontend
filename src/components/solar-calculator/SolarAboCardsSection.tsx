import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const cards = [
  { key: 'investment', icon: '/images/solar-calculator/card-icon-investment.png' },
  { key: 'control', icon: '/images/solar-calculator/card-icon-control.png' },
  { key: 'yield', icon: '/images/solar-calculator/card-icon-yield.png' },
] as const

const SolarAboCardsSection = async () => {
  const t = await getTranslations('solarCalculator.cards')

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(242, 244, 232, 1) 46%, rgba(220, 233, 230, 1) 100%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '568px',
          height: '568px',
          right: '-157px',
          top: '-202px',
          background: 'rgba(183, 254, 26, 0.14)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '568px',
          height: '568px',
          left: '-246px',
          top: '60px',
          background: 'rgba(183, 254, 26, 0.14)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[1120px] mx-auto px-4 sm:px-8 py-[151px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(({ key, icon }) => (
            <div
              key={key}
              className="relative flex flex-col overflow-hidden rounded-[20px] border border-[#809792] h-[266px]"
              style={{
                background: '#0D4841',
                boxShadow:
                  '0px 4px 24px 0px rgba(0, 0, 0, 0.45), inset 0px 0px 44px 0px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="flex-1 flex items-start justify-center pt-[30px]">
                <div
                  className="flex items-center justify-center w-[142px] h-[142px] rounded-full bg-white border border-[#B7FE1A]"
                  style={{
                    boxShadow: '0px 0px 44px 0px rgba(183, 254, 26, 0.3)',
                  }}
                >
                  <Image
                    src={icon}
                    alt={t(`${key}.title`)}
                    width={142}
                    height={142}
                    className="object-contain rounded-full"
                  />
                </div>
              </div>

              <div
                className="flex items-center justify-center h-[73px] border-t border-[#809792]"
                style={{
                  background: '#E5E6DE',
                  backdropFilter: 'blur(26.4px)',
                  WebkitBackdropFilter: 'blur(26.4px)',
                }}
              >
                <span className="text-[#062E25] text-lg md:text-[22px] font-bold tracking-[-0.02em] text-center capitalize">
                  {t(`${key}.title`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolarAboCardsSection
