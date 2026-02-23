import { getTranslations } from 'next-intl/server'

const steps = [
  { num: '01', key: 'strategicPlanning', position: 'top' },
  { num: '02', key: 'feasibilityStudy', position: 'bottom' },
  { num: '03', key: 'designEngineering', position: 'top' },
  { num: '04', key: 'tenderPreparation', position: 'bottom' },
  { num: '05', key: 'siteConstruction', position: 'top' },
  { num: '06', key: 'operationMaintenance', position: 'bottom' },
] as const

const GeneralContractorSection = async () => {
  const t = await getTranslations('solarCarport')

  return (
    <section
      className="relative overflow-hidden py-12 md:py-16"
      style={{
        background:
          'linear-gradient(180deg, rgba(59, 46, 88, 1) 47%, rgba(31, 25, 41, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '266px',
          height: '266px',
          left: '50%',
          top: '-130px',
          transform: 'translateX(-50%)',
          background: '#D9D9D9',
          filter: 'blur(544px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[972px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 mb-10 md:mb-16">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('generalContractor.title')}
          </h2>
          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center">
            {t('generalContractor.subtitle')}
          </p>
        </div>

        <div className="hidden lg:grid grid-cols-6 gap-x-4 items-end">
          {steps.map((step) => (
            <div
              key={step.num}
              className={`flex flex-col items-center gap-5 ${step.position === 'bottom' ? 'mt-[120px]' : ''}`}
            >
              {step.position === 'bottom' && (
                <span className="text-white/80 text-xl md:text-[26px] font-medium tracking-[-0.02em] text-center">
                  {t(`generalContractor.steps.${step.key}`)}
                </span>
              )}
              <div className="w-[51px] h-[50px] rounded-full bg-[#9F3E4F] flex items-center justify-center">
                <span className="text-white/80 text-xl font-normal tracking-[-0.02em] uppercase">
                  {step.num}
                </span>
              </div>
              {step.position === 'top' && (
                <span className="text-white/80 text-xl md:text-[26px] font-medium tracking-[-0.02em] text-center">
                  {t(`generalContractor.steps.${step.key}`)}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:hidden">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center gap-4">
              <div className="w-[51px] h-[50px] rounded-full bg-[#9F3E4F] flex items-center justify-center shrink-0">
                <span className="text-white/80 text-xl font-normal tracking-[-0.02em] uppercase">
                  {step.num}
                </span>
              </div>
              <span className="text-white/80 text-xl font-medium tracking-[-0.02em]">
                {t(`generalContractor.steps.${step.key}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GeneralContractorSection
