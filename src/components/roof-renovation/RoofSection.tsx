import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type Tone = 'light' | 'sand' | 'dark'

const TONE_CLASS: Record<Tone, string> = {
  light: 'bg-[#FDFFF5] text-[#062E25]',
  sand: 'bg-[#EAEDDF] text-[#062E25]',
  dark: 'bg-[#062E25] text-white',
}

interface RoofSectionProps {
  id?: string
  tone?: Tone
  title: string
  intro?: string
  children?: ReactNode
  className?: string
}

export const RoofSection = ({
  id,
  tone = 'light',
  title,
  intro,
  children,
  className,
}: RoofSectionProps) => (
  <section id={id} className={cn('scroll-mt-28', TONE_CLASS[tone], className)}>
    <div className="mx-auto max-w-[1214px] px-4 py-16 sm:px-6 md:py-24">
      <div className="flex max-w-[820px] flex-col gap-5">
        <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
          {title}
        </h2>
        {intro && (
          <p
            className={cn(
              'text-lg tracking-[-0.02em] md:text-[22px]',
              tone === 'dark' ? 'text-white/80' : 'text-[#062E25]/80'
            )}
          >
            {intro}
          </p>
        )}
      </div>
      {children && <div className="mt-10 md:mt-12">{children}</div>}
    </div>
  </section>
)

export const RoofIconBadge = ({
  children,
  tone = 'light',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
}) => (
  <span
    aria-hidden
    className={cn(
      'flex size-12 shrink-0 items-center justify-center rounded-full border [&_svg]:size-6',
      tone === 'dark'
        ? 'border-solar/60 text-solar'
        : 'border-[#6FB300]/50 bg-[#FBFFEF] text-[#062E25]'
    )}
  >
    {children}
  </span>
)
