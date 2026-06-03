'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import type { CalculatorPackage } from '@/services/residential-calculator.service'
import { cn } from '@/lib/utils'
import { getFromPriceChf, type SolarModelKey } from './PackageCard'

function fmtChf(n: number | null | undefined): string {
  return n != null ? n.toLocaleString('de-CH') : '—'
}

function kwpRange(pkg: CalculatorPackage): string | null {
  if (pkg.minCapacityKwp == null || pkg.maxCapacityKwp == null) return null
  const opts = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
  return pkg.minCapacityKwp === pkg.maxCapacityKwp
    ? pkg.minCapacityKwp.toLocaleString('de-CH', opts)
    : `${pkg.minCapacityKwp.toLocaleString('de-CH', opts)}–${pkg.maxCapacityKwp.toLocaleString('de-CH', opts)}`
}

export default function CompactPackageCard({
  pkg,
  model,
  isSelected,
  isRecommended,
  onSelect,
}: {
  pkg: CalculatorPackage
  model: SolarModelKey
  isSelected?: boolean
  isRecommended?: boolean
  onSelect: () => void
}) {
  const t = useTranslations('packageCatalog.card')
  const fromPrice = getFromPriceChf(pkg)
  const isFree = model === 'solar-free'
  const isAbo = model === 'solar-abo'
  const price = isFree
    ? '0 CHF'
    : isAbo
      ? fromPrice != null
        ? `${fmtChf(Math.round((fromPrice * 1.35) / 300))} CHF / Mt.`
        : '—'
      : fromPrice != null
        ? `${fmtChf(fromPrice)} CHF`
        : '—'
  const range = kwpRange(pkg)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={!!isSelected}
      className={cn(
        'relative flex h-full flex-col items-start gap-1.5 rounded-xl border bg-white p-3 pt-4 text-left transition-shadow hover:shadow-md',
        isSelected
          ? 'border-[#062E25] ring-2 ring-[#062E25]'
          : 'border-[#062E25]/15'
      )}
    >
      {isRecommended && (
        <span className="absolute -top-2.5 left-3 rounded-full bg-[#036B53] px-2.5 py-0.5 text-[10px] font-semibold text-white">
          {t('recommended')}
        </span>
      )}
      {pkg.imageUrl && (
        <div className="relative mx-auto h-16 w-full">
          <Image
            src={pkg.imageUrl}
            alt={pkg.name}
            fill
            sizes="180px"
            className="object-contain"
          />
        </div>
      )}
      <span className="text-sm font-bold text-[#062E25]">{pkg.name}</span>
      {range && (
        <span className="text-xs text-[#062E25]/60">
          {range} {t('kwpUnit')}
        </span>
      )}
      <span className="mt-auto text-base font-bold text-[#062E25]">
        {!isFree && (
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-[#062E25]/60">
            {t('priceLabels.from')}
          </span>
        )}
        {price}
      </span>
    </button>
  )
}
