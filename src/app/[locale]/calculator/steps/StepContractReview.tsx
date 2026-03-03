'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Check,
  AlertTriangle,
  Leaf,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

function formatSwissNumber(num: number, decimals = 0): string {
  return num.toLocaleString('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default function StepContractReview() {
  const t = useTranslations('solarAboCalculator.contractReview')
  const tNav = useTranslations('solarAboCalculator.navigation')

  const {
    acknowledgments,
    addAcknowledgment,
    removeAcknowledgment,
    createContract,
    nextStep,
    goToStep,
    address,
    getSystemSizeKwp,
    getEstimatedPanelCount,
    getAnnualProduction,
    getAnnualSavings,
    getCo2Savings,
    getSelectedArea,
    getSelfConsumptionRate,
    getRecommendedPackage,
  } = useSolarAboCalculatorStore()

  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const systemSizeKwp = getSystemSizeKwp()
  const panelCount = getEstimatedPanelCount()
  const production = getAnnualProduction()
  const savings = getAnnualSavings()
  const co2 = getCo2Savings()
  const roofArea = getSelectedArea()
  const selfConsumption = getSelfConsumptionRate()
  const recommendedPackage = getRecommendedPackage()

  const toggleAcknowledgment = (type: string) => {
    if (acknowledgments.includes(type)) {
      removeAcknowledgment(type)
    } else {
      addAcknowledgment(type)
    }
  }

  const requiredAcknowledgments = [
    'PRELIMINARY_QUOTE_NOTICE',
    'SITE_VISIT_CONSENT',
    'CONTRACT_REVIEW',
  ]

  const allAcknowledged = requiredAcknowledgments.every(ack =>
    acknowledgments.includes(ack)
  )

  const handleProceedToSign = async () => {
    if (!allAcknowledged) return

    setIsCreating(true)
    setCreateError(null)

    try {
      await createContract()
      nextStep()
    } catch (err) {
      console.error('Failed to create contract:', err)
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create contract'
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {createError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{createError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-primary" />
                {t('systemSummary.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatSwissNumber(systemSizeKwp, 2)}
                  </p>
                  <p className="text-sm text-muted-foreground">kWp</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{panelCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('systemSummary.panels')}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatSwissNumber(production)}
                  </p>
                  <p className="text-sm text-muted-foreground">kWh/Jahr</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    CHF {formatSwissNumber(savings, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('systemSummary.savings')}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatSwissNumber(co2)}
                  </p>
                  <p className="text-sm text-muted-foreground">kg CO₂/Jahr</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatSwissNumber(roofArea)} m²
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('systemSummary.roofArea')}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">
                    {t('systemSummary.address')}:
                  </span>{' '}
                  {address}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">
                    {t('systemSummary.package')}:
                  </span>{' '}
                  {recommendedPackage === 'home' ? 'SolarAbo Home' : 'SolarAbo Multi'}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">
                    {t('systemSummary.selfConsumption')}:
                  </span>{' '}
                  {formatSwissNumber(selfConsumption * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <Leaf className="h-5 w-5" />
                {t('aboBenefit.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {t('aboBenefit.point1')}
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {t('aboBenefit.point2')}
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {t('aboBenefit.point3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                {t('importantNotice.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-900">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  {t('importantNotice.point1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  {t('importantNotice.point2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  {t('importantNotice.point3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Check className="h-5 w-5 text-primary" />
                {t('acknowledgments.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ack-preliminary"
                  checked={acknowledgments.includes('PRELIMINARY_QUOTE_NOTICE')}
                  onCheckedChange={() =>
                    toggleAcknowledgment('PRELIMINARY_QUOTE_NOTICE')
                  }
                />
                <Label
                  htmlFor="ack-preliminary"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('acknowledgments.preliminary')}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ack-sitevisit"
                  checked={acknowledgments.includes('SITE_VISIT_CONSENT')}
                  onCheckedChange={() =>
                    toggleAcknowledgment('SITE_VISIT_CONSENT')
                  }
                />
                <Label
                  htmlFor="ack-sitevisit"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('acknowledgments.siteVisit')}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ack-contract"
                  checked={acknowledgments.includes('CONTRACT_REVIEW')}
                  onCheckedChange={() =>
                    toggleAcknowledgment('CONTRACT_REVIEW')
                  }
                />
                <Label
                  htmlFor="ack-contract"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('acknowledgments.contractReview')}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => goToStep(7)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {tNav('back')}
          </Button>

          <Button
            onClick={handleProceedToSign}
            disabled={!allAcknowledged || isCreating}
            className="gap-2"
          >
            {isCreating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {t('creatingContract')}
              </>
            ) : (
              <>
                {t('proceedToSign')}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
