import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const InstallationSection = async () => {
  const t = await getTranslations('howItWorks')

  return (
    <section className="bg-[#FDFFF5] py-12 md:py-[50px] md:pb-[90px]">
      <div className="max-w-[1218px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-12 md:gap-[50px]">
          <div className="flex flex-col items-center gap-12 md:gap-[50px] max-w-[942px]">
            <div className="flex flex-col items-center gap-5 max-w-[662px] text-center">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em]">
                {t('installation.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg md:text-[22px]">
                {t('installation.subtitle')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 md:gap-[60px] max-w-[844px]">
              <p className="text-[#062E25]/80 text-lg md:text-[22px] text-center">
                {t('installation.description')}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-5">
            <div className="relative w-full rounded-[12px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#062E25] via-[#139477]/0 to-transparent rounded-[12px]" />

              <div className="relative m-[1px] ml-[0.5px] rounded-[11px] p-8 md:p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#B7FE1A] to-transparent" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-[120px]">
                  <div className="flex flex-col gap-5 lg:max-w-[519px]">
                    <h3 className="text-[#062E25]/80 text-lg md:text-[22px] font-bold">
                      {t('installation.maintenance.title')}
                    </h3>
                    <p className="text-[#062E25]/80 text-lg md:text-[22px]">
                      {t('installation.maintenance.description')}
                    </p>
                  </div>

                  <div className="relative w-full lg:w-[487px] h-[300px] md:h-[400px] lg:h-[462px] shrink-0">
                    <Image
                      src="/images/solar-system-installation.png"
                      alt="Solar system installation"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[#062E25]/80 text-sm md:text-base leading-[1.56] tracking-[-0.02em] text-center max-w-[1127px]">
              {t('installation.bottomNote')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InstallationSection
