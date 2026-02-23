import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const items = [
  { num: '1', key: 'solarPanels' },
  { num: '2', key: 'inverter' },
  { num: '3', key: 'fuseBox' },
  { num: '4', key: 'hotWaterBoiler' },
  { num: '5', key: 'batteryStorage' },
  { num: '6', key: 'evCharging' },
  { num: '7', key: 'heatPump' },
] as const

const markerPositions = [
  'left-[47.9%] top-[0%]',
  'left-[19%] top-[79%]',
  'left-[30%] top-[79%]',
  'left-[52.1%] top-[74.7%]',
  'left-[65.3%] top-[74.7%]',
  'left-[80%] top-[64.6%]',
  'left-[93.4%] top-[52.7%]',
] as const

const HowItWorksSection = async () => {
  const t = await getTranslations('howLargePlantsWorks')

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[942px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5 max-w-[368px] text-center">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('howItWorks.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] max-w-[642px] text-center">
            {t('howItWorks.description')}
          </p>

          <div className="w-full relative">
            <div
              className="relative z-10 rounded-xl p-8 md:p-[60px]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(253, 255, 245, 1) 0%, rgba(211, 211, 211, 0) 100%)',
                border: '1px solid transparent',
                borderImage:
                  'linear-gradient(180deg, rgba(6, 46, 37, 1) 0%, rgba(19, 148, 119, 0) 72%) 1',
              }}
            >
              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] mb-8 md:mb-[60px]">
                {t('howItWorks.graphicDescription')}
              </p>

              <div className="flex flex-col gap-6 md:gap-[38px] items-center">
                <div className="flex flex-wrap gap-6 md:gap-[60px] justify-center">
                  {items.slice(0, 2).map((item) => (
                    <div key={item.num} className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-xl border-2 border-[#9F3E4F] text-[#062E25] text-xs font-bold shrink-0">
                        {item.num}
                      </span>
                      <span className="text-[#062E25] text-lg md:text-[22px] font-bold tracking-[-0.02em] capitalize">
                        {t(`howItWorks.items.${item.key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-6 md:gap-10 justify-center">
                  {items.slice(2, 5).map((item) => (
                    <div key={item.num} className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-xl border-2 border-[#9F3E4F] text-[#062E25] text-xs font-bold shrink-0">
                        {item.num}
                      </span>
                      <span className="text-[#062E25] text-lg md:text-[22px] font-bold tracking-[-0.02em] capitalize">
                        {t(`howItWorks.items.${item.key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-6 md:gap-10 justify-center">
                  {items.slice(5).map((item) => (
                    <div key={item.num} className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-xl border-2 border-[#9F3E4F] text-[#062E25] text-xs font-bold shrink-0">
                        {item.num}
                      </span>
                      <span className="text-[#062E25] text-lg md:text-[22px] font-bold tracking-[-0.02em] capitalize">
                        {t(`howItWorks.items.${item.key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative -mt-20 md:-mt-40 aspect-[942/463]">
              <Image
                src="/images/commercial/how-large-plants-works/large-plant-building-6c03e6.png"
                alt={t('howItWorks.title')}
                fill
                className="object-contain"
              />
              {items.map((item, i) => (
                <div
                  key={item.num}
                  className={`absolute ${markerPositions[i]} w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-white text-sm md:text-base font-bold hidden lg:flex`}
                  style={{
                    background: 'rgba(134, 146, 107, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {item.num}
                </div>
              ))}
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

export default HowItWorksSection
