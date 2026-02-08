import LongArrow from '@/components/icons/LongArrow'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const BatteryStorageRevenue = async () => {
  const t = await getTranslations('batteryStorage')

  const steps = [
    {
      key: 'solar',
      image: '/images/battery-storage/roof-with-solar-panels.png',
    },
    {
      key: 'storage',
      image: '/images/battery-storage/battery-storage.png',
    },
    {
      key: 'smartDispatch',
      image: '/images/battery-storage/smart-dispatch.png',
    },
    {
      key: 'revenue',
      image: '/images/battery-storage/revenue.png',
    },
  ]

  return (
    <section className="bg-[#FDFFF5] py-10 md:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:gap-5 mb-10 md:mb-12 lg:mb-14 max-w-3xl mx-auto">
          <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-center">
            {t('revenue.title')}
          </h2>
          <p className="text-[#062E25]/80 text-base sm:text-lg md:text-xl font-normal leading-relaxed tracking-tight text-center">
            {t('revenue.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
          {steps.map(step => (
            <div
              key={step.key}
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border border-[#062E25] bg-white"
            >
              <Image
                src={step.image}
                alt={t(`revenue.steps.${step.key}.title`)}
                width={176}
                height={176}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 md:mt-6 bg-[#062E25] rounded-full h-14 md:h-16 lg:h-18 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-center relative">
          {steps.map(step => (
            <span
              key={step.key}
              className="text-[#B7FE1A]/80 text-xs sm:text-sm md:text-base lg:text-xl font-medium tracking-tight text-center"
            >
              {t(`revenue.steps.${step.key}.title`)}
            </span>
          ))}
          <LongArrow className="hidden lg:block absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
          <LongArrow className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
          <LongArrow className="hidden lg:block absolute left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
        </div>

        <div className="mt-4 md:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map(step => (
            <p
              key={step.key}
              className="text-[#062E25]/80 text-xs sm:text-sm md:text-base font-medium leading-snug tracking-tight text-center"
            >
              {t(`revenue.steps.${step.key}.description`)}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BatteryStorageRevenue
