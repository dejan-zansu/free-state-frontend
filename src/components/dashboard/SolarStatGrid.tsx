'use client'

import { Leaf, PanelTop, TrendingUp, Zap } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

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
      <Card className="border-[#062E25]/10">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-3">
            <PanelTop className="h-5 w-5 text-[#062E25]/40" />
            <span className="text-sm text-[#062E25]/60">{labels.systemSize}</span>
          </div>
          <p className="text-2xl font-bold text-[#062E25]">
            {systemSizeKwp.toFixed(1)}{' '}
            <span className="text-sm font-normal">{labels.kwp}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-[#062E25]/60">
              {labels.annualProduction}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#062E25]">
            {Math.round(annualProductionKwh).toLocaleString('de-CH')}{' '}
            <span className="text-sm font-normal">{labels.kwh}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm text-[#062E25]/60">
              {labels.annualSavings}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#062E25]">
            {labels.chf} {Math.round(annualSavings).toLocaleString('de-CH')}
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-[#062E25]/60">{labels.co2Savings}</span>
          </div>
          <p className="text-2xl font-bold text-[#062E25]">
            {Math.round(co2Savings).toLocaleString('de-CH')}{' '}
            <span className="text-sm font-normal">{labels.kgPerYear}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
