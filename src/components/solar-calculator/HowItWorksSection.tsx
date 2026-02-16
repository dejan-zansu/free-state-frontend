import { getTranslations } from 'next-intl/server'

const steps = ['step1', 'step2', 'step3', 'step4'] as const

const HowItWorksSection = async () => {
  const t = await getTranslations('solarCalculator.howItWorks')

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center text-center gap-5 mb-16">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
            {t('title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light max-w-[500px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 max-w-[1100px] mx-auto">
          {steps.map((step) => (
            <div key={step} className="flex flex-col items-center text-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#B7FE1A] text-[#062E25] text-xl font-medium">
                {t(`steps.${step}.number`)}
              </div>
              <p className="text-[#062E25] text-base md:text-lg font-medium max-w-[220px]">
                {t(`steps.${step}.title`)}
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

export default HowItWorksSection
