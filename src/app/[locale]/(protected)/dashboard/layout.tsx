'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FolderOpen,
  FileSignature,
  ClipboardList,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, useUser } from '@/stores/auth.store'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardFooter from '@/components/DashboardFooter'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navDefs = [
  { href: '/dashboard', labelKey: 'overview', icon: LayoutDashboard },
  { href: '/dashboard/project', labelKey: 'myProject', icon: FolderOpen },
  { href: '/dashboard/contract', labelKey: 'myContract', icon: FileSignature },
  { href: '/dashboard/requests', labelKey: 'requests', icon: ClipboardList },
  { href: '/dashboard/support', labelKey: 'support', icon: HelpCircle },
  { href: '/dashboard/settings', labelKey: 'settings', icon: Settings },
] as const

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const user = useUser()
  const { logout } = useAuthStore()
  const t = useTranslations('dashboard.nav')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const localizedHref = (href: string) => `/${locale}${href}`

  const isActive = (href: string) => {
    const clean = pathname?.replace(/^\/(de|en|fr|it)/, '') || ''
    if (href === '/dashboard') return clean === '/dashboard'
    return clean.startsWith(href)
  }

  const NavList = (
    <nav className="flex-1 p-4 space-y-1">
      {navDefs.map(item => (
        <Link
          key={item.href}
          href={localizedHref(item.href)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.href)
              ? 'bg-[#062E25] text-white'
              : 'text-[#062E25]/70 hover:bg-[#062E25]/5 hover:text-[#062E25]'
          )}
        >
          <item.icon className="h-4 w-4" />
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#F2F4E8] flex flex-col">
      <DashboardHeader />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <button
            aria-label={t('openNavigation')}
            className="lg:hidden fixed top-2 right-3 sm:top-3 sm:right-4 z-[60] inline-flex items-center justify-center h-10 w-10 rounded-lg text-[#062E25] hover:bg-[#062E25]/5"
          >
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0 bg-white flex flex-col">
          <SheetTitle className="sr-only">{t('navigation')}</SheetTitle>
          <div className="p-6 border-b border-[#062E25]/10 mt-2">
            <p className="font-semibold text-[#062E25]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-[#062E25]/60 truncate">{user?.email}</p>
          </div>
          {NavList}
          <div className="p-4 border-t border-[#062E25]/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#062E25]/70 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              {t('signOut')}
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 pt-[57px] sm:pt-[69px]">
        <aside className="hidden lg:flex w-64 flex-col fixed top-[69px] bottom-0 border-r border-[#062E25]/10 bg-white/60 backdrop-blur-sm">
          <div className="p-6 border-b border-[#062E25]/10">
            <p className="font-semibold text-[#062E25]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-[#062E25]/60 truncate">{user?.email}</p>
          </div>

          {NavList}

          <div className="p-4 border-t border-[#062E25]/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#062E25]/70 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              {t('signOut')}
            </button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64 min-w-0 min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-69px)]">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
      <div className="lg:ml-64">
        <DashboardFooter />
      </div>
    </div>
  )
}
