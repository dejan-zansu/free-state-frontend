'use client'

import { Zap, TrendingUp, Sun, Leaf, PanelTop } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'

interface ResultsMetricsGridProps {
  annualProduction: number
  annualSavings: number
  selfConsumptionRate: number
  co2Savings: number
  energyBalance: number
  roofImage: string | null
  address: string
}

export default function ResultsMetricsGrid({
  annualProduction,
  annualSavings,
  selfConsumptionRate,
  co2Savings,
  energyBalance,
  roofImage,
  address,
}: ResultsMetricsGridProps) {
  const t = useTranslations('solarAboCalculator.results')

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Zap className="mx-auto h-6 w-6 text-yellow-500" />
            <p className="mt-1.5 text-xl font-bold">
              {Math.round(annualProduction).toLocaleString('de-CH')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('metrics.production')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <TrendingUp className="mx-auto h-6 w-6 text-green-500" />
            <p className="mt-1.5 text-xl font-bold">
              CHF {Math.round(annualSavings).toLocaleString('de-CH')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('metrics.savings')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Sun className="mx-auto h-6 w-6 text-orange-500" />
            <p className="mt-1.5 text-xl font-bold">
              {Math.round(selfConsumptionRate * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">
              {t('metrics.selfSufficiency')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Leaf className="mx-auto h-6 w-6 text-emerald-500" />
            <p className="mt-1.5 text-xl font-bold">
              {Math.round(co2Savings).toLocaleString('de-CH')}
            </p>
            <p className="text-sm text-muted-foreground">{t('metrics.co2')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-2xl overflow-hidden border border-[#062E25]/10">
        {roofImage ? (
          <Image
            src={roofImage}
            alt={t('system.title')}
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
            unoptimized
          />
        ) : (
          <div className="aspect-[5/2] bg-[#F5F7EE] flex items-center justify-center">
            <PanelTop className="h-16 w-16 text-[#062E25]/15" />
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-2 bg-[#062E25]/5">
          {address && (
            <span className="text-sm text-[#062E25]/60">{address}</span>
          )}
          <span className="text-sm font-semibold text-[#062E25]">
            {energyBalance}% {t('metrics.energyBalanceDesc')}
          </span>
        </div>
      </div>
    </>
  )
}
