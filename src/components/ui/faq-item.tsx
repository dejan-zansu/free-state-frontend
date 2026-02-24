'use client'

import { cn } from '@/lib/utils'
import { Plus, Minus } from 'lucide-react'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  variant?: 'dark' | 'light'
  className?: string
}

const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle,
  variant = 'dark',
  className,
}: FAQItemProps) => {
  const isDark = variant === 'dark'

  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden backdrop-blur-[70px]',
        isDark ? 'border-white/40' : 'border-white/40',
        className
      )}
      style={{
        background: isDark
          ? 'rgba(123, 135, 126, 0.32)'
          : 'rgba(198, 213, 202, 0.32)',
        backdropFilter: 'blur(70px)',
        WebkitBackdropFilter: 'blur(70px)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full px-[30px] py-[30px] flex items-center justify-between gap-[50px] text-left"
      >
        <span
          className={cn(
            'text-base md:text-lg tracking-[-0.02em]',
            isDark ? 'text-white/80' : 'text-[#062E25]/80'
          )}
        >
          {question}
        </span>
        <div className="border border-[#036B53] rounded-full p-1">
          {isOpen ? (
            <Minus className="w-3 h-3 text-[#036B53]" strokeWidth={2.5} />
          ) : (
            <Plus className="w-3 h-3 text-[#036B53]" strokeWidth={2.5} />
          )}
        </div>
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className={cn(
              'px-[30px] pb-[30px] transition-opacity duration-300',
              isOpen ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div
              className={cn(
                'border-t pt-5',
                isDark ? 'border-white/20' : 'border-[#30524A]/20'
              )}
            >
              <p
                className={cn(
                  'text-base font-light tracking-[-0.02em]',
                  isDark ? 'text-white/80' : 'text-[#062E25]/80'
                )}
              >
                {answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { FAQItem }
export type { FAQItemProps }
