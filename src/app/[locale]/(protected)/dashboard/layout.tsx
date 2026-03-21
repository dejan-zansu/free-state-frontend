'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import {
  LayoutDashboard,
  FolderOpen,
  FileSignature,
  HelpCircle,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, useUser } from '@/stores/auth.store'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardFooter from '@/components/DashboardFooter'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/project', label: 'My Project', icon: FolderOpen },
  { href: '/dashboard/contract', label: 'My Contract', icon: FileSignature },
  { href: '/dashboard/support', label: 'Support', icon: HelpCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

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

  return (
    <div className="min-h-screen bg-[#F2F4E8] flex flex-col">
      <DashboardHeader />
      <div className="flex flex-1" style={{ paddingTop: '77px' }}>
        <aside className="hidden lg:flex w-64 flex-col fixed top-[77px] bottom-0 border-r border-[#062E25]/10 bg-white/60 backdrop-blur-sm">
          <div className="p-6 border-b border-[#062E25]/10">
            <p className="font-semibold text-[#062E25]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-[#062E25]/60 truncate">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
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
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#062E25]/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#062E25]/70 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-77px)]">
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-3 border-b border-[#062E25]/10 bg-white/60 backdrop-blur-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={localizedHref(item.href)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  isActive(item.href)
                    ? 'bg-[#062E25] text-white'
                    : 'text-[#062E25]/70 bg-white border border-[#062E25]/10'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
      <div className="lg:ml-64">
        <DashboardFooter />
      </div>
    </div>
  )
}
