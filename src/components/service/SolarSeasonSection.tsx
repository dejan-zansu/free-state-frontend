import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const SolarSeasonSection = async () => {
  const t = await getTranslations('service')

  return (
    <section className="relative w-full bg-[#EAEDDF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-12 md:py-[60px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[160px]">
          <div className="flex flex-col gap-5 max-w-[581px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                {t('solarSeason.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em]">
              {t('solarSeason.title')}
            </h2>

            <p className="text-[#062E25]/80 text-base md:text-[22px] font-light tracking-[-0.02em]">
              {t('solarSeason.description')}
            </p>
          </div>

          <div className="relative w-full lg:w-[410px] aspect-[410/388] shrink-0 rounded-[20px] overflow-hidden">
            <Image
              src="/images/service/service-solar-season.png"
              alt={t('solarSeason.title')}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarSeasonSection
