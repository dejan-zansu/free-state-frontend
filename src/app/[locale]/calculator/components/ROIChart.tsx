'use client'

import { useTranslations } from 'next-intl'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'

interface ROIChartProps {
  netInvestment: number
  annualSavings: number
  contractTermYears: number
}

export default function ROIChart({
  netInvestment,
  annualSavings,
  contractTermYears,
}: ROIChartProps) {
  const t = useTranslations('solarAboCalculator.results.roi')

  const years = Math.min(contractTermYears, 35)
  const data: { year: number; cashflow: number }[] = []

  let cumulative = -netInvestment
  for (let y = 0; y <= years; y++) {
    if (y === 0) {
      data.push({ year: y, cashflow: Math.round(cumulative) })
    } else {
      cumulative += annualSavings
      data.push({ year: y, cashflow: Math.round(cumulative) })
    }
  }

  const paybackYear = data.find(d => d.cashflow >= 0)?.year
  const totalProfit = Math.round(cumulative)

  return (
    <div className="rounded-xl bg-white/60 border border-[#062E25]/8 p-6">
      <h3 className="text-base font-semibold text-[#062E25] mb-1">{t('title')}</h3>
      <div className="flex gap-6 mb-4">
        {paybackYear && (
          <p className="text-sm text-[#062E25]/50">
            {t('payback', { years: paybackYear })}
          </p>
        )}
        <p className="text-sm text-[#062E25]/50">
          {t('totalProfit', { amount: totalProfit.toLocaleString('de-CH') })}
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="year"
              tick={{ fontSize: 14, fill: '#062E25' }}
              tickLine={false}
              axisLine={false}
              label={{ value: t('years'), position: 'insideBottom', offset: -5, fontSize: 14, fill: '#062E2566' }}
            />
            <YAxis
              tick={{ fontSize: 14, fill: '#062E2566' }}
              tickLine={false}
              axisLine={false}
              width={70}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #062E2515',
                fontSize: '14px',
              }}
              formatter={(value) => [
                `CHF ${Number(value).toLocaleString('de-CH')}`,
                t('cashflow'),
              ]}
              labelFormatter={(year) => `${t('year')} ${year}`}
            />
            <ReferenceLine y={0} stroke="#062E25" strokeWidth={1} strokeOpacity={0.2} />
            <Bar dataKey="cashflow" radius={[2, 2, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={entry.cashflow >= 0 ? '#22C55E' : '#062E25'}
                  fillOpacity={entry.cashflow >= 0 ? 0.7 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
