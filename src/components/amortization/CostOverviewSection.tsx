import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const bulletItems = ['gridElectricity', 'solarPower'] as const

const CostOverviewSection = async () => {
  const t = await getTranslations('amortization')

  return (
    <section className="relative bg-[#FDFFF5] overflow-hidden">
      <div className="max-w-[1161px] mx-auto px-4 sm:px-6 py-[50px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center w-full">
            {t('costOverview.title')}
          </h2>

          <div className="flex flex-col lg:flex-row items-center gap-[50px] w-full">
            <div className="flex flex-col gap-10 lg:w-[584px]">
              <p className="text-[#062E25]/80 text-base md:text-[22px] font-light tracking-[-0.02em] text-justify">
                {t('costOverview.description')}
              </p>

              <div className="flex flex-col gap-5 max-w-[473px]">
                {bulletItems.map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <div
                      className="w-[13px] h-[13px] shrink-0 border-[1.5px] border-[#036B53]"
                      style={{ borderRadius: '5px 0px 5px 0px' }}
                    />
                    <span className="text-[#062E25]/80 text-lg tracking-[-0.02em]">
                      {t(`costOverview.items.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-5 lg:w-[527px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/light-bulb-with-pointer.png"
                alt=""
                width={100}
                height={114}
                className="mix-blend-multiply"
              />

              <div
                className="w-full rounded-[20px] border border-white/10 px-[31px] py-[22px]"
                style={{
                  background: '#EAEDDF',
                  backdropFilter: 'blur(26px)',
                  WebkitBackdropFilter: 'blur(26px)',
                }}
              >
                <p className="text-[#062E25]/80 text-base md:text-xl tracking-[-0.02em]">
                  {t('costOverview.infoCard')}
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

export default CostOverviewSection
