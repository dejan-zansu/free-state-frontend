import HeroNavLight from '@/components/HeroNavLight'
import { getLocale, getTranslations } from 'next-intl/server'

const HeatPumpsHero = async () => {
  const t = await getTranslations('heatPumps')
  const locale = await getLocale()

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#EBEDDF]">
      <HeroNavLight locale={locale} />
      <div
        className="hidden lg:block absolute right-40 top-44 w-60 h-60 rounded-full z-[1]"
        style={{
          backgroundColor: 'rgba(183, 254, 26, 0.3)',
          filter: 'blur(180px)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-40 sm:pt-48 lg:pt-64 pb-8 lg:pb-0">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-0">
          <div className="flex flex-col gap-4 sm:gap-5 max-w-lg">
            <div
              className="flex items-center justify-center px-4 py-2.5 rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-xs sm:text-sm md:text-base font-medium text-center tracking-tight">
                {t('hero.eyebrow')}
              </span>
            </div>

            <h1 className="text-[#17302A] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-none tracking-tight">
              {t('hero.title')}
            </h1>

            <p className="text-[#17302A]/80 text-base sm:text-lg md:text-xl font-normal leading-relaxed tracking-tight">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Image placeholder */}
          <div className="relative w-full lg:w-1/2 xl:w-[55%] aspect-[767/476] lg:absolute lg:right-0 lg:top-44 bg-[#D9D9D9] rounded-lg flex items-center justify-center">
            <span className="text-[#062E25]/40 text-sm">Image placeholder</span>
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

      <div className="hidden lg:block h-96" />
    </section>
  )
}

export default HeatPumpsHero
