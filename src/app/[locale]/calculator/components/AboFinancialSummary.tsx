'use client'

import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ABO_TERM_MONTHS } from '@/stores/solar-abo-calculator.store'

interface Props {
  monthlyChf: number
  totalChf: number
  included: string[]
  excluded: string[]
  addOnLabel?: string
  addOnChf?: number
  className?: string
}

export function AboFinancialSummary(props: Props) {
  const t = useTranslations('solarAboCalculator.results.solarAboPlan')
  const fmt = (n: number) =>
    `CHF ${n.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl bg-[#0F2A24] p-5 text-white',
        props.className
      )}
    >
      <h3 className="text-base font-medium">{t('monthlyTitle')}</h3>

      <div className="flex items-baseline gap-2">
        <span className="text-sm text-white/70">{t('from')}</span>
        <span className="text-3xl font-medium">{fmt(props.monthlyChf)}</span>
        <span className="text-base text-white/80">{t('perMonth')}</span>
      </div>
      <p className="text-sm text-white/70">
        {fmt(props.totalChf)} {t('overTerm', { years: Math.round(ABO_TERM_MONTHS / 12) })}
      </p>

      {props.addOnChf != null && props.addOnChf > 0 ? (
        <p className="text-sm text-white/70">
          {props.addOnLabel}: {fmt(props.addOnChf)}
        </p>
      ) : null}

      <hr className="border-white/20" />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white/90">
          {t('includedTitle')}
        </span>
        {props.included.map(item => (
          <div key={item} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-[#B7FE1A]" />
            <span className="text-sm text-white/80">{item}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-white/90">
          {t('excludedTitle')}
        </span>
        {props.excluded.map(item => (
          <div key={item} className="flex items-center gap-2">
            <X className="h-4 w-4 shrink-0 text-white/50" />
            <span className="text-sm text-white/60">{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
