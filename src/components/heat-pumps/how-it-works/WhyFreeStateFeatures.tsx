'use client'

import { useState } from 'react'
import { FAQItem } from '@/components/ui/faq-item'

interface WhyFreeStateFeaturesProps {
  items: { question: string; answer: string }[]
}

const WhyFreeStateFeatures = ({ items }: WhyFreeStateFeaturesProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-5 w-full max-w-[652px]">
      {items.map((item, index) => (
        <FAQItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          variant="dark"
        />
      ))}
    </div>
  )
}

export default WhyFreeStateFeatures
