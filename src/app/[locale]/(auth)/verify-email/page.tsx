'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  AuthErrorMark,
  AuthSplitLayout,
  AuthSuccessMark,
  authPanelCardClass,
} from '@/components/auth/AuthSplitLayout'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('verifyEmail')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError(t('invalidLink'))
      return
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error')
        setError(err instanceof Error ? err.message : t('expiredLink'))
      })
  }, [token, t])

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className={authPanelCardClass}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#062E25]/5 ring-1 ring-[#062E25]/10">
              <Loader2
                className="h-6 w-6 animate-spin text-[#062E25]"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('verifying')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t('verifyingHint')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className={authPanelCardClass}>
            <AuthSuccessMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('success')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t('successMessage')}
            </p>
            <div className="mt-8">
              <Link href="/login" className="inline-flex w-full sm:w-auto">
                <Button className="h-12 w-full rounded-xl bg-[#CDEA67] px-8 text-base font-semibold text-[#062E25] shadow-md shadow-[#062E25]/10 transition-all hover:bg-[#CDEA67]/90 hover:shadow-lg hover:shadow-[#062E25]/15">
                  {t('signIn')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={authPanelCardClass}>
            <AuthErrorMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('failed')}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {error}
            </p>
            <div className="mt-8">
              <Link href="/login" className="inline-flex w-full sm:w-auto">
                <Button className="h-12 w-full rounded-xl bg-[#CDEA67] px-8 text-base font-semibold text-[#062E25] shadow-md shadow-[#062E25]/10 transition-all hover:bg-[#CDEA67]/90 hover:shadow-lg hover:shadow-[#062E25]/15">
                  {t('goToLogin')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthSplitLayout>
  )
}
