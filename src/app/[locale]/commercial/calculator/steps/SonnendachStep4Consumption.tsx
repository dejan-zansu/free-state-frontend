'use client'

import { useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Car,
  Droplet,
  Flame,
  Zap,
  Users,
  Receipt,
  Gauge,
  Sun,
  ArrowDown,
  TrendingUp,
  Info,
  Calendar,
  LineChart as LineChartIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

// Format number with Swiss thousand separator (apostrophe)
function formatSwissNumber(num: number, decimals = 0): string {
  return num.toLocaleString('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export default function SonnendachStep4Consumption() {
  const t = useTranslations('sonnendach.step4Consumption')
  const {
    consumption,
    setConsumption,
    goToStep,
    nextStep,
    getSelectedSegments,
    selectedPotentialKwh,
    selectedPanel,
    panelCount,
  } = useSonnendachCalculatorStore()

  const selectedSegments = getSelectedSegments()

  // Calculate energy and financial metrics
  const calculations = useMemo(() => {
    // Default consumption based on residents if not specified
    const baseConsumption = consumption.residents * 1500 // ~1500 kWh per person/year
    const evConsumption = consumption.evChargingStations * 2500 // ~2500 kWh per EV/year
    const heatPumpHotWaterConsumption = consumption.heatPumpHotWater ? 2000 : 0
    const heatPumpHeatingConsumption = consumption.heatPumpHeating ? 5000 : 0

    const estimatedConsumption =
      baseConsumption + evConsumption + heatPumpHotWaterConsumption + heatPumpHeatingConsumption
    const annualConsumption = consumption.annualConsumptionKwh || estimatedConsumption

    // Solar production
    const production = selectedPotentialKwh

    // Self-consumption calculation (simplified model)
    // Typically 20-40% for residential without battery, higher with battery/heat pump
    let selfConsumptionRate = 0.25 // Base 25%
    if (consumption.heatPumpHotWater) selfConsumptionRate += 0.05
    if (consumption.heatPumpHeating) selfConsumptionRate += 0.10
    if (consumption.evChargingStations > 0) selfConsumptionRate += 0.05 * consumption.evChargingStations

    // Cap self-consumption at what's actually consumed
    const maxSelfConsumption = Math.min(production * selfConsumptionRate, annualConsumption)
    const selfConsumption = Math.round(maxSelfConsumption)

    // Grid interactions
    const gridFeedIn = Math.round(production - selfConsumption)
    const gridPurchase = Math.round(annualConsumption - selfConsumption)

    // Independence = self-consumption / total consumption * 100
    const independence = annualConsumption > 0
      ? Math.round((selfConsumption / annualConsumption) * 100)
      : 0

    // Tariffs (Rp/kWh -> CHF/kWh)
    const electricityTariff = consumption.electricityTariffAuto ? 25 : consumption.electricityTariff
    const feedInTariff = consumption.feedInTariffAuto ? 12 : consumption.feedInTariff
    const electricityPriceCHF = electricityTariff / 100
    const feedInPriceCHF = feedInTariff / 100

    // Financial calculations
    const systemSizeKwp = selectedPanel && panelCount
      ? (selectedPanel.power * panelCount) / 1000
      : 0

    // Investment cost (simplified: ~1800 CHF/kWp for residential)
    const investmentPerKwp = 1800
    const investment = Math.round(systemSizeKwp * investmentPerKwp)

    // Swiss federal subsidy: 350 CHF/kWp + 600 CHF base (simplified)
    const federalSubsidy = Math.round(600 + systemSizeKwp * 350)
    // Tax benefits: ~20% of net cost can be deducted (cantonal average)
    const taxBenefits = Math.round((investment - federalSubsidy) * 0.20)
    const totalSubsidies = federalSubsidy + taxBenefits

    const netInvestment = investment - totalSubsidies

    // Annual yield = savings from self-consumption + feed-in revenue
    const savingsFromSelfConsumption = selfConsumption * electricityPriceCHF
    const feedInRevenue = gridFeedIn * feedInPriceCHF
    const annualYield = Math.round(savingsFromSelfConsumption + feedInRevenue)

    // System lifetime: 25 years
    const systemLifetime = 25
    const grossReturnOverLifetime = annualYield * systemLifetime

    // Annual return rate (simplified)
    const annualReturnRate = netInvestment > 0
      ? ((annualYield / netInvestment) * 100)
      : 0

    return {
      production,
      annualConsumption,
      selfConsumption,
      gridFeedIn,
      gridPurchase,
      independence,
      investment,
      totalSubsidies,
      netInvestment,
      grossReturnOverLifetime,
      annualReturnRate,
      annualYield,
      electricityTariff,
      feedInTariff,
    }
  }, [
    consumption,
    selectedPotentialKwh,
    selectedPanel,
    panelCount,
  ])

  // Check if we have enough data to show reports
  const hasProductionData = calculations.production > 0

  // Generate ROI chart data (cumulative cash flow over 25 years)
  const roiChartData = useMemo(() => {
    const data = []
    let cumulativeCashFlow = -calculations.netInvestment

    for (let year = 0; year <= 25; year++) {
      if (year === 0) {
        data.push({
          year,
          cashFlow: cumulativeCashFlow,
          breakeven: 0,
        })
      } else {
        cumulativeCashFlow += calculations.annualYield
        data.push({
          year,
          cashFlow: Math.round(cumulativeCashFlow),
          breakeven: 0,
        })
      }
    }
    return data
  }, [calculations.netInvestment, calculations.annualYield])

  // Calculate payback year
  const paybackYear = useMemo(() => {
    if (calculations.annualYield <= 0) return null
    const years = calculations.netInvestment / calculations.annualYield
    return Math.ceil(years)
  }, [calculations.netInvestment, calculations.annualYield])

  // Generate monthly production data (Swiss solar irradiance pattern)
  const monthlyChartData = useMemo(() => {
    // Swiss monthly solar production factors (normalized to annual total)
    const monthlyFactors = [
      0.04,  // Jan
      0.05,  // Feb
      0.08,  // Mar
      0.10,  // Apr
      0.12,  // May
      0.13,  // Jun
      0.14,  // Jul
      0.12,  // Aug
      0.09,  // Sep
      0.07,  // Oct
      0.04,  // Nov
      0.02,  // Dec
    ]

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return months.map((month, index) => {
      const production = Math.round(calculations.production * monthlyFactors[index])
      const consumption = Math.round(calculations.annualConsumption / 12)
      const selfConsumption = Math.round(Math.min(production * 0.3, consumption))

      return {
        month,
        production,
        consumption,
        selfConsumption,
        gridFeedIn: production - selfConsumption,
        gridPurchase: consumption - selfConsumption,
      }
    })
  }, [calculations.production, calculations.annualConsumption])

  if (selectedSegments.length === 0) {
    return (
      <div className='h-full flex flex-col items-center justify-center gap-4 p-8'>
        <p className='text-muted-foreground text-center'>{t('noSegments')}</p>
        <Button variant='outline' onClick={() => goToStep(1)}>
          {t('backToSelection')}
        </Button>
      </div>
    )
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='text-muted-foreground mt-2'>{t('subtitle')}</p>
        </div>

        <div className='grid lg:grid-cols-2 gap-6'>
          {/* Left Column - Input Forms */}
          <div className='space-y-6'>
            {/* Property Info Section */}
            <Card>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Home className='w-5 h-5 text-primary' />
                  {t('propertyInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Property Type */}
                <div className='space-y-2'>
                  <Label htmlFor='propertyType'>{t('propertyInfo.propertyType')}</Label>
                  <Select
                    value={consumption.propertyType}
                    onValueChange={(value) => setConsumption({ propertyType: value as 'residential' | 'commercial' | 'industrial' | 'agricultural' })}
                  >
                    <SelectTrigger id='propertyType'>
                      <SelectValue placeholder={t('propertyInfo.selectPropertyType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='residential'>{t('propertyInfo.types.residential')}</SelectItem>
                      <SelectItem value='commercial'>{t('propertyInfo.types.commercial')}</SelectItem>
                      <SelectItem value='industrial'>{t('propertyInfo.types.industrial')}</SelectItem>
                      <SelectItem value='agricultural'>{t('propertyInfo.types.agricultural')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* New Building */}
                <div className='space-y-2'>
                  <Label htmlFor='isNewBuilding'>{t('propertyInfo.newBuilding')}</Label>
                  <Select
                    value={consumption.isNewBuilding ? 'yes' : 'no'}
                    onValueChange={(value) => setConsumption({ isNewBuilding: value === 'yes' })}
                  >
                    <SelectTrigger id='isNewBuilding'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='no'>{t('common.no')}</SelectItem>
                      <SelectItem value='yes'>{t('common.yes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* EV Charging Station */}
                <div className='space-y-2'>
                  <Label htmlFor='evChargingStations' className='flex items-center gap-2'>
                    <Car className='w-4 h-4' />
                    {t('propertyInfo.evCharging')}
                  </Label>
                  <Select
                    value={String(consumption.evChargingStations)}
                    onValueChange={(value) => setConsumption({ evChargingStations: Number(value) })}
                  >
                    <SelectTrigger id='evChargingStations'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>{t('common.none')}</SelectItem>
                      <SelectItem value='1'>1</SelectItem>
                      <SelectItem value='2'>2</SelectItem>
                      <SelectItem value='3'>3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Heat Pump - Hot Water */}
                <div className='space-y-2'>
                  <Label htmlFor='heatPumpHotWater' className='flex items-center gap-2'>
                    <Droplet className='w-4 h-4' />
                    {t('propertyInfo.heatPumpHotWater')}
                  </Label>
                  <Select
                    value={consumption.heatPumpHotWater ? 'yes' : 'no'}
                    onValueChange={(value) => setConsumption({ heatPumpHotWater: value === 'yes' })}
                  >
                    <SelectTrigger id='heatPumpHotWater'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='no'>{t('common.none')}</SelectItem>
                      <SelectItem value='yes'>{t('common.yes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Heat Pump - Heating */}
                <div className='space-y-2'>
                  <Label htmlFor='heatPumpHeating' className='flex items-center gap-2'>
                    <Flame className='w-4 h-4' />
                    {t('propertyInfo.heatPumpHeating')}
                  </Label>
                  <Select
                    value={consumption.heatPumpHeating ? 'yes' : 'no'}
                    onValueChange={(value) => setConsumption({ heatPumpHeating: value === 'yes' })}
                  >
                    <SelectTrigger id='heatPumpHeating'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='no'>{t('common.none')}</SelectItem>
                      <SelectItem value='yes'>{t('common.yes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Electricity Provider */}
                <div className='space-y-2'>
                  <Label htmlFor='electricityProvider' className='flex items-center gap-2'>
                    <Zap className='w-4 h-4' />
                    {t('propertyInfo.electricityProvider')}
                  </Label>
                  <Select
                    value={consumption.electricityProvider}
                    onValueChange={(value) => setConsumption({ electricityProvider: value })}
                  >
                    <SelectTrigger id='electricityProvider'>
                      <SelectValue placeholder={t('propertyInfo.selectProvider')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='standard'>{t('propertyInfo.providers.standard')}</SelectItem>
                      <SelectItem value='ewz'>{t('propertyInfo.providers.ewz')}</SelectItem>
                      <SelectItem value='axpo'>{t('propertyInfo.providers.axpo')}</SelectItem>
                      <SelectItem value='bkw'>{t('propertyInfo.providers.bkw')}</SelectItem>
                      <SelectItem value='other'>{t('propertyInfo.providers.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Consumption Section */}
            <Card>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Gauge className='w-5 h-5 text-primary' />
                  {t('consumption.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Number of Residents */}
                <div className='space-y-2'>
                  <Label htmlFor='residents' className='flex items-center gap-2'>
                    <Users className='w-4 h-4' />
                    {t('consumption.residents')}
                  </Label>
                  <Select
                    value={String(consumption.residents)}
                    onValueChange={(value) => setConsumption({ residents: Number(value) })}
                  >
                    <SelectTrigger id='residents'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>1</SelectItem>
                      <SelectItem value='2'>2</SelectItem>
                      <SelectItem value='3'>3</SelectItem>
                      <SelectItem value='4'>4</SelectItem>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='6'>6+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Annual Electricity Cost */}
                <div className='space-y-2'>
                  <Label htmlFor='annualElectricityCost' className='flex items-center gap-2'>
                    <Receipt className='w-4 h-4' />
                    {t('consumption.annualCost')}
                  </Label>
                  <div className='relative'>
                    <Input
                      id='annualElectricityCost'
                      type='number'
                      placeholder={t('consumption.annualCostPlaceholder')}
                      value={consumption.annualElectricityCost || ''}
                      onChange={(e) =>
                        setConsumption({ annualElectricityCost: Number(e.target.value) || 0 })
                      }
                      className='pr-16'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                      CHF
                    </span>
                  </div>
                </div>

                {/* Annual Consumption kWh */}
                <div className='space-y-2'>
                  <Label htmlFor='annualConsumptionKwh' className='flex items-center gap-2'>
                    <Zap className='w-4 h-4' />
                    {t('consumption.annualKwh')}
                  </Label>
                  <div className='relative'>
                    <Input
                      id='annualConsumptionKwh'
                      type='number'
                      placeholder={t('consumption.annualKwhPlaceholder')}
                      value={consumption.annualConsumptionKwh || ''}
                      onChange={(e) =>
                        setConsumption({ annualConsumptionKwh: Number(e.target.value) || 0 })
                      }
                      className='pr-20'
                    />
                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                      kWh/yr
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    {t('consumption.kwhHelp')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tariffs Section */}
            <Card>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Receipt className='w-5 h-5 text-primary' />
                  {t('tariffs.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Electricity Tariff */}
                <div className='space-y-2'>
                  <Label htmlFor='electricityTariff'>{t('tariffs.electricityTariff')}</Label>
                  <div className='flex gap-2'>
                    <Select
                      value={consumption.electricityTariffAuto ? 'auto' : 'manual'}
                      onValueChange={(value) =>
                        setConsumption({ electricityTariffAuto: value === 'auto' })
                      }
                    >
                      <SelectTrigger className='w-[120px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='auto'>{t('tariffs.auto')}</SelectItem>
                        <SelectItem value='manual'>{t('tariffs.manual')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {!consumption.electricityTariffAuto && (
                      <div className='relative flex-1'>
                        <Input
                          id='electricityTariff'
                          type='number'
                          step='0.01'
                          placeholder='25'
                          value={consumption.electricityTariff || ''}
                          onChange={(e) =>
                            setConsumption({ electricityTariff: Number(e.target.value) || 0 })
                          }
                          className='pr-16'
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                          Rp/kWh
                        </span>
                      </div>
                    )}
                  </div>
                  {consumption.electricityTariffAuto && (
                    <p className='text-xs text-muted-foreground'>
                      {t('tariffs.autoDescription')}
                    </p>
                  )}
                </div>

                {/* Feed-in Tariff */}
                <div className='space-y-2'>
                  <Label htmlFor='feedInTariff'>{t('tariffs.feedInTariff')}</Label>
                  <div className='flex gap-2'>
                    <Select
                      value={consumption.feedInTariffAuto ? 'auto' : 'manual'}
                      onValueChange={(value) =>
                        setConsumption({ feedInTariffAuto: value === 'auto' })
                      }
                    >
                      <SelectTrigger className='w-[120px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='auto'>{t('tariffs.auto')}</SelectItem>
                        <SelectItem value='manual'>{t('tariffs.manual')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {!consumption.feedInTariffAuto && (
                      <div className='relative flex-1'>
                        <Input
                          id='feedInTariff'
                          type='number'
                          step='0.01'
                          placeholder='12'
                          value={consumption.feedInTariff || ''}
                          onChange={(e) =>
                            setConsumption({ feedInTariff: Number(e.target.value) || 0 })
                          }
                          className='pr-16'
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                          Rp/kWh
                        </span>
                      </div>
                    )}
                  </div>
                  {consumption.feedInTariffAuto && (
                    <p className='text-xs text-muted-foreground'>
                      {t('tariffs.feedInAutoDescription')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reports */}
          {hasProductionData && (
            <div className='space-y-6'>
              {/* Energy Flow Diagram */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Sun className='w-5 h-5 text-primary' />
                    {t('reports.energyFlow.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    {/* Energy Flow Visualization */}
                    <div className='relative bg-muted/30 rounded-lg p-6'>
                      {/* Sun Icon */}
                      <div className='absolute top-4 right-4'>
                        <Sun className='w-12 h-12 text-yellow-500' />
                      </div>

                      {/* Production Box */}
                      <div className='flex flex-col items-center mb-4'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='bg-orange-100 border-2 border-orange-400 rounded-lg p-4 text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.production')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-xl font-bold text-orange-600'>
                                {formatSwissNumber(calculations.production)} kWh
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.productionTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Arrow Down */}
                      <div className='flex justify-center mb-4'>
                        <ArrowDown className='w-6 h-6 text-orange-500' />
                      </div>

                      {/* Middle Row - Self Consumption */}
                      <div className='grid grid-cols-3 gap-4 items-center mb-4'>
                        {/* Consumption Box (Left) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='bg-blue-100 border-2 border-blue-400 rounded-lg p-3 text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.consumption')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-lg font-bold text-blue-600'>
                                {formatSwissNumber(calculations.annualConsumption)} kWh
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.consumptionTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Self Consumption (Center) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='bg-green-100 border-2 border-green-500 rounded-lg p-3 text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.selfConsumption')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-lg font-bold text-green-600'>
                                {formatSwissNumber(calculations.selfConsumption)} kWh
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.selfConsumptionTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Feed-in (Right) */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='bg-amber-100 border-2 border-amber-500 rounded-lg p-3 text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.feedIn')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-lg font-bold text-amber-600'>
                                {formatSwissNumber(calculations.gridFeedIn)} kWh
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.feedInTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Bottom Stats */}
                      <div className='grid grid-cols-3 gap-4 mt-6 pt-4 border-t'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.independence')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-xl font-bold text-primary'>
                                {calculations.independence} %
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.independenceTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.gridPurchase')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-xl font-bold'>
                                {formatSwissNumber(calculations.gridPurchase)} kWh
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.gridPurchaseTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='text-center cursor-help'>
                              <p className='text-xs text-muted-foreground flex items-center gap-1 justify-center'>
                                {t('reports.energyFlow.gridFeedIn')}
                                <Info className='w-3 h-3' />
                              </p>
                              <p className='text-xl font-bold'>
                                {formatSwissNumber(calculations.gridFeedIn)} kWh
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('reports.energyFlow.gridFeedInTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* Key Figures */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <TrendingUp className='w-5 h-5 text-primary' />
                    {t('reports.keyFigures.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <div className='grid grid-cols-2 gap-4'>
                      {/* Investment */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='p-4 border-b cursor-help'>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                              {t('reports.keyFigures.investment')}
                              <Info className='w-3 h-3' />
                            </p>
                            <p className='text-xl font-bold'>
                              {formatSwissNumber(calculations.investment)} CHF
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('reports.keyFigures.investmentTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Gross Return */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='p-4 border-b cursor-help'>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                              {t('reports.keyFigures.grossReturn')}
                              <Info className='w-3 h-3' />
                            </p>
                            <p className='text-xl font-bold text-green-600'>
                              {formatSwissNumber(calculations.grossReturnOverLifetime)} CHF
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('reports.keyFigures.grossReturnTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Subsidies */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='p-4 border-b cursor-help'>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                              {t('reports.keyFigures.subsidies')}
                              <Info className='w-3 h-3' />
                            </p>
                            <p className='text-xl font-bold text-blue-600'>
                              {formatSwissNumber(calculations.totalSubsidies)} CHF
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('reports.keyFigures.subsidiesTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Annual Return Rate */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='p-4 border-b cursor-help'>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                              {t('reports.keyFigures.annualReturn')}
                              <Info className='w-3 h-3' />
                            </p>
                            <p className='text-xl font-bold text-primary'>
                              {calculations.annualReturnRate.toFixed(2)} %
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('reports.keyFigures.annualReturnTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Net Investment */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='p-4 cursor-help'>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                              {t('reports.keyFigures.netInvestment')}
                              <Info className='w-3 h-3' />
                            </p>
                            <p className='text-xl font-bold'>
                              {formatSwissNumber(calculations.netInvestment)} CHF
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('reports.keyFigures.netInvestmentTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Annual Yield */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className='p-4 cursor-help'>
                            <p className='text-sm text-muted-foreground flex items-center gap-1'>
                              {t('reports.keyFigures.annualYield')}
                              <Info className='w-3 h-3' />
                            </p>
                            <p className='text-xl font-bold text-green-600'>
                              {formatSwissNumber(calculations.annualYield)} CHF
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('reports.keyFigures.annualYieldTooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* ROI Chart */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <LineChartIcon className='w-5 h-5 text-primary' />
                    {t('reports.roiChart.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-[280px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={roiChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                        <XAxis
                          dataKey='year'
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}`}
                          label={{ value: t('reports.roiChart.years'), position: 'insideBottom', offset: -5, fontSize: 12 }}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          label={{ value: 'CHF', angle: -90, position: 'insideLeft', fontSize: 12 }}
                        />
                        <RechartsTooltip
                          formatter={(value) => [`${formatSwissNumber(Number(value) || 0)} CHF`, t('reports.roiChart.cumulative')]}
                          labelFormatter={(label) => `${t('reports.roiChart.year')} ${label}`}
                        />
                        <ReferenceLine y={0} stroke='#888' strokeDasharray='3 3' />
                        {paybackYear && paybackYear <= 25 && (
                          <ReferenceLine
                            x={paybackYear}
                            stroke='#22c55e'
                            strokeDasharray='5 5'
                            label={{ value: t('reports.roiChart.payback'), fill: '#22c55e', fontSize: 11 }}
                          />
                        )}
                        <Line
                          type='monotone'
                          dataKey='cashFlow'
                          stroke='hsl(var(--primary))'
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  {paybackYear && (
                    <p className='text-sm text-center text-muted-foreground mt-2'>
                      {t('reports.roiChart.paybackInfo', { years: paybackYear })}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Analysis Chart */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Calendar className='w-5 h-5 text-primary' />
                    {t('reports.monthlyChart.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='h-[280px]'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
                        <XAxis dataKey='month' tick={{ fontSize: 11 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}`}
                          label={{ value: 'kWh', angle: -90, position: 'insideLeft', fontSize: 12 }}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => {
                            const labels: Record<string, string> = {
                              production: t('reports.monthlyChart.production'),
                              consumption: t('reports.monthlyChart.consumption'),
                              selfConsumption: t('reports.monthlyChart.selfConsumption'),
                            }
                            return [`${formatSwissNumber(Number(value) || 0)} kWh`, labels[String(name)] || String(name)]
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            const labels: Record<string, string> = {
                              production: t('reports.monthlyChart.production'),
                              consumption: t('reports.monthlyChart.consumption'),
                              selfConsumption: t('reports.monthlyChart.selfConsumption'),
                            }
                            return labels[value] || value
                          }}
                        />
                        <Bar dataKey='production' fill='#f97316' name='production' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='consumption' fill='#3b82f6' name='consumption' radius={[2, 2, 0, 0]} />
                        <Bar dataKey='selfConsumption' fill='#22c55e' name='selfConsumption' radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='flex justify-center gap-6 mt-3 text-xs text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <div className='w-3 h-3 rounded-sm bg-orange-500' />
                      <span>{t('reports.monthlyChart.production')}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div className='w-3 h-3 rounded-sm bg-blue-500' />
                      <span>{t('reports.monthlyChart.consumption')}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div className='w-3 h-3 rounded-sm bg-green-500' />
                      <span>{t('reports.monthlyChart.selfConsumption')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className='flex gap-4 mt-8'>
          <Button variant='outline' onClick={() => goToStep(3)} className='gap-2'>
            <ChevronLeft className='w-4 h-4' />
            {t('back')}
          </Button>
          <Button onClick={nextStep} className='flex-1 gap-2'>
            {t('continue')}
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
