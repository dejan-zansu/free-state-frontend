import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'
import LeafIcon from './icons/LeafIcon'

const items = ['investmentCosts', 'subsidies', 'efficiency'] as const

interface SolarCalculatorCTAProps {
  translationNamespace: string
  translationKey?: string
  dark?: boolean
}

const SolarCalculatorCTA = async ({
  translationNamespace,
  translationKey = 'cta',
  dark = false,
}: SolarCalculatorCTAProps) => {
  const t = await getTranslations(translationNamespace)

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: dark
            ? 'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)'
            : 'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
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

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 pt-[102px] pb-[60px]">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="flex flex-col items-center gap-10 w-full">
                <div className="flex flex-col items-center gap-5 w-full">
                  <div
                    className={`flex items-center justify-center px-4 py-[10px] rounded-[20px] border ${dark ? 'border-white/20' : 'border-[#062E25]'}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(65px)',
                      WebkitBackdropFilter: 'blur(65px)',
                    }}
                  >
                    <span
                      className={`text-base font-light text-center whitespace-nowrap ${dark ? 'text-white' : 'text-[#062E25]'}`}
                    >
                      {t(`${translationKey}.topButton`)}
                    </span>
                  </div>

                  <h2
                    className={`text-4xl sm:text-5xl lg:text-[65px] font-medium leading-[103%] text-center capitalize w-full ${dark ? 'text-white' : 'text-[#062E25]'}`}
                  >
                    {t(`${translationKey}.heading`)}
                  </h2>
                </div>
              </div>

              <p
                className={`text-base md:text-[22px] font-light leading-[1.27em] text-center max-w-[519px] ${dark ? 'text-white/80' : 'text-[#062E25]/80'}`}
              >
                {t(`${translationKey}.subtitle`)}
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 max-w-[503px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-10 w-full">
                {items.slice(0, 2).map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <LeafIcon
                      className={`w-[13px] h-[13px] shrink-0 ${dark ? 'text-[#B7FE1A]' : 'text-[#036B53]'}`}
                    />
                    <span
                      className={`text-base md:text-[22px] font-medium ${dark ? 'text-white/80' : 'text-[#062E25]/80'}`}
                    >
                      {t(`${translationKey}.items.${item}`)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <LeafIcon
                  className={`w-[13px] h-[13px] shrink-0 ${dark ? 'text-[#B7FE1A]' : 'text-[#036B53]'}`}
                />
                <span
                  className={`text-base md:text-[22px] font-medium ${dark ? 'text-white/80' : 'text-[#062E25]/80'}`}
                >
                  {t(`${translationKey}.items.${items[2]}`)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <LinkButton
              variant={dark ? 'primary' : 'tertiary'}
              href={t(`${translationKey}.ctaLink`) as '/solar-abo-calculator'}
            >
              {t(`${translationKey}.ctaText`)}
            </LinkButton>

            <p
              className={`text-base font-light text-center ${dark ? 'text-white/80' : 'text-[#062E25]/80'} pb-[40px]`}
            >
              {t(`${translationKey}.note`)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarCalculatorCTA
