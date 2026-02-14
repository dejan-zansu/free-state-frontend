import { LinkButton } from '@/components/ui/link-button'
import LeafIcon from '@/components/icons/LeafIcon'
import { getTranslations } from 'next-intl/server'

const row1Keys = ['independent', 'electricityBill', 'propertyValue'] as const
const row2Keys = ['subsidies', 'taxBill', 'sellExcess'] as const

const AmortizationCTASection = async () => {
  const t = await getTranslations('amortization')

  return (
    <section className="relative w-full overflow-hidden pt-[40px]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 pt-[100px] pb-[60px]">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div
                className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25]"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(65px)',
                  WebkitBackdropFilter: 'blur(65px)',
                }}
              >
                <span className="text-[#062E25] text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                  {t('cta.eyebrow')}
                </span>
              </div>

              <h2 className="text-[#062E25] text-4xl sm:text-5xl lg:text-[65px] font-medium leading-[103%] text-center capitalize w-full">
                {t('cta.heading')}
              </h2>
            </div>

            <div className="flex flex-col items-center gap-5 max-w-[1032px]">
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-5 sm:gap-x-[60px] sm:gap-y-5">
                {row1Keys.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <LeafIcon className="w-[13px] h-[13px] text-[#036B53] shrink-0" />
                    <span className="text-[#062E25]/80 text-base md:text-lg tracking-[-0.02em]">
                      {t(`cta.items.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-5 sm:gap-x-[60px] sm:gap-y-5">
                {row2Keys.map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <LeafIcon className="w-[13px] h-[13px] text-[#036B53] shrink-0" />
                    <span className="text-[#062E25]/80 text-base md:text-lg tracking-[-0.02em]">
                      {t(`cta.items.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <LinkButton variant="tertiary" href={t('cta.ctaLink') as '/cost'}>
            {t('cta.ctaText')}
          </LinkButton>
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

export default AmortizationCTASection
