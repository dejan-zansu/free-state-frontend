'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem } from '@/components/ui/faq-item'

const faqKeys = [
  'preEquipped',
  'acDc',
  'billing',
  'homeCharging',
  'fleetOverload',
  'taxBreaks',
] as const

const FAQSection = () => {
  const t = useTranslations('chargingStationsCompany.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative w-full overflow-hidden pb-[40px]">
      <div
        className="absolute inset-x-0 top-[1px] bottom-0 rounded-t-[40px] overflow-hidden border border-[#63836F] border-b-0"
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(86, 73, 112, 0) 0%, rgba(86, 73, 112, 1) 86%),
            linear-gradient(0deg, rgba(180, 168, 200, 0.4), rgba(180, 168, 200, 0.4)),
            url(/images/charging-stations/company/faq-bg-company-133979.png)
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
                iconClassName="text-white border-white"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
