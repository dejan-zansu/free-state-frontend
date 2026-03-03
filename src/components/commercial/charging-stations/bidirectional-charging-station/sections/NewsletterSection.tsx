'use client'

import { NewsletterForm } from '@/components/ui/newsletter-form'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const NewsletterSection = () => {
  const t = useTranslations('bidirectionalChargingStation.newsletter')

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
                {t('title')}
              </h2>

              <div className="flex flex-col lg:flex-row gap-10 lg:gap-[98px] w-full">
                <div className="max-w-[380px]">
                  <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify whitespace-pre-line">
                    {t('description')}
                  </p>
                </div>

                <NewsletterForm className="bg-white/10 border border-[#062E25]/40 rounded-2xl backdrop-blur-[20px] p-6 md:px-8 md:py-6 w-full lg:w-[436px]" />
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
