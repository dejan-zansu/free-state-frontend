import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { cn } from '@/lib/utils'

const linkButtonVariants = cva(
  'group relative inline-flex items-center pl-6 pr-1 py-1 rounded-full font-medium transition-all gap-3',
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
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

interface LinkButtonProps
  extends React.ComponentProps<typeof Link>,
    VariantProps<typeof linkButtonVariants> {
  locale?: string
}

const LinkButton = React.forwardRef<
  React.ElementRef<typeof Link>,
  LinkButtonProps
>(({ className, variant, locale, href, children, ...props }, ref) => {
  const getHrefWithLocale = () => {
    if (!locale || typeof href !== 'string') return href
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href
    return `/${locale}${href.startsWith('/') ? href : '/' + href}`
  }

  const hrefWithLocale = getHrefWithLocale()

  const isPrimary = variant === 'primary' || variant === undefined
  const isSecondary = variant === 'secondary'
  const isTertiary = variant === 'tertiary'
  const isOutlinePrimary = variant === 'outline-primary'
  const isOutlineSecondary = variant === 'outline-secondary'

  const isFullWidth = className && className.includes('w-full')

  return (
    <Link
      ref={ref}
      href={hrefWithLocale}
      className={cn(
        linkButtonVariants({ variant }),
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
          'relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden',
          isPrimary && 'bg-[#062E25]',
          isSecondary && 'bg-white',
          isTertiary && 'bg-solar group-hover:bg-[#062E25]',
          isOutlinePrimary && 'bg-[#062E25]',
          isOutlineSecondary && 'bg-solar'
        )}
      >
        <ArrowRight
          className={cn(
            'w-4 h-4 -rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
            isPrimary && 'text-white',
            isSecondary && 'text-energy',
            isTertiary && 'text-[#062E25] group-hover:text-white',
            isOutlinePrimary && 'text-white',
            isOutlineSecondary && 'text-solar-foreground'
          )}
        />
        <ArrowRight
          className={cn(
            'w-4 h-4 -rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 opacity-0 transition-all duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100',
            isPrimary && 'text-white',
            isSecondary && 'text-energy',
            isTertiary && 'text-[#062E25] group-hover:text-white',
            isOutlinePrimary && 'text-white',
            isOutlineSecondary && 'text-solar-foreground'
          )}
        />
      </div>
    </Link>
  )
})

LinkButton.displayName = 'LinkButton'

export { LinkButton, linkButtonVariants }
