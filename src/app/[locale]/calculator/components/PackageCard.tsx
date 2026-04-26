'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { CalculatorPackage } from '@/services/residential-calculator.service'

interface PackageCardProps {
  package: CalculatorPackage
  isSelected: boolean
  variant: 'subscription' | 'purchase'
  estimatedNetPriceChf?: number
  onSelect: () => void
}

export function PackageCard({ package: pkg, isSelected, variant, estimatedNetPriceChf, onSelect }: PackageCardProps) {
  const t = useTranslations('solarAboCalculator.results.packageCard')
  const fmt = (n: number) => `CHF ${n.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-white p-4 text-left transition-shadow',
        isSelected
          ? 'border-[#062E25] shadow-md'
          : 'border-[#546963]/40 hover:shadow-sm',
      )}
    >
      {pkg.imageUrl ? (
        <div className="relative h-32 w-full overflow-hidden rounded-md">
          <Image
            src={pkg.imageUrl}
            alt={pkg.name ?? pkg.code}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}

      <h3 className="text-base font-medium text-[#062E25]">
        {pkg.name ?? pkg.code}
      </h3>

      {pkg.description ? (
        <p className="text-sm text-[#062E25]/70">{pkg.description}</p>
      ) : null}

      <p className="text-sm text-[#062E25]/60">
        {t('capacityRange', {
          min: pkg.minCapacityKwp ?? 0,
          max: pkg.maxCapacityKwp ?? 0,
        })}
      </p>

      {variant === 'purchase' && pkg.purchasePriceChf !== null ? (
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium text-[#062E25]">
            {fmt(pkg.purchasePriceChf)}
          </span>
          {estimatedNetPriceChf !== undefined ? (
            <span className="text-sm text-[#3B6B43]">
              {t('estimatedNet', { value: fmt(estimatedNetPriceChf) })}
            </span>
          ) : null}
        </div>
      ) : null}

      {variant === 'subscription' && pkg.pricePerKwp !== null ? (
        <span className="text-sm text-[#062E25]/70">{t('subscriptionTagline')}</span>
      ) : null}
    </button>
  )
}
