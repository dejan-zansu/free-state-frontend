import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const SolarSystemsModules = async () => {
  const t = await getTranslations('solarSystems')

  return (
    <section className="relative bg-[#FDFFF5]">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-0">
          <div className="flex flex-col gap-12 lg:gap-16 max-w-xl lg:max-w-[640px]">
            <div className="flex flex-col items-center lg:items-start gap-5 text-center lg:text-left">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-none tracking-tight">
                {t('modules.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-relaxed tracking-tight">
                {t('modules.subtitle')}
              </p>
            </div>

            <div className="relative rounded-xl bg-[#B7FE1A] border border-[#062E25] p-8 lg:p-10">
              <p className="text-[#062E25]/80 text-lg lg:text-[22px] font-normal leading-relaxed tracking-tight">
                {t('modules.description')}
              </p>
            </div>
          </div>

          <div className="relative w-full lg:w-1/2 xl:w-[45%] aspect-[530/429] lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
            <Image
              src="/images/two-solar-panels-on-roof.png"
              alt={t('modules.title')}
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

export default SolarSystemsModules
