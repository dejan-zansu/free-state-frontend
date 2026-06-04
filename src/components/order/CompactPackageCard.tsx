'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import type { CalculatorPackage } from '@/services/residential-calculator.service'
import { cn } from '@/lib/utils'
import { getFromPriceChf, type SolarModelKey } from './PackageCard'
import { ABO_TERM_MONTHS, ABO_UPLIFT_FACTOR } from '@/stores/solar-abo-calculator.store'

const YIELD_KWH_PER_KWP = 950

function fmtChf(n: number | null | undefined): string {
  return n != null ? n.toLocaleString('de-CH') : '—'
}

function fmtRange(min: number, max: number, digits = 1): string {
  const opts = { minimumFractionDigits: digits, maximumFractionDigits: digits }
  return min === max
    ? min.toLocaleString('de-CH', opts)
    : `${min.toLocaleString('de-CH', opts)}–${max.toLocaleString('de-CH', opts)}`
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
        ? `${fmtChf(Math.round((fromPrice * ABO_UPLIFT_FACTOR) / ABO_TERM_MONTHS))} CHF / Mt.`
        : '—'
      : fromPrice != null
        ? `${fmtChf(fromPrice)} CHF`
        : '—'
  const hasRange = pkg.minCapacityKwp != null && pkg.maxCapacityKwp != null
  const equipment = pkg.equipment.filter(e => e.name).slice(0, 4)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={!!isSelected}
      className={cn(
        'relative flex h-full flex-col items-start gap-2 rounded-xl border bg-white p-4 pt-5 text-left transition-shadow hover:shadow-md',
        isSelected
          ? 'border-[#062E25] ring-2 ring-[#062E25]'
          : 'border-[#062E25]/15'
      )}
    >
      {isRecommended && (
        <span className="absolute -top-2.5 left-3 rounded-full bg-[#036B53] px-2.5 py-0.5 text-sm font-semibold text-white">
          {t('recommended')}
        </span>
      )}
      {pkg.imageUrl && (
        <div className="relative mx-auto h-24 w-full">
          <Image
            src={pkg.imageUrl}
            alt={pkg.name}
            fill
            sizes="240px"
            className="object-contain"
          />
        </div>
      )}
      <span className="text-base font-bold text-[#062E25]">{pkg.name}</span>
      {hasRange && (
        <span className="text-sm font-medium text-[#062E25]/70">
          {fmtRange(pkg.minCapacityKwp!, pkg.maxCapacityKwp!)} {t('kwpUnit')}
          {' · '}~
          {fmtRange(
            Math.round(pkg.minCapacityKwp! * YIELD_KWH_PER_KWP),
            Math.round(pkg.maxCapacityKwp! * YIELD_KWH_PER_KWP),
            0
          )}{' '}
          {t('kwhPerYearUnit')}
        </span>
      )}
      {equipment.length > 0 && (
        <ul className="flex flex-col gap-1">
          {equipment.map(item => (
            <li
              key={`${item.equipmentType}:${item.name}`}
              className="text-sm text-[#062E25]/80"
            >
              {item.quantity > 1 ? `${item.quantity}× ` : ''}
              {item.name}
            </li>
          ))}
        </ul>
      )}
      <span className="mt-auto flex w-full items-baseline gap-1.5 border-t border-[#062E25]/10 pt-2">
        {!isFree && (
          <span className="text-sm font-semibold uppercase tracking-wider text-[#062E25]/60">
            {t('priceLabels.from')}
          </span>
        )}
        <span className="text-lg font-bold text-[#062E25]">{price}</span>
        {!isFree && (
          <span className="text-sm uppercase tracking-wider text-[#062E25]/50">
            {t('priceLabels.exclVat')}
          </span>
        )}
      </span>
    </button>
  )
}
