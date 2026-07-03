'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { EyebrowPill } from '@/components/ui/eyebrow-pill'
import { StatTile } from '@/components/ui/stat-tile'
import { modelLabelKey } from '@/lib/model-label'
import type { WorkspacePayload } from '@/services/customer-portal.service'

const PILL_BASE = 'rounded-full text-sm font-medium px-3 py-1.5'
const MIN_ROOF_IMAGE_PX = 32

function statusPillClass(status: string): string {
  const color =
    status === 'contract_signed'
      ? 'bg-green-100 text-green-700'
      : status === 'offer_requested' || status === 'contract_pending'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-blue-100 text-blue-700'
  return `${PILL_BASE} ${color}`
}

function HeroBand({ address, modelLabel }: { address: string; modelLabel: string }) {
  return (
    <div className="relative rounded-[24px] overflow-hidden bg-pine px-5 sm:px-8 py-12 sm:py-16">
      <span className="inline-flex">
        <EyebrowPill>{modelLabel}</EyebrowPill>
      </span>
      <p className="mt-6 text-base sm:text-xl font-medium text-white">{address}</p>
    </div>
  )
}

function RoofHero({
  url,
  address,
  modelLabel,
}: {
  url: string
  address: string
  modelLabel: string
}) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return <HeroBand address={address} modelLabel={modelLabel} />
  }

  return (
    <div className="relative w-full h-[340px] sm:h-[440px] rounded-[24px] overflow-hidden">
      <Image
        src={url}
        alt={address}
        fill
        sizes="100vw"
        className="object-cover"
        priority
        unoptimized
        onError={() => setBroken(true)}
        onLoad={(event) => {
          const img = event.currentTarget
          if (img.naturalWidth < MIN_ROOF_IMAGE_PX || img.naturalHeight < MIN_ROOF_IMAGE_PX) {
            setBroken(true)
          }
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-pine/40 to-transparent pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-pine/85 to-transparent pointer-events-none"
      />
      <span className="absolute top-5 left-5 z-10">
        <EyebrowPill>{modelLabel}</EyebrowPill>
      </span>
      <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-6 sm:pb-8">
        <p className="text-base sm:text-xl font-medium text-white">{address}</p>
      </div>
    </div>
  )
}

export function WorkspaceHero({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace')
  const tProject = useTranslations('dashboard.project')
  const fmt = (n: number, d = 0) => n.toLocaleString('de-CH', { maximumFractionDigits: d })
  const modelLabel = tProject(`models.${modelLabelKey(data.calculation.solarModel)}`)
  const isAbo = data.calculation.solarModel === 'solar-abo'
  const aboMonthly = data.financials.aboMonthlyChf

  return (
    <div className="space-y-8">
      {data.calculation.roofImageUrl ? (
        <RoofHero
          key={data.calculation.roofImageUrl}
          url={data.calculation.roofImageUrl}
          address={data.project.address}
          modelLabel={modelLabel}
        />
      ) : (
        <HeroBand address={data.project.address} modelLabel={modelLabel} />
      )}

      <div className="flex justify-end">
        <span className={statusPillClass(data.conversionStatus)}>
          {t(`conversion.${data.conversionStatus}`)}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pt-8">
        <StatTile
          variant="glass"
          badge={t('stats.systemBadge')}
          ready
          value={`${fmt(data.calculation.systemSizeKwp, 1)} kWp`}
          subtitle={t('stats.systemSubtitle', {
            production: fmt(data.calculation.annualProductionKwh),
            panels: data.calculation.panelCount ?? 0,
          })}
        />
        {isAbo && aboMonthly ? (
          <StatTile
            variant="glass"
            badge={t('stats.monthlyBadge')}
            ready
            value={`CHF ${fmt(aboMonthly)} / Mt.`}
            subtitle={t('stats.monthlySubtitle')}
          />
        ) : (
          <StatTile
            variant="glass"
            badge={t('stats.savingsBadge')}
            ready
            value={`CHF ${fmt(data.financials.annualSavingsChf)}`}
            subtitle={t('stats.savingsSubtitle')}
          />
        )}
        <StatTile
          variant="glass"
          ready
          value={`${fmt(data.calculation.carbonOffsetKg)} kg`}
          subtitle={t('stats.co2Subtitle')}
        />
        <StatTile
          variant="glass"
          ready
          value={`${Math.round(data.calculation.selfConsumptionRate * 100)}%`}
          subtitle={t('stats.selfConsumptionSubtitle')}
        />
      </div>
    </div>
  )
}
