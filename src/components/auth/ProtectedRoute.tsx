'use client'

import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isInitialized, user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isInitialized, isAuthenticated, router, redirectTo])

  // Check role-based access
  useEffect(() => {
    if (isInitialized && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized')
      }
    }
  }, [isInitialized, isAuthenticated, allowedRoles, user, router])

  // Loading state
  if (!isInitialized) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='w-16 h-16 rounded-full border-4 border-solar/20 animate-pulse' />
            <div className='absolute inset-0 flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-solar animate-spin'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='5' />
                <line x1='12' y1='1' x2='12' y2='3' />
                <line x1='12' y1='21' x2='12' y2='23' />
                <line x1='4.22' y1='4.22' x2='5.64' y2='5.64' />
                <line x1='18.36' y1='18.36' x2='19.78' y2='19.78' />
                <line x1='1' y1='12' x2='3' y2='12' />
                <line x1='21' y1='12' x2='23' y2='12' />
                <line x1='4.22' y1='19.78' x2='5.64' y2='18.36' />
                <line x1='18.36' y1='5.64' x2='19.78' y2='4.22' />
              </svg>
            </div>
          </div>
          <p className='text-muted-foreground text-sm'>Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null
  }

  // Role not allowed - will redirect
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
