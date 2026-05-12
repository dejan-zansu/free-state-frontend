'use client'

import { Check, Plug, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

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
    <section className="mt-12">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-[#062E25]">
          {t('title', { brand: charger.manufacturerName })}
        </h2>
        <p className="mt-2 text-base font-light text-[#062E25]/80">{t('subtitle')}</p>
      </header>

      <button
        type="button"
        aria-pressed={isSelected}
        onClick={toggle}
        className={`mx-auto flex w-full max-w-lg flex-col gap-4 rounded-2xl border bg-white p-5 text-left shadow-[0_8px_18px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center ${
          isSelected ? 'ring-2 ring-[#062E25]' : ''
        }`}
        style={{ borderColor: 'rgba(6, 46, 37, 0.18)' }}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F2F4E8] sm:w-32 sm:shrink-0">
          {charger.imageUrl ? (
            <Image
              src={charger.imageUrl}
              alt={charger.displayName}
              fill
              sizes="160px"
              className="object-contain"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Plug className="h-10 w-10 text-[#036B53]" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#036B53]">
            {charger.manufacturerName}
          </div>
          <div className="mt-1 text-lg font-bold text-[#062E25]">{charger.displayName}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#062E25]/70">
            <Zap className="h-3.5 w-3.5" />
            <span>{charger.ratedPowerKw} kW · {charger.connectorTypes ?? '-'}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-[#062E25]/60">{t('priceLabel')}</div>
            <div className="text-2xl font-extrabold text-[#062E25]">CHF {fmtChf(charger.priceChf)}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#062E25]/55">{t('inclInstallation')}</div>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
              isSelected
                ? 'border-[#062E25] bg-[#062E25] text-white'
                : 'border-[#062E25] bg-white text-[#062E25]'
            }`}
          >
            {isSelected && <Check className="h-4 w-4" strokeWidth={2.5} />}
            {isSelected ? t('addedLabel') : t('addLabel')}
          </span>
        </div>
      </button>
    </section>
  )
}
