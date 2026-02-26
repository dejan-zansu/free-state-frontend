'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqKeys = ['whatIs', 'benefits', 'advantages', 'batteryHarm', 'evCompatibility', 'savings', 'rangeLimit', 'requirements', 'specialChargers', 'warranty', 'legalSwiss', 'financialSupport'] as const

const FAQSection = () => {
  const t = useTranslations('bidirectionalChargingStation.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-x-0 top-[1px] bottom-0 rounded-t-[40px] overflow-hidden border border-[#8A7DAD] border-b-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(86, 73, 112, 0) 0%, rgba(86, 73, 112, 1) 86%),
            linear-gradient(0deg, rgba(180, 168, 200, 0.4), rgba(180, 168, 200, 0.4)),
            url(/images/bidirectional-charging/faq-bg-f4be9d.png)
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
                    background: 'rgba(123, 135, 126, 0.32)',
                    backdropFilter: 'blur(70px)',
                    WebkitBackdropFilter: 'blur(70px)',
                  }}
                >
                  <div className="p-[30px]">
                    <div className="flex items-center justify-between gap-[50px]">
                      <h3 className="text-white/80 text-base md:text-lg font-normal tracking-[-0.02em]">
                        {t(`items.${key}.question`)}
                      </h3>
                      <div className="flex items-center justify-center w-[25px] h-[24px] shrink-0 rounded-[6px] bg-[#3D3858] border border-[#3D3858]/50">
                        {isOpen ? (
                          <Minus className="w-3 h-3 text-white" strokeWidth={2.5} />
                        ) : (
                          <Plus className="w-3 h-3 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                    </div>

                    {isOpen && (
                      <>
                        <div className="mt-5 mb-5 h-px bg-white/20" />
                        <p className="text-white/80 text-base font-light tracking-[-0.02em]">
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
