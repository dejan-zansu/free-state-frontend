'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { Check, Loader2, Plug } from 'lucide-react'

import { cn } from '@/lib/utils'
import CompactPackageCard from '@/components/order/CompactPackageCard'
import type { SolarModelKey } from '@/components/order/PackageCard'
import { groupNumber } from '@/lib/format-chf'
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

export function ConfigurationPanel({
  data,
  onRefresh,
  isOpen,
}: {
  data: WorkspacePayload
  onRefresh: () => Promise<void>
  isOpen: boolean
}) {
  const t = useTranslations('dashboard.workspace.config')
  const tSections = useTranslations('dashboard.workspace.sections')
  const tOwnership = useTranslations('dashboard.workspace.ownership')
  const locale = useLocale()
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasOpened, setHasOpened] = useState(false)

  const modelKey = data.financials.solarModel as SolarModelKey
  const cardModel: SolarModelKey = modelKey === 'solar-abo' ? 'solar-direct' : modelKey

  useEffect(() => {
    if (isOpen) setHasOpened(true)
  }, [isOpen])

  useEffect(() => {
    if (!hasOpened) return
    const filter = MODEL_FILTER[data.financials.solarModel as SolarModelKey]
    residentialCalculatorService
      .getPackages(locale, filter)
      .then(pkgs =>
        pkgs.length === 0 && filter === 'SOLAR_ABO'
          ? residentialCalculatorService.getPackages(locale, 'SOLAR_DIRECT').then(setPackages)
          : setPackages(pkgs)
      )
      .catch(() => setPackages([]))
  }, [hasOpened, locale, data.financials.solarModel])

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

  const saveOwnership = async (value: boolean) => {
    if (value === data.project.isPropertyOwner) return
    setSaving(true)
    setError(null)
    try {
      await residentialCalculatorService.updateCalculation({
        projectId: data.project.id,
        calculation: { isPropertyOwner: value },
      })
      await onRefresh()
    } catch {
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  const evOffer = data.package?.availableEvCharger ?? null
  const evDisplay = data.evCharger ?? evOffer
  const evSelected = data.evCharger != null

  return (
    <div className="relative">
      <div className={cn('space-y-10', saving && 'opacity-60 pointer-events-none')}>
        <p className="text-base text-pine/75">{tSections('configHelper')}</p>

        {packages.length > 1 && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-pine">{t('packagesTitle')}</h3>
              <p className="text-base text-pine/75">{t('packagesSubtitle')}</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
              {packages.map(pkg => (
                <CompactPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  model={cardModel}
                  isSelected={pkg.id === data.package?.id}
                  isRecommended={!data.packageRetired && pkg.id === data.package?.id}
                  onSelect={() => void selectPackage(pkg)}
                />
              ))}
            </div>
          </section>
        )}

        {evDisplay && (
          <section className="space-y-4">
            <h3 className="text-xl font-medium text-pine">{t('evTitle')}</h3>
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
                    <div className="text-base font-semibold uppercase tracking-wider text-[#036B53]">
                      {evDisplay.manufacturerName}
                    </div>
                    <div className="text-base font-semibold text-pine truncate">
                      {evDisplay.displayName}
                    </div>
                    <div className="mt-1 text-base font-semibold text-pine tabular-nums">
                      CHF {groupNumber(evDisplay.priceChf)}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {evSelected && (
                    <span className="inline-flex items-center gap-1.5 text-base font-medium text-[#036B53]">
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

        <section className="space-y-4">
          <h3 className="text-xl font-medium text-pine">{tOwnership('question')}</h3>
          <div className="rounded-xl bg-white border border-[#062E25]/10 px-5 py-6 sm:px-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="inline-flex rounded-full bg-[#F2F4E8] p-1">
                {[true, false].map(value => (
                  <button
                    key={String(value)}
                    type="button"
                    onClick={() => void saveOwnership(value)}
                    aria-pressed={data.project.isPropertyOwner === value}
                    className={cn(
                      'px-5 py-2 rounded-full text-base font-medium transition-colors',
                      data.project.isPropertyOwner === value
                        ? 'bg-[#062E25] text-white'
                        : 'text-[#062E25]'
                    )}
                  >
                    {value ? tOwnership('yes') : tOwnership('no')}
                  </button>
                ))}
              </div>
              <p className="max-w-md text-base text-pine/75">{tOwnership('helper')}</p>
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
