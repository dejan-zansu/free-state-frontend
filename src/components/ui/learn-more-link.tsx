import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import * as React from 'react'

type LearnMoreLinkProps = {
  href: React.ComponentProps<typeof Link>['href']
  children: React.ReactNode
  className?: string
}

const LearnMoreLink = ({ href, children, className }: LearnMoreLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 text-primary font-medium group/link transition-opacity duration-300 hover:opacity-80',
        className
      )}
    >
      <span className="inline-flex items-center gap-2 border-b border-primary pb-0.5">
        <span>{children}</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
      </span>
    </Link>
  )
}

export { LearnMoreLink }
