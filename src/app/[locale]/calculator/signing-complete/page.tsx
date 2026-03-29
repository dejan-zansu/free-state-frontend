'use client'

import { CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { contractService } from '@/services/contract.service'
import { useRouter } from 'next/navigation'

export default function SigningCompletePage() {
  const t = useTranslations('solarAboCalculator.signingComplete')
  const searchParams = useSearchParams()
  const router = useRouter()

  const status = searchParams.get('status')
  const contractId = searchParams.get('contractId')

  const [verifying, setVerifying] = useState(status === 'success')
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (status !== 'success' || !contractId) return

    let cancelled = false
    const verify = async () => {
      try {
        const result = await contractService.checkSignatureStatus(contractId)
        if (!cancelled && result.status === 'COMPLETED') {
          setVerified(true)
        }
      } catch {
        // Status check failed — the polling job will handle it
      } finally {
        if (!cancelled) setVerifying(false)
      }
    }
    verify()
    return () => { cancelled = true }
  }, [status, contractId])

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
        <Card className="max-w-md w-full border-green-500">
          <CardContent className="py-12 text-center">
            {verifying ? (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-lg font-medium">{t('verifying.title')}</p>
                <p className="text-muted-foreground mt-1">{t('verifying.message')}</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-700">{t('success.title')}</p>
                <p className="text-muted-foreground mt-1">{t('success.message')}</p>
                <Button className="mt-6" onClick={() => router.push('/calculator')}>
                  {t('success.backButton')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'cancel') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ paddingTop: '77px' }}>
        <Card className="max-w-md w-full border-amber-500">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-medium">{t('cancel.title')}</p>
            <p className="text-muted-foreground mt-1">{t('cancel.message')}</p>
            <Button className="mt-6" onClick={() => router.push('/calculator')}>
              {t('cancel.backButton')}
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
