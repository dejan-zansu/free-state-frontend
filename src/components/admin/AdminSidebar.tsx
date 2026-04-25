'use client'

import {
  BarChart3,
  Battery,
  Box,
  Briefcase,
  CircuitBoard,
  ClipboardCheck,
  Coins,
  Factory,
  FileCheck,
  FileText,
  Flame,
  HandCoins,
  LayoutDashboard,
  LineChart,
  Mail,
  Menu,
  MessageSquareText,
  Newspaper,
  Package,
  PanelTop,
  Plug,
  Ticket,
  UserPlus,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

function useNavGroups() {
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
      label: t('groupResidential'),
      items: [
        { label: t('residentialContracts'), href: `${prefix}/contracts`, icon: FileText },
        { label: t('residentialLeads'),     href: `${prefix}/leads`,     icon: BarChart3 },
        { label: t('users'),                href: `${prefix}/users`,     icon: Users },
      ],
    },
    {
      label: t('groupCommercial'),
      items: [
        { label: t('commercialLeads'),      href: `${prefix}/commercial-leads`, icon: Briefcase },
      ],
    },
    {
      label: t('groupOperations'),
      items: [
        { label: t('support'),              href: `${prefix}/support`,                icon: Ticket },
        { label: t('contacts'),             href: `${prefix}/contacts`,               icon: MessageSquareText },
        { label: t('quoteRequests'),        href: `${prefix}/quote-requests`,         icon: FileCheck },
        { label: t('investorRequests'),     href: `${prefix}/investor-requests`,      icon: Briefcase },
        { label: t('maintenanceInquiries'), href: `${prefix}/maintenance-inquiries`,  icon: Wrench },
        { label: t('inspections'),          href: `${prefix}/inspections`,            icon: ClipboardCheck },
        { label: t('careerSubscriptions'),  href: `${prefix}/career-subscriptions`,   icon: UserPlus },
      ],
    },
    {
      label: t('groupContent'),
      items: [
        { label: t('blog'),       href: `${prefix}/blog`,       icon: Newspaper },
        { label: t('newsletter'), href: `${prefix}/newsletter`, icon: Mail },
      ],
    },
    {
      label: t('groupResources'),
      items: [
        { label: t('electricityPrices'), href: `${prefix}/electricity-prices`, icon: Plug },
        { label: t('subsidyRates'), href: `${prefix}/subsidy-rates`, icon: HandCoins },
        { label: t('feedInTariffs'), href: `${prefix}/feed-in-tariffs`, icon: Coins },
        { label: t('referenceMarketPrices'), href: `${prefix}/reference-market-prices`, icon: LineChart },
      ],
    },
    {
      label: t('groupEquipment'),
      items: [
        { label: t('manufacturers'),   href: `${prefix}/equipment/manufacturers`,    icon: Factory },
        { label: t('solarPanels'),     href: `${prefix}/equipment/solar-panels`,     icon: PanelTop },
        { label: t('inverters'),       href: `${prefix}/equipment/inverters`,        icon: Zap },
        { label: t('batteries'),       href: `${prefix}/equipment/batteries`,        icon: Battery },
        { label: t('mountingSystems'), href: `${prefix}/equipment/mounting-systems`, icon: Box },
        { label: t('ems'),             href: `${prefix}/equipment/ems`,              icon: CircuitBoard },
        { label: t('heatPumps'),       href: `${prefix}/equipment/heat-pumps`,       icon: Flame },
        { label: t('packages'),        href: `${prefix}/equipment/packages`,         icon: Package },
      ],
    },
  ]

  return navGroups
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const navGroups = useNavGroups()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="p-3">
      {navGroups.map((group, i) => (
        <div key={i} className={cn(i > 0 && 'mt-4')}>
          {group.label && (
            <p className="px-3 mb-1 text-sm font-semibold uppercase tracking-wider text-[#062E25]/40">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
  )
}

export function AdminSidebar() {
  const t = useTranslations('admin.sidebar')

  return (
    <aside className="hidden lg:block sticky top-0 w-64 h-screen overflow-y-auto border-r border-[#062E25]/10 bg-white shrink-0">
      <div className="p-6 border-b border-[#062E25]/10">
        <h2 className="text-lg font-bold text-[#062E25]">{t('title')}</h2>
      </div>
      <SidebarNav />
    </aside>
  )
}

export function AdminSidebarMobileTrigger() {
  const t = useTranslations('admin.sidebar')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label={t('title')}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 sm:max-w-xs">
        <div className="p-6 border-b border-[#062E25]/10">
          <SheetTitle className="text-lg font-bold text-[#062E25]">
            {t('title')}
          </SheetTitle>
        </div>
        <div className="overflow-y-auto flex-1">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
