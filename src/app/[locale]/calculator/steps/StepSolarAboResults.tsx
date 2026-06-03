'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import {
  residentialCalculatorService,
  type CalculatorPackage,
} from '@/services/residential-calculator.service'
import EvChargerPicker from '../components/EvChargerPicker'
import HeatPumpInterestStrip from '../components/HeatPumpInterestStrip'
import CompactPackageCard from '@/components/order/CompactPackageCard'
import { EquipmentList } from '../components/EquipmentList'
import { type EquipmentDetail } from '../components/EquipmentDetailCard'
import { AboFinancialSummary } from '../components/AboFinancialSummary'
import { WarrantyCallout } from '../components/WarrantyCallout'

function getEquipmentCategory(
  equipmentType: string,
): EquipmentDetail['category'] | null {
  switch (equipmentType) {
    case 'SOLAR_PANEL':
      return 'PANEL'
    case 'INVERTER':
      return 'INVERTER'
    case 'BATTERY':
    case 'BATTERY_STORAGE':
      return 'BATTERY'
    case 'MOUNTING_SYSTEM':
      return 'MOUNTING'
    case 'EMS':
      return 'EMS'
    case 'HEAT_PUMP':
      return 'HEAT_PUMP'
    default:
      return null
  }
}

function mapPackageEquipment(pkg: CalculatorPackage | undefined): EquipmentDetail[] {
  if (!pkg) return []
  return pkg.equipment
    .map(item => {
      const category = getEquipmentCategory(item.equipmentType)
      if (!category) return null
      const specs: Record<string, string | number> = {}
      if (item.panelWattageW) specs.peakPowerW = item.panelWattageW
      const detail: EquipmentDetail = {
        category,
        brand: '',
        model: item.name ?? item.equipmentType,
        imageUrl: item.imageUrl ?? null,
        quantity: item.quantity,
        specs,
      }
      return detail
    })
    .filter((d): d is EquipmentDetail => d !== null)
}

function summarizeProductWarranties(items: EquipmentDetail[]): string {
  const ws = items
    .filter(i => i.warranty)
    .map(i => {
      const perf = i.warranty!.performanceYears
        ? `/${i.warranty!.performanceYears}y perf.`
        : ''
      return `${i.model} ${i.warranty!.years}y${perf}`
    })
  return ws.join(' · ')
}

function getPanelSpecs(pkg: CalculatorPackage) {
  const panel = pkg.equipment.find(e => e.equipmentType === 'SOLAR_PANEL')
  return {
    panelWattageW: panel?.panelWattageW ?? null,
    panelAreaM2: panel?.panelAreaM2 ?? null,
    firstYearDegradationPercent: panel?.panelFirstYearDegradationPercent ?? null,
    annualDegradationPercent: panel?.panelAnnualDegradationPercent ?? null,
  }
}

function pickRecommendedPackage(
  packages: CalculatorPackage[],
  systemSizeKwp: number,
): CalculatorPackage | null {
  if (packages.length === 0) return null
  const inRange = packages.find(p => {
    const min = p.minCapacityKwp ?? -Infinity
    const max = p.maxCapacityKwp ?? Infinity
    return systemSizeKwp >= min && systemSizeKwp <= max
  })
  if (inRange) return inRange
  const withDistance = packages.map(p => {
    const min = p.minCapacityKwp ?? 0
    const max = p.maxCapacityKwp ?? min
    const mid = (min + max) / 2
    return { pkg: p, distance: Math.abs(systemSizeKwp - mid) }
  })
  withDistance.sort((a, b) => a.distance - b.distance)
  return withDistance[0].pkg
}

function applyPackageToStore(
  setFn: (
    id: string,
    code: string,
    pricePerKwp: number | null,
    panelWattageW?: number | null,
    panelAreaM2?: number | null,
    electricitySavingsPercent?: number | null,
    contractTermYears?: number | null,
    firstYearDegradationPercent?: number | null,
    annualDegradationPercent?: number | null,
    purchasePriceChf?: number | null,
    installerWarrantyYears?: number | null,
  ) => void,
  pkg: CalculatorPackage,
) {
  const { panelWattageW, panelAreaM2, firstYearDegradationPercent, annualDegradationPercent } =
    getPanelSpecs(pkg)
  setFn(
    pkg.id,
    pkg.code,
    pkg.pricePerKwp,
    panelWattageW,
    panelAreaM2,
    pkg.electricitySavingsPercent ?? null,
    pkg.contractTermYears ?? null,
    firstYearDegradationPercent,
    annualDegradationPercent,
    pkg.purchasePriceChf ?? null,
    pkg.installerWarrantyYears ?? null,
  )
}

export default function StepSolarAboResults() {
  const t = useTranslations('solarAboCalculator.results.solarAboPlan')
  const tPicker = useTranslations('solarAboCalculator.results.evChargerPicker')
  const locale = useLocale()
  const store = useSolarAboCalculatorStore()
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [offerSending, setOfferSending] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)

  const handleRequestOffer = async () => {
    setOfferSending(true)
    setOfferError(null)
    try {
      await store.requestOffer()
      setOfferSent(true)
    } catch {
      setOfferError(t('requestOfferError'))
    } finally {
      setOfferSending(false)
    }
  }

  useEffect(() => {
    residentialCalculatorService
      .getPackages(locale, 'SOLAR_DIRECT')
      .then(data => {
        setPackages(data)
        const hasValidSelection =
          store.selectedPackageId && data.some(p => p.id === store.selectedPackageId)
        if (data.length > 0 && !hasValidSelection) {
          const realKwp = useSolarAboCalculatorStore.getState().getSystemSizeKwp()
          const recommended = pickRecommendedPackage(data, realKwp) ?? data[0]
          applyPackageToStore(store.setSelectedPackage, recommended)
        }
      })
      .catch(() => {})
      .finally(() => setPackagesLoading(false))
  }, [locale])

  const selectedPkg = useMemo(
    () => packages.find(p => p.id === store.selectedPackageId) ?? undefined,
    [packages, store.selectedPackageId],
  )

  const systemSizeKwp = store.getSystemSizeKwp()
  const recommendedPkg = useMemo(
    () => pickRecommendedPackage(packages, systemSizeKwp),
    [packages, systemSizeKwp],
  )
  const orderedPackages = useMemo(
    () =>
      recommendedPkg
        ? [recommendedPkg, ...packages.filter(p => p.id !== recommendedPkg.id)]
        : packages,
    [packages, recommendedPkg],
  )

  const evChargerTotal = store.getEvChargerTotalChf()
  const aboTotal = store.getAboTotalChf()
  const aboMonthly = store.getAboMonthlyChf()
  const includedItems = t.raw('included') as string[]
  const excludedItems = t.raw('excluded') as string[]

  const equipmentItems = useMemo(() => mapPackageEquipment(selectedPkg), [selectedPkg])

  if (packagesLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F5F7EE] py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#062E25] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-6 bg-[#F5F7EE] px-4 py-6 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-[#062E25] sm:text-3xl">{t('title')}</h1>
        <p className="text-sm text-[#062E25]/70 sm:text-base">{t('subtitle')}</p>
      </header>

      {packages.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-[#062E25]">{t('chooseYourPackage')}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {orderedPackages.map(pkg => (
              <CompactPackageCard
                key={pkg.id}
                pkg={pkg}
                model="solar-abo"
                isSelected={pkg.id === store.selectedPackageId}
                isRecommended={pkg.id === recommendedPkg?.id}
                onSelect={() => {
                  store.clearEvCharger()
                  applyPackageToStore(store.setSelectedPackage, pkg)
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <EvChargerPicker charger={selectedPkg?.availableEvCharger ?? null} />

      <HeatPumpInterestStrip />

      {selectedPkg ? (
        <AboFinancialSummary
          monthlyChf={aboMonthly}
          totalChf={aboTotal}
          included={includedItems}
          excluded={excludedItems}
          addOnLabel={evChargerTotal > 0 ? tPicker('title') : undefined}
          addOnChf={evChargerTotal > 0 ? Math.round(evChargerTotal * 1.35) : undefined}
        />
      ) : null}

      {selectedPkg && equipmentItems.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-[#062E25]">{t('whatsIncluded')}</h2>
          <EquipmentList items={equipmentItems} />
        </section>
      ) : null}

      {selectedPkg ? (
        <WarrantyCallout
          installerYears={selectedPkg.installerWarrantyYears ?? 2}
          productSummary={summarizeProductWarranties(equipmentItems)}
        />
      ) : null}

      <section className="rounded-2xl border border-[#062E25]/15 bg-white/80 p-5 backdrop-blur-sm sm:p-6">
        {offerSent ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
            <div>
              <h3 className="text-base font-semibold text-[#062E25] sm:text-lg">
                {t('requestOfferSent')}
              </h3>
              <p className="mt-1 text-sm text-[#062E25]/70 sm:text-base">
                {t('requestOfferSentMessage')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#062E25] sm:text-lg">
                {t('requestOfferTitle')}
              </h3>
              <p className="mt-1 text-sm text-[#062E25]/70 sm:text-base">
                {t('requestOfferDescription')}
              </p>
              {offerError ? (
                <p className="mt-2 text-sm text-destructive">{offerError}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleRequestOffer}
              disabled={!selectedPkg || offerSending}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#062E25] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#062E25]/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {offerSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('requestOfferSending')}
                </>
              ) : (
                t('requestOfferButton')
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
