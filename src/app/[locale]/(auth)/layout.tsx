'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isInitialized, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isInitialized, isAuthenticated, router])

  if (!isInitialized) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-pulse'>
          <svg
            className='w-12 h-12 text-solar'
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
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className='min-h-screen relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background' />

      <div className='absolute top-0 right-0 w-[600px] h-[600px] opacity-10'>
        <div className='absolute inset-0 bg-gradient-radial from-solar via-solar/30 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3' />
      </div>
      <div className='absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10'>
        <div className='absolute inset-0 bg-gradient-radial from-energy via-energy/30 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3' />
      </div>

      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className='relative z-10 flex min-h-screen'>{children}</div>
    </div>
  )
}
