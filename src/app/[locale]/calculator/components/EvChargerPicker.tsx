'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { Plug, Zap } from 'lucide-react'

import { evChargerService, type PublicEvCharger } from '@/services/ev-charger.service'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

function fmtChf(n: number): string {
  return n.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function EvChargerPicker() {
  const t = useTranslations('solarAboCalculator.results.evChargerPicker')
  const locale = useLocale()
  const selectedId = useSolarAboCalculatorStore((s) => s.selectedEvChargerId)
  const setSelectedEvCharger = useSolarAboCalculatorStore((s) => s.setSelectedEvCharger)
  const clearEvCharger = useSolarAboCalculatorStore((s) => s.clearEvCharger)

  const [chargers, setChargers] = useState<PublicEvCharger[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    evChargerService
      .listPublic(locale)
      .then((data) => {
        if (!cancelled) setChargers(data)
      })
      .catch(() => {
        if (!cancelled) setChargers([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [locale])

  if (loading) return null
  if (chargers.length === 0) return null

  const handleClick = (c: PublicEvCharger) => {
    if (selectedId === c.id) {
      clearEvCharger()
    } else {
      setSelectedEvCharger(c.id, c.priceChf)
    }
  }

  return (
    <section className="mt-12">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-[#062E25]">{t('title')}</h2>
        <p className="mt-2 text-base font-light text-[#062E25]/80">{t('subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chargers.map((c) => {
          const isSelected = selectedId === c.id
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleClick(c)}
              className={`flex flex-col items-stretch gap-3 rounded-2xl border bg-white p-4 text-left shadow-[0_8px_18px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] ${
                isSelected ? 'ring-2 ring-[#062E25]' : ''
              }`}
              style={{ borderColor: 'rgba(6, 46, 37, 0.18)' }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F2F4E8]">
                {c.imageUrl ? (
                  <Image src={c.imageUrl} alt={c.displayName} fill sizes="320px" className="object-contain" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Plug className="h-10 w-10 text-[#036B53]" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#036B53]">
                  {c.manufacturerName}
                </div>
                <div className="mt-1 text-base font-bold text-[#062E25]">{c.displayName}</div>
                <ul className="mt-2 space-y-1 text-xs text-[#062E25]/70">
                  <li className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>{c.ratedPowerKw} kW · {c.connectorTypes ?? '-'}</span>
                  </li>
                  {c.keyFeatures && c.keyFeatures.length > 0 && (
                    <li className="text-[11px] italic">{c.keyFeatures.slice(0, 2).join(' · ')}</li>
                  )}
                </ul>
              </div>
              <div className="mt-auto flex items-baseline justify-between border-t pt-3">
                <span className="text-xs uppercase tracking-wider text-[#062E25]/60">{t('priceLabel')}</span>
                <span className="text-lg font-extrabold text-[#062E25]">CHF {fmtChf(c.priceChf)}</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[#062E25]/55">{t('exclVat')}</div>
            </button>
          )
        })}
      </div>

      {selectedId != null && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={clearEvCharger}
            className="text-sm font-medium text-[#062E25]/70 underline underline-offset-4 hover:text-[#062E25]"
          >
            {t('removeSelection')}
          </button>
        </div>
      )}
    </section>
  )
}
