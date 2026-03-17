'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Zap,
  TrendingUp,
  Sun,
  Leaf,
  PanelTop,
  BarChart3,
  Mail,
  FileSearch,
  FileSignature,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export default function StepResults() {
  const t = useTranslations('solarAboCalculator.results')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const store = useSolarAboCalculatorStore()

  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [offerRequesting, setOfferRequesting] = useState(false)
  const [offerRequested, setOfferRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const annualProduction = store.getAnnualProduction()
  const annualSavings = store.getAnnualSavings()
  const selfConsumptionRate = store.getSelfConsumptionRate()
  const co2Savings = store.getCo2Savings()
  const systemSizeKwp = store.getSystemSizeKwp()
  const panelCount = store.getEstimatedPanelCount()
  const selectedArea = store.getSelectedArea()
  const monthlyProduction = store.getMonthlyProduction()

  const chartData = MONTH_KEYS.map((key, i) => ({
    name: t(`months.${key}`),
    kWh: Math.round(monthlyProduction[i]),
  }))

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

  return (
    <div>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-4xl'>
        <h1 className='text-2xl font-bold'>{t('title')}</h1>
        <p className='mt-2 text-muted-foreground'>{t('subtitle')}</p>

        <div className='mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6 text-center'>
              <Zap className='mx-auto h-8 w-8 text-yellow-500' />
              <p className='mt-2 text-2xl font-bold'>
                {Math.round(annualProduction).toLocaleString('de-CH')}
              </p>
              <p className='text-sm text-muted-foreground'>{t('metrics.production')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6 text-center'>
              <TrendingUp className='mx-auto h-8 w-8 text-green-500' />
              <p className='mt-2 text-2xl font-bold'>
                CHF {Math.round(annualSavings).toLocaleString('de-CH')}
              </p>
              <p className='text-sm text-muted-foreground'>{t('metrics.savings')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6 text-center'>
              <Sun className='mx-auto h-8 w-8 text-orange-500' />
              <p className='mt-2 text-2xl font-bold'>
                {Math.round(selfConsumptionRate * 100)}%
              </p>
              <p className='text-sm text-muted-foreground'>{t('metrics.selfSufficiency')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6 text-center'>
              <Leaf className='mx-auto h-8 w-8 text-emerald-500' />
              <p className='mt-2 text-2xl font-bold'>
                {Math.round(co2Savings).toLocaleString('de-CH')}
              </p>
              <p className='text-sm text-muted-foreground'>{t('metrics.co2')}</p>
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

        <Card className='mt-8'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 mb-4'>
              <PanelTop className='h-5 w-5 text-primary' />
              <h2 className='text-lg font-semibold'>{t('system.title')}</h2>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('system.size')}</p>
                <p className='font-semibold'>{systemSizeKwp.toFixed(1)} kWp</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('system.panels')}</p>
                <p className='font-semibold'>~{panelCount}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('system.area')}</p>
                <p className='font-semibold'>{Math.round(selectedArea)} m²</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('system.consumption')}</p>
                <p className='font-semibold'>
                  {store.getEstimatedConsumption().toLocaleString('de-CH')} kWh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='mt-8 border-primary/20 bg-primary/5'>
          <CardContent className='pt-6'>
            <h2 className='text-lg font-semibold'>{t('abo.title')}</h2>
            <p className='mt-2 text-muted-foreground'>{t('abo.description')}</p>
            <p className='mt-2 text-muted-foreground'>
              {t('abo.savings', { amount: Math.round(annualSavings).toLocaleString('de-CH') })}
            </p>
          </CardContent>
        </Card>

        {error && (
          <div className='mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
            {error}
          </div>
        )}

        <div className='mt-10 space-y-4'>
          <Card className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className='flex items-center justify-between p-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0'>
                    <Mail className='h-6 w-6 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold'>{t('actions.downloadTitle')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('actions.downloadDescription')}</p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  onClick={handleEmailReport}
                  disabled={emailSending || emailSent}
                  style={{ borderColor: '#062E25', color: '#062E25' }}
                  className='shrink-0'
                >
                  {emailSending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {emailSent && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
                  {emailSent ? t('actions.emailSent') : t('actions.downloadButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className='flex items-center justify-between p-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center shrink-0'>
                    <FileSearch className='h-6 w-6 text-amber-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold'>{t('actions.offerTitle')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('actions.offerDescription')}</p>
                  </div>
                </div>
                <Button
                  variant='outline'
                  onClick={handleRequestOffer}
                  disabled={offerRequesting || offerRequested}
                  style={{ borderColor: '#062E25', color: '#062E25' }}
                  className='shrink-0'
                >
                  {offerRequesting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {offerRequested && <CheckCircle2 className='mr-2 h-4 w-4 text-green-600' />}
                  {offerRequested ? t('actions.offerSent') : t('actions.offerButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-[#062E25]/30'>
            <CardContent className='p-0'>
              <div className='flex items-center justify-between p-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-[#062E25]/10 rounded-lg flex items-center justify-center shrink-0'>
                    <FileSignature className='h-6 w-6 text-[#062E25]' />
                  </div>
                  <div>
                    <h3 className='font-semibold'>{t('actions.contractTitle')}</h3>
                    <p className='text-sm text-muted-foreground'>{t('actions.contractDescription')}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSignContract}
                  className='bg-[#062E25] text-white hover:bg-[#062E25]/90 shrink-0'
                >
                  {t('actions.contractButton')}
                </Button>
              </div>
            </CardContent>
          </Card>
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
