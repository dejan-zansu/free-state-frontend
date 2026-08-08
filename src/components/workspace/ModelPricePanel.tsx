'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

import { chf, rpPerKwh } from '@/lib/format-chf'
import { cn } from '@/lib/utils'
import type { WorkspacePayload } from '@/services/customer-portal.service'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-pine tracking-tight">{children}</p>
}

function BigNumber({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-5xl font-medium text-pine tabular-nums tracking-tight sm:text-6xl">
      {children}
    </p>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-2xl text-base font-light text-pine/75 tracking-tight">{children}</p>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-pine/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-base text-pine tracking-tight">{label}</span>
      <span
        className={cn(
          'text-base text-pine tabular-nums tracking-tight',
          strong ? 'font-medium' : '',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function Rows({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md space-y-3">{children}</div>
}

function DirectPanel({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace.money')
  const fin = data.financials

  const subsidyChf = fin.subsidiesChf ?? 0
  const subsidyAvailable = subsidyChf > 0
  const savingsAvailable = fin.annualSavingsChf > 0
  const paybackAvailable =
    fin.paybackYears != null && Number.isFinite(fin.paybackYears) && fin.paybackYears > 0

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>{subsidyAvailable ? t('direct.priceLabel') : t('direct.priceLabelNoSubsidy')}</Label>
        <BigNumber>{chf(subsidyAvailable ? fin.netPriceChf : fin.grossPriceChf)}</BigNumber>
      </div>

      <Rows>
        <Row label={t('direct.grossPrice')} value={chf(fin.grossPriceChf)} />
        {subsidyAvailable && (
          <Row label={t('direct.subsidy')} value={`− ${chf(subsidyChf)}`} />
        )}
        {savingsAvailable && (
          <Row label={t('direct.savings')} value={chf(fin.annualSavingsChf)} strong />
        )}
        {paybackAvailable && (
          <Row
            label={t('direct.payback')}
            value={t('direct.paybackYears', { years: fin.paybackYears!.toFixed(1) })}
          />
        )}
      </Rows>

      <div className="space-y-1">
        <Note>{t('direct.instalments')}</Note>
        {subsidyAvailable ? (
          <Note>{t('direct.subsidyFootnote')}</Note>
        ) : (
          <Note>{t('direct.subsidyUnavailable')}</Note>
        )}
      </div>
    </div>
  )
}

function FreePanel({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace.money')
  const fin = data.financials

  const discount = fin.ppaDiscountPercent ?? 30
  const term = fin.contractTermYears ?? data.package?.contractTermYears ?? 35
  const savingsAvailable = fin.annualSavingsChf > 0

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Label>{t('free.priceLabel')}</Label>
        <BigNumber>{chf(0)}</BigNumber>
      </div>

      <Rows>
        <Row label={t('free.discount')} value={t('free.discountValue', { percent: discount })} />
        <Row
          label={t('free.tariff')}
          value={t('free.tariffValue', { rate: rpPerKwh(data.rates.electricityChfPerKwh) })}
        />
        <Row label={t('free.term')} value={t('free.termYears', { years: term })} />
        {savingsAvailable && (
          <Row label={t('free.savings')} value={chf(fin.annualSavingsChf)} strong />
        )}
      </Rows>

      <div className="space-y-1">
        <Note>{t('free.ownership', { years: term })}</Note>
        <Note>{t('free.tariffFootnote')}</Note>
      </div>
    </div>
  )
}

function AboPanel() {
  const t = useTranslations('dashboard.workspace.money')
  const points = ['owner', 'fixed', 'noUpfront'] as const

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label>{t('abo.priceLabel')}</Label>
        <p className="max-w-2xl text-xl font-medium text-pine tracking-tight sm:text-2xl">
          {t('abo.pending')}
        </p>
      </div>

      <div className="max-w-md space-y-3">
        {points.map(point => (
          <div key={point} className="flex items-baseline gap-3">
            <Check className="h-4 w-4 shrink-0 translate-y-0.5 text-[#036B53]" aria-hidden />
            <span className="text-base text-pine tracking-tight">{t(`abo.points.${point}`)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Note>{t('abo.subsidyNote')}</Note>
        <Note>{t('abo.next')}</Note>
      </div>
    </div>
  )
}

export function ModelPricePanel({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace.money')
  const model = data.financials.solarModel

  if (model === 'solar-abo') return <AboPanel />
  if (model === 'solar-free') return <FreePanel data={data} />

  if (data.financials.grossPriceChf <= 0) {
    return (
      <p className="max-w-2xl text-base text-pine tracking-tight sm:text-xl">
        {t('unavailable')}
      </p>
    )
  }

  return <DirectPanel data={data} />
}
