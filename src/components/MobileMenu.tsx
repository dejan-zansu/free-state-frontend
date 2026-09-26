'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import LogoDark from './icons/LogoDark'
import LanguageSwitcher from './LanguageSwitcher'
import { LinkButton } from './ui/link-button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from './ui/sheet'

type SubPanel = 'products' | 'plans' | 'company'
type PropertyType = 'single' | 'multi' | 'business'

const CALCULATOR_BY_PROPERTY = {
  single: '/calculator',
  multi: '/commercial/calculator',
  business: '/commercial/calculator',
} as const

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MobileMenu = ({ open, onOpenChange }: MobileMenuProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-full max-w-none sm:max-w-none border-l-0 bg-[#FDFFF5] p-0 gap-0 shadow-none"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <MobileMenuBody onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}

const rowClass =
  'w-full flex items-center justify-between gap-4 py-3.5 text-left text-2xl text-[#062E25] transition-opacity hover:opacity-70'
const rowArrowClass = 'size-7 shrink-0 text-[#062E25]/50'

const MobileMenuBody = ({ onNavigate }: { onNavigate: () => void }) => {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  const tHeader = useTranslations('header')
  const tFooter = useTranslations('footer')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const isCommercial = pathname?.startsWith('/commercial') ?? false

  const [panel, setPanel] = useState<SubPanel | null>(null)
  const [propertyType, setPropertyType] = useState<PropertyType>(
    isCommercial ? 'business' : 'single'
  )
  const lastPanel = useRef<SubPanel | null>(null)
  const rowRefs = useRef<Partial<Record<SubPanel, HTMLButtonElement | null>>>(
    {}
  )
  const backRefs = useRef<Partial<Record<SubPanel, HTMLButtonElement | null>>>(
    {}
  )
  const hasNavigatedPanels = useRef(false)

  useEffect(() => {
    if (!hasNavigatedPanels.current) return
    if (panel) {
      backRefs.current[panel]?.focus({ preventScroll: true })
    } else if (lastPanel.current) {
      rowRefs.current[lastPanel.current]?.focus({ preventScroll: true })
    }
  }, [panel])

  const openPanel = (next: SubPanel) => {
    hasNavigatedPanels.current = true
    lastPanel.current = next
    setPanel(next)
  }

  const closePanel = () => {
    hasNavigatedPanels.current = true
    setPanel(null)
  }

  const planLinks = isCommercial
    ? [
        {
          label: t('hero.nav.solarAboMulti'),
          href: '/commercial/solar-free/solar-free-multi-family' as const,
        },
        {
          label: t('hero.nav.solarAboBusiness'),
          href: '/commercial/solar-free/industry-commercial' as const,
        },
        {
          label: t('hero.nav.solarAboAgro'),
          href: '/commercial/solar-free/farmhouses' as const,
        },
        {
          label: t('hero.nav.solarAboPublic'),
          href: '/commercial/solar-free/public-buildings' as const,
        },
        {
          label: t('hero.nav.communities'),
          href: '/ratgeber/energiegemeinschaften' as const,
        },
      ]
    : [
        { label: t('hero.nav.solarFree'), href: '/solar-free' as const },
        { label: t('hero.nav.solarDirect'), href: '/solar-direct' as const },
      ]

  const productGroups = isCommercial
    ? [
        {
          label: tFooter('products.solarSystems'),
          href: '/commercial/solar-systems' as const,
          subLinks: [
            {
              label: t('hero.nav.howLargePlantsWorks'),
              href: '/commercial/solar-systems/how-large-plants-works' as const,
            },
            {
              label: t('hero.nav.projectDevelopment'),
              href: '/commercial/solar-systems/project-development' as const,
            },
            {
              label: t('hero.nav.solarCarport'),
              href: '/commercial/solar-systems/solar-carport' as const,
            },
            {
              label: t('hero.nav.contracting'),
              href: '/commercial/solar-systems/contracting' as const,
            },
          ],
        },
        {
          label: tFooter('products.chargingStations'),
          href: '/commercial/charging-stations' as const,
          subLinks: [
            {
              label: t('hero.nav.apartmentBuilding'),
              href: '/commercial/charging-stations/apartment-building' as const,
            },
            {
              label: t('hero.nav.fastChargingStations'),
              href: '/commercial/charging-stations/fast-charging-stations' as const,
            },
            {
              label: t('hero.nav.bidirectionalCharging'),
              href: '/commercial/charging-stations/bidirectional-charging-station' as const,
            },
            {
              label: t('hero.nav.chargingCompany'),
              href: '/commercial/charging-stations/company' as const,
            },
          ],
        },
      ]
    : [
        {
          label: tFooter('products.solarSystems'),
          href: '/solar-systems' as const,
          subLinks: [
            {
              label: t('hero.nav.howItWorks'),
              href: '/how-it-works' as const,
            },
            { label: t('hero.nav.cost'), href: '/cost' as const },
            {
              label: t('hero.nav.amortization'),
              href: '/amortization' as const,
            },
            {
              label: t('hero.nav.carportSolarSystem'),
              href: '/solar-system-carport' as const,
            },
            {
              label: t('hero.nav.solarCalculator'),
              href: '/solar-calculator' as const,
            },
            { label: t('hero.nav.service'), href: '/service' as const },
            {
              label: t('hero.nav.energyStorage'),
              href: '/energy-storage' as const,
            },
            { label: t('hero.nav.repowering'), href: '/repowering' as const },
          ],
        },
        {
          label: tFooter('products.heatPumps'),
          href: '/heat-pumps' as const,
          subLinks: [
            {
              label: t('hero.nav.howItWorks'),
              href: '/heat-pumps/how-it-works' as const,
            },
            { label: t('hero.nav.cost'), href: '/heat-pumps/cost' as const },
            {
              label: t('hero.nav.heatPumpProducts'),
              href: '/heat-pumps/products' as const,
            },
            {
              label: t('hero.nav.withSolarSystem'),
              href: '/heat-pumps/heat-pumps-with-solar-system' as const,
            },
            {
              label: t('hero.nav.service'),
              href: '/heat-pumps/service' as const,
            },
          ],
        },
        {
          label: tFooter('products.chargingStations'),
          href: '/charging-stations' as const,
          subLinks: [
            {
              label: t('hero.nav.singleFamilyHome'),
              href: '/charging-stations/single-family-home' as const,
            },
            {
              label: t('hero.nav.apartmentBuilding'),
              href: '/charging-stations/apartment-building' as const,
            },
            {
              label: t('hero.nav.bidirectionalCharging'),
              href: '/charging-stations/bidirectional-charging-station' as const,
            },
          ],
        },
      ]

  const companyLinks = [
    { label: tFooter('company.aboutUs'), href: '/about-us' as const },
    { label: tFooter('company.history'), href: '/history' as const },
    { label: tFooter('company.team'), href: '/team' as const },
    { label: tFooter('company.investors'), href: '/investors' as const },
    { label: tFooter('company.careers'), href: '/careers' as const },
  ]

  const rows: (
    | { key: string; label: string; panel: SubPanel }
    | {
        key: string
        label: string
        href: '/' | '/commercial' | '/portfolio' | '/contact' | '/login'
      }
  )[] = [
    { key: 'products', label: t('hero.nav.products'), panel: 'products' },
    {
      key: 'plans',
      label: isCommercial ? t('hero.nav.solarAbo') : t('hero.nav.plansPrices'),
      panel: 'plans',
    },
    isCommercial
      ? { key: 'residential', label: tNav('residentialProperties'), href: '/' }
      : {
          key: 'commercial',
          label: tNav('commercialProperties'),
          href: '/commercial',
        },
    { key: 'portfolio', label: tNav('portfolio'), href: '/portfolio' },
    { key: 'company', label: tFooter('company.title'), panel: 'company' },
    { key: 'contact', label: tHeader('contact'), href: '/contact' },
    { key: 'login', label: tHeader('myHome'), href: '/login' },
  ]

  const propertyOptions: { value: PropertyType; label: string }[] = [
    { value: 'single', label: t('hero.nav.singleFamilyHome') },
    { value: 'multi', label: t('hero.nav.apartmentBuilding') },
    { value: 'business', label: t('hero.nav.solarAboBusiness') },
  ]

  const isCurrent = (href: string) => pathname === href

  const subPanelLink = (link: { label: string; href: string }) =>
    cn(
      'block py-3 text-lg text-[#062E25] border-b border-[#062E25]/10 transition-opacity hover:opacity-70',
      isCurrent(link.href) && 'font-medium'
    )

  const renderSubPanel = (
    key: SubPanel,
    title: string,
    body: ReactNode
  ) => (
    <div
      key={key}
      inert={panel !== key}
      aria-hidden={panel !== key}
      className={cn(
        'absolute inset-0 overflow-y-auto overscroll-contain px-6 pb-10 transition-[translate,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
        panel === key
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <button
        type="button"
        ref={el => {
          backRefs.current[key] = el
        }}
        onClick={closePanel}
        className="flex items-center gap-2 py-3 text-base text-[#062E25]/60 transition-opacity hover:opacity-70"
      >
        <ArrowLeft className="size-5" strokeWidth={1.5} />
        {tCommon('back')}
      </button>
      <h2 className="mt-2 mb-4 text-2xl font-medium text-[#062E25]">
        {title}
      </h2>
      {body}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
        <Link
          href="/"
          onClick={onNavigate}
          aria-label="Free State AG, Startseite"
          className="flex items-start gap-2"
        >
          <LogoDark className="h-7.25 w-auto" />
          <Image
            src="/images/swiss-flag.png"
            alt="Swiss flag"
            width={2}
            height={2}
            className="size-3"
            unoptimized
          />
        </Link>
        <SheetClose
          className="-mr-2 p-2 rounded-lg text-[#062E25]/70 transition-opacity hover:opacity-70"
          aria-label={tHeader('closeMenu')}
        >
          <X className="size-8" strokeWidth={1.25} />
        </SheetClose>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          inert={panel !== null}
          aria-hidden={panel !== null}
          className={cn(
            'absolute inset-0 overflow-y-auto overscroll-contain px-6 pt-4 pb-10 flex flex-col transition-[translate,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
            panel === null
              ? 'translate-x-0 opacity-100'
              : '-translate-x-1/4 opacity-0'
          )}
        >
          <nav>
            <ul>
              {rows.map(row => (
                <li key={row.key}>
                  {'panel' in row ? (
                    <button
                      type="button"
                      ref={el => {
                        rowRefs.current[row.panel] = el
                      }}
                      onClick={() => openPanel(row.panel)}
                      className={rowClass}
                    >
                      {row.label}
                      <ArrowRight
                        className={rowArrowClass}
                        strokeWidth={1.25}
                      />
                    </button>
                  ) : (
                    <Link
                      href={row.href}
                      onClick={onNavigate}
                      aria-current={isCurrent(row.href) ? 'page' : undefined}
                      className={cn(
                        rowClass,
                        isCurrent(row.href) && 'font-medium'
                      )}
                    >
                      {row.label}
                      <ArrowRight
                        className={rowArrowClass}
                        strokeWidth={1.25}
                      />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8">
            <LanguageSwitcher isScrolled />
          </div>

          <div className="mt-auto pt-10 flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="mobile-menu-property" className="sr-only">
                {tHeader('propertyType')}
              </label>
              <select
                id="mobile-menu-property"
                value={propertyType}
                onChange={e => setPropertyType(e.target.value as PropertyType)}
                className="w-full h-13 appearance-none rounded-xl border border-[#062E25]/15 bg-white pl-4 pr-12 text-base text-[#062E25] outline-none focus-visible:border-[#062E25]/50"
              >
                {propertyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-5 text-[#062E25]/70"
                strokeWidth={1.5}
              />
            </div>
            <LinkButton
              variant="primary"
              href={CALCULATOR_BY_PROPERTY[propertyType]}
              onClick={onNavigate}
              className="w-full text-lg"
            >
              {t('hero.nav.onlineStarter')}
            </LinkButton>
          </div>
        </div>

        {renderSubPanel(
          'products',
          t('hero.nav.products'),
          <div className="flex flex-col gap-8">
            {productGroups.map(group => (
              <div key={group.href}>
                <Link
                  href={group.href}
                  onClick={onNavigate}
                  aria-current={isCurrent(group.href) ? 'page' : undefined}
                  className="flex items-center justify-between gap-4 pb-2 text-xl font-medium text-[#062E25] transition-opacity hover:opacity-70"
                >
                  {group.label}
                  <ArrowRight
                    className="size-6 shrink-0 text-[#062E25]/50"
                    strokeWidth={1.25}
                  />
                </Link>
                {group.subLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={isCurrent(link.href) ? 'page' : undefined}
                    className={subPanelLink(link)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {renderSubPanel(
          'plans',
          isCommercial ? t('hero.nav.solarAbo') : t('hero.nav.plansPrices'),
          <div>
            {planLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className={subPanelLink(link)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {renderSubPanel(
          'company',
          tFooter('company.title'),
          <div>
            {companyLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className={subPanelLink(link)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileMenu
