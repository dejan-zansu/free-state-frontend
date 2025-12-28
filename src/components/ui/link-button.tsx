import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const linkButtonVariants = cva(
  'group relative inline-flex items-center pl-6 pr-1 py-1 rounded-full font-medium transition-all gap-3',
  {
    variants: {
      variant: {
        primary: 'bg-solar text-solar-foreground hover:bg-solar/90',
        secondary:
          'bg-white/5 border border-white backdrop-blur-[32.5px] hover:bg-white/10 text-white',
        outline:
          'bg-white border border-[#062E25] text-[#062E25] hover:bg-[#062E25]/5',
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
  const isOutline = variant === 'outline'

  return (
    <Link
      ref={ref}
      href={hrefWithLocale}
      className={cn(linkButtonVariants({ variant, className }))}
      {...props}
    >
      {children}
      <div
        className={cn(
          'relative w-10 h-10 flex items-center justify-center rounded-full overflow-hidden',
          isPrimary && 'bg-[#062E25]',
          isSecondary && 'bg-solar',
          isOutline && 'bg-[#062E25]'
        )}
      >
        <ArrowRight
          className={cn(
            'w-4 h-4 -rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
            isPrimary && 'text-white',
            isSecondary && 'text-solar-foreground',
            isOutline && 'text-white'
          )}
        />
        <ArrowRight
          className={cn(
            'w-4 h-4 -rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 opacity-0 transition-all duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100',
            isPrimary && 'text-white',
            isSecondary && 'text-solar-foreground',
            isOutline && 'text-white'
          )}
        />
      </div>
    </Link>
  )
})

LinkButton.displayName = 'LinkButton'

export { LinkButton, linkButtonVariants }
