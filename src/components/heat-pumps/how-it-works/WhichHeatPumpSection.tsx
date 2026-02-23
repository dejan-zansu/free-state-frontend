import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const WhichHeatPumpSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-147px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[1210px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('whichHeatPump.title')}
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[90px]">
            <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify max-w-[535px]">
              {t('whichHeatPump.description')}
            </p>

            <div className="flex items-center gap-[13px]">
              <div className="relative w-[100px] h-[100px] shrink-0">
                <div className="absolute inset-0 bg-white rounded-[20px] flex items-center justify-center">
                  <Image
                    src="/images/heat-pumps/how-it-works/heat-pump-icon.svg"
                    alt=""
                    width={80}
                    height={70}
                  />
                </div>
              </div>

              <div
                className="max-w-[447px] px-8 py-6 rounded-[20px] backdrop-blur-[26px]"
                style={{
                  background: 'rgba(225, 233, 222, 0.71)',
                  border: '1px solid #B7FE1A',
                }}
              >
                <p className="text-[#062E25]/80 text-base md:text-xl font-normal tracking-[-0.02em]">
                  {t('whichHeatPump.stat')}
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

export default WhichHeatPumpSection
