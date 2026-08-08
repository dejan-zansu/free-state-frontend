'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Status = 'loading' | 'success' | 'error'

const NewsletterConfirmInner = () => {
  const t = useTranslations('newsletterConfirm')
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      return
    }
    fetch(`${API_URL}/api/newsletters/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => setStatus(res.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-[480px] w-full text-center">
        <h1 className="text-foreground text-2xl sm:text-3xl font-semibold mb-4">
          {status === 'loading'
            ? t('loadingTitle')
            : status === 'success'
              ? t('successTitle')
              : t('errorTitle')}
        </h1>
        <p className="text-foreground text-base leading-relaxed mb-8">
          {status === 'loading'
            ? t('loadingBody')
            : status === 'success'
              ? t('successBody')
              : t('errorBody')}
        </p>
        {status !== 'loading' && (
          <Link
            href="/"
            className="inline-block rounded-[8px] bg-[#062E25] text-white px-6 py-3 text-sm font-semibold"
          >
            {t('backHome')}
          </Link>
        )}
      </div>
    </div>
  )
}

const NewsletterConfirmPage = () => (
  <Suspense fallback={null}>
    <NewsletterConfirmInner />
  </Suspense>
)

export default NewsletterConfirmPage
