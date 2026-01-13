'use client'

import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  Download,
  Leaf,
  Mail,
  Settings,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'
import { formatCurrency } from '@/config/countries'
import { reportService } from '@/services/report.service'
import { useParams } from 'next/navigation'

export default function Step5Results() {
  const params = useParams()
  const locale = (params?.locale as string) || 'de'
  const {
    selectedPanel,
    panelCount,
    selectedInverter,
    roofPolygon,
    panelPlacement,
    additionalParams,
    updateAdditionalParams,
    pvgisResult,
    calculatePVGISResults,
    isLoading,
    error,
    prevStep,
    countryCode,
    getCountryConfig,
    latitude,
    longitude,
    address: storeAddress,
  } = usePVGISCalculatorStore()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Get country-specific configuration
  const countryConfig = getCountryConfig()

  // Calculate results on mount
  useEffect(() => {
    if (!pvgisResult && selectedPanel && panelCount > 0) {
      calculatePVGISResults()
    }
  }, [pvgisResult, selectedPanel, panelCount, calculatePVGISResults])

  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat(countryCode === 'GB' ? 'en-GB' : 'de-CH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  // Helper to format with currency symbol
  const formatMoney = (amount: number, decimals: number = 0) => {
    const currency = countryConfig?.currency || 'CHF'
    return formatCurrency(amount, currency, countryCode, decimals)
  }

  // Financial calculations using country config
  const systemPowerKw =
    selectedPanel && panelCount ? (selectedPanel.power * panelCount) / 1000 : 0
  const panelCost = selectedPanel ? selectedPanel.price * panelCount : 0
  const inverterCost = selectedInverter?.price || 0
  // Installation cost: industry-standard rate per kWp
  const installationCostPerKwp = countryConfig?.installationCostPerKwp || 1500
  const installationCost = systemPowerKw * installationCostPerKwp
  const totalInvestment = panelCost + inverterCost + installationCost

  // Country-specific subsidies
  const subsidyBase = countryConfig?.subsidyBase || 0
  const subsidyPerKw = countryConfig?.subsidyPerKw || 0
  const subsidyCap = countryConfig?.subsidyCapKw || 100
  const subsidies =
    subsidyBase + Math.min(systemPowerKw, subsidyCap) * subsidyPerKw

  // Country-specific VAT
  const vatRate = additionalParams.vatPayable
    ? countryConfig?.vatRate || 0.2
    : 0
  const totalWithVAT = totalInvestment * (1 + vatRate)
  const netInvestment = totalWithVAT - subsidies

  // Electricity prices from country config (user can override in advanced settings)
  const electricityTariff =
    additionalParams.electricityTariff ||
    countryConfig?.electricityPrice ||
    0.25
  const feedInTariff =
    additionalParams.feedInTariff || countryConfig?.feedInTariff || 0.08

  // Self-consumption rate based on consumption vs production
  const yearlyProduction = pvgisResult?.yearlyProduction || 0
  const consumption = additionalParams.electricityConsumption
  const baseRate =
    consumption > 0 ? Math.min(consumption / yearlyProduction, 1) : 0.3
  const selfConsumptionRate = Math.min(0.7, Math.max(0.2, baseRate * 0.6)) // Clamp between 20-70%

  const selfConsumedEnergy = yearlyProduction * selfConsumptionRate
  const exportedEnergy = yearlyProduction * (1 - selfConsumptionRate)
  const annualSavings =
    selfConsumedEnergy * electricityTariff + exportedEnergy * feedInTariff

  // 30-year projections
  const systemLifetime = 30
  const degradationRate = 0.005 // 0.5% per year (PVGIS default)
  let totalSavings = 0
  for (let year = 1; year <= systemLifetime; year++) {
    const yearProduction =
      yearlyProduction * Math.pow(1 - degradationRate, year - 1)
    const yearSelfConsumed = yearProduction * selfConsumptionRate
    const yearExported = yearProduction * (1 - selfConsumptionRate)
    totalSavings +=
      yearSelfConsumed * electricityTariff + yearExported * feedInTariff
  }

  const netYield = totalSavings - netInvestment
  const paybackYears = annualSavings > 0 ? netInvestment / annualSavings : 0

  // Handle report download
  const handleDownloadReport = async () => {
    if (
      !pvgisResult ||
      !selectedPanel ||
      !latitude ||
      !longitude ||
      !storeAddress
    ) {
      alert('Missing required data. Please complete all steps first.')
      return
    }

    setIsDownloading(true)
    try {
      await reportService.downloadPVGISReport({
        latitude,
        longitude,
        address: storeAddress,
        countryCode,
        panelCount,
        panelPower: selectedPanel.power,
        panelWidth: selectedPanel.width,
        panelHeight: selectedPanel.height,
        panelName: selectedPanel.name,
        inverterName: selectedInverter?.name,
        inverterPower: selectedInverter ? selectedInverter.power : undefined,
        roofArea: roofPolygon?.area,
        roofPolygon: roofPolygon || undefined,
        orientation: panelPlacement.orientation,
        tilt: panelPlacement.tilt,
        yearlyProduction: pvgisResult.yearlyProduction,
        monthlyProduction: pvgisResult.monthlyProduction,
        dailyAverage: pvgisResult.dailyAverage,
        co2Reduction: pvgisResult.co2Reduction,
        panelCost,
        inverterCost,
        installationCost,
        totalInvestment: totalWithVAT,
        vatRate,
        subsidies,
        netInvestment,
        annualSavings,
        totalSavings,
        netYield,
        paybackYears,
        electricityTariff,
        feedInTariff,
        selfConsumptionRate,
        language: locale as 'de' | 'fr' | 'it' | 'en' | 'sr' | 'es',
      })
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center space-y-4'>
          <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-lg font-medium'>
            Calculating your solar potential...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Card className='max-w-md'>
          <CardContent className='pt-6 text-center space-y-4'>
            <div className='text-destructive text-5xl'>⚠️</div>
            <h2 className='text-xl font-semibold'>Calculation Error</h2>
            <p className='text-muted-foreground'>{error}</p>
            <div className='flex gap-2 justify-center'>
              <Button variant='outline' onClick={prevStep}>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Go Back
              </Button>
              <Button onClick={() => calculatePVGISResults()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='h-full overflow-auto'>
      <div className='container mx-auto px-4 py-6 max-w-6xl'>
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold flex items-center gap-2'>
                <Sun className='w-6 h-6 text-primary' />
                Your Solar Potential
              </h1>
            </div>
            <Button variant='outline' onClick={prevStep}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Edit System
            </Button>
          </div>

          {/* Main Results */}
          <div className='grid md:grid-cols-4 gap-4'>
            <Card className='bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>System Size</p>
                <p className='text-3xl font-bold text-primary'>
                  {systemPowerKw.toFixed(1)} kWp
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  {panelCount} panels
                </p>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/30'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>
                  Annual Production
                </p>
                <p className='text-3xl font-bold text-green-600'>
                  {formatNumber(yearlyProduction)}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>kWh/year</p>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>Annual Savings</p>
                <p className='text-3xl font-bold text-blue-600'>
                  {formatMoney(annualSavings)}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>per year</p>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30'>
              <CardContent className='pt-6'>
                <p className='text-sm text-muted-foreground'>Payback Period</p>
                <p className='text-3xl font-bold text-purple-600'>
                  {paybackYears.toFixed(1)}
                </p>
                <p className='text-xs text-muted-foreground mt-1'>years</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Production Chart */}
          {pvgisResult && pvgisResult.monthlyProduction.length === 12 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <BarChart3 className='w-5 h-5' />
                  Monthly Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-end justify-between gap-1 h-48'>
                    {pvgisResult.monthlyProduction.map((production, index) => {
                      const monthNames = [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                      ]
                      const maxProduction = Math.max(
                        ...pvgisResult.monthlyProduction
                      )
                      const heightPercent = (production / maxProduction) * 100

                      return (
                        <div
                          key={index}
                          className='flex flex-col items-center flex-1 gap-2'
                        >
                          <div className='relative group flex-1 w-full flex items-end'>
                            <div
                              className='w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all hover:opacity-80'
                              style={{ height: `${heightPercent}%` }}
                            >
                              {/* Tooltip on hover */}
                              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10'>
                                {formatNumber(production)} kWh
                              </div>
                            </div>
                          </div>
                          <span className='text-xs text-muted-foreground'>
                            {monthNames[index]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className='flex justify-between text-sm pt-3 border-t'>
                    <div>
                      <p className='text-muted-foreground'>Peak Month</p>
                      <p className='font-semibold'>
                        {formatNumber(
                          Math.max(...pvgisResult.monthlyProduction)
                        )}{' '}
                        kWh
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-muted-foreground'>Lowest Month</p>
                      <p className='font-semibold'>
                        {formatNumber(
                          Math.min(...pvgisResult.monthlyProduction)
                        )}{' '}
                        kWh
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Electricity Prices - IMPORTANT for accurate calculations */}
          <Card className='border-amber-500 bg-amber-500/5'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Zap className='w-5 h-5 text-amber-500' />
                💡 Your Electricity Prices
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                <strong>Important:</strong> Enter your actual rates from your
                electricity bill for accurate savings calculations. These
                greatly affect your payback period.
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid md:grid-cols-2 gap-4'>
                {/* Electricity Tariff */}
                <div className='space-y-2'>
                  <Label className='font-semibold text-base'>
                    Electricity Price (Rp/kWh)
                  </Label>
                  <div className='relative'>
                    <Input
                      type='number'
                      value={
                        additionalParams.electricityTariff
                          ? additionalParams.electricityTariff * 100
                          : ''
                      }
                      onChange={(e) =>
                        updateAdditionalParams({
                          electricityTariff:
                            parseFloat(e.target.value) / 100 || 0,
                        })
                      }
                      placeholder={`${(
                        (countryConfig?.electricityPrice || 0.27) * 100
                      ).toFixed(1)}`}
                      step={0.1}
                      min={0}
                      className='pr-16 h-12 text-lg'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                      Rp/kWh
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {additionalParams.electricityTariff
                      ? `✓ Using your rate: ${(
                          additionalParams.electricityTariff * 100
                        ).toFixed(1)} Rp/kWh`
                      : `Using Swiss average: ${(
                          (countryConfig?.electricityPrice || 0.27) * 100
                        ).toFixed(1)} Rp/kWh`}
                  </p>
                </div>

                {/* Feed-in Tariff */}
                <div className='space-y-2'>
                  <Label className='font-semibold text-base'>
                    Feed-in Tariff (Rp/kWh)
                  </Label>
                  <div className='relative'>
                    <Input
                      type='number'
                      value={
                        additionalParams.feedInTariff
                          ? additionalParams.feedInTariff * 100
                          : ''
                      }
                      onChange={(e) =>
                        updateAdditionalParams({
                          feedInTariff: parseFloat(e.target.value) / 100 || 0,
                        })
                      }
                      placeholder={`${(
                        (countryConfig?.feedInTariff || 0.08) * 100
                      ).toFixed(1)}`}
                      step={0.1}
                      min={0}
                      className='pr-16 h-12 text-lg'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium'>
                      Rp/kWh
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {additionalParams.feedInTariff
                      ? `✓ Using your rate: ${(
                          additionalParams.feedInTariff * 100
                        ).toFixed(1)} Rp/kWh`
                      : `Using Swiss average: ${(
                          (countryConfig?.feedInTariff || 0.08) * 100
                        ).toFixed(1)} Rp/kWh`}
                  </p>
                </div>
              </div>

              <div className='p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'>
                <p className='text-sm text-amber-900 dark:text-amber-100'>
                  <strong>💡 Where to find:</strong> Check your latest
                  electricity bill. The electricity price is what you pay per
                  kWh consumed. The feed-in tariff is what you earn for excess
                  energy exported to the grid.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <div className='grid md:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <DollarSign className='w-5 h-5' />
                  Investment
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Panels ({panelCount}×)
                  </span>
                  <span>{formatMoney(panelCost)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Inverter</span>
                  <span>{formatMoney(inverterCost)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Installation</span>
                  <span>{formatMoney(installationCost)}</span>
                </div>
                {additionalParams.vatPayable && (
                  <div className='flex justify-between text-muted-foreground'>
                    <span>VAT ({(vatRate * 100).toFixed(1)}%)</span>
                    <span>{formatMoney(totalInvestment * vatRate)}</span>
                  </div>
                )}
                <div className='flex justify-between pt-2 border-t font-semibold'>
                  <span>Total</span>
                  <span>{formatMoney(totalWithVAT)}</span>
                </div>
                {subsidies > 0 && (
                  <div className='flex justify-between text-green-600'>
                    <span>Government Subsidy</span>
                    <span>- {formatMoney(subsidies)}</span>
                  </div>
                )}
                <div className='flex justify-between pt-2 border-t font-bold text-lg'>
                  <span>Net Investment</span>
                  <span className='text-primary'>
                    {formatMoney(netInvestment)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <TrendingUp className='w-5 h-5' />
                  {systemLifetime}-Year Returns
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Total Production
                  </span>
                  <span>
                    {formatNumber(yearlyProduction * systemLifetime * 0.94)} kWh
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Self-consumed ({(selfConsumptionRate * 100).toFixed(0)}%)
                  </span>
                  <span>
                    {formatMoney(
                      (totalSavings * selfConsumptionRate) /
                        (selfConsumptionRate +
                          (1 - selfConsumptionRate) *
                            (feedInTariff / electricityTariff))
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Grid export income
                  </span>
                  <span>
                    {formatMoney(
                      (totalSavings *
                        (1 - selfConsumptionRate) *
                        (feedInTariff / electricityTariff)) /
                        (selfConsumptionRate +
                          (1 - selfConsumptionRate) *
                            (feedInTariff / electricityTariff))
                    )}
                  </span>
                </div>
                <div className='flex justify-between pt-2 border-t'>
                  <span className='font-semibold'>Total Savings</span>
                  <span className='font-semibold'>
                    {formatMoney(totalSavings)}
                  </span>
                </div>
                <div className='flex justify-between text-muted-foreground'>
                  <span>Minus Investment</span>
                  <span>- {formatMoney(netInvestment)}</span>
                </div>
                <div className='flex justify-between pt-2 border-t font-bold text-lg'>
                  <span>Net Profit</span>
                  <span
                    className={netYield > 0 ? 'text-green-600' : 'text-red-600'}
                  >
                    {formatMoney(netYield)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Impact */}
          <Card>
            <CardContent className='py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Leaf className='w-8 h-8 text-green-600' />
                  <div>
                    <p className='font-semibold'>Environmental Impact</p>
                    <p className='text-sm text-muted-foreground'>
                      Annual CO₂ reduction
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-green-600'>
                    {formatNumber(pvgisResult?.co2Reduction || 0)} kg
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    ≈ {formatNumber((pvgisResult?.co2Reduction || 0) / 0.12)} km
                    by car
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant='outline' className='w-full gap-2'>
                <Settings className='w-4 h-4' />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='pt-4'>
              <Card>
                <CardContent className='pt-6 space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    {/* Consumption */}
                    <div className='space-y-2'>
                      <Label className='flex items-center gap-2'>
                        <Zap className='w-4 h-4' />
                        Annual Electricity Consumption
                      </Label>
                      <div className='space-y-3'>
                        <Slider
                          value={[additionalParams.electricityConsumption]}
                          onValueChange={(v) =>
                            updateAdditionalParams({
                              electricityConsumption: v[0],
                            })
                          }
                          min={1000}
                          max={20000}
                          step={500}
                        />
                        <div className='flex justify-between text-sm'>
                          <span className='text-muted-foreground'>
                            1,000 kWh
                          </span>
                          <span className='font-semibold'>
                            {formatNumber(
                              additionalParams.electricityConsumption
                            )}{' '}
                            kWh/year
                          </span>
                          <span className='text-muted-foreground'>
                            20,000 kWh
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* VAT */}
                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                      <div>
                        <Label className='font-semibold'>Include VAT</Label>
                        <p className='text-sm text-muted-foreground'>
                          Add{' '}
                          {((countryConfig?.vatRate || 0.081) * 100).toFixed(1)}
                          % VAT to investment
                        </p>
                      </div>
                      <Switch
                        checked={additionalParams.vatPayable}
                        onCheckedChange={(checked) =>
                          updateAdditionalParams({ vatPayable: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* System Details */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <BarChart3 className='w-5 h-5' />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Panel Type</p>
                  <p className='font-semibold'>{selectedPanel?.name}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Inverter</p>
                  <p className='font-semibold'>{selectedInverter?.name}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Orientation</p>
                  <p className='font-semibold'>
                    {panelPlacement.orientation}° azimuth
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Tilt</p>
                  <p className='font-semibold'>{panelPlacement.tilt}°</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Roof Area</p>
                  <p className='font-semibold'>
                    {roofPolygon ? formatNumber(roofPolygon.area, 1) : 0} m²
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Panel Coverage</p>
                  <p className='font-semibold'>
                    {roofPolygon && selectedPanel
                      ? (
                          ((panelCount *
                            selectedPanel.width *
                            selectedPanel.height) /
                            roofPolygon.area) *
                          100
                        ).toFixed(0)
                      : 0}
                    %
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Daily Average</p>
                  <p className='font-semibold'>
                    {pvgisResult
                      ? formatNumber(pvgisResult.dailyAverage, 1)
                      : 0}{' '}
                    kWh
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Specific Yield</p>
                  <p className='font-semibold'>
                    {systemPowerKw > 0
                      ? formatNumber(yearlyProduction / systemPowerKw)
                      : 0}{' '}
                    kWh/kWp
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex gap-4'>
            <Button className='flex-1' size='lg'>
              <Mail className='w-4 h-4 mr-2' />
              Request Quote
            </Button>
            <Button
              variant='outline'
              className='flex-1'
              size='lg'
              onClick={handleDownloadReport}
              disabled={isDownloading || !pvgisResult}
            >
              <Download className='w-4 h-4 mr-2' />
              {isDownloading ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
