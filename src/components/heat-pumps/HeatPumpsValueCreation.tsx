import { getTranslations } from 'next-intl/server'

const HeatPumpsValueCreation = async () => {
  const t = await getTranslations('heatPumps')

  const steps = [
    { key: 'ambientEnergy' },
    { key: 'heatPumpSystem' },
    { key: 'smartDistribution' },
    { key: 'lowerCosts' },
  ]

  return (
    <section className="relative bg-[#FDFFF5] py-10 md:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:gap-5 mb-10 md:mb-12 lg:mb-14 max-w-3xl mx-auto">
          <h2 className="text-[#062E25] text-2xl sm:text-3xl md:text-4xl lg:text-[45px] font-medium leading-tight text-center">
            {t('valueCreation.title')}
          </h2>
          <p className="text-[#062E25]/80 text-base sm:text-lg md:text-[22px] font-normal leading-relaxed tracking-tight text-center">
            {t('valueCreation.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          {steps.map((step) => (
            <div key={step.key} className="flex flex-col items-center gap-4">
              {/* Circular image placeholder */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full border border-[#062E25] bg-[#D9D9D9] flex items-center justify-center">
                <span className="text-[#062E25]/40 text-xs">Image</span>
              </div>

              {/* Step title */}
              <h3 className="text-[#062E25]/80 text-lg md:text-[22px] font-medium leading-relaxed tracking-tight text-center">
                {t(`valueCreation.steps.${step.key}.title`)}
              </h3>

              {/* Step description */}
              <p className="text-[#062E25]/80 text-sm md:text-base font-medium leading-snug tracking-tight text-center">
                {t(`valueCreation.steps.${step.key}.description`)}
              </p>
            </div>
          ))}
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

export default HeatPumpsValueCreation
