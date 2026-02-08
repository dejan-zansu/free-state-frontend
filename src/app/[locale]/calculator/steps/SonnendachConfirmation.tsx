'use client'

import { useEffect } from 'react'
import {
  CheckCircle2,
  Download,
  Mail,
  Phone,
  Calendar,
  FileText,
  Home,
  Zap,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import confetti from 'canvas-confetti'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contractService } from '@/services/contract.service'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

export default function SonnendachConfirmation() {
  const t = useTranslations('sonnendach.confirmation')

  const {
    contractPreview,
    personalInfo,
    createdContractId,
    getSystemSizeKwp,
    panelCount,
    reset,
  } = useSonnendachCalculatorStore()

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#16a34a', '#15803d'],
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#16a34a', '#15803d'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  const handleDownloadContract = () => {
    if (createdContractId) {
      window.open(contractService.getDownloadUrl(createdContractId, true), '_blank')
    }
  }

  const handleStartNew = () => {
    reset()
    window.location.href = '/calculator'
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Contract Summary */}
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-800">
              <FileText className="h-5 w-5" />
              {t('contractSummary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('contractSummary.contractNumber')}</span>
              <span className="font-medium">{contractPreview?.contractNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('contractSummary.signedBy')}</span>
              <span className="font-medium">
                {personalInfo.firstName} {personalInfo.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('contractSummary.systemSize')}</span>
              <span className="font-medium">{getSystemSizeKwp().toFixed(2)} kWp</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('contractSummary.panels')}</span>
              <span className="font-medium">{panelCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Download Contract */}
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-energy/10 rounded-lg flex items-center justify-center">
                  <Download className="h-6 w-6 text-energy" />
                </div>
                <div>
                  <p className="font-medium">{t('download.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('download.description')}</p>
                </div>
              </div>
              <Button onClick={handleDownloadContract} className="bg-energy hover:bg-energy/90">
                {t('download.button')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-energy" />
              {t('nextSteps.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-energy/10 rounded-full flex items-center justify-center">
                  <span className="text-energy font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">{t('nextSteps.step1.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('nextSteps.step1.description')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-energy/10 rounded-full flex items-center justify-center">
                  <span className="text-energy font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">{t('nextSteps.step2.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('nextSteps.step2.description')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-energy/10 rounded-full flex items-center justify-center">
                  <span className="text-energy font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">{t('nextSteps.step3.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('nextSteps.step3.description')}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-energy/10 rounded-full flex items-center justify-center">
                  <span className="text-energy font-semibold">4</span>
                </div>
                <div>
                  <p className="font-medium">{t('nextSteps.step4.title')}</p>
                  <p className="text-sm text-muted-foreground">{t('nextSteps.step4.description')}</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-energy" />
              {t('contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('contact.description')}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <a href="mailto:solar@freestate.ch">
                  <Mail className="h-4 w-4" />
                  solar@freestate.ch
                </a>
              </Button>
              <Button variant="outline" className="flex-1 gap-2" asChild>
                <a href="tel:+41441234567">
                  <Phone className="h-4 w-4" />
                  +41 44 123 45 67
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Confirmation Note */}
        <div className="p-4 bg-muted/50 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-energy shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t('emailNote.title')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('emailNote.message', { email: personalInfo.email })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={handleStartNew} className="flex-1 gap-2">
            <Zap className="h-4 w-4" />
            {t('actions.newCalculation')}
          </Button>
          <Button className="flex-1 gap-2 bg-energy hover:bg-energy/90" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              {t('actions.backToHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
