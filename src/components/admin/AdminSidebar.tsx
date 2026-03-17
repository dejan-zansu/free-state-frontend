'use client'

import {
  BarChart3,
  Battery,
  Box,
  ChevronDown,
  CircuitBoard,
  Factory,
  FileText,
  Flame,
  LayoutDashboard,
  Package,
  PanelTop,
  Settings,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string; icon: React.ElementType }[]
}

export function AdminSidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  const [equipmentOpen, setEquipmentOpen] = useState(pathname.includes('/equipment'))

  const prefix = `/${locale}/admin`

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: `${prefix}/dashboard`, icon: LayoutDashboard },
    { label: 'Users', href: `${prefix}/users`, icon: Users },
    { label: 'Leads', href: `${prefix}/leads`, icon: BarChart3 },
    { label: 'Contracts', href: `${prefix}/contracts`, icon: FileText },
    {
      label: 'Equipment',
      href: `${prefix}/equipment`,
      icon: Settings,
      children: [
        { label: 'Manufacturers', href: `${prefix}/equipment/manufacturers`, icon: Factory },
        { label: 'Solar Panels', href: `${prefix}/equipment/solar-panels`, icon: PanelTop },
        { label: 'Inverters', href: `${prefix}/equipment/inverters`, icon: Zap },
        { label: 'Batteries', href: `${prefix}/equipment/batteries`, icon: Battery },
        { label: 'Mounting Systems', href: `${prefix}/equipment/mounting-systems`, icon: Box },
        { label: 'EMS', href: `${prefix}/equipment/ems`, icon: CircuitBoard },
        { label: 'Heat Pumps', href: `${prefix}/equipment/heat-pumps`, icon: Flame },
        { label: 'Packages', href: `${prefix}/equipment/packages`, icon: Package },
      ],
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-64 min-h-screen border-r border-[#062E25]/10 bg-white shrink-0">
      <div className="p-6 border-b border-[#062E25]/10">
        <h2 className="text-lg font-bold text-[#062E25]">Admin Panel</h2>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setEquipmentOpen(!equipmentOpen)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-[#062E25]/5 text-[#062E25]'
                      : 'text-[#062E25]/60 hover:bg-[#062E25]/5 hover:text-[#062E25]'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', equipmentOpen && 'rotate-180')} />
                </button>
                {equipmentOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          isActive(child.href)
                            ? 'bg-[#062E25]/10 text-[#062E25] font-medium'
                            : 'text-[#062E25]/50 hover:bg-[#062E25]/5 hover:text-[#062E25]'
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-[#062E25]/10 text-[#062E25]'
                  : 'text-[#062E25]/60 hover:bg-[#062E25]/5 hover:text-[#062E25]'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
