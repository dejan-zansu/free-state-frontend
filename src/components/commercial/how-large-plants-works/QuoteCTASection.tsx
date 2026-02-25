import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const checklistItems = ['investmentCosts', 'subsidies', 'efficiency'] as const

const QuoteCTASection = async () => {
  const t = await getTranslations('howLargePlantsWorks')

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24"
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
          top: '-156px',
          transform: 'translateX(-50%)',
          background: '#D9D9D9',
          filter: 'blur(544px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5 w-full">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-white text-base font-light tracking-[-0.02em]">
                {t('quoteCTA.eyebrow')}
              </span>
            </div>

            <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize">
              {t('quoteCTA.title')}
            </h2>
          </div>

          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[519px]">
            {t('quoteCTA.description')}
          </p>

          <div className="flex flex-col items-center gap-5">
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
              {checklistItems.map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-[13px] h-[13px] rotate-45 border-[1.5px] border-[#9F3E4F] shrink-0" />
                  <span className="text-white/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`quoteCTA.checklist.${item}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <LinkButton href="/solar-calculator" variant="outline-secondary">
              {t('quoteCTA.cta')}
            </LinkButton>
            <p className="text-white/80 text-base font-light tracking-[-0.02em] text-center">
              {t('quoteCTA.ctaSubtext')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuoteCTASection
