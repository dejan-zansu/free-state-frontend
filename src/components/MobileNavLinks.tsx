'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { LinkButton } from './ui/link-button'

interface MobileNavLinksProps {
  isCommercial?: boolean
  onNavigate?: () => void
}

const MobileNavLinks = ({
  isCommercial = false,
  onNavigate,
}: MobileNavLinksProps) => {
  const t = useTranslations('home')
  const tFooter = useTranslations('footer')
  const pathname = usePathname()

  const solarAboLinks = isCommercial
    ? [
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
      ]
    : [
        {
          label: t('hero.nav.solarFree'),
          href: '/solar-free' as const,
        },
        {
          label: t('hero.nav.solarDirect'),
          href: '/solar-direct' as const,
        },
      ]

  const productLinks = isCommercial
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
            {
              label: t('hero.nav.cost'),
              href: '/heat-pumps/cost' as const,
            },
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
        // {
        //   label: tFooter('products.batteryStorage'),
        //   href: '/battery-storage' as const,
        // },
        // {
        //   label: tFooter('products.energyStorage'),
        //   href: '/energy-storage' as const,
        // },
      ]

  const isPathActive = (href: string) => pathname === href
  const isProductActive = (product: (typeof productLinks)[number]) =>
    isPathActive(product.href) ||
    ('subLinks' in product &&
      product.subLinks?.some(s => isPathActive(s.href))) ||
    false
  const isSolarAboActive = solarAboLinks.some(l => isPathActive(l.href))
  const isProductsActive = productLinks.some(p => isProductActive(p))

  const [expanded, setExpanded] = useState<string | null>(
    isSolarAboActive ? 'solarAbo' : isProductsActive ? 'products' : null
  )

  const toggle = (key: string) => {
    setExpanded(prev => (prev === key ? null : key))
  }

  return (
    <div className="flex flex-col gap-1">
      <div>
        <button
          onClick={() => toggle('solarAbo')}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200',
            isSolarAboActive
              ? 'bg-[#E6EAE9] text-[#062E25]'
              : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]'
          )}
        >
          {isCommercial
            ? t('hero.nav.solarAbo')
            : t('hero.nav.plansPrices')}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              expanded === 'solarAbo' && 'rotate-180'
            )}
          />
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            expanded === 'solarAbo'
              ? 'max-h-[400px] opacity-100'
              : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-col gap-0.5 pt-1 pl-3">
            {solarAboLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm transition-colors',
                  isPathActive(link.href)
                    ? 'bg-[#E6EAE9] text-[#062E25] font-medium'
                    : 'text-[#062E25]/80 hover:bg-[rgba(6,46,37,0.08)]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={() => toggle('products')}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200',
            isProductsActive
              ? 'bg-[#E6EAE9] text-[#062E25]'
              : 'bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)]'
          )}
        >
          {t('hero.nav.products')}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              expanded === 'products' && 'rotate-180'
            )}
          />
        </button>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            expanded === 'products'
              ? 'max-h-[800px] opacity-100'
              : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-col gap-0.5 pt-1 pl-3">
            {productLinks.map(product => (
              <div key={product.href}>
                <Link
                  href={product.href}
                  onClick={onNavigate}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors block',
                    isPathActive(product.href)
                      ? 'bg-[#E6EAE9] text-[#062E25]'
                      : 'text-[#062E25] hover:bg-[rgba(6,46,37,0.08)]'
                  )}
                >
                  {product.label}
                </Link>
                {'subLinks' in product &&
                  product.subLinks?.map(sub => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onNavigate}
                      className={cn(
                        'pl-8 pr-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5',
                        isPathActive(sub.href)
                          ? 'bg-[#E6EAE9] text-[#062E25] font-medium'
                          : 'text-[#062E25]/60 hover:bg-[rgba(6,46,37,0.08)] hover:text-[#062E25]'
                      )}
                    >
                      <span
                        className={cn(
                          isPathActive(sub.href)
                            ? 'text-[#062E25]/60'
                            : 'text-[#062E25]/30'
                        )}
                      >
                        →
                      </span>
                      {sub.label}
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <LinkButton
          variant="primary"
          href={isCommercial ? '/commercial/calculator' : '/calculator'}
          className="w-full text-sm"
        >
          {t('hero.nav.onlineStarter')}
        </LinkButton>
      </div>
    </div>
  )
}

export default MobileNavLinks
