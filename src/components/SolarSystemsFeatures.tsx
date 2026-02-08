import HandIcon from '@/components/icons/HandIcon'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const SolarSystemsFeatures = async () => {
  const t = await getTranslations('solarSystems')

  const features = [
    {
      key: 'highEfficiency',
      icon: HandIcon,
    },
    {
      key: 'seamlessIntegration',
      icon: HandIcon,
    },
    {
      key: 'longLifespan',
      icon: HandIcon,
    },
    {
      key: 'suitableRoofs',
      icon: HandIcon,
    },
  ]

  return (
    <section className="relative bg-[#FDFFF5]">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-0">
          <div className="flex flex-col gap-12 lg:gap-16 max-w-xl lg:max-w-[640px]">
            <div className="flex flex-col gap-5">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-none tracking-tight">
                {t('features.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-relaxed tracking-tight">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
              {features.map((feature) => (
                <div key={feature.key} className="flex items-center gap-5">
                  <div className="flex-shrink-0 w-[71px] h-[71px] rounded-full bg-[#062E25] flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-[#B7FE1A]" />
                  </div>
                  <span className="text-[#062E25]/80 text-lg lg:text-[22px] font-medium leading-tight tracking-tight whitespace-pre-line">
                    {t(`features.items.${feature.key}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 xl:w-[55%] aspect-[733/402] lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
            <Image
              src="/images/battery-storage/home-with-battery-storage.png"
              alt={t('features.title')}
              fill
              className="object-contain"
              quality={100}
            />
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

export default SolarSystemsFeatures
