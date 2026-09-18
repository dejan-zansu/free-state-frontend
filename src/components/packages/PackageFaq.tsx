'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { FAQItem } from '@/components/ui/faq-item'

import { PACKAGE_FAQ_KEYS } from './types'

/** Questions buyers ask about a package, same accordion as the other FAQ sections of the site. */
export default function PackageFaq() {
  const t = useTranslations('packagePage.faq')
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="bg-[#EBEDDF]">
      <div className="container mx-auto max-w-[1290px] px-4 py-14 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div>
            <h2 className="text-3xl font-medium tracking-tight text-pine sm:text-[40px]">{t('title')}</h2>
            <p className="mt-3 max-w-md text-base text-pine/70 sm:text-xl">{t('subtitle')}</p>
          </div>
          <div className="flex flex-col gap-4">
            {PACKAGE_FAQ_KEYS.map((key, index) => (
              <FAQItem
                key={key}
                question={t(`items.${key}.question`)}
                answer={t(`items.${key}.answer`)}
                isOpen={open === index}
                onToggle={() => setOpen(open === index ? null : index)}
                variant="light"
                className="border-pine/15"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
