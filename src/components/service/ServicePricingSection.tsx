import CheckIcon from '@/components/icons/CheckIcon'
import { ChevronRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const itemKeys = ['inspection', 'measurements', 'repairs'] as const

const ServicePricingSection = async () => {
  const t = await getTranslations('service')

  return (
    <section className="relative w-full min-h-[710px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/service/service-pricing-bg-33c36c.png')" }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(168, 200, 193, 0.4)' }} />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 92%)',
        }}
      />

      <div className="relative z-10 max-w-[889px] mx-auto px-4 sm:px-6 py-12 md:py-[51px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em] text-center">
            {t('pricing.title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            <div
              className="relative rounded-[16px] overflow-hidden"
              style={{
                background: 'rgba(198, 213, 202, 0.32)',
                border: '1px solid rgba(246, 246, 246, 0.7)',
                backdropFilter: 'blur(70px)',
                WebkitBackdropFilter: 'blur(70px)',
              }}
            >
              <div className="flex flex-col gap-5 p-6 sm:p-[30px]">
                <div className="flex items-center justify-between gap-5">
                  <span className="text-[#062E25]/80 text-base md:text-lg tracking-[-0.02em]">
                    {t('pricing.expanded.label')}
                  </span>
                  <div className="flex items-center justify-center w-[25px] h-[24px] rounded-full bg-[#B7FE1A] shrink-0">
                    <CheckIcon className="w-[11px] h-[11px] text-[#036B53]" />
                  </div>
                </div>

                <div className="h-px" style={{ background: 'rgba(50, 83, 74, 0.2)' }} />

                <p className="text-[#062E25]/80 text-sm md:text-base font-light tracking-[-0.02em]">
                  {t('pricing.expanded.description')}
                </p>
              </div>
            </div>

            {itemKeys.map(key => (
              <div
                key={key}
                className="relative rounded-[16px] overflow-hidden"
                style={{
                  background: 'rgba(198, 213, 202, 0.32)',
                  border: '1px solid rgba(246, 246, 246, 0.7)',
                  backdropFilter: 'blur(70px)',
                  WebkitBackdropFilter: 'blur(70px)',
                }}
              >
                <div className="flex items-center justify-between gap-5 p-6 sm:p-[30px]">
                  <span className="text-[#062E25]/80 text-base md:text-lg tracking-[-0.02em]">
                    {t(`pricing.items.${key}`)}
                  </span>
                  <div className="flex items-center justify-center w-[25px] h-[24px] rounded-full bg-[#B7FE1A] shrink-0">
                    <ChevronRight className="w-[8px] h-[8px] text-[#036B53]" strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background: 'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default ServicePricingSection
