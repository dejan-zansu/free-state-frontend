'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
import { FAQItem } from '@/components/ui/faq-item'

const steps = ['propertySearch', 'projectDevelopment', 'building', 'commissioning', 'result'] as const

const OurApproachSection = () => {
  const t = useTranslations('projectDevelopment')
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="relative min-h-[872px] overflow-hidden">
      <div className="absolute inset-0 rounded-t-[40px] overflow-hidden">
        <Image
          src="/images/commercial/project-development/our-approach-bg-5dbca8.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{ background: 'rgba(168, 200, 193, 0.4)' }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px]"
        style={{
          background:
            'linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 92%)',
        }}
      />
      <div
        className="absolute inset-0 rounded-t-[40px] border border-[#63836F]"
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('approach.title')}
          </h2>

          <div className="flex flex-col gap-5 w-full max-w-[652px]">
            {steps.map((step, i) => (
              <FAQItem
                key={step}
                question={t(`approach.steps.${step}.title`)}
                answer={t(`approach.steps.${step}.description`)}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                iconClassName="text-white border-white"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurApproachSection
