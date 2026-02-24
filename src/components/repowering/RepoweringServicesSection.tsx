import { useTranslations } from 'next-intl'
import Image from 'next/image'

const cards = [
  {
    key: 'photovoltaics',
    icon: '/images/repowering/repowering-icon-photovoltaics.svg',
    logo: '/images/repowering/repowering-logo-1.svg',
    logoWidth: 117,
  },
  {
    key: 'heatPump',
    icon: '/images/repowering/repowering-icon-heatpump.svg',
    logo: '/images/repowering/repowering-logo-2.svg',
    logoWidth: 97,
  },
  {
    key: 'chargingSolution',
    icon: '/images/repowering/repowering-icon-charging.svg',
    logo: '/images/repowering/repowering-logo-3.svg',
    logoWidth: 150,
  },
] as const

const RepoweringServicesSection = () => {
  const t = useTranslations('repowering.services')

  return (
    <section className="bg-[#EAEDDF] py-12 md:py-[50px] overflow-hidden">
      <div className="max-w-[1316px] mx-auto px-4 sm:px-6 lg:px-[62px]">
        <div className="flex flex-col items-center gap-10 md:gap-[60px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-wrap justify-center gap-2.5 w-full max-w-[1220px]">
            {cards.map(card => (
              <div
                key={card.key}
                className="relative w-full sm:w-[calc(50%-5px)] lg:w-[calc(33.333%-7px)] h-[370px] rounded-[20px] overflow-hidden"
                style={{ border: '1px solid #809792' }}
              >
                <div className="relative z-10 flex items-center justify-center pt-[30px]">
                  <Image src={card.icon} alt="" width={142} height={142} />
                </div>

                <div
                  className="absolute bottom-0 left-0 right-0 h-[177px] backdrop-blur-[26px]"
                  style={{
                    background: '#E5E6DE',
                    borderTop: '1px solid #809792',
                  }}
                >
                  <div className="flex flex-col gap-5 px-8 py-5">
                    <div className="flex flex-col gap-2.5">
                      <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold capitalize text-center">
                        {t(`cards.${card.key}.title`)}
                      </h3>
                      <p className="text-[#062E25]/80 text-sm md:text-base font-light tracking-[-0.02em] text-center">
                        {t(`cards.${card.key}.description`)}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Image
                        src={card.logo}
                        alt=""
                        width={card.logoWidth}
                        height={23}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RepoweringServicesSection
