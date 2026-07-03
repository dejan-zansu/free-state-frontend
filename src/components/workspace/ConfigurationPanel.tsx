'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Check, Loader2, Pencil, Plug, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import CompactPackageCard from '@/components/order/CompactPackageCard'
import type { SolarModelKey } from '@/components/order/PackageCard'
import { SectionHeader } from '@/components/ui/section-header'
import type { WorkspacePayload } from '@/services/customer-portal.service'
import {
  residentialCalculatorService,
  type CalculatorPackage,
  type SolarModelFilter,
} from '@/services/residential-calculator.service'

const MODEL_FILTER: Record<SolarModelKey, SolarModelFilter> = {
  'solar-free': 'SOLAR_FREE',
  'solar-direct': 'SOLAR_DIRECT',
  'solar-abo': 'SOLAR_ABO',
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('de-CH')
}

export function ConfigurationPanel({
  data,
  onRefresh,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
}) {
  const t = useTranslations('dashboard.workspace.config')
  const locale = useLocale()
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const modelKey = (data.calculation.solarModel ?? 'solar-free') as SolarModelKey

  useEffect(() => {
    const filter = MODEL_FILTER[(data.calculation.solarModel ?? 'solar-free') as SolarModelKey]
    residentialCalculatorService
      .getPackages(locale, filter)
      .then(pkgs =>
        pkgs.length === 0 && filter === 'SOLAR_ABO'
          ? residentialCalculatorService.getPackages(locale, 'SOLAR_DIRECT').then(setPackages)
          : setPackages(pkgs)
      )
      .catch(() => setPackages([]))
  }, [locale, data.calculation.solarModel])

  const selectPackage = async (pkg: CalculatorPackage) => {
    if (pkg.id === data.package?.id) return
    setSaving(true)
    setError(null)
    try {
      await residentialCalculatorService.updateCalculation({
        projectId: data.project.id,
        calculation: {
          selectedPackageId: pkg.id,
          selectedPackageCode: pkg.code,
          evCharger: null,
        },
      })
      await onRefresh()
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const toggleEvCharger = async () => {
    setSaving(true)
    setError(null)
    try {
      await residentialCalculatorService.updateCalculation({
        projectId: data.project.id,
        calculation: data.evCharger
          ? { evCharger: null }
          : { evCharger: { evChargerId: data.package!.availableEvCharger!.id, quantity: 1 } },
      })
      await onRefresh()
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const saveConsumption = async (kwh: number | null) => {
    const clamped = kwh == null ? null : Math.min(50000, Math.max(500, Math.round(kwh)))
    setSaving(true)
    setError(null)
    try {
      await residentialCalculatorService.updateCalculation({
        projectId: data.project.id,
        calculation: { consumptionOverrideKwh: clamped },
      })
      await onRefresh()
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const startConsumptionEdit = () => {
    setDraft(String(Math.round(data.calculation.annualConsumptionKwh)))
    setEditing(true)
  }

  const commitConsumptionEdit = () => {
    const parsed = Number(draft.replace(/[^\d]/g, ''))
    setEditing(false)
    if (Number.isFinite(parsed) && parsed > 0) void saveConsumption(parsed)
  }

  const evOffer = data.package?.availableEvCharger ?? null
  const evDisplay = data.evCharger ?? evOffer
  const evSelected = data.evCharger != null
  const consumptionIsOverride = data.calculation.consumptionOverrideKwh != null

  return (
    <div className="relative">
      <div className={cn('space-y-16', saving && 'opacity-60 pointer-events-none')}>
        {packages.length > 1 && (
          <section>
            <SectionHeader title={t('packagesTitle')} subtitle={t('packagesSubtitle')} />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 pt-4">
              {packages.map(pkg => (
                <CompactPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  model={modelKey}
                  isSelected={pkg.id === data.package?.id}
                  isRecommended={!data.packageRetired && pkg.id === data.package?.id}
                  onSelect={() => void selectPackage(pkg)}
                />
              ))}
            </div>
          </section>
        )}

        {evDisplay && (
          <section>
            <SectionHeader title={t('evTitle')} />
            <div className="rounded-xl bg-white border border-[#062E25]/10 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8">
                <div className="flex flex-1 min-w-0 items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F2F4E8]">
                    {evDisplay.imageUrl ? (
                      <Image
                        src={evDisplay.imageUrl}
                        alt={evDisplay.displayName}
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
                    <div className="text-sm font-semibold uppercase tracking-wider text-[#036B53]">
                      {evDisplay.manufacturerName}
                    </div>
                    <div className="text-base font-semibold text-pine truncate">
                      {evDisplay.displayName}
                    </div>
                    <div className="mt-1 text-base font-semibold text-pine tabular-nums">
                      CHF {fmt(evDisplay.priceChf)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {evSelected && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#036B53]">
                      <Check className="h-4 w-4" />
                      {t('evSelected')}
                    </span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={evSelected}
                    onClick={() => void toggleEvCharger()}
                    className={cn(
                      'inline-flex items-center rounded-full border px-4 py-2 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]/30',
                      evSelected
                        ? 'bg-transparent text-pine border-[#062E25]/30 hover:bg-[#062E25]/5'
                        : 'bg-[#062E25] text-white border-[#062E25] hover:bg-[#062E25]/90'
                    )}
                  >
                    {evSelected ? t('evRemove') : t('evAdd')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <SectionHeader title={t('consumptionTitle')} />
          <div className="rounded-xl bg-white border border-[#062E25]/10 px-5 py-8 sm:px-6">
            <div className="flex flex-col items-center gap-3 text-center">
              {editing ? (
                <div className="inline-flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    value={draft}
                    onChange={e => setDraft(e.target.value.replace(/[^\d]/g, ''))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitConsumptionEdit()
                      if (e.key === 'Escape') setEditing(false)
                    }}
                    className="w-28 border-b border-[#062E25]/40 bg-transparent text-right text-2xl font-medium text-pine tabular-nums outline-none focus:border-[#062E25]"
                  />
                  <span className="text-base text-pine/70">{t('consumptionUnit')}</span>
                  <button
                    type="button"
                    onClick={commitConsumptionEdit}
                    aria-label={t('consumptionSave')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    aria-label={t('consumptionCancel')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#062E25]/30 text-pine hover:bg-[#062E25]/5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startConsumptionEdit}
                  className="group inline-flex items-baseline gap-2 text-pine hover:text-[#062E25]"
                >
                  <span className="text-2xl font-medium tabular-nums">
                    {fmt(data.calculation.annualConsumptionKwh)}
                  </span>
                  <span className="text-base text-pine/70">{t('consumptionUnit')}</span>
                  <Pencil className="h-4 w-4 self-center opacity-60 group-hover:opacity-100" />
                </button>
              )}
              {consumptionIsOverride && !editing && (
                <button
                  type="button"
                  onClick={() => void saveConsumption(null)}
                  className="text-sm text-pine/60 underline underline-offset-4 hover:text-pine"
                >
                  {t('consumptionReset')}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {saving && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <Loader2 className="mt-20 h-8 w-8 animate-spin text-pine" />
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-base text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
