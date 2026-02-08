'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ArrowRight, Menu, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import LogoDark from './icons/LogoDark'
import LogoLight from './icons/LogoLight'
import LanguageSwitcher from './LanguageSwitcher'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'

const Header = () => {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tHeader = useTranslations('header')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pagesWithDarkHeader = [
    '/calculator',
    '/solar-abo',
    '/commercial/solar-abo',
    '/about-us',
    '/battery-storage',
    '/login',
    '/solar-systems',
    '/heat-pumps',
    '/charging-stations',
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }

    if (isSearchOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isSearchOpen])

  const showCommercial = !pathname?.startsWith('/commercial')

  const navItems = [
    showCommercial
      ? { label: t('commercialProperties'), href: '/commercial' as const }
      : { label: t('residentialProperties'), href: '/' as const },
    { label: t('howItWorks'), href: '/how-it-works' as const },
    { label: t('portfolio'), href: '/portfolio' as const },
    { label: t('aboutUs'), href: '/about-us' as const },
    { label: tHeader('contact'), href: '/contact' as const },
  ]

  const isActive = (
    href:
      | '/'
      | '/commercial'
      | '/how-it-works'
      | '/portfolio'
      | '/about-us'
      | '/contact'
  ) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const showDarkHeader = shouldUseDarkHeader || isScrolled

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-6 transition-all duration-300',
          showDarkHeader ? 'bg-white shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="max-w-360 mx-auto">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {showDarkHeader ? (
                <LogoDark className="h-6 sm:h-7.25 w-auto" />
              ) : (
                <LogoLight className="h-6 sm:h-7.25 w-auto" />
              )}
              <Image
                src="/images/swiss-flag.png"
                alt="Swiss flag"
                width={18}
                height={18}
                className="size-[18px]"
              />
            </Link>

            <nav className="hidden md:flex items-center justify-center gap-0.75 flex-wrap">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3.75 py-1.25 rounded-[40px] font-medium whitespace-nowrap transition-all duration-200 relative',
                    showDarkHeader &&
                      isActive(item.href) &&
                      'bg-[#E6EAE9] text-[#062E25]',
                    showDarkHeader &&
                      !isActive(item.href) &&
                      'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]',
                    !showDarkHeader &&
                      isActive(item.href) &&
                      'bg-solar text-solar-foreground',
                    !showDarkHeader &&
                      !isActive(item.href) &&
                      'bg-white/20 text-white backdrop-blur-[65px] hover:bg-white/30',
                    index === 0 && 'pr-8',
                    index === 0 &&
                      !showCommercial &&
                      'bg-solar border border-solar text-solar-foreground backdrop-blur-[65px] hover:bg-solar/90',
                    index === 0 &&
                      showCommercial &&
                      'bg-energy text-white backdrop-blur-[65px] hover:bg-energy/90'
                  )}
                >
                  {item.label}
                  {index === 0 && (
                    <>
                      <ArrowRight
                        className={cn(
                          'w-4 h-4 -rotate-45 absolute right-1 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
                          showCommercial
                            ? 'text-white'
                            : 'text-solar-foreground'
                        )}
                      />
                    </>
                  )}
                </Link>
              ))}
            </nav>

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

            <div className="flex items-center justify-end shrink-0 gap-3 sm:gap-4 md:gap-6">
              <LanguageSwitcher isScrolled={showDarkHeader} />
              <Link
                href="/login"
                className={cn(
                  'px-3.75 py-1.25 rounded-[40px] font-medium whitespace-nowrap transition-all duration-200 hover:opacity-80 shrink-0 text-sm sm:text-base hidden sm:block bg-solar text-solar-foreground'
                )}
              >
                {tHeader('myHome')}
              </Link>
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200 hover:opacity-90 shrink-0',
                  showDarkHeader
                    ? 'text-[#062E25] hover:bg-[#E6EAE9]'
                    : 'text-white hover:bg-white/20'
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-8">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium transition-all duration-200 relative',
                  isActive(item.href)
                    ? 'bg-[#E6EAE9] text-[#062E25]'
                    : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]',
                  index === 0 && 'pr-12',
                  index === 0 &&
                    !showCommercial &&
                    'bg-solar text-solar-foreground hover:bg-solar/90',
                  index === 0 &&
                    showCommercial &&
                    'bg-energy text-white hover:bg-energy/90'
                )}
              >
                {item.label}
                {index === 0 && (
                  <ArrowRight
                    className={cn(
                      'w-4 h-4 -rotate-45 absolute right-4 top-1/2 -translate-y-1/2',
                      index === 0 && !showCommercial
                        ? 'text-solar-foreground'
                        : index === 0 && showCommercial
                          ? 'text-white'
                          : 'text-[#062E25]'
                    )}
                  />
                )}
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
        </SheetContent>
      </Sheet>

      {/* Search Overlay */}
      <div
        className={cn(
          'fixed left-0 right-0 z-40 transition-all duration-300 ease-out flex justify-center',
          isSearchOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none',
          'top-[72px] sm:top-[88px]'
        )}
      >
        <div className="max-w-360 w-full px-4 sm:px-6 py-4">
          <form
            onSubmit={handleSearch}
            className={cn(
              'flex items-center gap-3 shadow-lg rounded-lg px-4 py-3 transition-all duration-300',
              showDarkHeader
                ? 'bg-white border border-[#E6EAE9]'
                : 'bg-white/95 backdrop-blur-md border border-white/30'
            )}
          >
            <div className="flex-1 relative">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
                  'text-[#062E25]/50'
                )}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg border-0 transition-all duration-200 outline-none focus:ring-0 bg-transparent',
                  'text-[#062E25] placeholder:text-[#062E25]/50'
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery('')
              }}
              className={cn(
                'p-2 rounded-lg transition-all duration-200 hover:opacity-90 shrink-0',
                'text-[#062E25] hover:bg-[#E6EAE9]'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Header
