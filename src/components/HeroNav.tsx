'use client'

import { LinkButton } from '@/components/ui/link-button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

interface HeroNavProps {
  locale: string
  isCommercial?: boolean
}

const HeroNav = ({ locale, isCommercial = false }: HeroNavProps) => {
  const t = useTranslations('home')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const solarAboLinks = [
    { label: 'SolarAbo Home', href: `/${locale}/solar-abo/home` },
    {
      label: 'SolarAbo Home Storage',
      href: `/${locale}/solar-abo/home-storage`,
    },
    { label: 'SolarAbo Business', href: `/${locale}/solar-abo/business` },
    { label: 'SolarAbo Agro', href: `/${locale}/solar-abo/agro` },
    { label: 'SolarAbo Multi', href: `/${locale}/solar-abo/multi` },
  ]

  const productLinks = [
    { label: 'Solar Panels', href: `/${locale}/products/panels` },
    { label: 'Inverters', href: `/${locale}/products/inverters` },
    { label: 'Batteries', href: `/${locale}/products/batteries` },
    { label: 'Mounting Systems', href: `/${locale}/products/mounting` },
    {
      label: 'Energy Management',
      href: `/${locale}/products/energy-management`,
    },
  ]

  const hasDropdown = hoveredItem === 'solarAbo' || hoveredItem === 'products'
  const dropdownLinks = hoveredItem === 'solarAbo' ? solarAboLinks : productLinks

  return (
    <div className='absolute top-[100px] left-1/2 -translate-x-1/2 w-full flex justify-center z-20'>
      <div
        className={cn(
          'inline-flex flex-col gap-0 pl-[30px] pr-[9px] bg-white/20 backdrop-blur-[30px] rounded-[30px] border border-white/22 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden py-2',
        )}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className='flex items-center gap-[30px]'>
          <div className='flex items-center gap-9'>
            <div
              className='relative'
              onMouseEnter={() => setHoveredItem('solarAbo')}
            >
              <Link
                href={`/${locale}/solar-abo`}
                className='text-white font-medium text-base hover:opacity-80 transition-opacity block whitespace-nowrap'
              >
                {t('hero.nav.solarAbo')}
              </Link>
            </div>

            <div
              className='relative'
              onMouseEnter={() => setHoveredItem('products')}
            >
              <Link
                href={`/${locale}/products`}
                className='text-white font-medium text-base hover:opacity-80 transition-opacity block whitespace-nowrap'
              >
                {t('hero.nav.products')}
              </Link>
            </div>
          </div>
          <div className='shrink-0'>
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href='/calculator'
              locale={locale}
            >
              {t('hero.nav.onlineStarter')}
            </LinkButton>
          </div>
        </div>

        {/* Expanded Links Section - appears inside the same box */}
        <div
          className={cn(
            'flex flex-col gap-2 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            hasDropdown
              ? 'max-h-[500px] opacity-100 pt-4 mt-2 border-t border-white/10'
              : 'max-h-0 opacity-0 pt-0 mt-0 border-t-0'
          )}
        >
          {dropdownLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2.5 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all duration-300 whitespace-nowrap',
                hasDropdown
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-1 opacity-0'
              )}
              style={{
                transitionDelay: hasDropdown
                  ? `${index * 40}ms`
                  : `${(dropdownLinks.length - index) * 20}ms`,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroNav
