'use client'

import { LinkButton, linkButtonVariants } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { type VariantProps } from 'class-variance-authority'
import { ArrowUpRight, Flame, Plug2, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, useState } from 'react'

type LinkButtonVariant = NonNullable<
  VariantProps<typeof linkButtonVariants>['variant']
>

interface HeroNavLightProps {
  isCommercial?: boolean
  ctaVariant?: LinkButtonVariant
}

const HeroNavLight = ({
  isCommercial = false,
  ctaVariant,
}: HeroNavLightProps) => {
  const t = useTranslations('home')
  const tFooter = useTranslations('footer')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const lastActiveItem = useRef<string | null>(null)

  if (hoveredItem) {
    lastActiveItem.current = hoveredItem
  }

  const solarAboLinks = isCommercial
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
          icon: Sun,
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
          icon: Plug2,
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
          icon: Sun,
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
          icon: Flame,
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
          icon: Plug2,
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
        //   icon: Battery,
        //   subLinks: [],
        // },
        // {
        //   label: tFooter('products.energyStorage'),
        //   href: '/energy-storage' as const,
        //   icon: Zap,
        //   subLinks: [],
        // },
      ]

  const hasDropdown = hoveredItem === 'solarAbo' || hoveredItem === 'products'
  const displayItem = hoveredItem || lastActiveItem.current
  const promoHref = isCommercial ? '/commercial/solar-free' : '/solar-free'
  const promoTitle = isCommercial
    ? t('hero.nav.promoTitleCommercial')
    : t('hero.nav.promoTitle')

  return (
    <div className="absolute md:top-[120px] left-1/2 -translate-x-1/2 w-full hidden md:flex justify-center z-20 px-4">
      <div
        className={cn(
          'inline-flex flex-col items-center bg-white/30 backdrop-blur-[30px] border border-[#9CA9A6]/30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] max-w-[calc(100vw-2rem)]',
          hasDropdown
            ? 'rounded-[20px] sm:rounded-[24px] md:rounded-[30px]'
            : 'rounded-full sm:rounded-[24px] md:rounded-[30px]',
          isCommercial
            ? 'shadow-[0px_25px_34px_0px_rgba(159,62,79,0.1)]'
            : 'shadow-[0px_25px_34px_0px_rgba(183,254,26,0.1)]'
        )}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-[30px] pl-3 sm:pl-6 md:pl-[30px] pr-1.5 sm:pr-4 md:pr-[9px] py-1.5 sm:py-2">
          <div className="flex flex-row items-center gap-3 sm:gap-6 md:gap-9">
            <div onMouseEnter={() => setHoveredItem('solarAbo')}>
              <Link
                href="/solar-free"
                className="text-[#062E25] font-medium text-sm sm:text-base md:text-base hover:opacity-80 transition-opacity block whitespace-nowrap tracking-tight"
              >
                {isCommercial
                  ? t('hero.nav.solarAbo')
                  : t('hero.nav.plansPrices')}
              </Link>
            </div>
            <div onMouseEnter={() => setHoveredItem('products')}>
              <Link
                href="/products"
                className="text-[#062E25] font-medium text-sm sm:text-base md:text-base hover:opacity-80 transition-opacity block whitespace-nowrap tracking-tight"
              >
                {t('hero.nav.products')}
              </Link>
            </div>
          </div>
          <div className="shrink-0">
            <LinkButton
              variant={
                ctaVariant ?? (isCommercial ? 'secondary' : 'primary')
              }
              href={isCommercial ? '/commercial/calculator' : '/calculator'}
              className="text-sm sm:text-base md:text-base pl-3 sm:pl-6 gap-1.5 sm:gap-3 [&>div]:w-7 [&>div]:h-7 sm:[&>div]:w-10 sm:[&>div]:h-10"
            >
              {t('hero.nav.onlineStarter')}
            </LinkButton>
          </div>
        </div>

        <div
          className={cn(
            'grid transition-[grid-template-rows,grid-template-columns] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            hasDropdown
              ? 'grid-rows-[1fr] grid-cols-[1fr]'
              : 'grid-rows-[0fr] grid-cols-[0fr]'
          )}
        >
          <div className="overflow-hidden min-h-0 min-w-0">
            <div
              className={cn(
                'border-t border-[#062E25]/10 transition-opacity duration-300 ease-out',
                hasDropdown ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="grid">
                <div
                  className={cn(
                    'col-start-1 row-start-1 transition-all duration-300',
                    displayItem === 'solarAbo' && hasDropdown
                      ? 'flex flex-row gap-4 lg:gap-5 p-4 md:p-[18px] opacity-100 visible'
                      : 'opacity-0 invisible w-0 h-0 overflow-hidden'
                  )}
                >
                  <div className="flex flex-col min-w-[200px] pt-3">
                    <div className="flex items-center gap-1.5 text-[#062E25] text-sm font-medium whitespace-nowrap mb-[30px]">
                      <Plug2 className="w-[15px] h-[15px]" strokeWidth={1.5} />
                      <span>{t('hero.nav.ourPackages')}</span>
                    </div>
                    {solarAboLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'py-[7px] text-[#062E25] text-sm font-light border-b border-[#062E25]/30 hover:border-[#062E25] transition-all duration-400 whitespace-nowrap',
                          displayItem === 'solarAbo' && hasDropdown
                            ? 'translate-y-0 opacity-100'
                            : '-translate-y-1 opacity-0'
                        )}
                        style={{
                          transitionDelay:
                            displayItem === 'solarAbo' && hasDropdown
                              ? `${100 + index * 40}ms`
                              : '0ms',
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={promoHref}
                    className="relative hidden lg:block w-[291px] h-[301px] rounded-[10px] overflow-hidden group shrink-0"
                  >
                    <Image
                      src="/images/nav/nav-promo.webp"
                      alt={promoTitle}
                      fill
                      sizes="291px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,66,53,0.15)_0%,rgba(12,66,53,0.3)_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(72,144,144,0.1)_0%,rgba(72,144,144,0.7)_100%)]" />
                    <h3 className="absolute top-4 left-4 right-4 text-white font-medium text-xl">
                      {promoTitle}
                    </h3>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-sm font-medium">
                      <span>{t('hero.nav.promoCta')}</span>
                      <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                    </div>
                  </Link>
                </div>
                <div
                  className={cn(
                    'col-start-1 row-start-1 transition-all duration-300',
                    displayItem === 'products' && hasDropdown
                      ? 'flex flex-row gap-4 lg:gap-5 p-4 md:p-[18px] opacity-100 visible'
                      : 'opacity-0 invisible w-0 h-0 overflow-hidden'
                  )}
                >
                  <div className="flex flex-row gap-6 lg:gap-[38px] pt-3">
                    {productLinks.map((product, columnIndex) => {
                      const Icon = product.icon
                      return (
                        <div
                          key={product.href}
                          className={cn(
                            'flex flex-col w-[144px] transition-all duration-400',
                            displayItem === 'products' && hasDropdown
                              ? 'translate-y-0 opacity-100'
                              : '-translate-y-1 opacity-0'
                          )}
                          style={{
                            transitionDelay:
                              displayItem === 'products' && hasDropdown
                                ? `${100 + columnIndex * 50}ms`
                                : '0ms',
                          }}
                        >
                          <Link
                            href={product.href}
                            className="flex items-center gap-1.5 text-[#062E25] text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap mb-[30px]"
                          >
                            <Icon
                              className="w-[15px] h-[15px]"
                              strokeWidth={1.5}
                            />
                            <span>{product.label}</span>
                          </Link>
                          <div className="flex flex-col">
                            {product.subLinks?.map(sub => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className="py-[7px] text-[#062E25] text-sm font-light border-b border-[#062E25]/30 hover:border-[#062E25] transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <Link
                    href={promoHref}
                    className="relative hidden lg:block w-[291px] h-[301px] rounded-[10px] overflow-hidden group shrink-0"
                  >
                    <Image
                      src="/images/nav/nav-promo.webp"
                      alt={promoTitle}
                      fill
                      sizes="291px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,66,53,0.15)_0%,rgba(12,66,53,0.3)_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(72,144,144,0.1)_0%,rgba(72,144,144,0.7)_100%)]" />
                    <h3 className="absolute top-4 left-4 right-4 text-white font-medium text-xl">
                      {promoTitle}
                    </h3>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-sm font-medium">
                      <span>{t('hero.nav.promoCta')}</span>
                      <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroNavLight
