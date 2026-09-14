'use client'

import { useAuthStore } from '@/stores/auth.store'
import { Capability, UserRole } from '@/types/auth'
import { useRouter } from '@/i18n/navigation'
import { useEffect, useRef } from 'react'
import { PageLoader } from '@/components/ui/page-loader'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredCapability?: Capability
  redirectTo?: string
  adminRedirect?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requiredCapability,
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
      const capabilities = user.capabilities ?? []

      if (adminRedirect && capabilities.includes('staff.area')) {
        hasRedirected.current = true
        const target = capabilities.includes('users.manage')
          ? adminRedirect
          : '/admin/workspaces'
        router.replace(target as any)
        return
      }
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        hasRedirected.current = true
        router.replace('/login' as any)
        return
      }
      if (requiredCapability && !capabilities.includes(requiredCapability)) {
        hasRedirected.current = true
        router.replace('/login' as any)
      }
    }
  }, [
    isInitialized,
    isAuthenticated,
    user,
    allowedRoles,
    requiredCapability,
    adminRedirect,
    redirectTo,
    router,
  ])

  if (!isInitialized || !isAuthenticated) {
    return <PageLoader fullscreen />
  }

  const capabilities = user?.capabilities ?? []

  if (adminRedirect && capabilities.includes('staff.area')) {
    return <PageLoader fullscreen />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <PageLoader fullscreen />
  }

  if (
    requiredCapability &&
    user &&
    !capabilities.includes(requiredCapability)
  ) {
    return <PageLoader fullscreen />
  }

  return <>{children}</>
}

export default ProtectedRoute
