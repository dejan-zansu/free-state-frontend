'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqKeys = ['howItWorks', 'isFree', 'howQuickly', 'funding', 'roofSuitable'] as const

const FAQSection = () => {
  const t = useTranslations('solarCalculator.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-x-0 top-[1px] bottom-0 rounded-t-[40px] overflow-hidden border border-[#63836F] border-b-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 92%),
            linear-gradient(0deg, rgba(168, 200, 193, 0.4), rgba(168, 200, 193, 0.4)),
            url(/images/solar-calculator-faq-section.png)
          `,
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
            {faqKeys.map((key, index) => {
              const isOpen = openIndex === index

              return (
                <button
                  key={key}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={cn(
                    'w-full rounded-2xl border text-left transition-all overflow-hidden',
                    'border-white/40'
                  )}
                  style={{
                    background: 'rgba(198, 213, 202, 0.32)',
                    backdropFilter: 'blur(70px)',
                    WebkitBackdropFilter: 'blur(70px)',
                  }}
                >
                  <div className="p-[30px]">
                    <div className="flex items-center justify-between gap-[50px]">
                      <h3 className="text-[#062E25]/80 text-base md:text-lg font-normal tracking-[-0.02em]">
                        {t(`items.${key}.question`)}
                      </h3>
                      <div className="flex items-center justify-center w-[25px] h-[24px] shrink-0 rounded-[6px] bg-[#B7FE1A] border border-[#036B53]/50">
                        {isOpen ? (
                          <Minus className="w-3 h-3 text-[#036B53]" strokeWidth={2.5} />
                        ) : (
                          <Plus className="w-3 h-3 text-[#036B53]" strokeWidth={2.5} />
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <>
                        <div className="mt-5 mb-5 h-px bg-[#30524A]/20" />
                        <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em]">
                          {t(`items.${key}.answer`)}
                        </p>
                      </>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
