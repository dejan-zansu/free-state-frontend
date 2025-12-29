'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const InvestorsFAQ = () => {
  const t = useTranslations('investorsPage.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      key: 'invest',
      question: t('items.invest.question'),
      answer: t('items.invest.answer'),
    },
    {
      key: 'deposit',
      question: t('items.deposit.question'),
      answer: t('items.deposit.answer'),
    },
    {
      key: 'listed',
      question: t('items.listed.question'),
      answer: t('items.listed.answer'),
    },
  ]

  return (
    <section className='relative py-24 bg-background'>
      <div className='max-w-327.5 mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-foreground text-4xl font-semibold mb-6'>
            {t('title')}
          </h2>
        </div>

        <div className='max-w-4xl mx-auto space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={faq.key}
              className='border border-foreground/10 rounded-lg overflow-hidden'
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className='w-full px-6 py-4 flex items-center justify-between text-left hover:bg-foreground/5 transition-colors'
              >
                <h3 className='text-foreground text-lg font-semibold pr-4'>
                  {faq.question}
                </h3>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-foreground/60 transition-transform flex-shrink-0',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === index && (
                <div className='px-6 pb-4'>
                  <p className='text-foreground/80 text-base font-light leading-relaxed'>
                    {faq.answer}
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

export default InvestorsFAQ
