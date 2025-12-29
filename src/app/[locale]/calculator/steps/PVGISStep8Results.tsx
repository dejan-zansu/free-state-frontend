'use client'

import {
  BarChart3,
  Battery,
  DollarSign,
  Leaf,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep8Results() {
  const {
    selectedPanel,
    panelCount,
    selectedInverter,
    roofPolygon,
    additionalParams,
    pvgisResult,
    calculatePVGISResults,
    isLoading,
    error,
  } = usePVGISCalculatorStore()

  // Calculate results on mount
  useEffect(() => {
    if (!pvgisResult && selectedPanel && panelCount > 0) {
      calculatePVGISResults()
    }
  }, [pvgisResult, selectedPanel, panelCount, calculatePVGISResults])

  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('de-CH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4'>
          <div className='w-16 h-16 border-4 border-solar border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-lg font-medium'>
            Calculating your solar potential...
          </p>
          <p className='text-sm text-muted-foreground'>
            Using PVGIS data for accurate results
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Card className='max-w-md'>
          <CardContent className='pt-6 text-center space-y-4'>
            <div className='text-destructive text-5xl'>⚠️</div>
            <h2 className='text-xl font-semibold'>Calculation Error</h2>
            <p className='text-muted-foreground'>{error}</p>
            <Button onClick={() => calculatePVGISResults()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!pvgisResult) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Button onClick={() => calculatePVGISResults()} className='gap-2'>
          <BarChart3 className='w-4 h-4' />
          Calculate Results
        </Button>
      </div>
    )
  }

  // Financial calculations
  const systemPowerKw =
    selectedPanel && panelCount ? (selectedPanel.power * panelCount) / 1000 : 0
  const panelCost = selectedPanel ? selectedPanel.price * panelCount : 0
  const inverterCost = selectedInverter?.price || 0
  const installationCost = systemPowerKw * 1000 // Approx 1000 CHF/kWp for installation
  const totalInvestment = panelCost + inverterCost + installationCost

  // Swiss subsidies (Pronovo: ~380 CHF base + ~300 CHF/kWp up to 30kWp)
  const subsidyBase = 380
  const subsidyPerKw = 300
  const subsidies = subsidyBase + Math.min(systemPowerKw, 30) * subsidyPerKw

  // VAT
  const vatRate = additionalParams.vatPayable ? 0.081 : 0
  const totalWithVAT = totalInvestment * (1 + vatRate)
  const netInvestment = totalWithVAT - subsidies

  // Electricity savings
  const electricityTariff = additionalParams.electricityTariff || 0.2 // CHF/kWh
  const feedInTariff = additionalParams.feedInTariff || 0.08 // CHF/kWh
  const selfConsumptionRate = 0.3 // Assume 30% self-consumption

  const selfConsumedEnergy = pvgisResult.yearlyProduction * selfConsumptionRate
  const exportedEnergy =
    pvgisResult.yearlyProduction * (1 - selfConsumptionRate)
  const annualSavings =
    selfConsumedEnergy * electricityTariff + exportedEnergy * feedInTariff

  // 25-year projections
  const systemLifetime = 25
  const degradationRate = 0.005 // 0.5% per year
  let totalSavings = 0
  for (let year = 1; year <= systemLifetime; year++) {
    const yearlyProduction =
      pvgisResult.yearlyProduction * Math.pow(1 - degradationRate, year - 1)
    const yearSelfConsumed = yearlyProduction * selfConsumptionRate
    const yearExported = yearlyProduction * (1 - selfConsumptionRate)
    totalSavings +=
      yearSelfConsumed * electricityTariff + yearExported * feedInTariff
  }

  const grossYield = totalSavings
  const netYield = grossYield - netInvestment
  const yieldPerKwp = netYield / systemPowerKw
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const yieldPerYear = netYield / systemLifetime

  // Payback period (simplified)
  const paybackYears = netInvestment / annualSavings

  return (
    <div className='space-y-6'>
      {/* Summary Card */}
      <Card className='bg-gradient-to-br from-solar/10 to-energy/10 border-solar/30'>
        <CardHeader>
          <CardTitle className='text-3xl flex items-center gap-3'>
            <Sun className='w-8 h-8 text-solar' />
            Your Solar System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            <div>
              <div className='text-sm text-muted-foreground'>
                Installed Capacity
              </div>
              <div className='text-3xl font-bold text-solar'>
                {systemPowerKw.toFixed(2)} kWp
              </div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>
                Number of Panels
              </div>
              <div className='text-3xl font-bold'>{panelCount}</div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>
                Annual Production
              </div>
              <div className='text-3xl font-bold text-energy'>
                {formatNumber(pvgisResult.yearlyProduction)} kWh
              </div>
            </div>
            <div>
              <div className='text-sm text-muted-foreground'>Usable Area</div>
              <div className='text-3xl font-bold'>
                {roofPolygon ? formatNumber(roofPolygon.area, 0) : 0} m²
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Figures Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* CO2 Reduction */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              CO₂ Reduction per Year
            </CardTitle>
            <Leaf className='w-4 h-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatNumber(pvgisResult.co2Reduction)} kg
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Equivalent to {formatNumber(pvgisResult.co2Reduction / 0.12)} km
              driven
            </p>
          </CardContent>
        </Card>

        {/* Investment */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Investment
            </CardTitle>
            <DollarSign className='w-4 h-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatNumber(totalWithVAT)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Including {additionalParams.vatPayable ? '8.1%' : '0%'} VAT
            </p>
          </CardContent>
        </Card>

        {/* Subsidies */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Subsidies / Tax Benefits
            </CardTitle>
            <TrendingUp className='w-4 h-4 text-energy' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-energy'>
              {formatNumber(subsidies)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Swiss federal (Pronovo) subsidy
            </p>
          </CardContent>
        </Card>

        {/* Net Investment */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Net Investment
            </CardTitle>
            <DollarSign className='w-4 h-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatNumber(netInvestment)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              After subsidies
            </p>
          </CardContent>
        </Card>

        {/* Annual Savings */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Annual Savings
            </CardTitle>
            <Zap className='w-4 h-4 text-solar' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-solar'>
              {formatNumber(annualSavings)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Year 1 electricity savings
            </p>
          </CardContent>
        </Card>

        {/* Payback Period */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Payback Period
            </CardTitle>
            <Battery className='w-4 h-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {paybackYears.toFixed(1)} years
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Return on investment
            </p>
          </CardContent>
        </Card>

        {/* Gross Yield (25 years) */}
        <Card className='md:col-span-2 lg:col-span-1'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Gross Yield (25 years)
            </CardTitle>
            <TrendingUp className='w-4 h-4 text-energy' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-energy'>
              {formatNumber(grossYield)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Total electricity savings
            </p>
          </CardContent>
        </Card>

        {/* Net Yield */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Net Yield (25 years)
            </CardTitle>
            <DollarSign className='w-4 h-4 text-solar' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-solar'>
              {formatNumber(netYield)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              After investment cost
            </p>
          </CardContent>
        </Card>

        {/* Yield per kWp */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Yield per kWp</CardTitle>
            <BarChart3 className='w-4 h-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatNumber(yieldPerKwp)} CHF
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Per installed kWp
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <div className='text-muted-foreground'>Panel Model</div>
              <div className='font-semibold'>{selectedPanel?.name}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>Inverter</div>
              <div className='font-semibold'>
                {selectedInverter?.name || 'Not selected'}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                Daily Average Production
              </div>
              <div className='font-semibold'>
                {formatNumber(pvgisResult.dailyAverage, 1)} kWh
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>Peak Sun Hours</div>
              <div className='font-semibold'>
                {pvgisResult.peakSunHours.toFixed(1)} hours/day
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>System Loss</div>
              <div className='font-semibold'>
                {pvgisResult.systemLoss.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>Self-consumption Rate</div>
              <div className='font-semibold'>
                {(selfConsumptionRate * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className='pt-6 flex gap-4'>
          <Button className='flex-1 bg-solar' size='lg'>
            Request Quote
          </Button>
          <Button variant='outline' className='flex-1' size='lg'>
            Download Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
