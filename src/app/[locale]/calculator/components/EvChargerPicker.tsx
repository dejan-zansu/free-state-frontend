'use client'

import { Plug, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import type { PublicEvCharger } from '@/services/residential-calculator.service'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

function fmtChf(n: number): string {
  return n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface EvChargerPickerProps {
  charger: PublicEvCharger | null
}

export default function EvChargerPicker({ charger }: EvChargerPickerProps) {
  const t = useTranslations('solarAboCalculator.results.evChargerPicker')
  const selectedId = useSolarAboCalculatorStore((s) => s.selectedEvChargerId)
  const setSelectedEvCharger = useSolarAboCalculatorStore((s) => s.setSelectedEvCharger)
  const clearEvCharger = useSolarAboCalculatorStore((s) => s.clearEvCharger)

  if (!charger) return null

  const isSelected = selectedId === charger.id

  const toggle = () => {
    if (isSelected) {
      clearEvCharger()
    } else {
      setSelectedEvCharger(charger.id, charger.priceChf)
    }
  }

  return (
    <section className="rounded-xl bg-white/60 border border-[#062E25]/10 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-medium text-[#062E25] tracking-tight">
            {t('title', { brand: charger.manufacturerName })}
          </h3>
          <p className="mt-1 text-base text-[#062E25]/70 max-w-2xl">
            {t('subtitle')}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F2F4E8]">
              {charger.imageUrl ? (
                <Image
                  src={charger.imageUrl}
                  alt={charger.displayName}
                  fill
                  sizes="64px"
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Plug className="h-6 w-6 text-[#036B53]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#036B53]">
                {charger.manufacturerName}
              </div>
              <div className="text-base font-semibold text-[#062E25] truncate">
                {charger.displayName}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#062E25]/65">
                <Zap className="h-3.5 w-3.5" />
                <span>{charger.ratedPowerKw} kW · {charger.connectorTypes ?? '-'}</span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-base font-semibold text-[#062E25] tabular-nums">
                CHF {fmtChf(charger.priceChf)}
              </div>
              <div className="text-xs text-[#062E25]/65">{t('inclInstallation')}</div>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={isSelected}
            aria-pressed={isSelected}
            aria-label={charger.displayName}
            onClick={toggle}
            className={cn(
              'inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]/30',
              isSelected
                ? 'bg-[#062E25] text-white border-[#062E25]'
                : 'bg-transparent text-[#062E25] border-[#062E25]/30 hover:bg-[#062E25]/5',
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-4 h-4 rounded-full border transition-colors',
                isSelected
                  ? 'bg-white border-white'
                  : 'bg-transparent border-[#062E25]/40',
              )}
            >
              {isSelected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="#062E25"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {isSelected ? t('addedLabel') : t('addLabel')}
          </button>
        </div>
      </div>
    </section>
  )
}
