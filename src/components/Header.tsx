'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  Menu,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import LogoDark from './icons/LogoDark'
import LogoLight from './icons/LogoLight'
import LogoutSquare from './icons/LogoutSquare'
import LanguageSwitcher from './LanguageSwitcher'
import MobileNavLinks from './MobileNavLinks'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'

const Header = () => {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tHeader = useTranslations('header')
  const tFooter = useTranslations('footer')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCompanyOpen, setIsCompanyOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileCompanyOpen, setIsMobileCompanyOpen] = useState(false)

  const pagesWithDarkHeader = [
    '/calculator',
    '/commercial/calculator',
    '/solar-free',
    '/commercial/solar-free',
    '/about-us',
    '/battery-storage',
    '/login',
    '/solar-systems',
    '/heat-pumps',
    '/charging-stations',
    '/dashboard',
    '/blog',
    '/history',
    '/team',
    '/investors',
    '/careers',
    '/solar-direct',
  ]

  const shouldUseDarkHeader = pagesWithDarkHeader.some(path =>
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

  const showCommercial = !pathname?.startsWith('/commercial')

  const leadingNavItems = [
    showCommercial
      ? { label: t('commercialProperties'), href: '/commercial' as const }
      : { label: t('residentialProperties'), href: '/' as const },
    { label: t('portfolio'), href: '/portfolio' as const },
  ]

  const trailingNavItems = [
    { label: tHeader('contact'), href: '/contact' as const },
  ]

  const companyLinks = [
    { label: tFooter('company.aboutUs'), href: '/about-us' as const },
    { label: tFooter('company.history'), href: '/history' as const },
    { label: tFooter('company.team'), href: '/team' as const },
    { label: tFooter('company.investors'), href: '/investors' as const },
    { label: tFooter('company.careers'), href: '/careers' as const },
  ]

  const isActive = (href: '/' | '/commercial' | '/portfolio' | '/contact') => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const isCompanyActive = companyLinks.some(link =>
    pathname?.startsWith(link.href)
  )

  const showDarkHeader = shouldUseDarkHeader || isScrolled
  const isCalculatorPage =
    (pathname as string) === '/calculator' ||
    (pathname as string)?.startsWith('/calculator/')

  if (isCalculatorPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-6 bg-[#EAEDDF]">
        <div className="max-w-360 mx-auto flex items-center justify-center">
          <Link href="/">
            <LogoDark className="h-6 sm:h-7.25 w-auto" />
          </Link>
        </div>
      </header>
    )
  }

  const navItemClass = (active: boolean, isFirst = false) =>
    cn(
      'px-3.75 py-1.25 rounded-[40px] font-medium whitespace-nowrap transition-all duration-200 relative',
      showDarkHeader && active && 'bg-[#E6EAE9] text-[#062E25]',
      showDarkHeader &&
        !active &&
        'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]',
      !showDarkHeader && active && 'bg-solar text-solar-foreground',
      !showDarkHeader &&
        !active &&
        'bg-white/20 text-white backdrop-blur-[65px] hover:bg-white/30',
      isFirst && 'pr-8',
      isFirst &&
        !showCommercial &&
        'bg-solar border border-solar text-solar-foreground backdrop-blur-[65px] hover:bg-solar/90',
      isFirst &&
        showCommercial &&
        'bg-energy text-white backdrop-blur-[65px] hover:bg-energy/90'
    )

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-6 transition-all duration-300',
          showDarkHeader
            ? 'bg-white/20 backdrop-blur-[32.5px]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-360 mx-auto">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
            <Link
              href="/"
              aria-label="Free State AG — Startseite"
              className="flex items-start gap-2 shrink-0"
            >
              {showDarkHeader ? (
                <LogoDark className="h-6 sm:h-7.25 w-auto" />
              ) : (
                <LogoLight className="h-6 sm:h-7.25 w-auto" />
              )}
              <Image
                src="/images/swiss-flag.png"
                alt="Swiss flag"
                width={2}
                height={2}
                className="size-3"
                unoptimized
              />
            </Link>

            <nav className="hidden md:flex items-center justify-center gap-0.75 flex-wrap">
              {leadingNavItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(isActive(item.href), index === 0)}
                >
                  {item.label}
                  {index === 0 && (
                    <ArrowRight
                      className={cn(
                        'w-4 h-4 -rotate-45 absolute right-1 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
                        showCommercial ? 'text-white' : 'text-solar-foreground'
                      )}
                    />
                  )}
                </Link>
              ))}

              <div
                className="relative"
                onMouseEnter={() => setIsCompanyOpen(true)}
                onMouseLeave={() => setIsCompanyOpen(false)}
              >
                <Link
                  href="/about-us"
                  className={navItemClass(isCompanyActive)}
                >
                  {tFooter('company.title')}
                </Link>

                <div
                  className={cn(
                    'absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-opacity duration-300',
                    isCompanyOpen
                      ? 'opacity-100 visible'
                      : 'opacity-0 invisible pointer-events-none'
                  )}
                >
                  <div
                    className={cn(
                      'inline-flex rounded-[20px] overflow-hidden border backdrop-blur-[30px]',
                      showDarkHeader
                        ? 'bg-white/95 border-[#062E25]/10 shadow-xl'
                        : 'bg-white/20 border-white/22'
                    )}
                  >
                    <div className="flex flex-row gap-4 lg:gap-5 p-4 md:p-[18px]">
                      <div className="flex flex-col min-w-[220px] pt-3">
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-sm font-medium whitespace-nowrap mb-[30px]',
                            showDarkHeader ? 'text-[#062E25]' : 'text-white'
                          )}
                        >
                          <Building2
                            className="w-[15px] h-[15px]"
                            strokeWidth={1.5}
                          />
                          <span>{tFooter('company.title')}</span>
                        </div>
                        {companyLinks.map((link, index) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              'py-[7px] text-sm font-light border-b transition-all duration-400 whitespace-nowrap',
                              showDarkHeader
                                ? 'text-[#062E25] border-[#062E25]/20 hover:border-[#062E25]'
                                : 'text-white border-white/60 hover:border-white',
                              isCompanyOpen
                                ? 'translate-y-0 opacity-100'
                                : '-translate-y-1 opacity-0'
                            )}
                            style={{
                              transitionDelay: isCompanyOpen
                                ? `${100 + index * 40}ms`
                                : '0ms',
                            }}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/about-us"
                        className="relative hidden lg:block w-[291px] h-[301px] rounded-[10px] overflow-hidden group shrink-0"
                      >
                        <Image
                          src="/images/nav/nav-promo.webp"
                          alt={tFooter('company.title')}
                          fill
                          sizes="291px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,66,53,0.15)_0%,rgba(12,66,53,0.3)_100%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(72,144,144,0.1)_0%,rgba(72,144,144,0.7)_100%)]" />
                        <h3 className="absolute top-4 left-4 right-4 text-white font-medium text-xl">
                          {tFooter('company.title')}
                        </h3>
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-sm font-medium">
                          <span>{tFooter('company.aboutUs')}</span>
                          <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {trailingNavItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navItemClass(isActive(item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-end shrink-0 gap-3 sm:gap-4 md:gap-6">
              <Link
                href="/login"
                className={cn(
                  'px-3.75 py-1.25 rounded-[40px] font-medium whitespace-nowrap transition-all duration-200 hover:opacity-80 shrink-0 text-sm sm:text-base hidden sm:flex justify-center items-center bg-solar text-solar-foreground gap-1.5'
                )}
              >
                <LogoutSquare />
                {tHeader('myHome')}
              </Link>

              <div className="hidden md:block">
                <LanguageSwitcher isScrolled={showDarkHeader} />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'md:hidden p-2 rounded-lg transition-all duration-200 hover:opacity-90 shrink-0',
                  showDarkHeader
                    ? 'text-[#062E25] hover:bg-[#E6EAE9]'
                    : 'text-white hover:bg-white/20'
                )}
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Sheet
        open={isMobileMenuOpen}
        onOpenChange={open => {
          setIsMobileMenuOpen(open)
          if (!open) setIsMobileCompanyOpen(false)
        }}
      >
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[400px] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-8 px-4">
            {leadingNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium transition-all duration-200 relative',
                  isActive(item.href)
                    ? 'bg-[#E6EAE9] text-[#062E25]'
                    : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div>
              <button
                onClick={() => setIsMobileCompanyOpen(prev => !prev)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200',
                  isCompanyActive
                    ? 'bg-[#E6EAE9] text-[#062E25]'
                    : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]'
                )}
              >
                {tFooter('company.title')}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-300',
                    isMobileCompanyOpen && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  isMobileCompanyOpen
                    ? 'max-h-[400px] opacity-100'
                    : 'max-h-0 opacity-0'
                )}
              >
                <div className="flex flex-col gap-0.5 pt-1 pl-3">
                  {companyLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-200',
                        pathname?.startsWith(link.href)
                          ? 'bg-[#E6EAE9] text-[#062E25]'
                          : 'text-[#062E25] hover:bg-[rgba(6,46,37,0.08)]'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {trailingNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium transition-all duration-200 relative mt-2',
                  isActive(item.href)
                    ? 'bg-[#E6EAE9] text-[#062E25]'
                    : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg font-medium transition-all duration-200 mt-4 bg-[#E6EAE9] text-[#062E25]"
            >
              {tHeader('myHome')}
            </Link>
          </nav>
          <div className="mt-4 pt-4 border-t border-[#E6EAE9] px-4">
            <MobileNavLinks
              isCommercial={pathname?.startsWith('/commercial')}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-[#E6EAE9] px-4">
            <LanguageSwitcher isScrolled={true} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Header
