'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LogoDark from './icons/LogoDark'
import LogoLight from './icons/LogoLight'
import LanguageSwitcher from './LanguageSwitcher'
import { cn } from '@/lib/utils'
import { ArrowRight, Search, X } from 'lucide-react'

const Header = () => {
  const params = useParams()
  const pathname = usePathname()
  const locale = params.locale as string
  const t = useTranslations('nav')
  const tHeader = useTranslations('header')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const pagesWithDarkHeader = [
    `/${locale}/calculator`,
    `/${locale}/contact`,
    `/${locale}/portfolio`,
    `/${locale}/how-it-works`,
    `/${locale}/solar-abo`,
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

  const showCommercial = !pathname?.startsWith(`/${locale}/commercial`)

  const navItems = [
    showCommercial
      ? { label: t('commercialProperties'), href: `/${locale}/commercial` }
      : { label: t('residentialProperties'), href: `/${locale}` },
    { label: t('solarAbo'), href: `/${locale}/solar-abo` },
    { label: t('howItWorks'), href: `/${locale}/how-it-works` },
    { label: t('portfolio'), href: `/${locale}/portfolio` },
    { label: t('aboutUs'), href: `/${locale}/about-us` },
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`
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

            <div className='flex items-center justify-end shrink-0'>
              <LanguageSwitcher isScrolled={showDarkHeader} />
              <Link
                href={`/${locale}/contact`}
                className={cn(
                  'font-medium whitespace-nowrap transition-all duration-200 hover:opacity-90 shrink-0 ml-6',
                  showDarkHeader ? 'text-[#062E25]' : 'text-white'
                )}
              >
                {tHeader('contact')}
              </Link>
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200 hover:opacity-90 shrink-0 ml-6',
                  showDarkHeader
                    ? 'text-[#062E25] hover:bg-[#E6EAE9]'
                    : 'text-white hover:bg-white/20'
                )}
                aria-label='Search'
              >
                <Search className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <div
        className={cn(
          'fixed left-0 right-0 z-40 transition-all duration-300 ease-out flex justify-center',
          isSearchOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none',
          'top-[88px]' // Header height
        )}
      >
        <div className='max-w-360 w-full px-6 py-4'>
          <form
            onSubmit={handleSearch}
            className={cn(
              'flex items-center gap-3 shadow-lg rounded-lg px-4 py-3 transition-all duration-300',
              showDarkHeader
                ? 'bg-white border border-[#E6EAE9]'
                : 'bg-white/95 backdrop-blur-md border border-white/30'
            )}
          >
            <div className='flex-1 relative'>
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
                  'text-[#062E25]/50'
                )}
              />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search...'
                autoFocus
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg border-0 transition-all duration-200 outline-none focus:ring-0 bg-transparent',
                  'text-[#062E25] placeholder:text-[#062E25]/50'
                )}
              />
            </div>
            <button
              type='button'
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery('')
              }}
              className={cn(
                'p-2 rounded-lg transition-all duration-200 hover:opacity-90 shrink-0',
                'text-[#062E25] hover:bg-[#E6EAE9]'
              )}
            >
              <X className='w-5 h-5' />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Header
