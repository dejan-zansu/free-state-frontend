'use client'

import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#062E25] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-[#062E25] mb-2">{t('verifying')}</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#062E25] mb-2">{t('success')}</h2>
            <p className="text-gray-600 mb-6">{t('successMessage')}</p>
            <Link href="/login">
              <Button className="bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]">
                {t('signIn')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#062E25] mb-2">{t('failed')}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/login">
              <Button className="bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]">
                {t('goToLogin')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
