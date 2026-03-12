'use client'

import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('Invalid verification link.')
      return
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Verification failed. The link may have expired.')
      })
  }, [token])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-[#062E25] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-[#062E25] mb-2">Verifying your email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#062E25] mb-2">Email Verified</h2>
            <p className="text-gray-600 mb-6">Your email has been verified successfully.</p>
            <Link href="/login">
              <Button className="bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]">
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#062E25] mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/login">
              <Button className="bg-[#CDEA67] hover:bg-[#CDEA67]/90 text-[#062E25]">
                Go to Login <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
