import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const WhatIsEnergyStorageSection = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <section className="relative overflow-hidden bg-[#EAEDDF]">
      <div className="relative z-10 max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-[60px]">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[160px]">
          <div className="flex flex-col gap-5 max-w-[561px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                {t('whatIs.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium">
              {t('whatIs.title')}
            </h2>

            <p className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em]">
              {t('whatIs.description')}
            </p>
          </div>

          <div className="relative w-full max-w-[410px] aspect-[410/388] rounded-[20px] overflow-hidden shrink-0">
            <Image
              src="/images/energy-storage-what-is-5da9ac.png"
              alt={t('whatIs.title')}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatIsEnergyStorageSection
