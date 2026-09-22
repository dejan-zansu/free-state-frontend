import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const TONES = {
  white: 'bg-white',
  sand: 'bg-[#EAEDDF]',
  light: 'bg-[#FDFFF5]',
} as const

interface SectionProps {
  id?: string
  eyebrow?: string
  title: string
  lead?: string
  tone?: keyof typeof TONES
  className?: string
  children: ReactNode
}

export default function Section({
  id,
  eyebrow,
  title,
  lead,
  tone = 'white',
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn(TONES[tone], 'text-[#062E25]', className)}>
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 md:py-20">
        {eyebrow && (
          <p className="mb-2 text-base font-semibold uppercase tracking-wide text-[#062E25]/60">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold md:text-[38px]">{title}</h2>
        {lead && (
          <p className="mt-3 max-w-3xl text-base text-[#062E25]/80 md:text-lg">
            {lead}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
