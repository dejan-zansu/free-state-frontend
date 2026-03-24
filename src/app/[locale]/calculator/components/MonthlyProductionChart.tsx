'use client'

import { BarChart3 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

import { Card, CardContent } from '@/components/ui/card'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

interface MonthlyProductionChartProps {
  monthlyProduction: number[]
}

export default function MonthlyProductionChart({ monthlyProduction }: MonthlyProductionChartProps) {
  const t = useTranslations('solarAboCalculator.results')

  const chartData = MONTH_KEYS.map((key, i) => ({
    name: t(`months.${key}`),
    kWh: Math.round(monthlyProduction[i]),
  }))

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex items-center gap-2 mb-4'>
          <BarChart3 className='h-5 w-5 text-primary' />
          <h2 className='text-lg font-semibold'>{t('chart.title')}</h2>
        </div>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData}>
              <XAxis dataKey='name' tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }} />
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
  )
}
