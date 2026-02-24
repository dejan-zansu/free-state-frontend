'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem } from '@/components/ui/faq-item'

const faqKeys = [
  'howItWorks',
  'isFree',
  'howQuickly',
  'funding',
  'roofSuitable',
] as const

const FAQSection = () => {
  const t = useTranslations('solarCalculator.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full overflow-hidden -mt-[40px] rounded-t-[40px]">
      <div
        className="absolute -inset-1"
        style={{
          backgroundImage: 'url(/images/solar-calculator-faq-section.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-8 pt-[51px] pb-[51px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
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
                variant="light"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
