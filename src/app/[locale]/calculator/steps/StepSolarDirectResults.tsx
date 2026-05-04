'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import {
  residentialCalculatorService,
  type CalculatorPackage,
} from '@/services/residential-calculator.service'
import HeatPumpInterestStrip from '../components/HeatPumpInterestStrip'
import PackageCard from '@/components/order/PackageCard'
import { EquipmentList } from '../components/EquipmentList'
import { type EquipmentDetail } from '../components/EquipmentDetailCard'
import { PurchaseFinancialSummary } from '../components/PurchaseFinancialSummary'
import { SubsidyAssistanceCallout } from '../components/SubsidyAssistanceCallout'
import { WarrantyCallout } from '../components/WarrantyCallout'
import SignContractDialog from '../components/SignContractDialog'

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

export default function StepSolarDirectResults() {
  const t = useTranslations('solarAboCalculator.results.solarDirect')
  const locale = useLocale()
  const store = useSolarAboCalculatorStore()
  const [signOpen, setSignOpen] = useState(false)
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)

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

  useEffect(() => {
    store.fetchSubsidyRate()
  }, [])

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

  const annualSavings = store.getAnnualSavings()
  const estimatedSubsidy = store.getSubsidyAmount()
  const grossPrice = selectedPkg?.purchasePriceChf ?? 0
  const netPrice = store.getEstimatedNetPrice(
    { purchasePriceChf: selectedPkg?.purchasePriceChf ?? null },
    estimatedSubsidy,
  )
  const paybackYears = store.getPaybackYears(netPrice, annualSavings)
  const lifetime = store.getLifetimeSavings25y(annualSavings, netPrice)

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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {orderedPackages.map(pkg => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                model="solar-direct"
                locale={locale}
                isSelected={pkg.id === store.selectedPackageId}
                onSelect={() => applyPackageToStore(store.setSelectedPackage, pkg)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <HeatPumpInterestStrip />

      {selectedPkg ? (
        <PurchaseFinancialSummary
          grossPriceChf={grossPrice}
          estimatedSubsidyChf={estimatedSubsidy > 0 ? estimatedSubsidy : null}
          estimatedNetPriceChf={netPrice}
          annualSavingsChf={annualSavings}
          paybackYears={paybackYears}
          lifetimeSavings25y={lifetime}
        />
      ) : null}

      <SubsidyAssistanceCallout />

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

      <footer className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setSignOpen(true)}
          disabled={!selectedPkg}
          className="rounded-full bg-[#062E25] px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t('signContract')}
        </button>
      </footer>

      <SignContractDialog open={signOpen} onOpenChange={setSignOpen} />
    </div>
  )
}
