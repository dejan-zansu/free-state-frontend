'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { Link, useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import {
  AuthErrorMark,
  AuthSplitLayout,
  AuthSuccessMark,
} from '@/components/auth/AuthSplitLayout'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

function getApiErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data?.error?.code
}

export default function MagicLinkVerifyPage() {
  const invokedRef = useRef(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const t = useTranslations('magicLinkVerify')
  const tErrors = useTranslations('apiErrors')
  const magicLinkLogin = useAuthStore(state => state.magicLinkLogin)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (invokedRef.current) return
    invokedRef.current = true

    if (!token) {
      setStatus('error')
      setError(t('invalidLink'))
      return
    }

    magicLinkLogin(token)
      .then(() => {
        setStatus('success')
        router.replace('/dashboard')
      })
      .catch(err => {
        setStatus('error')
        const code = getApiErrorCode(err)
        setError(code && tErrors.has(code) ? tErrors(code) : t('invalidLink'))
      })
  }, [token, magicLinkLogin, router, t, tErrors])

  return (
    <AuthSplitLayout>
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <div className="p-8 sm:p-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#062E25]/5 ring-1 ring-[#062E25]/10">
              <Loader2
                className="h-6 w-6 animate-spin text-[#062E25]"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('verifying')}
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              {t('verifyingHint')}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-8 sm:p-10 text-center">
            <AuthSuccessMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('success')}
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              {t('successMessage')}
            </p>
            <div className="mt-8">
              <Link href="/dashboard" className="inline-flex w-full sm:w-auto">
                <Button className="h-12 w-full rounded-xl bg-[#CDEA67] px-8 text-base font-semibold text-[#062E25] shadow-md shadow-[#062E25]/10 transition-all hover:bg-[#CDEA67]/90 hover:shadow-lg hover:shadow-[#062E25]/15">
                  {t('openDashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-8 sm:p-10 text-center">
            <AuthErrorMark />
            <h1 className="text-2xl font-bold tracking-tight text-[#062E25] sm:text-[1.75rem]">
              {t('failed')}
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
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
