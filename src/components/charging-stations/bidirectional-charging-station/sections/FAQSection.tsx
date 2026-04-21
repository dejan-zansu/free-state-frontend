'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem } from '@/components/ui/faq-item'

const faqKeys = [
  'whatIs',
  'benefits',
  'advantages',
  'batteryHarm',
  'evCompatibility',
  'savings',
  'rangeLimit',
  'requirements',
  'specialChargers',
  'warranty',
  'legalSwiss',
  'financialSupport',
] as const

const FAQSection = () => {
  const t = useTranslations('bidirectionalChargingStation.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full overflow-hidden -mt-[40px] pb-16">
      <div
        className="absolute inset-x-0 top-[1px] bottom-0 rounded-t-[40px] overflow-hidden border border-[#63836F] border-b-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(7, 51, 42, 0) 0%, rgba(7, 51, 42, 1) 86%),
            linear-gradient(0deg, rgba(168, 200, 193, 0.4), rgba(168, 200, 193, 0.4)),
            url(/images/bidirectional-charging/faq-bg-f4be9d.webp)
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-8 pt-[51px] pb-[51px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            {faqKeys.map((key, index) => (
              <FAQItem
                key={key}
                question={t(`items.${key}.question`)}
                answer={t(`items.${key}.answer`)}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
