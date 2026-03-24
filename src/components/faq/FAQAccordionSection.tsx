'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQAccordionItem {
  question: string
  answer: string
}

interface FAQAccordionSectionProps {
  eyebrow: string
  title: string
  description: string
  items: FAQAccordionItem[]
}

const FAQAccordionSection = ({
  eyebrow,
  title,
  description,
  items,
}: FAQAccordionSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px]">
        <div className="flex flex-col items-center gap-5 mb-12">
          <div
            className="flex items-center justify-center px-4 py-2.5 rounded-full border border-[#062E25]"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
              {eyebrow}
            </span>
          </div>

          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {title}
          </h2>

          <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
            {description}
          </p>
        </div>

        <div>
          {items.map((item, index) => (
            <div
              key={index}
              className="border-b border-[#30524A]/20"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between py-4 px-[30px] text-left"
              >
                <span className="text-[#062E25]/80 text-base md:text-lg font-normal tracking-[-0.02em] pr-4">
                  {item.question}
                </span>
                <div className="flex-shrink-0 flex items-center justify-center w-[25px] h-[24px] rounded-full border border-[#036B53] p-1">
                  {openIndex === index ? (
                    <Minus className="w-3 h-3 text-[#036B53]" strokeWidth={2.5} />
                  ) : (
                    <Plus className="w-3 h-3 text-[#036B53]" strokeWidth={2.5} />
                  )}
                </div>
              </button>

              <div
                className={cn(
                  'grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden min-h-0">
                  <div
                    className={cn(
                      'px-[30px] pb-5 transition-opacity duration-300',
                      openIndex === index ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQAccordionSection
