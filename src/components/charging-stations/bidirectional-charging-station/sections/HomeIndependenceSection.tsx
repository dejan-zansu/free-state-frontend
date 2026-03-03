import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HomeIndependenceSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section
      className="relative py-12 md:py-16"
      style={{ background: '#EAEDDF' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          left: '-174px',
          top: '-122px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div className="max-w-[1079px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('homeIndependence.title')}
          </h2>

          <div className="flex flex-col lg:flex-row justify-center gap-[20px] w-full">
            <div
              className="rounded-[20px] w-full lg:w-[360px] h-[388px] relative overflow-hidden p-8 flex flex-col justify-center shrink-0 border border-[#809792]"
              style={{
                background: 'linear-gradient(126deg, rgba(6, 46, 37, 1) 23%, rgba(19, 148, 119, 1) 100%)',
              }}
            >
              <div
                className="absolute pointer-events-none"
                style={{
                  right: '-50px',
                  bottom: '-100px',
                  width: '268px',
                  height: '268px',
                  background: 'rgba(183, 254, 26, 0.5)',
                  filter: 'blur(360px)',
                  borderRadius: '50%',
                }}
              />
              <div className="relative z-10 flex flex-col gap-4">
                <p className="text-white/80 text-[22px] font-semibold tracking-[-0.02em]">
                  {t('homeIndependence.capacityComparison.title')}
                </p>
                <p className="text-white/80 text-[22px] font-light tracking-[-0.02em]">
                  {t('homeIndependence.capacityComparison.description')}
                </p>
              </div>
            </div>

            <div className="border border-[#809792] rounded-[20px] w-full lg:w-[406px] h-[388px] relative overflow-hidden shrink-0">
              <Image
                src="/images/bidirectional-charging/ev-battery-card.png"
                alt={t('homeIndependence.cards.evBattery')}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex items-center justify-center px-4">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center">
                  {t('homeIndependence.cards.evBattery')}
                </h3>
              </div>
            </div>

            <div className="border border-[#809792] rounded-[20px] w-full lg:w-[401px] h-[388px] relative overflow-hidden shrink-0">
              <Image
                src="/images/bidirectional-charging/home-battery-card.png"
                alt={t('homeIndependence.cards.homeBattery')}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex items-center justify-center px-4">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center">
                  {t('homeIndependence.cards.homeBattery')}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default HomeIndependenceSection
