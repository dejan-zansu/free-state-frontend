'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LogoLight from './icons/LogoLight'
import LogoDark from './icons/LogoDark'
import LanguageSwitcher from './LanguageSwitcher'

const Header = () => {
  const params = useParams()
  const pathname = usePathname()
  const locale = params.locale as string
  const t = useTranslations('nav')
  const tHeader = useTranslations('header')
  const [isScrolled, setIsScrolled] = useState(false)

  const pagesWithDarkHeader = [
    `/${locale}/calucluator`,
    `/${locale}/calculator`,
  ]

  const shouldUseDarkHeader = pagesWithDarkHeader.some((path) =>
    pathname?.startsWith(path)
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: t('home'), href: `/${locale}` },
    { label: t('calculator'), href: `/${locale}/calucluator` },
    { label: t('solutions'), href: `/${locale}/solar-solutions` },
    { label: t('companies'), href: `/${locale}/companies` },
    { label: t('portfolio'), href: `/${locale}/portfolio` },
    { label: t('investors'), href: `/${locale}/investors` },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`
    }
    return pathname?.startsWith(href)
  }

  // Determine if we should show dark header styling
  const showDarkHeader = shouldUseDarkHeader || isScrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300 ${
        showDarkHeader ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className='max-w-360 mx-auto'>
        <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4'>
          <Link
            href={`/${locale}`}
            className='flex items-center gap-2 shrink-0'
          >
            {showDarkHeader ? (
              <LogoDark className='h-7.25 w-auto' />
            ) : (
              <LogoLight className='h-7.25 w-auto' />
            )}
          </Link>

          <nav className='flex items-center justify-center gap-0.75 flex-wrap'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-3.75 py-1.25 rounded-[40px] font-medium whitespace-nowrap
                  transition-all duration-200
                  ${
                    showDarkHeader
                      ? isActive(item.href)
                        ? 'bg-[#E6EAE9] text-[#062E25]'
                        : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]'
                      : isActive(item.href)
                      ? 'bg-solar text-solar-foreground'
                      : 'bg-white/20 text-white backdrop-blur-[65px] hover:bg-white/30'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className='flex items-center justify-end gap-6 shrink-0'>
            <LanguageSwitcher isScrolled={showDarkHeader} />
            <Link
              href={`/${locale}/contact`}
              className={`
                px-6.25 py-2 rounded-[20px] font-medium whitespace-nowrap
                transition-all duration-200 hover:opacity-90
                ${
                  showDarkHeader
                    ? 'bg-solar text-solar-foreground'
                    : 'bg-solar text-solar-foreground'
                }
              `}
            >
              {tHeader('contact')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
