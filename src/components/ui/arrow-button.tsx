import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const arrowButtonVariants = cva(
  'group relative inline-flex items-center rounded-full font-medium transition-all',
  {
    variants: {
      variant: {
        primary: 'bg-solar text-solar-foreground hover:bg-solar/90',
        secondary:
          'bg-energy border border-energy hover:bg-energy/90 text-white',
        tertiary: 'bg-[#062E25] text-white hover:bg-solar hover:text-solar-foreground',
        'outline-primary':
          'bg-white border border-[#062E25] text-[#062E25] hover:bg-[#062E25]/5',
        'outline-secondary':
          'bg-white/5 border border-white backdrop-blur-[32.5px] hover:bg-white/10 text-white',
      },
      size: {
        sm: 'pl-4 pr-0.5 py-0.5 gap-2',
        default: 'pl-6 pr-1 py-1 gap-3',
        lg: 'pl-8 pr-1.5 py-1.5 gap-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

interface ArrowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof arrowButtonVariants> {}

const ArrowButton = React.forwardRef<HTMLButtonElement, ArrowButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const isPrimary = variant === 'primary' || variant === undefined
    const isSecondary = variant === 'secondary'
    const isTertiary = variant === 'tertiary'
    const isOutlinePrimary = variant === 'outline-primary'
    const isOutlineSecondary = variant === 'outline-secondary'

    const isFullWidth = className && className.includes('w-full')

    return (
      <button
        ref={ref}
        className={cn(
          arrowButtonVariants({ variant, size }),
          isFullWidth && 'flex justify-between w-full',
          className
        )}
        {...props}
      >
        {isFullWidth ? (
          <span className="flex-1 text-center">{children}</span>
        ) : (
          children
        )}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full overflow-hidden',
            size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10',
            isPrimary && 'bg-[#062E25]',
            isSecondary && 'bg-white',
            isTertiary && 'bg-solar group-hover:bg-[#062E25]',
            isOutlinePrimary && 'bg-[#062E25]',
            isOutlineSecondary && 'bg-solar'
          )}
        >
          <ArrowRight
            className={cn(
              '-rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
              isPrimary && 'text-white',
              isSecondary && 'text-energy',
              isTertiary && 'text-[#062E25] group-hover:text-white',
              isOutlinePrimary && 'text-white',
              isOutlineSecondary && 'text-solar-foreground'
            )}
          />
          <ArrowRight
            className={cn(
              '-rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 opacity-0 transition-all duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100',
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
              isPrimary && 'text-white',
              isSecondary && 'text-energy',
              isTertiary && 'text-[#062E25] group-hover:text-white',
              isOutlinePrimary && 'text-white',
              isOutlineSecondary && 'text-solar-foreground'
            )}
          />
        </div>
      </button>
    )
  }
)

ArrowButton.displayName = 'ArrowButton'

export { ArrowButton, arrowButtonVariants }
