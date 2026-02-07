import { getTranslations } from 'next-intl/server'

const HeatPumpsFeatures = async () => {
  const t = await getTranslations('heatPumps')

  const features = [
    { key: 'exceptionalEfficiency' },
    { key: 'lowerOperatingCosts' },
    { key: 'heatingCooling' },
    { key: 'futureTechnology' },
  ]

  return (
    <section className="relative bg-[#EAEDDF] py-10 md:py-12 lg:py-14">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-center mb-8 md:mb-10 lg:mb-14">
          {t('features.title')}
        </h2>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-stretch">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-1/2">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="bg-[#FDFFF5] border border-[#062E25] rounded-xl p-3 sm:p-4 md:p-5 flex flex-col items-center text-center gap-2 sm:gap-3"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-[#B7FE1A] flex items-center justify-center flex-shrink-0" />

                <div className="flex flex-col gap-1 sm:gap-2">
                  <h3 className="text-[#062E25] text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-tight">
                    {t(`features.items.${feature.key}.title`)}
                  </h3>
                  <p className="text-[#062E25]/80 text-xs sm:text-sm md:text-base font-medium leading-snug tracking-tight">
                    {t(`features.items.${feature.key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full w-full rounded-xl overflow-hidden bg-[#D9D9D9] flex items-center justify-center">
              <span className="text-[#062E25]/40 text-sm">Image placeholder</span>
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

export default HeatPumpsFeatures
