'use client'

import { useEffect, useState } from 'react'
import {
  Sun,
  Leaf,
  TrendingUp,
  PiggyBank,
  Calendar,
  Download,
  Share2,
  FileText,
  Check,
  ArrowRight,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCalculatorStore } from '@/stores/calculator.store'
import { reportService } from '@/services/report.service'

export default function Step4Results() {
  const {
    address,
    latitude,
    longitude,
    postalCode,
    administrativeArea,
    buildingInsights,
    calculation,
    panelCount,
    panelCapacityWatts,
    annualConsumptionKwh,
    purchaseRateRp,
    feedInRateRp,
    isLoading,
    calculateSolarPotential,
  } = useCalculatorStore()

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [reportLanguage, setReportLanguage] = useState<'de' | 'fr' | 'it' | 'en'>('de')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)

  // Calculate on mount if needed
  useEffect(() => {
    if (!calculation && !isLoading) {
      calculateSolarPotential()
    }
  }, [calculation, isLoading, calculateSolarPotential])

  const formatNumber = (num: number) => num.toLocaleString('de-CH', { maximumFractionDigits: 0 })
  const formatCurrency = (num: number) =>
    num.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 })

  // Use calculation results or fallback to estimates
  const results = calculation || {
    panelCount,
    systemCapacityKw: (panelCount * panelCapacityWatts) / 1000,
    roofAreaM2: buildingInsights?.solarPotential.wholeRoofStats.areaMeters2 || 0,
    yearlyProductionKwh: 0,
    monthlyProductionKwh: [],
    estimatedSystemCostChf: 0,
    estimatedSubsidiesChf: 0,
    netCostChf: 0,
    yearlyElectricitySavingsChf: 0,
    yearlyFeedInRevenueChf: 0,
    totalYearlySavingsChf: 0,
    paybackYears: 0,
    yearlyCo2OffsetKg: 0,
    selfConsumptionPercent: 30,
    gridFeedInPercent: 70,
  }

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

  // Calculate 25-year savings
  const savings25Years = results.totalYearlySavingsChf * 25

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='w-16 h-16 rounded-full border-4 border-solar/20 border-t-solar animate-spin mx-auto mb-4' />
          <p className='text-lg font-medium'>Calculating your solar potential...</p>
          <p className='text-sm text-muted-foreground'>This may take a moment</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Hero Summary */}
      <Card className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-solar/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <CardContent className='p-8 relative z-10'>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center md:text-left'>
              <p className='text-primary-foreground/70 mb-1'>System Size</p>
              <p className='text-4xl font-bold'>
                {results.systemCapacityKw.toFixed(1)} <span className='text-xl'>kWp</span>
              </p>
              <p className='text-sm text-primary-foreground/70 mt-1'>
                {results.panelCount} panels
              </p>
            </div>
            <div className='text-center'>
              <p className='text-primary-foreground/70 mb-1'>Annual Production</p>
              <p className='text-4xl font-bold text-solar'>
                {formatNumber(results.yearlyProductionKwh)}{' '}
                <span className='text-xl'>kWh</span>
              </p>
              <p className='text-sm text-primary-foreground/70 mt-1'>Clean energy per year</p>
            </div>
            <div className='text-center md:text-right'>
              <p className='text-primary-foreground/70 mb-1'>25-Year Savings</p>
              <p className='text-4xl font-bold text-energy'>
                {formatCurrency(savings25Years)}
              </p>
              <p className='text-sm text-primary-foreground/70 mt-1'>Total estimated savings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Financial Details */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PiggyBank className='w-5 h-5 text-solar' />
              Financial Analysis
            </CardTitle>
            <CardDescription>Investment and savings breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-6'>
              {/* Investment */}
              <div className='space-y-4'>
                <h4 className='font-medium text-muted-foreground'>Investment</h4>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>System Cost</span>
                    <span className='font-medium'>
                      {formatCurrency(results.estimatedSystemCostChf)}
                    </span>
                  </div>
                  <div className='flex justify-between text-energy'>
                    <span>Federal Subsidies</span>
                    <span className='font-medium'>
                      -{formatCurrency(results.estimatedSubsidiesChf)}
                    </span>
                  </div>
                  <div className='border-t pt-3 flex justify-between'>
                    <span className='font-semibold'>Net Investment</span>
                    <span className='font-bold text-lg'>
                      {formatCurrency(results.netCostChf)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Annual Savings */}
              <div className='space-y-4'>
                <h4 className='font-medium text-muted-foreground'>Annual Savings</h4>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>Electricity Savings</span>
                    <span className='font-medium text-energy'>
                      {formatCurrency(results.yearlyElectricitySavingsChf)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Feed-in Revenue</span>
                    <span className='font-medium text-energy'>
                      {formatCurrency(results.yearlyFeedInRevenueChf)}
                    </span>
                  </div>
                  <div className='border-t pt-3 flex justify-between'>
                    <span className='font-semibold'>Total Annual Savings</span>
                    <span className='font-bold text-lg text-energy'>
                      {formatCurrency(results.totalYearlySavingsChf)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payback Period */}
            <div className='mt-6 p-4 rounded-xl bg-solar/10 border border-solar/20'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-6 h-6 text-solar' />
                  <div>
                    <p className='font-medium'>Payback Period</p>
                    <p className='text-sm text-muted-foreground'>
                      Time to recover your investment
                    </p>
                  </div>
                </div>
                <p className='text-3xl font-bold text-solar'>
                  {results.paybackYears.toFixed(1)} <span className='text-base'>years</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Leaf className='w-5 h-5 text-energy' />
              Environmental Impact
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='text-center p-4 rounded-xl bg-energy/10'>
              <Leaf className='w-12 h-12 text-energy mx-auto mb-2' />
              <p className='text-3xl font-bold text-energy'>
                {formatNumber(results.yearlyCo2OffsetKg)} kg
              </p>
              <p className='text-sm text-muted-foreground'>CO₂ saved per year</p>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
                <div className='text-2xl'>🌳</div>
                <div>
                  <p className='font-medium'>
                    {Math.round(results.yearlyCo2OffsetKg / 20)} trees
                  </p>
                  <p className='text-xs text-muted-foreground'>equivalent planted per year</p>
                </div>
              </div>
              <div className='flex items-center gap-3 p-3 rounded-lg bg-muted/50'>
                <div className='text-2xl'>🚗</div>
                <div>
                  <p className='font-medium'>
                    {formatNumber(Math.round(results.yearlyCo2OffsetKg / 0.12))} km
                  </p>
                  <p className='text-xs text-muted-foreground'>car travel offset per year</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Production Chart */}
      {results.monthlyProductionKwh.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-solar' />
              Monthly Production Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-48 flex items-end gap-2'>
              {results.monthlyProductionKwh.map((kwh, index) => {
                const maxKwh = Math.max(...results.monthlyProductionKwh)
                const height = (kwh / maxKwh) * 100
                return (
                  <div key={index} className='flex-1 flex flex-col items-center gap-1'>
                    <span className='text-xs text-muted-foreground'>
                      {formatNumber(kwh)}
                    </span>
                    <div
                      className='w-full bg-gradient-to-t from-solar to-energy rounded-t transition-all'
                      style={{ height: `${height}%`, minHeight: '8px' }}
                    />
                    <span className='text-xs text-muted-foreground'>{monthNames[index]}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Options */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sun className='w-5 h-5 text-solar' />
            Choose Your Package
          </CardTitle>
          <CardDescription>
            Select the best option for your needs - all with CHF 0 upfront investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Home Abo */}
            <div className='p-6 rounded-xl border-2 border-solar bg-solar/5 relative'>
              <div className='absolute -top-3 left-4 px-2 py-0.5 bg-solar text-solar-foreground text-xs font-medium rounded'>
                Most Popular
              </div>
              <h3 className='text-lg font-bold mb-2'>Home Abo</h3>
              <p className='text-3xl font-bold mb-1'>
                CHF 0 <span className='text-base font-normal'>upfront</span>
              </p>
              <p className='text-sm text-muted-foreground mb-4'>+ monthly subscription</p>
              <ul className='space-y-2 text-sm mb-6'>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Solar panels + inverter
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Monitoring app included
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  30% cheaper electricity
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  35-year contract
                </li>
              </ul>
              <Button className='w-full bg-solar hover:bg-solar/90 text-solar-foreground'>
                Select Package
              </Button>
            </div>

            {/* Home Abo + Battery */}
            <div className='p-6 rounded-xl border-2 border-border hover:border-energy/50 transition-colors'>
              <h3 className='text-lg font-bold mb-2'>Home Abo + Battery</h3>
              <p className='text-3xl font-bold mb-1'>
                CHF 1,500 <span className='text-base font-normal'>one-time</span>
              </p>
              <p className='text-sm text-muted-foreground mb-4'>+ higher monthly rate</p>
              <ul className='space-y-2 text-sm mb-6'>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Everything in Home Abo
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Battery storage included
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  70%+ self-consumption
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Blackout protection
                </li>
              </ul>
              <Button variant='outline' className='w-full'>
                Select Package
              </Button>
            </div>

            {/* Direct Purchase */}
            <div className='p-6 rounded-xl border-2 border-border hover:border-energy/50 transition-colors'>
              <h3 className='text-lg font-bold mb-2'>Direct Purchase</h3>
              <p className='text-3xl font-bold mb-1'>
                {formatCurrency(results.netCostChf)}
              </p>
              <p className='text-sm text-muted-foreground mb-4'>after subsidies</p>
              <ul className='space-y-2 text-sm mb-6'>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Own your system outright
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  25-year warranty
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  All savings are yours
                </li>
                <li className='flex items-center gap-2'>
                  <Check className='w-4 h-4 text-energy' />
                  Increases property value
                </li>
              </ul>
              <Button variant='outline' className='w-full'>
                Select Package
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-center'>
        <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
          <DialogTrigger asChild>
            <Button variant='outline' className='gap-2'>
              <Download className='w-4 h-4' />
              Download Report
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Download Solar Report</DialogTitle>
              <DialogDescription>
                Get a professional PDF report with your solar analysis
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='report-language'>Report Language</Label>
                <Select
                  value={reportLanguage}
                  onValueChange={(value) => setReportLanguage(value as typeof reportLanguage)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='de'>🇩🇪 Deutsch</SelectItem>
                    <SelectItem value='fr'>🇫🇷 Français</SelectItem>
                    <SelectItem value='it'>🇮🇹 Italiano</SelectItem>
                    <SelectItem value='en'>🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='customer-name'>Your Name (optional)</Label>
                <Input
                  id='customer-name'
                  placeholder='Max Muster'
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='customer-email'>Your Email (optional)</Label>
                <Input
                  id='customer-email'
                  type='email'
                  placeholder='max@example.com'
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              {downloadError && (
                <p className='text-sm text-destructive'>{downloadError}</p>
              )}
            </div>
            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setShowDownloadDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleDownloadReport}
                disabled={isDownloading || !latitude || !longitude}
                className='gap-2 bg-solar hover:bg-solar/90 text-solar-foreground'
              >
                {isDownloading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className='w-4 h-4' />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant='outline' className='gap-2' onClick={handleShare}>
          <Share2 className='w-4 h-4' />
          Share Results
        </Button>
        <Button className='gap-2 bg-energy hover:bg-energy/90 text-energy-foreground'>
          <FileText className='w-4 h-4' />
          Request Official Quote
          <ArrowRight className='w-4 h-4' />
        </Button>
      </div>
    </div>
  )

  // Download report handler
  async function handleDownloadReport() {
    if (!latitude || !longitude) return

    setIsDownloading(true)
    setDownloadError(null)

    try {
      await reportService.downloadSolarReport({
        latitude,
        longitude,
        address,
        postalCode,
        administrativeArea,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        panelCount,
        panelCapacityWatts,
        annualConsumptionKwh,
        purchaseRateRp,
        feedInRateRp,
        language: reportLanguage,
      })
      setShowDownloadDialog(false)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download report')
    } finally {
      setIsDownloading(false)
    }
  }

  // Share handler
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'My Solar Analysis - Free State AG',
        text: `Check out my solar potential: ${results.systemCapacityKw.toFixed(1)} kWp system producing ${formatNumber(results.yearlyProductionKwh)} kWh/year!`,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
}

