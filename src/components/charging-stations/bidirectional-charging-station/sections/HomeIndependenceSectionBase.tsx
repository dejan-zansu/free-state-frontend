import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

interface HomeIndependenceSectionBaseProps {
  cardGradient: string
  glowColor: string
  evBatteryImage: string
  homeBatteryImage: string
}

const HomeIndependenceSectionBase = async ({
  cardGradient,
  glowColor,
  evBatteryImage,
  homeBatteryImage,
}: HomeIndependenceSectionBaseProps) => {
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

          <div className="flex flex-col lg:flex-row justify-center w-full">
            <div
              className="rounded-[20px] w-full lg:w-[360px] h-[388px] relative overflow-hidden p-8 flex flex-col justify-center shrink-0 border border-[#809792] z-30"
              style={{ background: cardGradient }}
            >
              <div
                className="absolute pointer-events-none"
                style={{
                  right: '-50px',
                  bottom: '-100px',
                  width: '268px',
                  height: '268px',
                  background: glowColor,
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

            <div
              className="border border-[#809792] rounded-[20px] w-full lg:w-[406px] h-[388px] shrink-0 overflow-hidden flex flex-col bg-[#EAEDDF] z-20 -mt-[32px] lg:mt-0 lg:-ml-[32px]"
            >
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src={evBatteryImage}
                  alt={t('homeIndependence.cards.evBattery')}
                  width={232}
                  height={232}
                  className="object-contain"
                />
              </div>
              <div className="py-5 bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex items-center justify-center px-4 shrink-0">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center">
                  {t('homeIndependence.cards.evBattery')}
                </h3>
              </div>
            </div>

            <div
              className="border border-[#809792] rounded-[20px] w-full lg:w-[401px] h-[388px] shrink-0 overflow-hidden flex flex-col bg-[#EAEDDF] z-10 -mt-[32px] lg:mt-0 lg:-ml-[32px]"
            >
              <div className="flex-1 flex items-center justify-center">
                <Image
                  src={homeBatteryImage}
                  alt={t('homeIndependence.cards.homeBattery')}
                  width={232}
                  height={232}
                  className="object-contain"
                />
              </div>
              <div className="py-5 bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex items-center justify-center px-4 shrink-0">
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

export default HomeIndependenceSectionBase
