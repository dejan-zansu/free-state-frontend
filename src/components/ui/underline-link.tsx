import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface UnderlineLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  underlineColor?: string
  iconClassName?: string
  variant?: 'inline' | 'separate'
  underlineWidth?: string
}

const UnderlineLink = ({
  href,
  children,
  className,
  underlineColor = '#F7F7F8',
  iconClassName,
  variant = 'inline',
  underlineWidth = '105px',
}: UnderlineLinkProps) => {
  if (variant === 'separate') {
    return (
      <div className='flex flex-col gap-2'>
        <Link
          href={href}
          className={cn(
            'font-medium inline-flex items-center group transition-opacity duration-300 hover:opacity-80',
            className
          )}
        >
          <span className='inline-flex items-center gap-2'>
            {children}
            <ArrowRight
              className={cn(
                'w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0',
                iconClassName
              )}
            />
          </span>
        </Link>
        <div
          className='h-px'
          style={{
            backgroundColor: underlineColor,
            width: underlineWidth,
          }}
        />
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'font-medium inline-flex items-center group transition-opacity duration-300 hover:opacity-80',
        className
      )}
    >
      <span
        className='inline-flex items-center gap-2 border-b pb-0.5'
        style={{ borderColor: underlineColor }}
      >
        {children}
        <ArrowRight
          className={cn(
            'w-4 h-4 transition-transform duration-300 group-hover:translate-x-1',
            iconClassName
          )}
        />
      </span>
    </Link>
  )
}

export default UnderlineLink
