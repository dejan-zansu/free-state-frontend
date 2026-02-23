import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const steps = ['1', '2', '3'] as const

const HowHeatPumpWorksSection = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div
          className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[436px] flex flex-col gap-5">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('howHeatPumpWorks.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('howHeatPumpWorks.description')}
            </p>

            <div className="flex flex-col gap-[10px] mt-4">
              {steps.map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="w-[18px] h-[18px] flex items-center justify-center rounded-[9px] border-[1.5px] border-[#036B53] text-[#062E25] text-[9px] font-bold">
                    {step}
                  </span>
                  <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                    {t(`howHeatPumpWorks.steps.${step}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/487]">
          <Image
            src="/images/heat-pumps-with-solar-system/heat-pump-solar-diagram-749664.png"
            alt={t('howHeatPumpWorks.title')}
            fill
            className="object-cover"
          />
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

export default HowHeatPumpWorksSection
