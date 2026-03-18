import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

export interface SolarAboPricingProps {
  translationNamespace: string
  backgroundImage?: string
}

const SolarAboPricing = async ({
  translationNamespace,
  backgroundImage = '/images/solar-abo-home-roof.png',
}: SolarAboPricingProps) => {
  const t = await getTranslations(translationNamespace)

  const rows = [
    {
      label: t('pricing.roofSize.label'),
      value: t('pricing.roofSize.value'),
    },
    {
      label: t('pricing.residents.label'),
      value: t('pricing.residents.value'),
    },
    {
      label: t('pricing.costPerM2.label'),
      value: t('pricing.costPerM2.value'),
    },
  ]

  return (
    <section
      className="relative w-full bg-[#F3F4EE] overflow-hidden bg-bottom bg-cover bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(229, 232, 216, 0) 12%, rgba(229, 232, 216, 1) 75%), linear-gradient(0deg, rgba(242, 243, 236, 0) 0%, rgba(242, 243, 236, 1) 92%), url('${backgroundImage}')`,
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-[50px] pb-16">
        <div className="flex flex-col items-center gap-5 max-w-[619px] mx-auto">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium text-center w-full">
            {t('pricing.title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-light text-center tracking-[-0.02em] w-full">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-16 w-full max-w-[433px]">
          <div
            className="rounded-2xl border border-[#062E25] overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="grid grid-cols-[auto_1fr]">
              {rows.map((row, index) => (
                <>
                  <div
                    key={`label-${index}`}
                    className="px-5 pt-6 pb-1 flex items-end"
                  >
                    <span className="text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em] whitespace-pre-line">
                      {row.label}
                    </span>
                  </div>
                  <div
                    key={`value-${index}`}
                    className="bg-[#E4E9D3] px-5 pt-6 pb-1 flex items-end border-l border-[#062E25]"
                    style={{
                      borderTopRightRadius: index === 0 ? '16px' : '0px',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    <span className="text-[#062E25]/80 text-lg italic font-normal tracking-[-0.02em]">
                      {row.value}
                    </span>
                  </div>
                </>
              ))}
            </div>

            <div
              className="px-5 py-5 flex items-center gap-6 sm:gap-10"
              style={{
                background:
                  'linear-gradient(150deg, rgba(176, 255, 0, 1) 0%, rgba(147, 213, 0, 1) 100%)',
              }}
            >
              <span className="text-[#062E25]/80 text-base sm:text-lg font-medium tracking-[-0.02em] max-w-[117px]">
                {t('pricing.costLabel')}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1 text-[#1F433B]/75 line-through decoration-2">
                  <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] uppercase">
                    {t('pricing.amount')}
                  </span>
                  <span className="text-sm sm:text-base font-semibold tracking-[-0.02em] uppercase">
                    {t('pricing.currency')}
                  </span>
                </div>
                <span className="text-[#1F433B] text-base sm:text-lg font-bold tracking-[-0.02em]">
                  {t('pricing.solarAboPrice')}
                </span>
              </div>
            </div>

            <div className="flex justify-center py-8">
              <LinkButton
                variant="tertiary"
                href={t('pricing.orderLink') as '/calculator'}
              >
                {t('pricing.orderNow')}
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarAboPricing
