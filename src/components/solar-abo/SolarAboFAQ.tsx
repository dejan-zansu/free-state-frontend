'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { FAQItem } from '@/components/ui/faq-item'

export interface SolarAboFAQProps {
  translationNamespace: string
}

const questions = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

const SolarAboFAQ = ({ translationNamespace }: SolarAboFAQProps) => {
  const t = useTranslations(translationNamespace)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/solar-free/faq-bg-4447e5.webp')`,
          borderTopRightRadius: '40px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(168, 200, 193, 0.4)',
          borderTopRightRadius: '40px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 92%)',
          borderTopRightRadius: '40px',
        }}
      />
      <div
        className="absolute inset-0 border border-[#63836F] pointer-events-none"
        style={{ borderTopRightRadius: '40px' }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-[100px]">
        <div className="flex flex-col items-center gap-10 sm:gap-[50px] max-w-[925px] mx-auto">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center tracking-tight">
            {t('faq.title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[749px]">
            {questions.map((key, index) => (
              <FAQItem
                key={key}
                question={t(`faq.items.${key}.question`)}
                answer={t(`faq.items.${key}.answer`)}
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

export default SolarAboFAQ
