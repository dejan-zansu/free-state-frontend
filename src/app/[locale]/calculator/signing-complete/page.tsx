'use client'

import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { contractService } from '@/services/contract.service'

type ResolvedStatus = 'verifying' | 'success' | 'awaitingCompany' | 'pending' | 'error'

const MAX_POLLS = 12
const POLL_INTERVAL_MS = 5000

export default function SigningCompletePage() {
  const t = useTranslations('solarAboCalculator.signingComplete')
  const searchParams = useSearchParams()
  const router = useRouter()

  const contractId = searchParams.get('contractId')
  const initialStatus = searchParams.get('status')

  const [resolved, setResolved] = useState<ResolvedStatus>(
    initialStatus === 'error' ? 'error' : 'verifying'
  )
  const pollsRef = useRef(0)

  useEffect(() => {
    if (resolved === 'error' || resolved === 'success') return
    if (!contractId) {
      setResolved('error')
      return
    }

    let cancelled = false

    const check = async () => {
      try {
        const result = await contractService.checkSignatureStatus(contractId)
        if (cancelled) return

        if (result.status === 'COMPLETED') {
          setResolved('success')
          return
        }
        if (result.status === 'EXPIRED') {
          setResolved('error')
          return
        }

        if (result.customerSignedAt) {
          setResolved('awaitingCompany')
          return
        }

        pollsRef.current += 1
        if (pollsRef.current >= MAX_POLLS) {
          setResolved('pending')
          return
        }
        setTimeout(check, POLL_INTERVAL_MS)
      } catch {
        if (!cancelled) setResolved('error')
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [contractId, resolved])

  if (resolved === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-lg font-medium">{t('verifying.title')}</p>
            <p className="text-muted-foreground mt-1">{t('verifying.message')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (resolved === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
        <Card className="max-w-md w-full border-green-500">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-700">{t('success.title')}</p>
            <p className="text-muted-foreground mt-1">{t('success.message')}</p>
            <Button className="mt-6" onClick={() => router.push('/calculator')}>
              {t('success.backButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (resolved === 'awaitingCompany') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
        <Card className="max-w-md w-full border-primary">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium text-primary">{t('awaitingCompany.title')}</p>
            <p className="text-muted-foreground mt-1">{t('awaitingCompany.message')}</p>
            <Button className="mt-6" onClick={() => router.push('/calculator')}>
              {t('awaitingCompany.backButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (resolved === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
        <Card className="max-w-md w-full border-amber-500">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-amber-600 mx-auto mb-4" />
            <p className="text-lg font-medium">{t('pending.title')}</p>
            <p className="text-muted-foreground mt-1">{t('pending.message')}</p>
            <Button className="mt-6" onClick={() => router.push('/calculator')}>
              {t('pending.backButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
      <Card className="max-w-md w-full border-destructive">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium text-destructive">{t('error.title')}</p>
          <p className="text-muted-foreground mt-1">{t('error.message')}</p>
          <Button className="mt-6" onClick={() => router.push('/calculator')}>
            {t('error.backButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
