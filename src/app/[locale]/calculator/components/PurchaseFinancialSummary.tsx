'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface Props {
  grossPriceChf: number
  estimatedSubsidyChf: number | null
  estimatedNetPriceChf: number
  annualSavingsChf: number
  paybackYears: number
  lifetimeSavings25y: number
  className?: string
}

export function PurchaseFinancialSummary(props: Props) {
  const t = useTranslations('solarAboCalculator.results.purchaseFinancial')
  const fmt = (n: number) =>
    `CHF ${n.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`
  const paybackText = Number.isFinite(props.paybackYears)
    ? `${props.paybackYears.toFixed(1)} ${t('yearsShort')}`
    : '—'

  return (
    <section className={cn('flex flex-col gap-3 rounded-xl bg-[#0F2A24] p-5 text-white', props.className)}>
      <h3 className="text-base font-medium">{t('title')}</h3>
      <Row label={t('grossPrice')} value={fmt(props.grossPriceChf)} />
      {props.estimatedSubsidyChf !== null ? (
        <Row label={t('estimatedSubsidy')} value={`− ${fmt(props.estimatedSubsidyChf)}`} />
      ) : (
        <p className="text-sm text-white/70">{t('subsidyUnavailable')}</p>
      )}
      <hr className="border-white/20" />
      <Row label={t('netInvestment')} value={fmt(props.estimatedNetPriceChf)} bold />
      <hr className="border-white/20" />
      <Row label={t('annualSavings')} value={`${fmt(props.annualSavingsChf)} / ${t('year')}`} />
      <Row label={t('paybackPeriod')} value={paybackText} />
      <Row label={t('lifetime25y')} value={fmt(props.lifetimeSavings25y)} />
    </section>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-sm text-white/80">{label}</span>
      <span className={cn('text-base', bold ? 'text-xl font-medium' : '')}>
        {value}
      </span>
    </div>
  )
}
