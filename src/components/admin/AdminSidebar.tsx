'use client'

import {
  Activity,
  BarChart3,
  Battery,
  Box,
  Briefcase,
  Building2,
  Calculator,
  CircuitBoard,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Eye,
  Factory,
  FileCheck,
  FileText,
  Flame,
  FlaskConical,
  FolderOpen,
  HandCoins,
  Images,
  Inbox,
  LayoutDashboard,
  LineChart,
  Mail,
  Megaphone,
  Menu,
  MessageSquareText,
  Newspaper,
  Package,
  PanelTop,
  Plug,
  Radar,
  Settings,
  Sparkles,
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

import { TasksNavBadge } from '@/components/admin/TasksNavBadge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCapabilities } from '@/lib/capabilities'
import { cn } from '@/lib/utils'
import type { Capability } from '@/types/auth'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: React.ReactNode
  capability?: Capability
}

function useNavGroups() {
  const locale = useLocale()
  const t = useTranslations('admin.sidebar')

  const prefix = `/${locale}/admin`

  const navGroups: { label?: string; items: NavItem[] }[] = [
    {
      items: [
        {
          label: t('dashboard'),
          href: `${prefix}/dashboard`,
          icon: LayoutDashboard,
          capability: 'users.manage',
        },
      ],
    },
    {
      label: t('groupResidential'),
      items: [
        {
          label: t('residentialContracts'),
          href: `${prefix}/contracts`,
          icon: FileText,
          capability: 'users.manage',
        },
        {
          label: t('residentialLeads'),
          href: `${prefix}/leads`,
          icon: BarChart3,
          capability: 'users.manage',
        },
        {
          label: t('residentialProjects'),
          href: `${prefix}/projects`,
          icon: Calculator,
          capability: 'users.manage',
        },
        {
          label: t('users'),
          href: `${prefix}/users`,
          icon: Users,
          capability: 'users.manage',
        },
      ],
    },
    {
      label: t('groupCommercial'),
      items: [
        {
          label: t('commercialLeads'),
          href: `${prefix}/commercial-leads`,
          icon: Briefcase,
          capability: 'sales.tools',
        },
        {
          label: t('outreach'),
          href: `${prefix}/outreach`,
          icon: Radar,
          capability: 'sales.tools',
        },
        {
          label: t('outreachQueues'),
          href: `${prefix}/outreach/queue`,
          icon: Inbox,
          capability: 'sales.tools',
        },
        {
          label: t('outreachStats'),
          href: `${prefix}/outreach/stats`,
          icon: LineChart,
          capability: 'sales.tools',
        },
      ],
    },
    {
      label: t('groupOperations'),
      items: [
        {
          label: t('workspaces'),
          href: `${prefix}/workspaces`,
          icon: FolderOpen,
          capability: 'projects.access',
        },
        {
          label: t('tasks'),
          href: `${prefix}/tasks`,
          icon: ClipboardList,
          badge: <TasksNavBadge />,
          capability: 'sales.tools',
        },
        {
          label: t('support'),
          href: `${prefix}/support`,
          icon: Ticket,
          capability: 'users.manage',
        },
        {
          label: t('contacts'),
          href: `${prefix}/contacts`,
          icon: MessageSquareText,
          capability: 'users.manage',
        },
        {
          label: t('quoteRequests'),
          href: `${prefix}/quote-requests`,
          icon: FileCheck,
          capability: 'users.manage',
        },
        {
          label: t('investorRequests'),
          href: `${prefix}/investor-requests`,
          icon: Briefcase,
          capability: 'users.manage',
        },
        {
          label: t('maintenanceInquiries'),
          href: `${prefix}/maintenance-inquiries`,
          icon: Wrench,
          capability: 'users.manage',
        },
        {
          label: t('inspections'),
          href: `${prefix}/inspections`,
          icon: ClipboardCheck,
          capability: 'users.manage',
        },
        {
          label: t('careerSubscriptions'),
          href: `${prefix}/career-subscriptions`,
          icon: UserPlus,
          capability: 'users.manage',
        },
      ],
    },
    {
      label: t('groupContent'),
      items: [
        {
          label: t('blog'),
          href: `${prefix}/blog`,
          icon: Newspaper,
          capability: 'users.manage',
        },
        {
          label: t('references'),
          href: `${prefix}/references`,
          icon: Building2,
          capability: 'users.manage',
        },
        {
          label: t('newsletter'),
          href: `${prefix}/newsletter`,
          icon: Mail,
          capability: 'users.manage',
        },
      ],
    },
    {
      label: t('groupMarketing'),
      items: [
        {
          label: t('marketingOverview'),
          href: `${prefix}/marketing`,
          icon: Megaphone,
          capability: 'users.manage',
        },
        {
          label: t('marketingCampaigns'),
          href: `${prefix}/marketing/campaigns`,
          icon: BarChart3,
          capability: 'users.manage',
        },
        {
          label: t('marketingAnalytics'),
          href: `${prefix}/marketing/analytics`,
          icon: Activity,
          capability: 'users.manage',
        },
        {
          label: t('marketingContent'),
          href: `${prefix}/marketing/content`,
          icon: Images,
          capability: 'users.manage',
        },
        {
          label: t('marketingStudio'),
          href: `${prefix}/marketing/studio`,
          icon: Sparkles,
          capability: 'users.manage',
        },
        {
          label: t('marketingCompetitors'),
          href: `${prefix}/marketing/competitors`,
          icon: Eye,
          capability: 'users.manage',
        },
        {
          label: t('marketingExperiments'),
          href: `${prefix}/marketing/experiments`,
          icon: FlaskConical,
          capability: 'users.manage',
        },
        {
          label: t('marketingSettings'),
          href: `${prefix}/marketing/settings`,
          icon: Settings,
          capability: 'users.manage',
        },
      ],
    },
    {
      label: t('groupResources'),
      items: [
        {
          label: t('electricityPrices'),
          href: `${prefix}/electricity-prices`,
          icon: Plug,
          capability: 'users.manage',
        },
        {
          label: t('subsidyRates'),
          href: `${prefix}/subsidy-rates`,
          icon: HandCoins,
          capability: 'users.manage',
        },
        {
          label: t('feedInTariffs'),
          href: `${prefix}/feed-in-tariffs`,
          icon: Coins,
          capability: 'users.manage',
        },
        {
          label: t('referenceMarketPrices'),
          href: `${prefix}/reference-market-prices`,
          icon: LineChart,
          capability: 'users.manage',
        },
      ],
    },
    {
      label: t('groupEquipment'),
      items: [
        {
          label: t('manufacturers'),
          href: `${prefix}/equipment/manufacturers`,
          icon: Factory,
          capability: 'users.manage',
        },
        {
          label: t('solarPanels'),
          href: `${prefix}/equipment/solar-panels`,
          icon: PanelTop,
          capability: 'users.manage',
        },
        {
          label: t('inverters'),
          href: `${prefix}/equipment/inverters`,
          icon: Zap,
          capability: 'users.manage',
        },
        {
          label: t('batteries'),
          href: `${prefix}/equipment/batteries`,
          icon: Battery,
          capability: 'users.manage',
        },
        {
          label: t('mountingSystems'),
          href: `${prefix}/equipment/mounting-systems`,
          icon: Box,
          capability: 'users.manage',
        },
        {
          label: t('ems'),
          href: `${prefix}/equipment/ems`,
          icon: CircuitBoard,
          capability: 'users.manage',
        },
        {
          label: t('heatPumps'),
          href: `${prefix}/equipment/heat-pumps`,
          icon: Flame,
          capability: 'users.manage',
        },
        {
          label: t('evChargers'),
          href: `${prefix}/equipment/ev-chargers`,
          icon: Plug,
          capability: 'users.manage',
        },
        {
          label: t('packages'),
          href: `${prefix}/equipment/packages`,
          icon: Package,
          capability: 'users.manage',
        },
      ],
    },
  ]

  const capabilities = useCapabilities()

  return navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(
        item => !item.capability || capabilities.includes(item.capability)
      ),
    }))
    .filter(group => group.items.length > 0)
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const navGroups = useNavGroups()

  const matches = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')
  const activeHref = navGroups
    .flatMap(group => group.items)
    .filter(item => matches(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
  const isActive = (href: string) => href === activeHref

  return (
    <nav className="p-3">
      {navGroups.map((group, i) => (
        <div key={i} className={cn(i > 0 && 'mt-4')}>
          {group.label && (
            <p className="px-3 mb-1 text-sm font-semibold uppercase tracking-wider text-[#062E25]/75">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-[#062E25]/10 text-[#062E25]'
                    : 'text-[#062E25]/75 hover:bg-[#062E25]/5 hover:text-[#062E25]'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge}
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
