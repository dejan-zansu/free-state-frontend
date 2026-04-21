'use client'

import { Home, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface EnergyFlowDiagramProps {
  annualProduction: number
  estimatedConsumption: number
  selfConsumptionRate: number
}

const COLORS = {
  solar: '#B7FE1A',
  surplus: '#036B53',
  grid: '#9CA9A6',
} as const

export default function EnergyFlowDiagram({
  annualProduction,
  estimatedConsumption,
  selfConsumptionRate,
}: EnergyFlowDiagramProps) {
  const t = useTranslations('solarAboCalculator.results.energyFlow')

  const rawSelfConsumed = annualProduction * selfConsumptionRate
  const selfConsumed = Math.round(
    Math.min(rawSelfConsumed, estimatedConsumption),
  )
  const feedIn = Math.round(Math.max(0, annualProduction - selfConsumed))
  const gridSupply = Math.round(
    Math.max(0, estimatedConsumption - selfConsumed),
  )
  const independence =
    estimatedConsumption > 0
      ? Math.min(
          100,
          Math.round((selfConsumed / estimatedConsumption) * 100),
        )
      : 0

  const fmt = (n: number) => Math.round(n).toLocaleString('de-CH')

  const prodSelfPct =
    annualProduction > 0 ? (selfConsumed / annualProduction) * 100 : 0
  const prodSurplusPct = Math.max(0, 100 - prodSelfPct)

  const consSelfPct =
    estimatedConsumption > 0 ? (selfConsumed / estimatedConsumption) * 100 : 0
  const consGridPct = Math.max(0, 100 - consSelfPct)

  return (
    <div className="rounded-xl bg-white/60 border border-[#062E25]/8 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[#062E25] mb-5">
        {t('title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <FlowCard
          icon={<Sun className="w-4 h-4 text-[#062E25]" aria-hidden />}
          iconBg="bg-[#B7FE1A]/30"
          label={t('production')}
          total={fmt(annualProduction)}
          segments={[
            { pct: prodSelfPct, color: COLORS.solar },
            { pct: prodSurplusPct, color: COLORS.surplus },
          ]}
          legend={[
            {
              color: COLORS.solar,
              label: t('selfConsumed'),
              value: fmt(selfConsumed),
            },
            {
              color: COLORS.surplus,
              label: t('feedIn'),
              value: fmt(feedIn),
            },
          ]}
        />

        <FlowCard
          icon={<Home className="w-4 h-4 text-[#062E25]" aria-hidden />}
          iconBg="bg-[#062E25]/10"
          label={t('consumption')}
          total={fmt(estimatedConsumption)}
          segments={[
            { pct: consSelfPct, color: COLORS.solar },
            { pct: consGridPct, color: COLORS.grid },
          ]}
          legend={[
            {
              color: COLORS.solar,
              label: t('ownConsumption'),
              value: fmt(selfConsumed),
            },
            {
              color: COLORS.grid,
              label: t('gridSupply'),
              value: fmt(gridSupply),
            },
          ]}
        />
      </div>

      <div className="mt-4 sm:mt-5 flex items-center justify-between gap-4 rounded-lg bg-[#062E25] px-5 py-4">
        <p className="text-xs sm:text-sm font-semibold text-white/75 uppercase tracking-[0.12em]">
          {t('independence')}
        </p>
        <p className="text-2xl font-bold text-[#B7FE1A] tabular-nums">
          {independence}%
        </p>
      </div>
    </div>
  )
}

interface FlowCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  total: string
  segments: { pct: number; color: string }[]
  legend: { color: string; label: string; value: string }[]
}

function FlowCard({
  icon,
  iconBg,
  label,
  total,
  segments,
  legend,
}: FlowCardProps) {
  return (
    <div className="rounded-lg bg-white/70 border border-[#062E25]/6 p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${iconBg}`}
        >
          {icon}
        </div>
        <p className="text-sm text-[#062E25]/60">{label}</p>
      </div>

      <p className="mt-3 text-2xl sm:text-[28px] font-semibold text-[#062E25] tabular-nums leading-tight">
        {total}
        <span className="ml-1.5 text-sm font-normal text-[#062E25]/50">
          kWh
        </span>
      </p>

      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[#062E25]/6">
        {segments.map((s, i) => (
          <div
            key={i}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            className="h-full"
          />
        ))}
      </div>

      <div className="mt-3.5 space-y-2">
        {legend.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="truncate text-[#062E25]/70">{item.label}</span>
            </div>
            <span className="font-medium text-[#062E25] tabular-nums">
              {item.value}{' '}
              <span className="text-[#062E25]/50 font-normal">kWh</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
