'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem } from '@/components/ui/faq-item'

const itemKeys = ['inspection', 'measurements', 'repairs'] as const

const ServicePricingSection = () => {
  const t = useTranslations('service')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = [
    {
      question: t('pricing.expanded.label'),
      answer: t('pricing.expanded.description'),
    },
    ...itemKeys.map(key => ({
      question: t(`pricing.items.${key}`),
      answer: '',
    })),
  ]

  return (
    <section
      className="relative w-full overflow-hidden rounded-t-[40px]"
      style={{
        border: '1px solid #63836F',
        background:
          'linear-gradient(0deg, rgba(242, 244, 232, 0.00) 17.55%, #F2F4E8 91.75%), rgba(168, 200, 193, 0.40)',
      }}
    >
      <div className="relative z-10 max-w-[889px] mx-auto px-4 sm:px-6 py-12 md:py-[51px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em] text-center">
            {t('pricing.title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            {items.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
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

export default ServicePricingSection
