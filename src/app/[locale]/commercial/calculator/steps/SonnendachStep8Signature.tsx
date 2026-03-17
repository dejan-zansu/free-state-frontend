'use client'

import {
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  FileCheck,
  Loader2,
  Shield,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contractService } from '@/services/contract.service'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

export default function SonnendachStep8Signature() {
  const t = useTranslations('sonnendach.step8Signature')
  const tCommon = useTranslations('common')

  const {
    contractPreview,
    signatureStatus,
    setSignatureStatus,
    setSignatureRequestData,
    setSignedPdfUrl,
    resetSignature,
    acknowledgments,
    goToStep,
    nextStep,
    personalInfo,
    createdContractId,
  } = useSonnendachCalculatorStore()

  const [isInitiating, setIsInitiating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [signingUrl, setSigningUrl] = useState<string | null>(null)

  const handleInitiateSignature = useCallback(async () => {
    if (!createdContractId) {
      setError('Contract not found. Please go back and try again.')
      return
    }

    setIsInitiating(true)
    setError(null)

    try {
      const response = await contractService.initiateSignature(
        createdContractId,
        acknowledgments
      )

      setSignatureRequestData({
        requestId: response.processId,
        maskedPhone: '',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      })

      setSigningUrl(response.signingUrl)
      setSignatureStatus('otp_sent')
    } catch (err) {
      console.error('Failed to initiate signature:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to start signing process'
      )
      setSignatureStatus('failed')
    } finally {
      setIsInitiating(false)
    }
  }, [
    createdContractId,
    acknowledgments,
    setSignatureRequestData,
    setSignatureStatus,
  ])

  const handleOpenSigningPage = () => {
    if (signingUrl) {
      window.open(signingUrl, '_blank')
      setIsPolling(true)
    }
  }

  const checkStatus = useCallback(async () => {
    if (!createdContractId) return

    try {
      const result =
        await contractService.checkSignatureStatus(createdContractId)

      if (result.status === 'COMPLETED') {
        setSignatureStatus('signed')
        if (result.signedPdfUrl) {
          setSignedPdfUrl(result.signedPdfUrl)
        }
        setIsPolling(false)
        nextStep()
      } else if (result.status === 'EXPIRED') {
        setSignatureStatus('failed')
        setIsPolling(false)
        setError(t('failed.message'))
      }
    } catch (err) {
      console.error('Failed to check signature status:', err)
    }
  }, [createdContractId, setSignatureStatus, setSignedPdfUrl, nextStep, t])

  useEffect(() => {
    if (signatureStatus === 'idle' && createdContractId) {
      handleInitiateSignature()
    }
  }, [])

  useEffect(() => {
    if (!isPolling || signatureStatus === 'signed') return

    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [isPolling, signatureStatus, checkStatus])

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-energy" />
              {t('summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('summary.document')}
              </span>
              <span className="font-medium">
                {t('summary.preliminaryAgreement')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('summary.contractNumber')}
              </span>
              <span className="font-medium">
                {contractPreview?.contractNumber || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('summary.signer')}
              </span>
              <span className="font-medium">
                {personalInfo.firstName} {personalInfo.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('summary.email')}
              </span>
              <span className="font-medium">{personalInfo.email}</span>
            </div>
          </CardContent>
        </Card>

        {signatureStatus === 'idle' || signatureStatus === 'initiating' ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-energy border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-lg font-medium">{t('initiating.title')}</p>
              <p className="text-muted-foreground mt-1">
                {t('initiating.message')}
              </p>
            </CardContent>
          </Card>
        ) : signatureStatus === 'otp_sent' ? (
          <Card>
            <CardContent className="py-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-energy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="h-8 w-8 text-energy" />
                </div>
                <p className="text-lg font-medium">
                  {t('signing.title') || 'Ready to Sign'}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t('signing.description') ||
                    'Click the button below to open the secure Swisscom Sign page.'}
                </p>
              </div>

              <Button
                onClick={handleOpenSigningPage}
                className="w-full gap-2 bg-energy hover:bg-energy/90"
                size="lg"
              >
                <ExternalLink className="h-4 w-4" />
                {t('signing.openButton') || 'Open Signing Page'}
              </Button>

              {isPolling && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {t('signing.waiting') || 'Waiting for your signature...'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : signatureStatus === 'failed' ? (
          <Card className="border-destructive">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium text-destructive">
                {t('failed.title')}
              </p>
              <p className="text-muted-foreground mt-1 mb-4">
                {t('failed.message')}
              </p>
              <Button
                onClick={() => {
                  resetSignature()
                  handleInitiateSignature()
                }}
                disabled={isInitiating}
              >
                {isInitiating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('failed.retrying')}
                  </>
                ) : (
                  t('failed.retry')
                )}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-energy shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t('security.title')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('security.message')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              resetSignature()
              goToStep(7)
            }}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>

          {contractPreview?.pdfUrl && (
            <Button variant="ghost" asChild>
              <a
                href={contractService.getDownloadUrl(createdContractId || '')}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('downloadContract')}
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
