'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import {
  Zap,
  TrendingUp,
  Sun,
  Leaf,
  PanelTop,
  BarChart3,
  Loader2,
  CheckCircle2,
  Check,
  Package,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { residentialCalculatorService, type CalculatorPackage } from '@/services/residential-calculator.service'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

function getPanelSpecs(pkg: CalculatorPackage) {
  const panel = pkg.equipment.find(e => e.equipmentType === 'SOLAR_PANEL')
  return {
    panelWattageW: panel?.panelWattageW ?? null,
    panelAreaM2: panel?.panelAreaM2 ?? null,
  }
}

function selectPackageFromData(
  setFn: (id: string, code: string, pricePerKwp: number | null, panelWattageW?: number | null, panelAreaM2?: number | null) => void,
  pkg: CalculatorPackage
) {
  const { panelWattageW, panelAreaM2 } = getPanelSpecs(pkg)
  setFn(pkg.id, pkg.code, pkg.pricePerKwp, panelWattageW, panelAreaM2)
}

export default function StepResults() {
  const t = useTranslations('solarAboCalculator.results')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const locale = useLocale()
  const store = useSolarAboCalculatorStore()

  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [offerRequesting, setOfferRequesting] = useState(false)
  const [offerRequested, setOfferRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)

  const annualProduction = store.getAnnualProduction()
  const annualSavings = store.getAnnualSavings()
  const selfConsumptionRate = store.getSelfConsumptionRate()
  const co2Savings = store.getCo2Savings()
  const systemSizeKwp = store.getSystemSizeKwp()
  const panelCount = store.getEstimatedPanelCount()
  const selectedArea = store.getSelectedArea()
  const monthlyProduction = store.getMonthlyProduction()
  const estimatedConsumption = store.getEstimatedConsumption()
  const grossAmount = store.getGrossAmount()
  const subsidyAmount = store.getSubsidyAmount()
  const netAmount = store.getNetAmount()
  const energyBalance = estimatedConsumption > 0
    ? Math.round((annualProduction / estimatedConsumption) * 100)
    : 0

  const chartData = MONTH_KEYS.map((key, i) => ({
    name: t(`months.${key}`),
    kWh: Math.round(monthlyProduction[i]),
  }))

  useEffect(() => {
    residentialCalculatorService.getPackages(locale)
      .then((data) => {
        const filtered = data.filter((pkg) => {
          if (pkg.minCapacityKwp != null && systemSizeKwp < pkg.minCapacityKwp) return false
          if (pkg.maxCapacityKwp != null && systemSizeKwp > pkg.maxCapacityKwp) return false
          return true
        })
        setPackages(filtered)
        if (filtered.length > 0 && !store.selectedPackageId) {
          const recommended = filtered.find(
            (p) => p.code.toLowerCase() === store.getRecommendedPackage()
          ) || filtered[0]
          selectPackageFromData(store.setSelectedPackage, recommended)
        }
      })
      .catch(() => {})
      .finally(() => setPackagesLoading(false))
  }, [locale])

  const handleEmailReport = async () => {
    setEmailSending(true)
    setError(null)
    try {
      await store.emailReport()
      setEmailSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setEmailSending(false)
    }
  }

  const handleRequestOffer = async () => {
    setOfferRequesting(true)
    setError(null)
    try {
      await store.requestOffer()
      setOfferRequested(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to request offer')
    } finally {
      setOfferRequesting(false)
    }
  }

  const handleSignContract = () => {
    store.setResultsPath('contract')
    store.nextStep()
  }

  const selectedPkg = packages.find(p => p.id === store.selectedPackageId)

  return (
    <div>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-4xl'>
        <h1 className='text-2xl font-bold'>{t('title')}</h1>
        <p className='mt-2 text-muted-foreground'>{t('subtitle')}</p>

        <div className='mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3'>
          <Card>
            <CardContent className='pt-5 pb-4 text-center'>
              <Zap className='mx-auto h-6 w-6 text-yellow-500' />
              <p className='mt-1.5 text-xl font-bold'>
                {Math.round(annualProduction).toLocaleString('de-CH')}
              </p>
              <p className='text-xs text-muted-foreground'>{t('metrics.production')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-5 pb-4 text-center'>
              <TrendingUp className='mx-auto h-6 w-6 text-green-500' />
              <p className='mt-1.5 text-xl font-bold'>
                CHF {Math.round(annualSavings).toLocaleString('de-CH')}
              </p>
              <p className='text-xs text-muted-foreground'>{t('metrics.savings')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-5 pb-4 text-center'>
              <Sun className='mx-auto h-6 w-6 text-orange-500' />
              <p className='mt-1.5 text-xl font-bold'>
                {Math.round(selfConsumptionRate * 100)}%
              </p>
              <p className='text-xs text-muted-foreground'>{t('metrics.selfSufficiency')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-5 pb-4 text-center'>
              <Leaf className='mx-auto h-6 w-6 text-emerald-500' />
              <p className='mt-1.5 text-xl font-bold'>
                {Math.round(co2Savings).toLocaleString('de-CH')}
              </p>
              <p className='text-xs text-muted-foreground'>{t('metrics.co2')}</p>
            </CardContent>
          </Card>
        </div>

        <div className='mt-6 rounded-2xl overflow-hidden border border-[#062E25]/10'>
          {store.roofImage ? (
            <Image
              src={store.roofImage}
              alt={t('system.title')}
              width={1200}
              height={600}
              className='w-full h-auto object-cover'
            />
          ) : (
            <div className='aspect-[5/2] bg-[#F5F7EE] flex items-center justify-center'>
              <PanelTop className='h-16 w-16 text-[#062E25]/15' />
            </div>
          )}
          <div className='flex items-center justify-between px-4 py-2 bg-[#062E25]/5'>
            {store.address && (
              <span className='text-xs text-[#062E25]/60'>{store.address}</span>
            )}
            <span className='text-sm font-semibold text-[#062E25]'>{energyBalance}% {t('metrics.energyBalanceDesc')}</span>
          </div>
        </div>

        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center gap-2 mb-4'>
                <PanelTop className='h-5 w-5 text-primary' />
                <h2 className='text-lg font-semibold'>{t('system.title')}</h2>
              </div>
              <div className='space-y-3'>
                <div className='flex justify-between items-center py-2 border-b border-[#062E25]/5'>
                  <span className='text-sm text-muted-foreground'>{t('system.panels')}</span>
                  <span className='font-semibold'>
                    {panelCount} × {store.selectedPanelWattageW || 460}W
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-[#062E25]/5'>
                  <span className='text-sm text-muted-foreground'>{t('system.size')}</span>
                  <span className='font-semibold'>{systemSizeKwp.toFixed(1)} kWp</span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-[#062E25]/5'>
                  <span className='text-sm text-muted-foreground'>{t('system.area')}</span>
                  <span className='font-semibold'>{Math.round(selectedArea)} m²</span>
                </div>
                <div className='flex justify-between items-center py-2'>
                  <span className='text-sm text-muted-foreground'>{t('system.consumption')}</span>
                  <span className='font-semibold'>
                    {estimatedConsumption.toLocaleString('de-CH')} kWh
                  </span>
                </div>
              </div>

              {selectedPkg && selectedPkg.equipment.filter(e => e.name).length > 0 && (
                <div className='mt-5 pt-4 border-t'>
                  <p className='text-sm font-medium mb-2'>{t('packages.equipment')}</p>
                  <ul className='space-y-1.5'>
                    {selectedPkg.equipment.filter(e => e.name).map((eq, i) => (
                      <li key={i} className='text-sm text-muted-foreground flex items-center gap-2'>
                        <Check className='h-3.5 w-3.5 text-primary shrink-0' />
                        {eq.quantity > 1 && <span>{eq.quantity} ×</span>}
                        {eq.name}
                        {eq.isOptional && (
                          <span className='text-xs text-muted-foreground/60'>({t('packages.optional')})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <h2 className='text-lg font-semibold mb-4'>{t('pricing.title')}</h2>
              <div className='space-y-3'>
                <div className='flex justify-between items-center py-2 border-b border-[#062E25]/5'>
                  <span className='text-sm text-muted-foreground'>{t('pricing.gross')}</span>
                  <span className='font-semibold'>
                    CHF {Math.round(grossAmount).toLocaleString('de-CH')}
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-[#062E25]/5'>
                  <span className='text-sm text-muted-foreground'>{t('pricing.subsidy')}</span>
                  <span className='font-semibold text-green-600'>
                    - CHF {Math.round(subsidyAmount).toLocaleString('de-CH')}
                  </span>
                </div>
                <div className='flex justify-between items-center py-3 bg-[#F5F7EE] rounded-lg px-3 -mx-3'>
                  <span className='font-semibold'>{t('pricing.net')}</span>
                  <span className='text-xl font-bold text-[#062E25]'>
                    CHF {Math.round(netAmount).toLocaleString('de-CH')}
                  </span>
                </div>
              </div>

              <div className='mt-5 pt-4 border-t space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>{t('pricing.annualSavings')}</span>
                  <span className='font-semibold'>
                    CHF {Math.round(annualSavings).toLocaleString('de-CH')}
                  </span>
                </div>
                {selectedPkg?.contractTermYears && (
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>{t('pricing.totalSavings')}</span>
                    <span className='font-semibold text-green-600'>
                      CHF {Math.round(annualSavings * selectedPkg.contractTermYears).toLocaleString('de-CH')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mt-8'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 mb-4'>
              <BarChart3 className='h-5 w-5 text-primary' />
              <h2 className='text-lg font-semibold'>{t('chart.title')}</h2>
            </div>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData}>
                  <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value} kWh`, t('chart.tooltipLabel')]}
                  />
                  <Bar dataKey='kWh' radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index >= 4 && index <= 8 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {!packagesLoading && packages.length > 0 && (
          <div className='mt-8'>
            <div className='flex items-center gap-2 mb-4'>
              <Package className='h-5 w-5 text-primary' />
              <h2 className='text-lg font-semibold'>{t('packages.title')}</h2>
            </div>
            <p className='text-sm text-muted-foreground mb-4'>{t('packages.subtitle')}</p>
            <div className='grid gap-4 md:grid-cols-2'>
              {packages.map((pkg) => {
                const isSelected = store.selectedPackageId === pkg.id
                const totalEstimate = pkg.pricePerKwp
                  ? Math.round(pkg.pricePerKwp * systemSizeKwp)
                  : null
                return (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40'}`}
                    onClick={() => selectPackageFromData(store.setSelectedPackage, pkg)}
                  >
                    <CardContent className='pt-6'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h3 className='font-semibold text-base'>{pkg.name}</h3>
                          {pkg.highlightedFeature && (
                            <span className='inline-block mt-1 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full'>
                              {pkg.highlightedFeature}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className='w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0'>
                            <Check className='h-4 w-4 text-white' />
                          </div>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mt-2'>{pkg.description}</p>
                      {pkg.pricePerKwp && (
                        <div className='mt-3'>
                          <p className='text-sm font-medium'>
                            {t('packages.pricePerKwp', { price: pkg.pricePerKwp.toLocaleString('de-CH') })}
                          </p>
                          {totalEstimate && (
                            <p className='text-xs text-muted-foreground'>
                              {t('packages.totalEstimate', { total: totalEstimate.toLocaleString('de-CH') })}
                            </p>
                          )}
                        </div>
                      )}
                      {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                        <div className='mt-3 border-t pt-3'>
                          <ul className='space-y-1'>
                            {(pkg.features as string[]).map((feature, i) => (
                              <li key={i} className='text-xs text-muted-foreground flex items-center gap-1'>
                                <Check className='h-3 w-3 text-primary shrink-0' />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {error && (
          <div className='mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
            {error}
          </div>
        )}

        <div className='mt-10 space-y-3'>
          <div className='rounded-2xl border border-[#062E25]/15 bg-white/80 p-5 backdrop-blur-sm'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <h3 className='text-base font-semibold text-[#062E25]'>{t('actions.downloadTitle')}</h3>
                <p className='mt-1 text-sm text-[#062E25]/65'>{t('actions.downloadDescription')}</p>
              </div>
              <Button
                variant='outline'
                onClick={handleEmailReport}
                disabled={emailSending || emailSent}
                style={{ borderColor: '#062E25', color: '#062E25' }}
                className='w-full sm:w-auto shrink-0'
              >
                {emailSending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {emailSent && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
                {emailSent ? t('actions.emailSent') : t('actions.downloadButton')}
              </Button>
            </div>
          </div>

          <div className='rounded-2xl border border-[#062E25]/15 bg-white/80 p-5 backdrop-blur-sm'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <h3 className='text-base font-semibold text-[#062E25]'>{t('actions.offerTitle')}</h3>
                <p className='mt-1 text-sm text-[#062E25]/65'>{t('actions.offerDescription')}</p>
              </div>
              <Button
                variant='outline'
                onClick={handleRequestOffer}
                disabled={offerRequesting || offerRequested}
                style={{ borderColor: '#062E25', color: '#062E25' }}
                className='w-full sm:w-auto shrink-0'
              >
                {offerRequesting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {offerRequested && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
                {offerRequested ? t('actions.offerSent') : t('actions.offerButton')}
              </Button>
            </div>
          </div>

          <div className='rounded-2xl border border-[#062E25]/30 bg-[#F5F7EE] p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <h3 className='text-base font-semibold text-[#062E25]'>{t('actions.contractTitle')}</h3>
                <p className='mt-1 text-sm text-[#062E25]/65'>{t('actions.contractDescription')}</p>
              </div>
              <Button
                onClick={handleSignContract}
                className='w-full sm:w-auto shrink-0 bg-[#062E25] text-white hover:bg-[#062E25]/90'
              >
                {t('actions.contractButton')}
              </Button>
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4' style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}>
          <Button variant='outline' onClick={store.prevStep} style={{ borderColor: "#062E25", color: "#062E25" }}>
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
