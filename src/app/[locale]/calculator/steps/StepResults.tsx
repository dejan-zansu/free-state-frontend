'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, CheckCircle2, Check } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  const taxSavings = store.getEstimatedTaxSavings()
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
      <div className='container mx-auto px-4 pt-8 pb-24 max-w-3xl'>

        <h1 className='text-2xl sm:text-3xl font-medium text-[#062E25]'>{t('title')}</h1>
        <p className='mt-2 text-[#062E25]/60 text-sm'>{t('subtitle')}</p>

        {!packagesLoading && packages.length > 0 && (
          <div className='mt-8'>
            <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-3'>{t('packages.title')}</p>
            <div className='flex gap-3'>
              {packages.map((pkg) => {
                const isSelected = store.selectedPackageId === pkg.id
                return (
                  <button
                    key={pkg.id}
                    type='button'
                    onClick={() => selectPackageFromData(store.setSelectedPackage, pkg)}
                    className={cn(
                      'flex-1 rounded-xl border-2 px-4 py-4 text-left transition-all',
                      isSelected
                        ? 'border-[#062E25] bg-[#062E25]/[0.03]'
                        : 'border-[#062E25]/10 hover:border-[#062E25]/30'
                    )}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-semibold text-[#062E25]'>{pkg.name}</span>
                      {isSelected && (
                        <div className='w-5 h-5 rounded-full bg-[#062E25] flex items-center justify-center'>
                          <Check className='h-3 w-3 text-white' />
                        </div>
                      )}
                    </div>
                    {pkg.highlightedFeature && (
                      <span className='inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 bg-[#B7FE1A]/30 text-[#062E25] rounded-full'>
                        {pkg.highlightedFeature}
                      </span>
                    )}
                    {pkg.description && (
                      <p className='mt-2 text-xs text-[#062E25]/50'>{pkg.description}</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {store.roofImage && (
          <div className='mt-8 rounded-xl overflow-hidden'>
            <Image
              src={store.roofImage}
              alt={t('system.title')}
              width={1200}
              height={500}
              className='w-full h-auto'
            />
            {store.address && (
              <div className='px-3 py-1.5 bg-[#062E25] text-[10px] text-white/60'>
                {store.address}
              </div>
            )}
          </div>
        )}

        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-8'>

          <div>
            <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-4'>{t('system.title')}</p>
            <div className='space-y-0'>
              <Row label={t('system.panels')} value={`${panelCount} x ${store.selectedPanelWattageW || 460}W`} />
              <Row label={t('system.size')} value={`${systemSizeKwp.toFixed(1)} kWp`} />
              <Row label={t('system.area')} value={`${Math.round(selectedArea)} m²`} />
              <Row label={t('system.consumption')} value={`${estimatedConsumption.toLocaleString('de-CH')} kWh`} />
            </div>

            {selectedPkg && selectedPkg.equipment.filter(e => e.name).length > 0 && (
              <div className='mt-5'>
                <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-3'>{t('packages.equipment')}</p>
                <div className='space-y-2'>
                  {selectedPkg.equipment.filter(e => e.name).map((eq, i) => (
                    <div key={i} className='flex items-center gap-2 text-sm text-[#062E25]/70'>
                      <span className='w-1 h-1 rounded-full bg-[#062E25]/30 shrink-0' />
                      {eq.quantity > 1 && <span className='text-[#062E25]/40'>{eq.quantity} x</span>}
                      <span>{eq.name}</span>
                      {eq.isOptional && (
                        <span className='text-[10px] text-[#062E25]/30'>({t('packages.optional')})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='mt-8'>
              <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-4'>{t('metrics.energyBalance')}</p>
              <div className='space-y-0'>
                <Row label={t('metrics.production')} value={`${Math.round(annualProduction).toLocaleString('de-CH')} kWh`} />
                <Row label={t('metrics.savings')} value={`CHF ${Math.round(annualSavings).toLocaleString('de-CH')}`} />
                <Row label={t('metrics.selfSufficiency')} value={`${Math.round(selfConsumptionRate * 100)}%`} />
                <Row label={t('metrics.co2')} value={`${Math.round(co2Savings).toLocaleString('de-CH')} kg`} />
                <Row label={t('metrics.energyBalanceDesc')} value={`${energyBalance}%`} bold />
              </div>
            </div>
          </div>

          <div>
            <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-4'>{t('pricing.title')}</p>

            <div className='rounded-xl bg-white/60 border border-[#062E25]/8 p-5'>
              <div className='space-y-0'>
                <Row label={t('pricing.gross')} value={`CHF ${Math.round(grossAmount).toLocaleString('de-CH')}`} />
                <Row label={t('pricing.subsidy')} value={`- CHF ${Math.round(subsidyAmount).toLocaleString('de-CH')}`} green />
              </div>

              <div className='mt-3 pt-3 border-t border-[#062E25]/8'>
                <div className='flex justify-between items-baseline'>
                  <span className='text-sm font-semibold text-[#062E25]'>{t('pricing.net')}</span>
                  <span className='text-2xl font-bold text-[#062E25] tabular-nums'>
                    CHF {Math.round(netAmount).toLocaleString('de-CH')}
                  </span>
                </div>
              </div>

              {taxSavings > 0 && (
                <div className='mt-3 pt-3 border-t border-[#062E25]/8'>
                  <Row label={t('pricing.taxSavings')} value={`- CHF ${taxSavings.toLocaleString('de-CH')}`} green />
                  <p className='text-[10px] text-[#062E25]/30 mt-1'>{t('pricing.taxSavingsNote')}</p>
                </div>
              )}
            </div>

            <div className='mt-5 rounded-xl bg-white/60 border border-[#062E25]/8 p-5'>
              <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-3'>{t('pricing.returns')}</p>
              <Row label={t('pricing.annualSavings')} value={`CHF ${Math.round(annualSavings).toLocaleString('de-CH')}`} />
              {selectedPkg?.contractTermYears && (
                <Row
                  label={t('pricing.totalSavings')}
                  value={`CHF ${Math.round(annualSavings * selectedPkg.contractTermYears).toLocaleString('de-CH')}`}
                  bold
                />
              )}
            </div>
          </div>
        </div>

        <div className='mt-8'>
          <p className='text-xs font-medium text-[#062E25]/40 uppercase tracking-wider mb-4'>{t('chart.title')}</p>
          <div className='h-52 rounded-xl bg-white/60 border border-[#062E25]/8 p-4'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={chartData}>
                <XAxis dataKey='name' tick={{ fontSize: 11, fill: '#062E25' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#062E2566' }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  formatter={(value) => [`${value} kWh`, t('chart.tooltipLabel')]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #062E2515', fontSize: '12px' }}
                />
                <Bar dataKey='kWh' radius={[3, 3, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index >= 4 && index <= 8 ? '#062E25' : '#062E2530'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {error && (
          <div className='mt-6 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg'>
            {error}
          </div>
        )}

        <div className='mt-10 space-y-3'>
          <div className='rounded-xl border border-[#062E25]/10 bg-white/60 p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm font-semibold text-[#062E25]'>{t('actions.downloadTitle')}</p>
                <p className='mt-0.5 text-xs text-[#062E25]/50'>{t('actions.downloadDescription')}</p>
              </div>
              <Button
                variant='outline'
                onClick={handleEmailReport}
                disabled={emailSending || emailSent}
                className='shrink-0 border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5'
              >
                {emailSending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {emailSent && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
                {emailSent ? t('actions.emailSent') : t('actions.downloadButton')}
              </Button>
            </div>
          </div>

          <div className='rounded-xl border border-[#062E25]/10 bg-white/60 p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm font-semibold text-[#062E25]'>{t('actions.offerTitle')}</p>
                <p className='mt-0.5 text-xs text-[#062E25]/50'>{t('actions.offerDescription')}</p>
              </div>
              <Button
                variant='outline'
                onClick={handleRequestOffer}
                disabled={offerRequesting || offerRequested}
                className='shrink-0 border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5'
              >
                {offerRequesting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {offerRequested && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
                {offerRequested ? t('actions.offerSent') : t('actions.offerButton')}
              </Button>
            </div>
          </div>

          <div className='rounded-xl border border-[#062E25]/20 bg-[#062E25] p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm font-semibold text-white'>{t('actions.contractTitle')}</p>
                <p className='mt-0.5 text-xs text-white/50'>{t('actions.contractDescription')}</p>
              </div>
              <Button
                onClick={handleSignContract}
                className='shrink-0 bg-[#B7FE1A] text-[#062E25] hover:bg-[#B7FE1A]/90 font-semibold'
              >
                {t('actions.contractButton')}
              </Button>
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4' style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}>
          <Button variant='outline' onClick={store.prevStep} style={{ borderColor: '#062E25', color: '#062E25' }}>
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
  return (
    <div className='flex justify-between items-baseline py-2 border-b border-[#062E25]/[0.04] last:border-0'>
      <span className='text-sm text-[#062E25]/50'>{label}</span>
      <span className={cn(
        'text-sm tabular-nums',
        bold ? 'font-semibold text-[#062E25]' : 'text-[#062E25]/80',
        green && 'text-green-700'
      )}>
        {value}
      </span>
    </div>
  )
}
