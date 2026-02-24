'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FAQItem } from '@/components/ui/faq-item'

const faqKeys = [
  'whatIsRepowering',
  'whenWorthwhile',
  'whichComponents',
  'newInverter',
  'substructure',
  'heatPumpsEv',
  'howItWorks',
  'costsPayback',
  'legalRegulations',
  'subsidies',
  'existingKev',
  'kevExpiry',
  'feedInTariff',
  'optimalTime',
  'selfConsumption',
  'notBuiltByFreeState',
  'oldPanels',
  'taxBenefits',
  'addSolarAbo',
] as const

const RepoweringFAQSection = () => {
  const t = useTranslations('repowering.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative min-h-[782px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center rounded-t-[40px]"
        style={{
          backgroundImage: `url('/images/repowering-faq-bg-202695.png')`,
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background: 'rgba(168, 200, 193, 0.4)',
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background:
            'linear-gradient(0deg, rgba(7, 51, 42, 0) 16%, rgba(7, 51, 42, 1) 86%)',
        }}
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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

export default RepoweringFAQSection
