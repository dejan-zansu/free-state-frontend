'use client'

import {
  BarChart3,
  Battery,
  Box,
  CircuitBoard,
  Factory,
  FileText,
  Flame,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Newspaper,
  Package,
  PanelTop,
  Ticket,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

export function AdminSidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('admin.sidebar')

  const prefix = `/${locale}/admin`

  const navGroups: { label?: string; items: NavItem[] }[] = [
    {
      items: [
        { label: t('dashboard'), href: `${prefix}/dashboard`, icon: LayoutDashboard },
      ],
    },
    {
      label: t('groupContent'),
      items: [
        { label: t('blog'), href: `${prefix}/blog`, icon: Newspaper },
        { label: t('newsletter'), href: `${prefix}/newsletter`, icon: Mail },
      ],
    },
    {
      label: t('groupCrm'),
      items: [
        { label: t('leads'), href: `${prefix}/leads`, icon: BarChart3 },
        { label: t('contracts'), href: `${prefix}/contracts`, icon: FileText },
        { label: t('support'), href: `${prefix}/support`, icon: Ticket },
        { label: t('users'), href: `${prefix}/users`, icon: Users },
      ],
    },
    {
      label: t('groupSubmissions'),
      items: [
        { label: t('contacts'), href: `${prefix}/contacts`, icon: MessageSquareText },
        { label: t('maintenanceInquiries'), href: `${prefix}/maintenance-inquiries`, icon: Wrench },
      ],
    },
    {
      label: t('groupEquipment'),
      items: [
        { label: t('manufacturers'), href: `${prefix}/equipment/manufacturers`, icon: Factory },
        { label: t('solarPanels'), href: `${prefix}/equipment/solar-panels`, icon: PanelTop },
        { label: t('inverters'), href: `${prefix}/equipment/inverters`, icon: Zap },
        { label: t('batteries'), href: `${prefix}/equipment/batteries`, icon: Battery },
        { label: t('mountingSystems'), href: `${prefix}/equipment/mounting-systems`, icon: Box },
        { label: t('ems'), href: `${prefix}/equipment/ems`, icon: CircuitBoard },
        { label: t('heatPumps'), href: `${prefix}/equipment/heat-pumps`, icon: Flame },
        { label: t('packages'), href: `${prefix}/equipment/packages`, icon: Package },
      ],
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="w-64 min-h-screen border-r border-[#062E25]/10 bg-white shrink-0">
      <div className="p-6 border-b border-[#062E25]/10">
        <h2 className="text-lg font-bold text-[#062E25]">{t('title')}</h2>
      </div>
      <nav className="p-3">
        {navGroups.map((group, i) => (
          <div key={i} className={cn(i > 0 && 'mt-4')}>
            {group.label && (
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-[#062E25]/40">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
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
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
