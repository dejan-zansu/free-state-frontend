'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Menu,
  Plug2,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import LogoDark from './icons/LogoDark'
import LogoLight from './icons/LogoLight'
import LogoutSquare from './icons/LogoutSquare'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'
import { useSiteNavLinks } from './nav/useSiteNavLinks'

type NavMenu = 'plans' | 'products' | 'company'

const Header = () => {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tHeader = useTranslations('header')
  const tFooter = useTranslations('footer')
  const tHome = useTranslations('home')
  const [isScrolled, setIsScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<NavMenu | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const pagesWithDarkHeader = [
    '/calculator',
    '/ratgeber',
    '/commercial/calculator',
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
  ]

  const isBlogPost = /^\/blog\/[^/]+/.test(pathname ?? '')

  const isReferenceDetail = /^\/portfolio\/[^/]+/.test(pathname ?? '')

  const shouldUseDarkHeader =
    isReferenceDetail ||
    (!isBlogPost &&
      pagesWithDarkHeader.some(path => pathname?.startsWith(path)))

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const showCommercial = !pathname?.startsWith('/commercial')

  const isCommercial = !showCommercial

  const commercialSwitch = showCommercial
    ? { label: t('commercialProperties'), href: '/commercial' as const }
    : { label: t('residentialProperties'), href: '/' as const }

  const { planLinks, productGroups } = useSiteNavLinks(isCommercial)

  const plansHref = isCommercial ? '/commercial/solar-free' : '/solar-free'
  const plansLabel = isCommercial
    ? tHome('hero.nav.solarAbo')
    : tHome('hero.nav.plansPrices')
  const promoHref = plansHref
  const promoTitle = isCommercial
    ? tHome('hero.nav.promoTitleCommercial')
    : tHome('hero.nav.promoTitle')

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

  const isPlansActive = [
    plansHref,
    '/solar-direct',
    ...planLinks.map(link => link.href),
  ].some(href => pathname?.startsWith(href))

  const isProductsActive =
    pathname?.startsWith('/products') ||
    productGroups.some(group =>
      [group.href, ...group.subLinks.map(sub => sub.href)].some(href =>
        pathname?.startsWith(href)
      )
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


  const dropdownTextClass = showDarkHeader ? 'text-[#062E25]' : 'text-white'

  const dropdownBorderClass = showDarkHeader
    ? 'text-[#062E25] border-[#062E25]/20 hover:border-[#062E25]'
    : 'text-white border-white/60 hover:border-white'

  const dropdownDelay = (menu: NavMenu, delay: number) => ({
    transitionDelay: openMenu === menu ? `${delay}ms` : '0ms',
  })

  const dropdownLinkClass = (menu: NavMenu) =>
    cn(
      'py-[7px] text-sm font-light border-b transition-all duration-400 whitespace-nowrap',
      dropdownBorderClass,
      openMenu === menu
        ? 'translate-y-0 opacity-100'
        : '-translate-y-1 opacity-0'
    )

  const renderDropdownHeading = (Icon: LucideIcon, label: string) => (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium whitespace-nowrap mb-[30px]',
        dropdownTextClass
      )}
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
      <span>{label}</span>
    </div>
  )

  const renderPromo = (
    href: '/about-us' | '/solar-free' | '/commercial/solar-free',
    title: string,
    cta: string,
    visibleFrom: 'lg:block' | 'xl:block'
  ) => (
    <Link
      href={href}
      className={cn(
        'relative hidden w-[291px] h-[301px] rounded-[10px] overflow-hidden group shrink-0',
        visibleFrom
      )}
    >
      <Image
        src="/images/nav/nav-promo.webp"
        alt={title}
        fill
        sizes="291px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,66,53,0.15)_0%,rgba(12,66,53,0.3)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(72,144,144,0.1)_0%,rgba(72,144,144,0.7)_100%)]" />
      <h3 className="absolute top-4 left-4 right-4 text-white font-medium text-xl">
        {title}
      </h3>
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-sm font-medium">
        <span>{cta}</span>
        <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
      </div>
    </Link>
  )

  const renderDropdown = (
    menu: NavMenu,
    positionClass: string,
    content: ReactNode
  ) => (
    <div
      className={cn(
        'absolute top-full pt-2 transition-opacity duration-300',
        positionClass,
        openMenu === menu
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
          {content}
        </div>
      </div>
    </div>
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
              aria-label="Free State AG, Startseite"
              className="flex items-start gap-2 shrink-0"
            >
              {showDarkHeader ? (
                <LogoDark className="h-6 sm:h-7.25 w-auto max-[340px]:h-5" />
              ) : (
                <LogoLight className="h-6 sm:h-7.25 w-auto max-[340px]:h-5" />
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

            <nav className="hidden xl:flex relative items-center justify-center gap-0.75">
              <Link
                href={commercialSwitch.href}
                className={navItemClass(isActive(commercialSwitch.href), true)}
              >
                {commercialSwitch.label}
                <ArrowRight
                  className={cn(
                    'w-4 h-4 -rotate-45 absolute right-1 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:-translate-y-6 group-hover:opacity-0',
                    showCommercial ? 'text-white' : 'text-solar-foreground'
                  )}
                />
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setOpenMenu('plans')}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={plansHref}
                  className={navItemClass(isPlansActive)}
                >
                  {plansLabel}
                </Link>
                {renderDropdown(
                  'plans',
                  'left-1/2 -translate-x-1/2',
                  <>
                    <div className="flex flex-col min-w-[220px] pt-3">
                      {renderDropdownHeading(Plug2, tHome('hero.nav.ourPackages'))}
                      {planLinks.map((link, index) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={dropdownLinkClass('plans')}
                          style={dropdownDelay('plans', 100 + index * 40)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    {renderPromo(promoHref, promoTitle, tHome('hero.nav.promoCta'), 'lg:block')}
                  </>
                )}
              </div>

              <div
                onMouseEnter={() => setOpenMenu('products')}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href="/products"
                  className={navItemClass(isProductsActive)}
                >
                  {tHome('hero.nav.products')}
                </Link>
                {renderDropdown(
                  'products',
                  'left-1/2 -translate-x-1/2',
                  <>
                    <div className="flex flex-row gap-6 lg:gap-[38px] pt-3">
                      {productGroups.map((group, columnIndex) => {
                        const Icon = group.icon
                        return (
                          <div
                            key={group.href}
                            className={cn(
                              'flex flex-col w-[144px] transition-all duration-400',
                              openMenu === 'products'
                                ? 'translate-y-0 opacity-100'
                                : '-translate-y-1 opacity-0'
                            )}
                            style={dropdownDelay('products', 100 + columnIndex * 50)}
                          >
                            <Link
                              href={group.href}
                              className={cn(
                                'flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap mb-[30px]',
                                dropdownTextClass
                              )}
                            >
                              <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
                              <span>{group.label}</span>
                            </Link>
                            <div className="flex flex-col">
                              {group.subLinks.map(sub => (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  className={cn(
                                    'py-[7px] text-sm font-light border-b transition-colors',
                                    dropdownBorderClass
                                  )}
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {renderPromo(
                      promoHref,
                      promoTitle,
                      tHome('hero.nav.promoCta'),
                      productGroups.length > 3 ? 'xl:block' : 'lg:block'
                    )}
                  </>
                )}
              </div>

              <Link
                href="/portfolio"
                className={navItemClass(isActive('/portfolio'))}
              >
                {t('portfolio')}
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setOpenMenu('company')}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href="/about-us"
                  className={navItemClass(isCompanyActive)}
                >
                  {tFooter('company.title')}
                </Link>
                {renderDropdown(
                  'company',
                  'left-1/2 -translate-x-1/2',
                  <>
                    <div className="flex flex-col min-w-[220px] pt-3">
                      {renderDropdownHeading(Building2, tFooter('company.title'))}
                      {companyLinks.map((link, index) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={dropdownLinkClass('company')}
                          style={dropdownDelay('company', 100 + index * 40)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    {renderPromo(
                      '/about-us',
                      tFooter('company.title'),
                      tFooter('company.aboutUs'),
                      'lg:block'
                    )}
                  </>
                )}
              </div>

              <Link
                href="/contact"
                className={navItemClass(isActive('/contact'))}
              >
                {tHeader('contact')}
              </Link>
            </nav>

            <div className="flex items-center justify-end shrink-0 gap-2 sm:gap-4 md:gap-6">
              <Link
                href={
                  (showCommercial
                    ? '/calculator'
                    : '/commercial/calculator') as ComponentProps<
                    typeof Link
                  >['href']
                }
                className={cn(
                  'xl:hidden px-3.75 py-1.25 rounded-[40px] font-medium whitespace-nowrap transition-all duration-200 hover:opacity-80 shrink-0 text-sm sm:text-base flex justify-center items-center bg-solar text-solar-foreground max-xl:px-4 max-xl:py-2 max-xl:uppercase max-[375px]:px-3 max-[375px]:text-xs'
                )}
              >
                {tHeader('calculatorShort')}
              </Link>
              <Link
                href="/login"
                className={cn(
                  navItemClass(false),
                  'hidden sm:flex items-center gap-1.5 text-sm sm:text-base'
                )}
              >
                <LogoutSquare />
                {tHeader('myHome')}
              </Link>

              <div className="hidden xl:block">
                <LanguageSwitcher isScrolled={showDarkHeader} />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  'xl:hidden -mr-2 p-2 rounded-lg transition-all duration-200 hover:opacity-90 shrink-0',
                  showDarkHeader
                    ? 'text-[#062E25] hover:bg-[#E6EAE9]'
                    : 'text-white hover:bg-white/20'
                )}
                aria-label="Open menu"
              >
                <Menu className="size-8" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  )
}

export default Header
