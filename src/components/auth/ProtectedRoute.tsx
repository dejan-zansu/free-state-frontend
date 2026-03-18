'use client'

import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/auth'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useRef } from 'react'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
  adminRedirect?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  adminRedirect,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isInitialized, user, checkAuth } = useAuthStore()
  const hasRedirected = useRef(false)

  useEffect(() => {
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isInitialized || hasRedirected.current) return

    if (!isAuthenticated) {
      hasRedirected.current = true
      router.replace(redirectTo as any)
      return
    }

    if (isAuthenticated && user) {
      if (adminRedirect && user.role === 'ADMIN') {
        hasRedirected.current = true
        router.replace(adminRedirect as any)
        return
      }
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        hasRedirected.current = true
        router.replace('/login' as any)
      }
    }
  }, [isInitialized, isAuthenticated, user, allowedRoles, adminRedirect, redirectTo, router])

  if (!isInitialized || !isAuthenticated) {
    return <AdminPageLoader fullscreen />
  }

  if (adminRedirect && user?.role === 'ADMIN') {
    return <AdminPageLoader fullscreen />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <AdminPageLoader fullscreen />
  }

  return <>{children}</>
}

export default ProtectedRoute
