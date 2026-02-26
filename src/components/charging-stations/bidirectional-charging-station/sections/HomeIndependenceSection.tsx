import { getTranslations } from 'next-intl/server'

const HomeIndependenceSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section
      className="relative py-12 md:py-16"
      style={{ background: '#EAEDDF' }}
    >
      <div
        className="absolute rounded-full"
        style={{
          left: '-174px',
          top: '-122px',
          width: '374px',
          height: '374px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
        }}
      />

      <div className="max-w-[1079px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('homeIndependence.title')}
          </h2>

          <div className="flex flex-wrap justify-center gap-[20px]">
            <div className="bg-[#0D4841] border border-[#809792] rounded-[20px] w-[401px] h-[388px] relative overflow-hidden">
              <div className="flex items-center justify-center h-full pb-[125px]" />
              <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex items-center justify-center px-4">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center">
                  {t('homeIndependence.cards.homeBattery')}
                </h3>
              </div>
            </div>

            <div className="bg-[#0D4841] border border-[#809792] rounded-[20px] w-[406px] h-[388px] relative overflow-hidden">
              <div className="flex items-center justify-center h-full pb-[125px]" />
              <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex items-center justify-center px-4">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center">
                  {t('homeIndependence.cards.evBattery')}
                </h3>
              </div>
            </div>

            <div className="rounded-[20px] w-[360px] h-[388px] relative overflow-hidden p-8 flex flex-col justify-center">
              <div
                className="absolute rounded-full"
                style={{
                  right: '-50px',
                  bottom: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'rgba(183, 254, 26, 0.3)',
                  filter: 'blur(100px)',
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
