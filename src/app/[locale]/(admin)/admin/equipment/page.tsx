'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  Battery,
  Box,
  ChevronRight,
  CircuitBoard,
  Factory,
  Flame,
  Package,
  PanelTop,
  Zap,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export default function AdminEquipmentPage() {
  const locale = useLocale()
  const t = useTranslations('admin.equipment')
  const prefix = `/${locale}/admin/equipment`

  const equipmentTypes = [
    { label: t('manufacturers'), href: 'manufacturers', icon: Factory, description: t('manufacturersDesc') },
    { label: t('solarPanels'), href: 'solar-panels', icon: PanelTop, description: t('solarPanelsDesc') },
    { label: t('inverters'), href: 'inverters', icon: Zap, description: t('invertersDesc') },
    { label: t('batteries'), href: 'batteries', icon: Battery, description: t('batteriesDesc') },
    { label: t('mountingSystems'), href: 'mounting-systems', icon: Box, description: t('mountingSystemsDesc') },
    { label: t('ems'), href: 'ems', icon: CircuitBoard, description: t('emsDesc') },
    { label: t('heatPumps'), href: 'heat-pumps', icon: Flame, description: t('heatPumpsDesc') },
    { label: t('packages'), href: 'packages', icon: Package, description: t('packagesDesc') },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {equipmentTypes.map((type) => (
          <Link key={type.href} href={`${prefix}/${type.href}`}>
            <Card className="border-[#062E25]/10 hover:border-[#062E25]/30 transition-colors cursor-pointer h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#062E25]/5 flex items-center justify-center shrink-0">
                  <type.icon className="h-5 w-5 text-[#062E25]/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#062E25]">{type.label}</p>
                  <p className="text-sm text-[#062E25]/50 truncate">{type.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#062E25]/30 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
