'use client'

import { useTranslations } from 'next-intl'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

const MONTHLY_CONSUMPTION_FACTORS = [
  0.10, 0.09, 0.09, 0.08, 0.07, 0.07, 0.07, 0.07, 0.08, 0.09, 0.09, 0.10,
]

interface MonthlyAnalysisChartProps {
  monthlyProduction: number[]
  estimatedConsumption: number
  selfConsumptionRate: number
}

export default function MonthlyAnalysisChart({
  monthlyProduction,
  estimatedConsumption,
  selfConsumptionRate,
}: MonthlyAnalysisChartProps) {
  const t = useTranslations('solarAboCalculator.results')

  const data = MONTH_KEYS.map((key, i) => {
    const production = Math.round(monthlyProduction[i])
    const consumption = Math.round(estimatedConsumption * MONTHLY_CONSUMPTION_FACTORS[i])
    const selfConsumed = Math.round(Math.min(production * selfConsumptionRate, consumption))
    return {
      name: t(`months.${key}`),
      production,
      consumption,
      selfConsumed,
    }
  })

  return (
    <div className="rounded-xl bg-white/60 border border-[#062E25]/8 p-6">
      <h3 className="text-base font-semibold text-[#062E25] mb-4">{t('monthlyAnalysis.title')}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 14, fill: '#062E25' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 14, fill: '#062E2566' }}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #062E2515',
                fontSize: '14px',
              }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  production: t('monthlyAnalysis.production'),
                  consumption: t('monthlyAnalysis.consumption'),
                  selfConsumed: t('monthlyAnalysis.selfConsumed'),
                }
                return [`${value} kWh`, labels[String(name)] || String(name)]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '14px' }}
              formatter={(value: string) => {
                const labels: Record<string, string> = {
                  production: t('monthlyAnalysis.production'),
                  consumption: t('monthlyAnalysis.consumption'),
                  selfConsumed: t('monthlyAnalysis.selfConsumed'),
                }
                return labels[value] || value
              }}
            />
            <Area
              type="monotone"
              dataKey="production"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#63b7e8"
              fill="#63b7e8"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="selfConsumed"
              stroke="#c1272d"
              fill="#c1272d"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
