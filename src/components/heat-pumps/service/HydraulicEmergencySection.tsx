import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HydraulicEmergencySection = async () => {
  const t = await getTranslations('heatPumpsService')

  const items = [
    'circulationPump',
    'dripping',
    'noWaterPressure',
    'waterOnGround',
    'noUnderfloor',
  ]

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row-reverse">
        <div
          className="relative w-full lg:w-1/2 py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[409px] mx-auto lg:mr-auto lg:ml-[80px]">
            <div className="flex flex-col gap-5 mb-5">
              <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium">
                {t('hydraulic.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
                {t('hydraulic.subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mb-5">
              {items.map((key, index) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] rounded-[9px] border-[1.5px] border-[#036B53] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#062E25] text-[9px] font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                    {t(`hydraulic.items.${key}`)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[#062E25]/80 text-[17px] tracking-[-0.02em]">
              {t('hydraulic.footer')}
            </p>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-20"
            style={{
              background:
                'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
            }}
          />
        </div>

        <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[488px]">
          <Image
            src="/images/heat-pumps/heating-or-water-system.png"
            alt={t('hydraulic.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default HydraulicEmergencySection
