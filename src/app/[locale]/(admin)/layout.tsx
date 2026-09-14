'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import {
  AdminSidebar,
  AdminSidebarMobileTrigger,
} from '@/components/admin/AdminSidebar'
import { PushNotificationToggle } from '@/components/admin/PushNotificationToggle'
import { UploadPanel } from '@/components/admin/workspaces/UploadPanel'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useHasCapability } from '@/lib/capabilities'
import { useUser } from '@/stores/auth.store'
import { LogOut } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useUser()
  const canUseSalesTools = useHasCapability('sales.tools')
  const isInitialized = useAuthStore(s => s.isInitialized)
  const router = useRouter()
  const pathname = usePathname()
  const logout = useAuthStore(s => s.logout)

  useEffect(() => {
    if (!isInitialized || !user) return
    const capabilities = user.capabilities ?? []
    if (
      pathname.endsWith('/admin/dashboard') &&
      capabilities.includes('staff.area') &&
      !capabilities.includes('users.manage')
    ) {
      router.replace('/admin/workspaces' as any)
    }
  }, [isInitialized, user, pathname, router])

  const handleLogout = async () => {
    await logout()
    router.replace('/login' as any)
  }

  return (
    <ProtectedRoute requiredCapability="staff.area">
      <link rel="manifest" href="/manifest.webmanifest" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <Toaster position="bottom-left" />
      <UploadPanel />
      <div className="flex min-h-screen bg-gray-50/50">
        <AdminSidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-14 border-b border-[#062E25]/10 bg-white flex items-center justify-between px-4 lg:px-6">
            <div>
              <AdminSidebarMobileTrigger />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#062E25]/75">
                {user?.firstName} {user?.lastName}
              </span>
              {canUseSalesTools && <PushNotificationToggle />}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="flex-1 min-w-0 p-6">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
