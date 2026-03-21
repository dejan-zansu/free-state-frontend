'use client'

import { useEffect } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/stores/auth.store'
import LogoDark from '@/components/icons/LogoDark'
import { PageLoader } from '@/components/ui/page-loader'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const tNav = useTranslations('nav')
  const { isAuthenticated, isInitialized, user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin/dashboard' as any)
      } else {
        router.replace('/dashboard' as any)
      }
    }
  }, [isInitialized, isAuthenticated, user, router])

  if (!isInitialized) {
    return <PageLoader fullscreen />
  }

  if (isAuthenticated) {
    return <PageLoader fullscreen />
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

      <div className='relative z-10 flex min-h-screen flex-col'>
        <header className='relative z-20 flex shrink-0 items-center border-b border-[#062E25]/10 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-8 sm:py-4'>
          <Link
            href='/'
            className='inline-flex items-center rounded-md outline-offset-4 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#062E25]'
            aria-label={tNav('home')}
          >
            <LogoDark className='h-6 w-auto sm:h-7.25' />
          </Link>
        </header>
        <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
      </div>
    </div>
  )
}
