'use client'

import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'
import Link from 'next/link'

const SolarSystemsNav = () => {
  const locale = useLocale()

  const navItems = [
    { label: 'Commercial properties', href: `/${locale}/commercial`, isActive: false },
    { label: 'SolarAbo', href: `/${locale}/solar-abo`, isActive: false },
    { label: 'How it works', href: `/${locale}/how-it-works`, isActive: false },
    { label: 'Portfolio', href: `/${locale}/portfolio`, isActive: false },
    { label: 'About us', href: `/${locale}/about-us`, isActive: false },
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
