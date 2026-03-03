'use client'

import { useTranslations } from 'next-intl'
import { Zap, TrendingUp, Sun, Leaf, PanelTop, Ruler, BarChart3, Home, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

export default function StepResults() {
  const t = useTranslations('solarAboCalculator.results')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const store = useSolarAboCalculatorStore()

  const annualProduction = store.getAnnualProduction()
  const annualSavings = store.getAnnualSavings()
  const selfConsumptionRate = store.getSelfConsumptionRate()
  const co2Savings = store.getCo2Savings()
  const systemSizeKwp = store.getSystemSizeKwp()
  const panelCount = store.getEstimatedPanelCount()
  const selectedArea = store.getSelectedArea()
  const monthlyProduction = store.getMonthlyProduction()
  const recommendedPackage = store.getRecommendedPackage()

  const chartData = MONTH_KEYS.map((key, i) => ({
    name: t(`months.${key}`),
    kWh: Math.round(monthlyProduction[i]),
  }))

  return (
    <div className='h-full overflow-y-auto'>
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

        <Card className='mt-8'>
          <CardContent className='pt-6'>
            <h2 className='text-lg font-semibold mb-4'>{t('package.title')}</h2>
            <div className='grid grid-cols-2 gap-4'>
              <Card
                className={`cursor-default ${recommendedPackage === 'home' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                <CardContent className='pt-6 text-center'>
                  <Home className='mx-auto h-8 w-8 text-primary' />
                  <p className='mt-2 font-semibold'>{t('package.home')}</p>
                  <p className='text-sm text-muted-foreground'>{t('package.homeDesc')}</p>
                  {recommendedPackage === 'home' && (
                    <span className='mt-2 inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full'>
                      {t('package.recommended')}
                    </span>
                  )}
                </CardContent>
              </Card>
              <Card
                className={`cursor-default ${recommendedPackage === 'multi' ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                <CardContent className='pt-6 text-center'>
                  <Building2 className='mx-auto h-8 w-8 text-primary' />
                  <p className='mt-2 font-semibold'>{t('package.multi')}</p>
                  <p className='text-sm text-muted-foreground'>{t('package.multiDesc')}</p>
                  {recommendedPackage === 'multi' && (
                    <span className='mt-2 inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full'>
                      {t('package.recommended')}
                    </span>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className='mt-8 flex gap-4 justify-end'>
          <Button variant='outline' onClick={store.prevStep}>
            {tNav('back')}
          </Button>
          <Button onClick={store.nextStep}>
            {t('cta')}
          </Button>
        </div>
      </div>
    </div>
  )
}
