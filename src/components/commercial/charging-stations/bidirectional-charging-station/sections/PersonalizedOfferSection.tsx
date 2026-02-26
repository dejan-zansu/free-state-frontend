import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const PersonalizedOfferSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  const radioOptions = ['option1', 'option2', 'option3'] as const

  return (
    <section
      className="relative py-12 md:py-16"
      style={{
        background: 'linear-gradient(181deg, rgba(243, 245, 233, 1) 8%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[916px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[40px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('personalizedOffer.title')}
          </h2>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[100px] w-full">
            <div className="max-w-[380px]">
              <div className="flex flex-col gap-[20px]">
                <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify">
                  {t('personalizedOffer.description')}
                </p>
                <p className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em] text-justify">
                  {t('personalizedOffer.callToAction')}
                </p>
              </div>
            </div>

            <div className="bg-white/10 border border-[#062E25]/40 rounded-2xl backdrop-blur-[20px] p-6 md:px-9 md:py-6 w-full lg:w-[436px]">
              <div className="flex flex-col gap-4">
                <h3 className="text-[#062E25] text-[22px] font-bold tracking-[-0.02em]">
                  {t('personalizedOffer.form.title')}
                </h3>
                <p className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                  {t('personalizedOffer.form.question')}
                </p>
                <div className="flex flex-col gap-[7px]">
                  {radioOptions.map((option) => (
                    <div key={option} className="flex flex-row items-center gap-[10px]">
                      <div className="w-[15px] h-[15px] rounded-full border border-[#4A9A99] shrink-0" />
                      <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                        {t(`personalizedOffer.form.options.${option}`)}
                      </span>
                    </div>
                  ))}
                </div>
                <LinkButton variant="quaternary" href="/contact">
                  {t('personalizedOffer.form.submit')}
                </LinkButton>
              </div>
            </div>
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

export default PersonalizedOfferSection
