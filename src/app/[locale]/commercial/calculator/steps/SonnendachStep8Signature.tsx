'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  Shield,
  Smartphone,
  Check,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
    maskedPhone,
    setSignedPdfUrl,
    resetSignature,
    acknowledgments,
    goToStep,
    nextStep,
    personalInfo,
    createdContractId,
  } = useSonnendachCalculatorStore()

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [isInitiating, setIsInitiating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newDigits = [...otpDigits]
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i]
    }
    setOtpDigits(newDigits)
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  // Initiate signature
  const handleInitiateSignature = async () => {
    if (!createdContractId) {
      setError('Contract not found. Please go back and try again.')
      return
    }

    setIsInitiating(true)
    setError(null)

    try {
      const response = await contractService.initiateSignature(createdContractId, acknowledgments)

      setSignatureRequestData({
        requestId: response.signatureRequestId,
        maskedPhone: response.maskedPhone,
        expiresAt: new Date(response.expiresAt),
      })

      setSignatureStatus('otp_sent')
      setResendCooldown(60)
    } catch (err) {
      console.error('Failed to initiate signature:', err)
      setError(err instanceof Error ? err.message : 'Failed to send verification code')
      setSignatureStatus('failed')
    } finally {
      setIsInitiating(false)
    }
  }

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('')
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    if (!createdContractId) {
      setError('Contract not found')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const response = await contractService.verifySignature(createdContractId, otp)

      if (response.success) {
        setSignedPdfUrl(response.signedPdfUrl)
        setSignatureStatus('signed')
        // Move to confirmation step
        nextStep()
      }
    } catch (err) {
      console.error('Failed to verify signature:', err)
      setError(err instanceof Error ? err.message : 'Invalid verification code')
      setOtpDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    await handleInitiateSignature()
  }

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-initiate signature when component mounts (if not already initiated)
  useEffect(() => {
    if (signatureStatus === 'idle' && createdContractId) {
      handleInitiateSignature()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
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

        {/* Signature Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="h-5 w-5 text-energy" />
              {t('summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.document')}</span>
              <span className="font-medium">{t('summary.preliminaryAgreement')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.contractNumber')}</span>
              <span className="font-medium">{contractPreview?.contractNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.signer')}</span>
              <span className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('summary.email')}</span>
              <span className="font-medium">{personalInfo.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Signature Flow */}
        {signatureStatus === 'idle' || signatureStatus === 'initiating' ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-energy border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-lg font-medium">{t('initiating.title')}</p>
              <p className="text-muted-foreground mt-1">{t('initiating.message')}</p>
            </CardContent>
          </Card>
        ) : signatureStatus === 'otp_sent' || signatureStatus === 'verifying' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-energy" />
                {t('otp.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {t('otp.sentTo')}
                </p>
                <p className="font-medium text-lg mt-1">{maskedPhone || '+41 ** *** ** **'}</p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-2xl font-bold"
                    disabled={isVerifying}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerifyOtp}
                disabled={otpDigits.some((d) => !d) || isVerifying}
                className="w-full bg-energy hover:bg-energy/90"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('otp.verifying')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('otp.verify')}
                  </>
                )}
              </Button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{t('otp.didntReceive')}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isInitiating}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isInitiating ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `${t('otp.resend')} (${resendCooldown}s)` : t('otp.resend')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : signatureStatus === 'failed' ? (
          <Card className="border-destructive">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium text-destructive">{t('failed.title')}</p>
              <p className="text-muted-foreground mt-1 mb-4">{t('failed.message')}</p>
              <Button onClick={handleInitiateSignature} disabled={isInitiating}>
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

        {/* Security Note */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-energy shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t('security.title')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('security.message')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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

          {/* Download unsigned contract */}
          {contractPreview?.pdfUrl && (
            <Button
              variant="ghost"
              asChild
            >
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
