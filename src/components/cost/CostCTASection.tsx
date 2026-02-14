import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'
import LeafIcon from '../icons/LeafIcon'

const items = ['investmentCosts', 'subsidies', 'efficiency'] as const

const CostCTASection = async () => {
  const t = await getTranslations('cost')

  return (
    <section className="relative w-full min-h-[751px] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '40px',
          top: '-256px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 pt-[102px] pb-12">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="flex flex-col items-center gap-10 w-full">
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
                      {t('cta.topButton')}
                    </span>
                  </div>

                  <h2 className="text-[#062E25] text-4xl sm:text-5xl lg:text-[65px] font-medium leading-[103%] text-center capitalize w-full">
                    {t('cta.heading')}
                  </h2>
                </div>
              </div>

              <p className="text-[#062E25]/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em] text-center max-w-[519px]">
                {t('cta.subtitle')}
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 max-w-[503px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-10 w-full">
                {items.slice(0, 2).map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <LeafIcon className="w-[13px] h-[13px] text-[#036B53] shrink-0" />
                    <span className="text-[#062E25]/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                      {t(`cta.items.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <LeafIcon className="w-[13px] h-[13px] text-[#036B53] shrink-0" />
                <span className="text-[#062E25]/80 text-base md:text-[22px] font-medium tracking-[-0.02em]">
                  {t(`cta.items.${items[2]}`)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <LinkButton
              variant="tertiary"
              href={t('cta.ctaLink') as '/solar-abo-calculator'}
            >
              {t('cta.ctaText')}
            </LinkButton>

            <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] text-center">
              {t('cta.note')}
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

export default CostCTASection
