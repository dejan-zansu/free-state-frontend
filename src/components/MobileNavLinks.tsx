'use client'

import { Link } from '@/i18n/navigation'
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
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key))
  }

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

  return (
    <div className="flex flex-col gap-1">
      <div>
        <button
          onClick={() => toggle('solarAbo')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)] transition-all duration-200"
        >
          {t('hero.nav.solarAbo')}
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
            expanded === 'solarAbo' ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-col gap-0.5 pt-1 pl-3">
            {solarAboLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className="px-4 py-2.5 rounded-lg text-sm text-[#062E25]/80 hover:bg-[rgba(6,46,37,0.08)] transition-colors"
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
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium bg-[rgba(6,46,37,0.1)] text-[#062E25] hover:bg-[rgba(6,46,37,0.15)] transition-all duration-200"
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
            expanded === 'products' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-col gap-0.5 pt-1 pl-3">
            {productLinks.map((product) => (
              <div key={product.href}>
                <Link
                  href={product.href}
                  onClick={onNavigate}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-[#062E25] hover:bg-[rgba(6,46,37,0.08)] transition-colors block"
                >
                  {product.label}
                </Link>
                {'subLinks' in product &&
                  product.subLinks?.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onNavigate}
                      className="pl-8 pr-4 py-2 rounded-lg text-sm text-[#062E25]/60 hover:bg-[rgba(6,46,37,0.08)] hover:text-[#062E25] transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-[#062E25]/30">→</span>
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
          href="/calculator"
          className="w-full text-sm"
        >
          {t('hero.nav.onlineStarter')}
        </LinkButton>
      </div>
    </div>
  )
}

export default MobileNavLinks
