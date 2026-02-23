'use client'

import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface HeroNavProps {
  isCommercial?: boolean
}

const HeroNav = ({ isCommercial = false }: HeroNavProps) => {
  const t = useTranslations('home')
  const tFooter = useTranslations('footer')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const solarAboLinks = isCommercial
    ? [
        {
          label: t('hero.nav.solarAboBusiness'),
          href: '/commercial/solar-abo/solar-abo-business' as const,
        },
        {
          label: t('hero.nav.solarAboAgro'),
          href: '/commercial/solar-abo/solar-abo-agro' as const,
        },
        {
          label: t('hero.nav.solarAboPublic'),
          href: '/commercial/solar-abo/solar-abo-public' as const,
        },
      ]
    : [
        {
          label: t('hero.nav.solarAboHome'),
          href: '/solar-abo/solar-abo-home' as const,
        },
        {
          label: t('hero.nav.solarAboMulti'),
          href: '/solar-abo/solar-abo-multi' as const,
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
              label: t('hero.nav.howSolarPowerSystemWorks'),
              href: '/commercial/solar-systems/how-solar-power-system-works' as const,
            },
            {
              label: t('hero.nav.projectDevelopment'),
              href: '/commercial/solar-systems/project-development' as const,
            },
            {
              label: t('hero.nav.solarCarport'),
              href: '/commercial/solar-systems/solar-carport' as const,
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
              label: t('hero.nav.service'),
              href: '/heat-pumps/service' as const,
            },
            {
              label: t('hero.nav.withSolarSystem'),
              href: '/heat-pumps/heat-pumps-with-solar-system' as const,
            },
          ],
        },
        {
          label: tFooter('products.chargingStations'),
          href: '/charging-stations' as const,
        },
        {
          label: tFooter('products.batteryStorage'),
          href: '/battery-storage' as const,
        },
        {
          label: tFooter('products.energyManagement'),
          href: '/energy-management' as const,
        },
      ]

  const hasDropdown = hoveredItem === 'solarAbo' || hoveredItem === 'products'

  return (
    <div className="absolute top-[60px] sm:top-[80px] md:top-[100px] left-1/2 -translate-x-1/2 w-full hidden md:flex justify-center z-20 px-4">
      <div
        className={cn(
          'inline-flex flex-col items-center bg-white/20 backdrop-blur-[30px] border border-white/22 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden max-w-[calc(100vw-2rem)]',
          hasDropdown
            ? 'rounded-[20px] sm:rounded-[24px] md:rounded-[30px]'
            : 'rounded-full sm:rounded-[24px] md:rounded-[30px]'
        )}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-[30px] pl-3 sm:pl-6 md:pl-[30px] pr-1.5 sm:pr-4 md:pr-[9px] py-1.5 sm:py-2">
          <div className="flex flex-row items-center gap-3 sm:gap-6 md:gap-9">
            <div onMouseEnter={() => setHoveredItem('solarAbo')}>
              <Link
                href="/solar-abo"
                className="text-white font-medium text-xs sm:text-sm md:text-base hover:opacity-80 transition-opacity block whitespace-nowrap"
              >
                {t('hero.nav.solarAbo')}
              </Link>
            </div>
            <div onMouseEnter={() => setHoveredItem('products')}>
              <Link
                href="/products"
                className="text-white font-medium text-xs sm:text-sm md:text-base hover:opacity-80 transition-opacity block whitespace-nowrap"
              >
                {t('hero.nav.products')}
              </Link>
            </div>
          </div>
          <div className="shrink-0">
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href="/calculator"
              className="text-xs sm:text-sm md:text-base pl-3 sm:pl-6 gap-1.5 sm:gap-3 [&>div]:w-7 [&>div]:h-7 sm:[&>div]:w-10 sm:[&>div]:h-10"
            >
              {t('hero.nav.onlineStarter')}
            </LinkButton>
          </div>
        </div>

        <div
          className={cn(
            'self-stretch overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            hasDropdown
              ? 'max-h-[800px] opacity-100'
              : 'max-h-0 opacity-0'
          )}
        >
          <div className="border-t border-white/10 px-3 sm:px-4 md:px-5 pt-3 pb-2">
            {hoveredItem === 'solarAbo' && (
              <div className="flex flex-col gap-1">
                {solarAboLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2.5 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-all duration-500 whitespace-nowrap',
                      hasDropdown
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-1 opacity-0'
                    )}
                    style={{
                      transitionDelay: hasDropdown
                        ? `${150 + index * 50}ms`
                        : `${(solarAboLinks.length - index) * 30}ms`,
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {hoveredItem === 'products' && (
              <div className="flex flex-col md:flex-row md:gap-2 lg:gap-4">
                {productLinks.map((product, columnIndex) => (
                  <div
                    key={product.href}
                    className={cn(
                      'flex flex-col transition-all duration-500',
                      hasDropdown
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-1 opacity-0'
                    )}
                    style={{
                      transitionDelay: hasDropdown
                        ? `${150 + columnIndex * 70}ms`
                        : '0ms',
                    }}
                  >
                    <Link
                      href={product.href}
                      className="px-3 py-2 text-white text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap block"
                    >
                      {product.label}
                    </Link>
                    {'subLinks' in product &&
                      product.subLinks?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="px-3 py-1.5 text-white/70 text-xs rounded-lg hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
                        >
                          <span className="text-white/40">→</span>
                          {sub.label}
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroNav
