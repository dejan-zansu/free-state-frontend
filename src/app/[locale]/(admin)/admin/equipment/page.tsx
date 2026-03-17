'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
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

const equipmentTypes = [
  { label: 'Manufacturers', href: 'manufacturers', icon: Factory, description: 'Manage equipment manufacturers' },
  { label: 'Solar Panels', href: 'solar-panels', icon: PanelTop, description: 'Panel models and series' },
  { label: 'Inverters', href: 'inverters', icon: Zap, description: 'String, micro, and hybrid inverters' },
  { label: 'Batteries', href: 'batteries', icon: Battery, description: 'Energy storage systems' },
  { label: 'Mounting Systems', href: 'mounting-systems', icon: Box, description: 'Roof and ground mount systems' },
  { label: 'Energy Management', href: 'ems', icon: CircuitBoard, description: 'Smart energy controllers' },
  { label: 'Heat Pumps', href: 'heat-pumps', icon: Flame, description: 'Air, brine, and water heat pumps' },
  { label: 'Packages', href: 'packages', icon: Package, description: 'Subscription and abo packages' },
]

export default function AdminEquipmentPage() {
  const locale = useLocale()
  const prefix = `/${locale}/admin/equipment`

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">Equipment Catalog</h1>

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
