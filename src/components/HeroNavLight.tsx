'use client'

import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface HeroNavLightProps {
  isCommercial?: boolean
}

const HeroNavLight = ({ isCommercial = false }: HeroNavLightProps) => {
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

  const productLinks = [
    {
      label: tFooter('products.solarSystems'),
      href: '/solar-systems' as const,
      subLinks: [
        { label: t('hero.nav.howItWorks'), href: '/how-it-works' as const },
        { label: t('hero.nav.cost'), href: '/cost' as const },
        { label: t('hero.nav.amortization'), href: '/amortization' as const },
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
      label: tFooter('products.batteryStorage'),
      href: '/battery-storage' as const,
    },
    { label: tFooter('products.heatPumps'), href: '/heat-pumps' as const },
    {
      label: tFooter('products.chargingStations'),
      href: '/charging-stations' as const,
    },
    {
      label: tFooter('products.energyManagement'),
      href: '/energy-management' as const,
    },
  ]

  const hasDropdown = hoveredItem === 'solarAbo' || hoveredItem === 'products'

  return (
    <div className="absolute top-[60px] sm:top-[80px] md:top-[100px] left-1/2 -translate-x-1/2 w-full flex justify-center z-20 px-4">
      <div
        className={cn(
          'inline-flex flex-col gap-0 pl-4 sm:pl-6 md:pl-[30px] pr-2 sm:pr-4 md:pr-[9px] bg-white/30 backdrop-blur-[30px] rounded-2xl sm:rounded-[24px] md:rounded-[30px] border border-[#9CA9A6]/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden py-2 max-w-[calc(100vw-2rem)]',
          isCommercial
            ? 'shadow-[0px_25px_34px_0px_rgba(159,62,79,0.1)]'
            : 'shadow-[0px_25px_34px_0px_rgba(183,254,26,0.1)]'
        )}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-[30px]">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-9">
            <div
              className="relative"
              onMouseEnter={() => setHoveredItem('solarAbo')}
            >
              <Link
                href="/solar-abo"
                className="text-[#062E25] font-medium text-base sm:text-base hover:opacity-80 transition-opacity block whitespace-nowrap tracking-tight"
              >
                {t('hero.nav.solarAbo')}
              </Link>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setHoveredItem('products')}
            >
              <Link
                href="/products"
                className="text-[#062E25] font-medium text-base sm:text-base hover:opacity-80 transition-opacity block whitespace-nowrap tracking-tight"
              >
                {t('hero.nav.products')}
              </Link>
            </div>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            <LinkButton
              variant={isCommercial ? 'secondary' : 'primary'}
              href={isCommercial ? '/calculator' : '/solar-abo-calculator'}
            >
              {t('hero.nav.onlineStarter')}
            </LinkButton>
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col gap-1 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            hasDropdown
              ? 'max-h-[800px] opacity-100 pt-4 mt-2 border-t border-[#062E25]/10'
              : 'max-h-0 opacity-0 pt-0 mt-0 border-t-0'
          )}
        >
          {hoveredItem === 'solarAbo' &&
            solarAboLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2.5 text-foreground text-base font-medium rounded-lg hover:bg-[#062E25]/10 transition-all duration-300 whitespace-nowrap',
                  hasDropdown
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-1 opacity-0'
                )}
                style={{
                  transitionDelay: hasDropdown
                    ? `${index * 40}ms`
                    : `${(solarAboLinks.length - index) * 20}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
          {hoveredItem === 'products' &&
            (() => {
              let itemIndex = 0
              return productLinks.map(link => {
                const currentIndex = itemIndex++
                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'px-4 py-2 text-foreground text-base font-semibold rounded-lg hover:bg-[#062E25]/10 transition-all duration-300 whitespace-nowrap block',
                        hasDropdown
                          ? 'translate-y-0 opacity-100'
                          : '-translate-y-1 opacity-0'
                      )}
                      style={{
                        transitionDelay: hasDropdown
                          ? `${currentIndex * 40}ms`
                          : '0ms',
                      }}
                    >
                      {link.label}
                    </Link>
                    {'subLinks' in link &&
                      link.subLinks?.map(sub => {
                        const subIndex = itemIndex++
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              'pl-8 pr-4 py-1.5 text-foreground/60 text-base rounded-lg hover:bg-[#062E25]/10 hover:text-foreground transition-all duration-300 whitespace-nowrap flex items-center gap-2',
                              hasDropdown
                                ? 'translate-y-0 opacity-100'
                                : '-translate-y-1 opacity-0'
                            )}
                            style={{
                              transitionDelay: hasDropdown
                                ? `${subIndex * 40}ms`
                                : '0ms',
                            }}
                          >
                            <span className="text-foreground/30">→</span>
                            {sub.label}
                          </Link>
                        )
                      })}
                  </div>
                )
              })
            })()}
        </div>
      </div>
    </div>
  )
}

export default HeroNavLight
