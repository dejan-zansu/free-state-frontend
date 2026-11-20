'use client'

import { pvServiceVisible } from '@/lib/pv-service-gate'
import { roofRenovationVisible } from '@/lib/roof-renovation-gate'
import { Flame, House, Plug2, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

export const useSiteNavLinks = (isCommercial: boolean) => {
  const t = useTranslations('home')
  const tFooter = useTranslations('footer')

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
        { label: t('hero.nav.solarAboPlan'), href: '/solar-abo' as const },
        { label: t('hero.nav.solarDirect'), href: '/solar-direct' as const },
      ]

  const roofRenovationGroups = roofRenovationVisible
    ? [
        {
          label: tFooter('products.roofRenovation'),
          href: '/roof-renovation' as const,
          icon: House,
          subLinks: [
            {
              label: tFooter('products.roofRenovationService'),
              href: '/roof-renovation' as const,
            },
            {
              label: tFooter('products.roofRenovationSolar'),
              href: '/roof-renovation/solar' as const,
            },
          ],
        },
      ]
    : []

  const productGroups = isCommercial
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
            ...(pvServiceVisible
              ? [
                  {
                    label: t('hero.nav.pvService'),
                    href: '/service' as const,
                  },
                ]
              : []),
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
        ...roofRenovationGroups,
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
        ...roofRenovationGroups,
      ]

  return { planLinks, productGroups }
}
