'use client'

import { NewsletterForm } from '@/components/ui/newsletter-form'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const NewsletterSection = () => {
  const t = useTranslations('bidirectionalChargingStation.newsletter')

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(181deg, rgba(243, 245, 233, 1) 8%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="relative z-10 max-w-[916px] mx-auto px-4 sm:px-6 lg:px-0 py-12 md:py-16 lg:pt-[50px] lg:pb-[130px]">
        <div className="flex flex-col items-center gap-[40px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[98px]">
            <div className="lg:w-[380px] lg:shrink-0 flex flex-col gap-[20px]">
              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] whitespace-pre-line">
                {t('description')}
              </p>
              <div className="relative w-full aspect-[380/280]">
                <Image
                  src="/images/bidirectional-charging/newsletter-right-419b0b.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <NewsletterForm className="flex items-center bg-white/10 border border-[#062E25]/40 rounded-2xl backdrop-blur-[20px] px-8 py-[26px] w-full lg:w-[436px] lg:h-[438px] lg:shrink-0" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
