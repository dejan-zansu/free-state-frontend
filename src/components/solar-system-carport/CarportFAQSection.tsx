'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const faqKeys = [
  'installationTime',
  'subsidies',
  'electricityProduction',
  'evCharging',
  'energyStorage',
] as const

const CarportFAQSection = () => {
  const t = useTranslations('solarSystemCarport.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative overflow-hidden rounded-t-[40px] border-t border-[#63836F]">
      <div className="absolute inset-0">
        <Image
          src="/images/carport-faq-bg.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(168,200,193,0.4)]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(7, 51, 42, 0) 0%, rgba(7, 51, 42, 1) 86%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-8 py-12 md:py-[51px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            {faqKeys.map((key, index) => (
              <div
                key={key}
                className="bg-[rgba(123,135,126,0.32)] border border-[rgba(246,246,246,0.4)] backdrop-blur-[70px] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-[30px] py-[30px] flex items-center justify-between gap-[50px] text-left"
                >
                  <span className="text-white/80 text-lg">
                    {t(`items.${key}.question`)}
                  </span>
                  <span
                    className={cn(
                      'flex items-center justify-center w-[25px] h-[24px] shrink-0 rounded-sm bg-[#B7FE1A] text-[#062E25] text-lg font-medium transition-transform',
                      openIndex === index && 'rotate-45'
                    )}
                  >
                    +
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-[30px] pb-[30px]">
                    <div className="border-t border-[rgba(246,246,246,0.2)] pt-5">
                      <p className="text-white/80 text-base font-light">
                        {t(`items.${key}.answer`)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CarportFAQSection
