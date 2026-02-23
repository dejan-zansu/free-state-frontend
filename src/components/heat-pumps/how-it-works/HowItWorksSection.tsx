import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const steps = ['1', '2', '3'] as const

const markerPositions = [
  'left-[30%] top-[24%]',
  'left-[53%] top-[26%]',
  'left-[74%] top-[43%]',
] as const

const HowItWorksSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

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
              {t('howItWorks.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('howItWorks.subtitle')}
            </p>

            <div className="flex flex-col gap-[10px] mt-4">
              {steps.map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="w-[18px] h-[18px] flex items-center justify-center rounded-[9px] border-[1.5px] border-[#036B53] text-[#062E25] text-[9px] font-bold">
                    {step}
                  </span>
                  <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                    {t(`howItWorks.steps.${step}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/487]">
          <Image
            src="/images/heat-pumps/how-it-works/heat-pump-diagram-749664.png"
            alt={t('howItWorks.title')}
            fill
            className="object-cover"
          />
          {steps.map((step, i) => (
            <div
              key={step}
              className={`absolute ${markerPositions[i]} w-[29px] h-[29px] flex items-center justify-center rounded-[14.5px] backdrop-blur-[8.7px] text-white text-xs font-bold hidden lg:flex`}
              style={{
                background: 'rgba(182, 184, 178, 0.6)',
                border: '0.72px solid rgba(255, 255, 255, 0.7)',
              }}
            >
              {step}
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
