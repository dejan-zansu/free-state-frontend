import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { LinkButton } from '@/components/ui/link-button'

const NewsletterSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section
      className="relative w-full"
      style={{
        background: 'linear-gradient(181deg, rgba(243, 245, 233, 1) 8%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="flex flex-row">
        <div className="w-full lg:w-1/2">
          <div className="max-w-[916px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col items-center gap-[40px]">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
                {t('newsletter.title')}
              </h2>

              <div className="flex flex-col lg:flex-row gap-10 lg:gap-[98px] w-full">
                <div className="max-w-[380px]">
                  <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify whitespace-pre-line">
                    {t('newsletter.description')}
                  </p>
                </div>

                <div className="bg-white/10 border border-[#062E25]/40 rounded-2xl backdrop-blur-[20px] p-6 md:px-8 md:py-6 w-full lg:w-[436px]">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-[20px]">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                          {t('newsletter.form.firstName')}
                        </label>
                        <input
                          type="text"
                          className="bg-[#EAEDDF] border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-xs text-[#062E25]/20 w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                          {t('newsletter.form.lastName')}
                        </label>
                        <input
                          type="text"
                          className="bg-[#EAEDDF] border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-xs text-[#062E25]/20 w-full"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                        {t('newsletter.form.email')}
                      </label>
                      <input
                        type="email"
                        className="bg-[#EAEDDF] border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-xs text-[#062E25]/20 w-full"
                      />
                    </div>

                    <p className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                      {t('newsletter.form.privacy')}
                    </p>

                    <div className="flex flex-row items-start gap-[10px]">
                      <div className="w-[15px] h-[15px] border border-[#4A9A99] rounded-[3.75px] shrink-0 mt-0.5" />
                      <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                        {t('newsletter.form.consent')}
                      </span>
                    </div>

                    <p className="text-[#062E25]/60 text-xs font-normal tracking-[-0.02em]">
                      {t('newsletter.form.disclaimer')}
                    </p>

                    <LinkButton variant="tertiary" href="/contact">
                      {t('newsletter.form.submit')}
                    </LinkButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/images/bidirectional-charging/newsletter-right-419b0b.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
