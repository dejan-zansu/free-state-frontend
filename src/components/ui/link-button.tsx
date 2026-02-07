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
        tertiary:
          'bg-[#062E25] text-white hover:bg-solar hover:text-solar-foreground',
        quaternary:
          'bg-[#3D3858] text-white hover:bg-energy/90 hover:border-energy border border-[#3D3858]',
        'outline-primary':
          'bg-white border border-[#062E25] text-[#062E25] hover:bg-[#062E25]/5',
        'outline-secondary':
          'bg-white/5 border border-white backdrop-blur-[32.5px] hover:bg-white/10 text-white',
        'outline-tertiary':
          'bg-white border border-[#062E25] text-[#062E25] hover:bg-[#062E25]/5',
        'outline-tertiary-dark':
          'bg-white border border-[#062E25] text-[#062E25] hover:bg-[#062E25]/5',
        'outline-quaternary':
          'bg-white border border-[#062E25] text-[#062E25] hover:bg-[#062E25]/5',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
)

interface LinkButtonProps
  extends
    React.ComponentProps<typeof Link>,
    VariantProps<typeof linkButtonVariants> {
  locale?: string
  icon?: React.ReactNode
  iconWrapperClassName?: string
}

const LinkButton = React.forwardRef<
  React.ElementRef<typeof Link>,
  LinkButtonProps
>(({ className, variant, locale, href, children, icon, iconWrapperClassName, ...props }, ref) => {
  const getHrefWithLocale = () => {
    if (!locale || typeof href !== 'string') return href
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href
    return `/${locale}${href.startsWith('/') ? href : '/' + href}`
  }

  const hrefWithLocale = getHrefWithLocale()

  const isPrimary = variant === 'primary' || variant === undefined
  const isSecondary = variant === 'secondary'
  const isTertiary = variant === 'tertiary'
  const isQuaternary = variant === 'quaternary'
  const isOutlinePrimary = variant === 'outline-primary'
  const isOutlineSecondary = variant === 'outline-secondary'
  const isOutlineTertiary = variant === 'outline-tertiary'
  const isOutlineTertiaryDark = variant === 'outline-tertiary-dark'
  const isOutlineQuaternary = variant === 'outline-quaternary'

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
          isQuaternary && 'bg-white group-hover:bg-white',
          isOutlinePrimary && 'bg-[#062E25]',
          isOutlineSecondary && 'bg-solar',
          isOutlineTertiary && 'bg-[#b7fe1a]',
          isOutlineTertiaryDark && 'bg-[#062E25]',
          isOutlineQuaternary && 'bg-energy',
          iconWrapperClassName
        )}
      >
        {icon ? (
          icon
        ) : (
          <>
            <ArrowRight
              className={cn(
                'w-4 h-4 -rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
                isPrimary && 'text-white',
                isSecondary && 'text-energy',
                isTertiary && 'text-[#062E25] group-hover:text-white',
                isQuaternary && 'text-[#3D3858]',
                isOutlinePrimary && 'text-white',
                isOutlineSecondary && 'text-solar-foreground',
                isOutlineTertiary && 'text-[#062E25]',
                isOutlineTertiaryDark && 'text-white',
                isOutlineQuaternary && 'text-white'
              )}
            />
            <ArrowRight
              className={cn(
                'w-4 h-4 -rotate-45 absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 opacity-0 transition-all duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100',
                isPrimary && 'text-white',
                isSecondary && 'text-energy',
                isTertiary && 'text-[#062E25] group-hover:text-white',
                isQuaternary && 'text-energy',
                isOutlinePrimary && 'text-white',
                isOutlineSecondary && 'text-solar-foreground',
                isOutlineTertiary && 'text-[#062E25]',
                isOutlineTertiaryDark && 'text-white',
                isOutlineQuaternary && 'text-white'
              )}
            />
          </>
        )}
      </div>
    </Link>
  )
})

LinkButton.displayName = 'LinkButton'

export { LinkButton, linkButtonVariants }
