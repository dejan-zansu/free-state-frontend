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

  const solarAboLinks = isCommercial
    ? [
        { label: t('hero.nav.solarAboBusiness'), href: `/${locale}/solar-abo/solar-abo-business` },
        { label: t('hero.nav.solarAboAgro'), href: `/${locale}/solar-abo/solar-abo-agro` },
        { label: t('hero.nav.solarAboPublic'), href: `/${locale}/solar-abo/solar-abo-public` },
      ]
    : [
        { label: t('hero.nav.solarAboHome'), href: `/${locale}/solar-abo/solar-abo-home` },
        { label: t('hero.nav.solarAboHomeStorage'), href: `/${locale}/solar-abo/solar-abo-home-storage` },
        { label: t('hero.nav.solarAboMulti'), href: `/${locale}/solar-abo/solar-abo-multi` },
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
    <div className='absolute top-[60px] sm:top-[80px] md:top-[100px] left-1/2 -translate-x-1/2 w-full flex justify-center z-20 px-4'>
      <div
        className={cn(
          'inline-flex flex-col gap-0 pl-4 sm:pl-6 md:pl-[30px] pr-2 sm:pr-4 md:pr-[9px] bg-white/20 backdrop-blur-[30px] rounded-2xl sm:rounded-[24px] md:rounded-[30px] border border-white/22 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden py-2 max-w-[calc(100vw-2rem)]',
        )}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-[30px]'>
          <div className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-9'>
            <div
              className='relative'
              onMouseEnter={() => setHoveredItem('solarAbo')}
            >
              <Link
                href={`/${locale}/solar-abo`}
                className='text-white font-medium text-sm sm:text-base hover:opacity-80 transition-opacity block whitespace-nowrap'
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
                className='text-white font-medium text-sm sm:text-base hover:opacity-80 transition-opacity block whitespace-nowrap'
              >
                {t('hero.nav.products')}
              </Link>
            </div>
          </div>
          <div className='shrink-0 w-full sm:w-auto'>
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href='/calculator'
              locale={locale}
              className='w-full sm:w-auto text-sm sm:text-base'
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
