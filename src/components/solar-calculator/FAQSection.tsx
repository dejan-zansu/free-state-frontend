'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqKeys = ['howItWorks', 'isFree', 'howQuickly', 'funding', 'roofSuitable'] as const

const FAQSection = () => {
  const t = useTranslations('solarCalculator.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative bg-[#062E25] py-16 md:py-24 rounded-t-[40px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center mb-12">
          {t('title')}
        </h2>

        <div className="max-w-[800px] mx-auto space-y-4">
          {faqKeys.map((key, index) => (
            <div
              key={key}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <h3 className="text-white text-base md:text-lg font-medium pr-4">
                  {t(`items.${key}.question`)}
                </h3>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-white/60 transition-transform flex-shrink-0',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-white/70 text-base font-light">
                    {t(`items.${key}.answer`)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
