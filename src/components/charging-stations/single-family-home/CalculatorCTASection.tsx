import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const CalculatorCTASection = async () => {
  const t = await getTranslations('chargingStationsSingleFamilyHome')

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-200px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '40px',
          top: '-232px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px]">
            <div className="flex flex-col items-center gap-5">
              <div
                className="flex items-center justify-center px-4 py-[10px] rounded-full border border-[#062E25] w-fit"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(65px)',
                }}
              >
                <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                  {t('calculator.eyebrow')}
                </span>
              </div>

              <h2 className="text-[#062E25] text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize">
                {t('calculator.title')}
              </h2>
            </div>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[682px]">
              {t('calculator.description')}
            </p>
          </div>

          <div className="flex flex-col items-center gap-5">
            <LinkButton variant="tertiary" href="/calculator">
              {t('calculator.ctaText')}
            </LinkButton>

            <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] text-center">
              {t('calculator.ctaSubtext')}
            </p>
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

export default CalculatorCTASection
