'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'

import { fmtNumber } from './format'

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

type Props = {
  monthly: number[]
}

export function MonthlyProductionCard({ monthly }: Props) {
  const t = useTranslations('admin.leads')
  const tMonths = useTranslations('admin.leads.months')

  const maxMonthly = monthly.length > 0 ? Math.max(...monthly) : 0
  if (monthly.length !== 12 || maxMonthly <= 0) return null

  return (
    <Card className="border-[#062E25]/10 mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[#062E25] mb-4">
          {t('monthlyProduction')}
        </h2>
        <div className="grid grid-cols-12 gap-2 items-end h-36">
          {monthly.map((value, i) => {
            const heightPct = maxMonthly > 0 ? (value / maxMonthly) * 100 : 0
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-[#B7FE1A] rounded-t"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-sm text-[#062E25]/60 uppercase">
                  {tMonths(MONTH_KEYS[i])}
                </span>
                <span className="text-sm text-[#062E25] tabular-nums">
                  {fmtNumber(value)}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
