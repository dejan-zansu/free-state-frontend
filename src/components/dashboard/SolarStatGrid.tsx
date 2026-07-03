'use client'

import { Leaf, PanelTop, TrendingUp, Zap } from 'lucide-react'

import { StatTile } from '@/components/ui/stat-tile'

export interface SolarStatGridLabels {
  systemSize: string
  kwp: string
  annualProduction: string
  kwh: string
  annualSavings: string
  chf: string
  co2Savings: string
  kgPerYear: string
}

export interface SolarStatGridProps {
  systemSizeKwp: number
  annualProductionKwh: number
  annualSavings: number
  co2Savings: number
  labels: SolarStatGridLabels
}

export default function SolarStatGrid({
  systemSizeKwp,
  annualProductionKwh,
  annualSavings,
  co2Savings,
  labels,
}: SolarStatGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatTile
        variant="calm"
        icon={<PanelTop className="h-5 w-5" />}
        label={labels.systemSize}
        value={`${systemSizeKwp.toFixed(1)} ${labels.kwp}`}
      />

      <StatTile
        variant="calm"
        icon={<Zap className="h-5 w-5" />}
        label={labels.annualProduction}
        value={`${Math.round(annualProductionKwh).toLocaleString('de-CH')} ${labels.kwh}`}
      />

      <StatTile
        variant="calm"
        icon={<TrendingUp className="h-5 w-5" />}
        label={labels.annualSavings}
        value={`${labels.chf} ${Math.round(annualSavings).toLocaleString('de-CH')}`}
      />

      <StatTile
        variant="calm"
        icon={<Leaf className="h-5 w-5" />}
        label={labels.co2Savings}
        value={`${Math.round(co2Savings).toLocaleString('de-CH')} ${labels.kgPerYear}`}
      />
    </div>
  )
}
