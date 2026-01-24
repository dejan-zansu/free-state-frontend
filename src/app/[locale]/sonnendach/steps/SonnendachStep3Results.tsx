'use client'

import {
  ChevronLeft,
  Sun,
  Zap,
  Ruler,
  Compass,
  TrendingUp,
  Leaf,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

export default function SonnendachStep3Results() {
  const t = useTranslations('sonnendach.step3')
  const {
    building,
    selectedArea,
    selectedPotentialKwh,
    selectedPanel,
    selectedInverter,
    panelCount,
    getSelectedSegments,
    goToStep,
    reset,
  } = useSonnendachCalculatorStore()

  const selectedSegments = getSelectedSegments()

  // Calculate aggregated stats
  const averageTilt =
    selectedSegments.length > 0
      ? Math.round(
          selectedSegments.reduce((sum, s) => sum + s.tilt, 0) / selectedSegments.length
        )
      : 0

  // Get dominant orientation
  const orientationCounts = selectedSegments.reduce(
    (acc, s) => {
      acc[s.azimuthCardinal] = (acc[s.azimuthCardinal] || 0) + s.area
      return acc
    },
    {} as Record<string, number>
  )
  const dominantOrientation = Object.entries(orientationCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 'N/A'

  // Calculate CO2 savings (Swiss grid factor: ~26g CO2/kWh, but offset vs EU average: ~400g)
  const co2SavingsKg = Math.round(selectedPotentialKwh * 0.4) // 400g per kWh

  // Use actual panel data from selection
  const systemSizeKwp = selectedPanel && panelCount
    ? Math.round((selectedPanel.power * panelCount) / 1000 * 10) / 10
    : 0

  // Financial estimates using actual equipment costs
  const panelCost = selectedPanel ? selectedPanel.price * panelCount : 0
  const inverterCost = selectedInverter ? selectedInverter.price : 0
  const installationCost = Math.round(systemSizeKwp * 800) // Installation labor ~800 CHF/kWp
  const estimatedCost = panelCost + inverterCost + installationCost
  const federalSubsidy = Math.round(600 + systemSizeKwp * 350) // Simplified Swiss subsidy
  const netCost = estimatedCost - Math.min(federalSubsidy, estimatedCost * 0.3)

  // Electricity price assumptions
  const purchasePrice = 0.25 // CHF/kWh
  const feedInTariff = 0.12 // CHF/kWh
  const selfConsumptionRate = 0.30 // 30% self-consumption

  const selfConsumedKwh = selectedPotentialKwh * selfConsumptionRate
  const exportedKwh = selectedPotentialKwh * (1 - selfConsumptionRate)
  const yearlySavings = Math.round(
    selfConsumedKwh * purchasePrice + exportedKwh * feedInTariff
  )
  const paybackYears = yearlySavings > 0 ? Math.round((netCost / yearlySavings) * 10) / 10 : 0

  if (!building) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('noData')}</p>
      </div>
    )
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center'>
            <Sun className='w-8 h-8 text-primary' />
          </div>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='text-muted-foreground mt-2'>{t('subtitle')}</p>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Zap className='w-8 h-8 text-primary mx-auto mb-2' />
              <p className='text-2xl font-bold'>
                {selectedPotentialKwh.toLocaleString()}
              </p>
              <p className='text-sm text-muted-foreground'>kWh/year</p>
            </CardContent>
          </Card>

          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Ruler className='w-8 h-8 text-primary mx-auto mb-2' />
              <p className='text-2xl font-bold'>{selectedArea}</p>
              <p className='text-sm text-muted-foreground'>m² {t('roofArea')}</p>
            </CardContent>
          </Card>

          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Building2 className='w-8 h-8 text-primary mx-auto mb-2' />
              <p className='text-2xl font-bold'>{panelCount}</p>
              <p className='text-sm text-muted-foreground'>{t('panels')}</p>
            </CardContent>
          </Card>

          <Card className='text-center'>
            <CardContent className='pt-6'>
              <Leaf className='w-8 h-8 text-green-600 mx-auto mb-2' />
              <p className='text-2xl font-bold'>{co2SavingsKg.toLocaleString()}</p>
              <p className='text-sm text-muted-foreground'>kg CO2/year</p>
            </CardContent>
          </Card>
        </div>

        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          {/* Selected Roof Segments */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle2 className='w-5 h-5 text-primary' />
                {t('selectedRoofs')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {selectedSegments.map((segment) => {
                const suitability = SUITABILITY_CLASSES[segment.suitability.class]
                return (
                  <div
                    key={segment.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-muted/50'
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-4 h-4 rounded-full'
                        style={{ backgroundColor: suitability?.color || '#888' }}
                      />
                      <div>
                        <p className='font-medium capitalize'>{suitability?.label}</p>
                        <p className='text-xs text-muted-foreground'>
                          {segment.azimuthCardinal} facing, {segment.tilt}° tilt
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>{segment.area} m²</p>
                      <p className='text-xs text-muted-foreground'>
                        {segment.electricityYield.toLocaleString()} kWh
                      </p>
                    </div>
                  </div>
                )
              })}

              <div className='pt-4 border-t space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('averageTilt')}</span>
                  <span className='font-medium'>{averageTilt}°</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('dominantOrientation')}</span>
                  <span className='font-medium'>{dominantOrientation}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('systemSize')}</span>
                  <span className='font-medium'>{systemSizeKwp} kWp</span>
                </div>
                {selectedPanel && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{t('panelType')}</span>
                    <span className='font-medium'>{selectedPanel.name}</span>
                  </div>
                )}
                {selectedInverter && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{t('inverter')}</span>
                    <span className='font-medium'>{selectedInverter.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-primary' />
                {t('financialEstimate')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('estimatedCost')}</span>
                  <span className='font-medium'>
                    CHF {estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between text-green-600'>
                  <span>{t('federalSubsidy')}</span>
                  <span className='font-medium'>
                    - CHF {Math.min(federalSubsidy, estimatedCost * 0.3).toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between font-bold text-lg pt-2 border-t'>
                  <span>{t('netCost')}</span>
                  <span>CHF {netCost.toLocaleString()}</span>
                </div>
              </div>

              <div className='pt-4 border-t space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('yearlySavings')}</span>
                  <span className='font-medium text-green-600'>
                    CHF {yearlySavings.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('paybackPeriod')}</span>
                  <span className='font-medium'>{paybackYears} years</span>
                </div>
              </div>

              <div className='p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground'>
                {t('disclaimer')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Source Info */}
        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-4'>
              <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0'>
                <Compass className='w-5 h-5 text-blue-600' />
              </div>
              <div>
                <h3 className='font-medium mb-1'>{t('dataSource.title')}</h3>
                <p className='text-sm text-muted-foreground'>{t('dataSource.description')}</p>
                <a
                  href='https://www.sonnendach.ch'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-primary hover:underline mt-2 inline-block'
                >
                  sonnendach.ch →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className='flex gap-4'>
          <Button variant='outline' onClick={() => goToStep(2)} className='gap-2'>
            <ChevronLeft className='w-4 h-4' />
            {t('back')}
          </Button>
          <Button onClick={reset} variant='outline' className='gap-2'>
            {t('startOver')}
          </Button>
          <Button className='flex-1 gap-2'>
            {t('requestQuote')}
          </Button>
        </div>
      </div>
    </div>
  )
}
