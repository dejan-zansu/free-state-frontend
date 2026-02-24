'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem } from '@/components/ui/faq-item'
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
              <FAQItem
                key={key}
                question={t(`items.${key}.question`)}
                answer={t(`items.${key}.answer`)}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                variant="dark"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CarportFAQSection
