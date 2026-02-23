import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const TaxDeductionSection = async () => {
  const t = await getTranslations('heatPumpsCost')

  return (
    <section
      className="relative"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="flex flex-col gap-5 max-w-[581px]">
            <div
              className="flex items-center justify-center px-4 py-2.5 rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-sm md:text-base font-light tracking-[-0.02em]">
                {t('taxDeduction.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium">
              {t('taxDeduction.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('taxDeduction.description')}
            </p>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0">
            <Image
              src="/images/heat-pumps-cost/tax-deduction-illustration.svg"
              alt={t('taxDeduction.title')}
              width={257}
              height={304}
              className="w-full max-w-[257px] mx-auto h-auto"
            />
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

export default TaxDeductionSection
