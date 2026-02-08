'use client'

import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

const SolarSystemsNav = () => {
  const navItems = [
    { label: 'Commercial properties', href: '/commercial' as const, isActive: false },
    { label: 'SolarAbo', href: '/solar-abo' as const, isActive: false },
    { label: 'How it works', href: '/how-it-works' as const, isActive: false },
    { label: 'Portfolio', href: '/portfolio' as const, isActive: false },
    { label: 'About us', href: '/about-us' as const, isActive: false },
  ]

  return (
    <section className="relative bg-white py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px]">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                'px-6 py-3 rounded-full border text-sm sm:text-base font-medium transition-all duration-300',
                item.isActive
                  ? 'bg-[#062E25] text-white border-[#062E25]'
                  : 'bg-white text-[#062E25] border-[#062E25]/20 hover:border-[#062E25]/40'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolarSystemsNav
