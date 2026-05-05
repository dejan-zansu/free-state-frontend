'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

export default function HeatPumpInterestStrip() {
  const t = useTranslations('solarAboCalculator.results.heatPumpInterest')
  const { heatPumpInterest, setHeatPumpInterest } = useSolarAboCalculatorStore()

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ]

  return (
    <section className="rounded-xl bg-white/60 border border-[#062E25]/10 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-medium text-[#062E25] tracking-tight">
            {t('title')}
          </h3>
          <p className="mt-1 text-base text-[#062E25]/70 max-w-2xl">
            {t('subtitle')}
          </p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <li key={i} className="flex flex-col">
                <span className="text-base font-semibold text-[#062E25] tabular-nums">
                  {s.value}
                </span>
                <span className="text-base text-[#062E25]/65">
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={heatPumpInterest}
            aria-label={t('toggleAriaLabel')}
            onClick={() => setHeatPumpInterest(!heatPumpInterest)}
            className={cn(
              'inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]/30',
              heatPumpInterest
                ? 'bg-[#062E25] text-white border-[#062E25]'
                : 'bg-transparent text-[#062E25] border-[#062E25]/30 hover:bg-[#062E25]/5'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-4 h-4 rounded-full border transition-colors',
                heatPumpInterest
                  ? 'bg-white border-white'
                  : 'bg-transparent border-[#062E25]/40'
              )}
            >
              {heatPumpInterest && (
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
            {t('toggleLabel')}
          </button>
        </div>
      </div>
    </section>
  )
}
