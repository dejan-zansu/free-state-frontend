import { CheckIcon } from '@/components/icons'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const EvChargingSection = async () => {
  const t = await getTranslations('solarSystemCarport')

  const advantages = [
    t('evCharging.advantages.freeRefueling'),
    t('evCharging.advantages.co2Neutral'),
    t('evCharging.advantages.convenientCharging'),
  ]

  return (
    <section
      className="relative overflow-hidden py-12 md:py-[50px]"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div className="absolute -left-[123px] top-[74px] w-[568px] h-[568px] rounded-full bg-[rgba(183,254,26,0.14)] blur-[490px]" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="relative w-full lg:w-[688px] h-[400px] sm:h-[500px] lg:h-[594px] shrink-0">
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none"
              style={{
                width: '442px',
                height: '442px',
                borderRadius: '442px',
                background: 'rgba(183, 254, 26, 0.14)',
                filter: 'blur(85px)',
              }}
            />
            <Image
              src="/images/ev-charging-station.png"
              alt={t('evCharging.title')}
              fill
              className="object-contain"
            />
          </div>

          <div className="flex flex-col gap-[30px] max-w-[554px]">
            <div className="flex flex-col gap-5">
              <span className="inline-flex self-start items-center justify-center px-4 py-[10px] h-[35px] rounded-[20px] border border-[#062E25] bg-white/20 backdrop-blur-[65px] text-[#062E25] text-base font-light">
                {t('evCharging.eyebrow')}
              </span>
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
                {t('evCharging.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light max-w-[507px]">
                {t('evCharging.description')}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <p className="text-[#062E25]/80 text-xl md:text-[26px] font-bold">
                {t('evCharging.advantagesTitle')}
              </p>
              <div className="flex flex-col gap-5">
                {advantages.map((item, index) => (
                  <div key={index} className="flex items-center gap-[10px]">
                    <CheckIcon className="w-5 h-5 shrink-0 text-[#295823]" />
                    <p className="text-[#062E25]/80 text-lg md:text-[22px] font-medium">
                      {item}
                    </p>
                  </div>
                ))}
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

export default EvChargingSection
