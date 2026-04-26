'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  Loader2,
  CheckCircle2,
  Download,
  Pencil,
  Check,
  X,
  ArrowRight,
  Mail,
  FileText,
  Sun,
  BatteryCharging,
  Car,
  Smartphone,
} from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { contractService } from '@/services/contract.service'
import { reportService } from '@/services/report.service'
import EnergyFlowDiagram from '../components/EnergyFlowDiagram'
import MonthlyAnalysisChart from '../components/MonthlyAnalysisChart'
import SignContractDialog from '../components/SignContractDialog'
import {
  DEFAULT_PPA_DISCOUNT_PCT,
  useSolarAboCalculatorStore,
} from '@/stores/solar-abo-calculator.store'
import {
  residentialCalculatorService,
  type CalculatorPackage,
  type SolarModelFilter,
} from '@/services/residential-calculator.service'
import { LinkButton } from '@/components/ui/link-button'

function getPanelSpecs(pkg: CalculatorPackage) {
  const panel = pkg.equipment.find(e => e.equipmentType === 'SOLAR_PANEL')
  return {
    panelWattageW: panel?.panelWattageW ?? null,
    panelAreaM2: panel?.panelAreaM2 ?? null,
    firstYearDegradationPercent:
      panel?.panelFirstYearDegradationPercent ?? null,
    annualDegradationPercent: panel?.panelAnnualDegradationPercent ?? null,
  }
}

function pickRecommendedPackage(
  packages: CalculatorPackage[],
  systemSizeKwp: number
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
  pkg: CalculatorPackage
) {
  const {
    panelWattageW,
    panelAreaM2,
    firstYearDegradationPercent,
    annualDegradationPercent,
  } = getPanelSpecs(pkg)
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

function SectionHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <header className="text-center max-w-xl mx-auto space-y-4 mb-8">
      <h2 className="text-4xl sm:text-[45px] font-medium text-[#062E25] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-xl font-light text-[#062E25]/80 tracking-tight">
          {subtitle}
        </p>
      )}
    </header>
  )
}

function ActionRow({
  icon,
  title,
  subtitle,
  buttonLabel,
  onClick,
  disabled,
  loading,
  done,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  buttonLabel: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  done?: boolean
}) {
  return (
    <div className="relative flex items-center gap-4 rounded-[30px] border border-[rgba(84,105,99,0.55)] bg-white/30 backdrop-blur-md px-5 py-3 shadow-[0_25px_34px_0_rgba(183,254,26,0.1)]">
      <span className="shrink-0 text-[#036B53]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium uppercase tracking-tight text-[#062E25]">
          {title}
        </p>
        <p className="text-sm italic font-light text-[#062E25]/80 tracking-tight truncate">
          {subtitle}
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[#062E25] bg-white/10 backdrop-blur px-4 py-2.5 text-sm font-medium text-[#062E25] hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {done && <CheckCircle2 className="w-4 h-4 text-[#036B53]" />}
        <span>{buttonLabel}</span>
      </button>
    </div>
  )
}

function BulletIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M5.01317 0.792524C5.41719 0.448221 5.6192 0.27607 5.83041 0.175118C6.31892 -0.0583728 6.88683 -0.0583728 7.37534 0.175118C7.58655 0.27607 7.78856 0.448221 8.19258 0.792524C8.35338 0.929558 8.43378 0.998074 8.51964 1.05563C8.71648 1.18755 8.93753 1.27912 9.17 1.32501C9.27142 1.34504 9.37672 1.35344 9.58732 1.37024C10.1165 1.41247 10.381 1.43358 10.6018 1.51155C11.1123 1.69187 11.5139 2.09345 11.6942 2.60398C11.7722 2.82471 11.7933 3.08928 11.8355 3.61843C11.8523 3.82903 11.8607 3.93433 11.8807 4.03574C11.9266 4.26821 12.0182 4.48926 12.1501 4.6861C12.2077 4.77197 12.2762 4.85237 12.4132 5.01317C12.7575 5.41719 12.9297 5.6192 13.0306 5.83041C13.2641 6.31892 13.2641 6.88683 13.0306 7.37534C12.9297 7.58655 12.7575 7.78856 12.4132 8.19258C12.2762 8.35338 12.2077 8.43378 12.1501 8.51965C12.0182 8.71648 11.9266 8.93753 11.8807 9.17C11.8607 9.27142 11.8523 9.37672 11.8355 9.58732C11.7933 10.1165 11.7722 10.381 11.6942 10.6018C11.5139 11.1123 11.1123 11.5139 10.6018 11.6942C10.381 11.7722 10.1165 11.7933 9.58732 11.8355C9.37672 11.8523 9.27142 11.8607 9.17 11.8807C8.93753 11.9266 8.71648 12.0182 8.51965 12.1501C8.43378 12.2077 8.35338 12.2762 8.19258 12.4132C7.78856 12.7575 7.58655 12.9297 7.37534 13.0306C6.88683 13.2641 6.31892 13.2641 5.83041 13.0306C5.6192 12.9297 5.41719 12.7575 5.01317 12.4132C4.85237 12.2762 4.77197 12.2077 4.6861 12.1501C4.48926 12.0182 4.26821 11.9266 4.03574 11.8807C3.93433 11.8607 3.82903 11.8523 3.61843 11.8355C3.08928 11.7933 2.82471 11.7722 2.60398 11.6942C2.09345 11.5139 1.69187 11.1123 1.51155 10.6018C1.43358 10.381 1.41247 10.1165 1.37024 9.58732C1.35344 9.37672 1.34504 9.27142 1.32501 9.17C1.27912 8.93753 1.18755 8.71648 1.05563 8.51964C0.998074 8.43378 0.929558 8.35338 0.792524 8.19258C0.448221 7.78856 0.27607 7.58655 0.175118 7.37534C-0.0583728 6.88683 -0.0583728 6.31892 0.175118 5.83041C0.27607 5.6192 0.448221 5.41719 0.792524 5.01317C0.929558 4.85237 0.998074 4.77197 1.05563 4.6861C1.18755 4.48926 1.27912 4.26821 1.32501 4.03574C1.34504 3.93433 1.35344 3.82903 1.37024 3.61843C1.41247 3.08928 1.43358 2.82471 1.51155 2.60398C1.69187 2.09345 2.09345 1.69187 2.60398 1.51155C2.82471 1.43358 3.08928 1.41247 3.61843 1.37024C3.82903 1.35344 3.93433 1.34504 4.03574 1.32501C4.26821 1.27912 4.48926 1.18755 4.6861 1.05563C4.77197 0.998074 4.85237 0.929558 5.01317 0.792524Z"
        fill="#036B53"
      />
      <path
        d="M4.0957 6.95421L5.52872 8.38723L9.11126 4.80469"
        stroke="white"
        strokeWidth="0.943267"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SpecItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[#036B53]">{icon}</span>
      <div className="min-w-0 flex flex-col">
        <span className="text-base font-bold text-[#062E25] tracking-tight truncate">
          {value}
        </span>
        <span className="text-base font-light text-[#062E25]/80 tracking-tight truncate">
          {label}
        </span>
      </div>
    </div>
  )
}

function EyebrowPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-[#B7FE1A] border border-[#809792]/70 px-4 py-2 text-base font-light text-[#062E25] tracking-tight">
      {children}
    </span>
  )
}

function GlassStatCard({
  badge,
  value,
  subtitle,
  ready,
}: {
  badge?: string
  value: string
  subtitle: string
  ready: boolean
}) {
  return (
    <div className="relative rounded-[10px] border border-[rgba(84,105,99,0.55)] bg-white/30 backdrop-blur-md px-6 h-[180px] sm:h-[200px] flex flex-col items-center justify-center text-center">
      {badge && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <EyebrowPill>{badge}</EyebrowPill>
        </span>
      )}
      {ready ? (
        <>
          <div className="text-3xl sm:text-5xl font-semibold text-[#062E25] tabular-nums">
            {value}
          </div>
          <p className="mt-3 text-base sm:text-xl font-light text-[#062E25]/90 tracking-tight">
            {subtitle}
          </p>
        </>
      ) : (
        <>
          <div className="h-10 w-48 rounded bg-[#062E25]/10 animate-pulse" />
          <div className="mt-3 h-5 w-32 rounded bg-[#062E25]/10 animate-pulse" />
        </>
      )}
    </div>
  )
}

export default function StepResults() {
  const t = useTranslations('solarAboCalculator.results.solarFree')
  const tActions = useTranslations('solarAboCalculator.results.actions')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const locale = useLocale()
  const store = useSolarAboCalculatorStore()

  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [offerRequesting, setOfferRequesting] = useState(false)
  const [offerRequested, setOfferRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [signDialogOpen, setSignDialogOpen] = useState(false)
  const [signingEnabled, setSigningEnabled] = useState(true)
  const [consumptionEditing, setConsumptionEditing] = useState(false)
  const [consumptionDraft, setConsumptionDraft] = useState('')

  useEffect(() => {
    let cancelled = false
    contractService
      .getSigningConfig()
      .then((cfg) => {
        if (!cancelled) setSigningEnabled(cfg.enabled)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const annualProduction = store.getAnnualProduction()
  const annualSavings = store.getAnnualPpaSavings()
  const selfConsumptionRate = store.getSelfConsumptionRate()
  const co2Savings = store.getCo2Savings()
  const systemSizeKwp = store.getSystemSizeKwp()
  const panelCount = store.getEstimatedPanelCount()
  const selectedArea = store.getSelectedArea()
  const monthlyProduction = store.getMonthlyProduction()
  const estimatedConsumption = store.getEstimatedConsumption()
  const electricityPriceChfKwh = store.getElectricityPriceChfKwh()
  const ppaDiscountPercent =
    store.selectedPackageElectricitySavingsPercent ?? DEFAULT_PPA_DISCOUNT_PCT
  const feedInTariffChfKwh = store.feedInTariffRate?.chfPerKwh ?? null
  const panelDataReady =
    !packagesLoading &&
    store.selectedPanelWattageW != null &&
    store.selectedPanelAreaM2 != null &&
    feedInTariffChfKwh != null

  useEffect(() => {
    const solarModel = useSolarAboCalculatorStore.getState().solarModel
    const apiSolarModel: SolarModelFilter = solarModel === 'solar-direct' ? 'SOLAR_DIRECT' : 'SOLAR_FREE'
    residentialCalculatorService
      .getPackages(locale, apiSolarModel)
      .then(data => {
        setPackages(data)
        const hasValidSelection =
          store.selectedPackageId &&
          data.some(p => p.id === store.selectedPackageId)
        if (data.length > 0 && !hasValidSelection) {
          applyPackageToStore(store.setSelectedPackage, data[0])
          const realKwp = useSolarAboCalculatorStore
            .getState()
            .getSystemSizeKwp()
          const recommended = pickRecommendedPackage(data, realKwp) || data[0]
          if (recommended.id !== data[0].id) {
            applyPackageToStore(store.setSelectedPackage, recommended)
          }
        }
      })
      .catch(() => {})
      .finally(() => setPackagesLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  useEffect(() => {
    store.fetchElectricityPriceForAddress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.address])

  useEffect(() => {
    store.fetchFeedInTariff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedPkg = packages.find(p => p.id === store.selectedPackageId)
  const equipmentWithNames = selectedPkg?.equipment.filter(e => e.name) || []
  const recommendedPkg = pickRecommendedPackage(packages, systemSizeKwp)
  const tPackageSelector = useTranslations(
    'solarAboCalculator.results.solarFree.packageSelector'
  )

  const handleDownloadReport = async () => {
    if (
      !panelDataReady ||
      store.selectedPanelWattageW == null ||
      feedInTariffChfKwh == null
    )
      return
    setDownloading(true)
    setError(null)
    try {
      const segments = store.getSelectedSegments()
      const avgTilt =
        segments.length > 0
          ? segments.reduce((sum, s) => sum + s.tilt, 0) / segments.length
          : 30
      const avgAzimuth =
        segments.length > 0
          ? segments.reduce((sum, s) => sum + s.azimuth, 0) / segments.length
          : 180

      await reportService.downloadSonnendachReport({
        latitude: store.building?.center.lat || 0,
        longitude: store.building?.center.lng || 0,
        address: store.address,
        customerName:
          `${store.contact.firstName} ${store.contact.lastName}`.trim() ||
          undefined,
        customerEmail: store.contact.email || undefined,
        customerPhone: store.contact.phoneNumber || undefined,
        panelCount,
        panelPower: store.selectedPanelWattageW,
        roofArea: Math.round(selectedArea),
        roofImage: store.roofImage || undefined,
        orientation: avgAzimuth,
        tilt: avgTilt,
        yearlyProduction: annualProduction,
        monthlyProduction,
        dailyAverage: Math.round(annualProduction / 365),
        co2Reduction: co2Savings,
        solarModel: 'solar-free',
        ppaDiscountPercent,
        contractTermYears:
          selectedPkg?.contractTermYears ??
          store.selectedPackageContractTermYears ??
          35,
        annualSavings,
        electricityTariff: electricityPriceChfKwh,
        feedInTariff: feedInTariffChfKwh,
        panelFirstYearDegradationPercent:
          store.selectedPanelFirstYearDegradationPercent,
        panelAnnualDegradationPercent:
          store.selectedPanelAnnualDegradationPercent,
        selfConsumptionRate,
        annualConsumption: estimatedConsumption,
        equipment: equipmentWithNames.map(e => ({
          type: e.equipmentType,
          name: e.name,
          quantity: e.quantity,
          imageUrl: e.imageUrl || undefined,
        })),
        householdSize: store.householdSize || undefined,
        language: (locale as 'de' | 'en' | 'fr' | 'it' | 'sr' | 'es') || 'de',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  const handleEmailReport = async () => {
    setEmailSending(true)
    setError(null)
    try {
      await store.emailReport()
      setEmailSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setEmailSending(false)
    }
  }

  const handleRequestOffer = async () => {
    setOfferRequesting(true)
    setError(null)
    try {
      await store.requestOffer()
      setOfferRequested(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to request offer')
    } finally {
      setOfferRequesting(false)
    }
  }

  const fmt = (n: number) => Math.round(n).toLocaleString('de-CH')
  const selfSufficientPct = Math.round(selfConsumptionRate * 100)
  const consumptionIsOverride = store.consumptionOverrideKwh != null

  const startConsumptionEdit = () => {
    setConsumptionDraft(String(estimatedConsumption))
    setConsumptionEditing(true)
  }

  const saveConsumptionEdit = () => {
    const parsed = Number(consumptionDraft.replace(/[^\d.]/g, ''))
    if (Number.isFinite(parsed) && parsed > 0) {
      store.setConsumptionOverride(parsed)
    }
    setConsumptionEditing(false)
  }

  const cancelConsumptionEdit = () => {
    setConsumptionEditing(false)
  }

  const resetConsumptionOverride = () => {
    store.setConsumptionOverride(null)
    setConsumptionEditing(false)
  }

  return (
    <>
      {store.roofImage ? (
        <div className="relative w-full h-[340px] sm:h-[440px] lg:h-[520px] overflow-hidden">
          <Image
            src={store.roofImage}
            alt={store.address || 'Your roof'}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#062E25]/40 to-transparent pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#062E25]/85 to-transparent pointer-events-none"
          />
          {store.address && (
            <div className="absolute inset-x-0 bottom-0 px-4 sm:px-8 pb-6 sm:pb-8">
              <p className="max-w-4xl mx-auto text-lg sm:text-xl font-medium text-white">
                {store.address}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[88px] sm:h-[100px]" aria-hidden />
      )}

      <div className="container mx-auto px-4 pb-28 max-w-4xl pt-8">
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-5 pt-4">
            <GlassStatCard
              badge={t('yourSystem.label')}
              value={t('yourSystem.valueLine', {
                kwp: systemSizeKwp.toFixed(1),
                kwh: fmt(annualProduction),
              })}
              subtitle={t('yourSystem.panelsPerYear', { count: panelCount })}
              ready={panelDataReady}
            />
            <GlassStatCard
              badge={t('yourYearlySaving.label')}
              value={t('yourYearlySaving.amount', {
                amount: fmt(annualSavings),
              })}
              subtitle={t('yourYearlySaving.suffix')}
              ready={panelDataReady}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div aria-hidden />
            <div className="flex flex-col items-center gap-2 text-center">
              {consumptionEditing ? (
                <div className="inline-flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    value={consumptionDraft}
                    onChange={e =>
                      setConsumptionDraft(e.target.value.replace(/[^\d]/g, ''))
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveConsumptionEdit()
                      if (e.key === 'Escape') cancelConsumptionEdit()
                    }}
                    className="text-base font-medium text-[#062E25] tabular-nums bg-transparent border-b border-[#062E25]/40 focus:border-[#062E25] outline-none w-24 text-right"
                  />
                  <span className="text-base text-[#062E25]/70">kWh</span>
                  <button
                    type="button"
                    onClick={saveConsumptionEdit}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
                    aria-label={t('yourYearlySaving.consumptionSave')}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelConsumptionEdit}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#062E25]/30 text-[#062E25] hover:bg-[#062E25]/5"
                    aria-label={t('yourYearlySaving.consumptionCancel')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startConsumptionEdit}
                  className="inline-flex items-center gap-1.5 text-base font-light italic text-[#0E3925]/80 tracking-tight hover:text-[#0E3925] group"
                >
                  {t('yourYearlySaving.consumptionBasedOn', {
                    kwh: fmt(estimatedConsumption),
                  })}
                  <Pencil className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </button>
              )}
              <p className="text-base font-light italic text-[#0E3925]/80 tracking-tight">
                {t('yourYearlySaving.footnote')}
              </p>
              {consumptionIsOverride && !consumptionEditing && (
                <button
                  type="button"
                  onClick={resetConsumptionOverride}
                  className="text-sm text-[#062E25]/60 hover:text-[#062E25] underline underline-offset-4"
                >
                  {t('yourYearlySaving.consumptionReset')}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-10 sm:hidden">
            <EyebrowPill>{t('yourImpact.label')}</EyebrowPill>
          </div>
          <div className="relative mt-5 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
            <span className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:inline-flex">
              <EyebrowPill>{t('yourImpact.label')}</EyebrowPill>
            </span>
            <GlassStatCard
              value={t('yourImpact.co2Value', { kg: fmt(co2Savings) })}
              subtitle={t('yourImpact.co2Subtitle')}
              ready={panelDataReady}
            />
            <GlassStatCard
              value={`~${selfSufficientPct}%`}
              subtitle={t('yourImpact.selfSufficientSubtitle')}
              ready={panelDataReady}
            />
          </div>
        </section>

        {!packagesLoading && packages.length > 1 && (
          <section className="mt-16">
            <SectionHeader
              title={tPackageSelector('sectionTitle')}
              subtitle={tPackageSelector('sectionSubtitle')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
              {packages.map(pkg => {
                const isSelected = pkg.id === store.selectedPackageId
                const isRecommended = pkg.id === recommendedPkg?.id
                const batteryEquip = pkg.equipment.find(
                  e =>
                    e.equipmentType === 'BATTERY' ||
                    e.equipmentType === 'BATTERY_STORAGE'
                )
                const hasBattery = batteryEquip != null
                const batteryKwhMatch =
                  batteryEquip?.name.match(/(\d+(?:[.,]\d+)?)\s*kWh/i)
                const batteryKwh = batteryKwhMatch
                  ? batteryKwhMatch[1].replace(',', '.')
                  : null

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() =>
                      applyPackageToStore(store.setSelectedPackage, pkg)
                    }
                    aria-pressed={isSelected}
                    className={cn(
                      'relative rounded-[10px] bg-[#FDFEFA] p-6 flex flex-col text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]',
                      isRecommended
                        ? 'border border-[#062E25]'
                        : 'border border-[rgba(84,105,99,0.5)]',
                      isSelected && !isRecommended && 'ring-2 ring-[#062E25]',
                      'hover:shadow-[0_8px_24px_rgba(6,46,37,0.08)]'
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#036B53] px-4 py-2 text-base font-light text-white whitespace-nowrap shadow-[0_4px_12px_rgba(3,107,83,0.25)]">
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                        {tPackageSelector('recommended')}
                      </span>
                    )}

                    <div className="relative -mt-6 -mx-6 mb-5 aspect-video rounded-t-[10px] overflow-hidden bg-gradient-to-br from-[#F5F7EE] to-[#DCE9E6] flex items-center justify-center">
                      {pkg.imageUrl ? (
                        <Image
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Sun
                          className="w-12 h-12 text-[#036B53]/50"
                          strokeWidth={1.25}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      {pkg.description && (
                        <p className="text-base font-light text-[#062E25]/80 tracking-tight">
                          {pkg.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-start gap-2 text-base text-[#062E25]">
                        <span className="mt-1.5">
                          <BulletIcon />
                        </span>
                        <span className="font-light tracking-tight">
                          {t('whatsIncluded.footnote')}
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
                        {pkg.minCapacityKwp != null &&
                          pkg.maxCapacityKwp != null && (
                            <SpecItem
                              icon={
                                <Sun className="w-6 h-6" strokeWidth={1.75} />
                              }
                              value={tPackageSelector('capacityRange', {
                                min: pkg.minCapacityKwp,
                                max: pkg.maxCapacityKwp,
                              })}
                              label={tPackageSelector('specPv')}
                            />
                          )}
                        {hasBattery && batteryKwh != null && (
                          <SpecItem
                            icon={
                              <BatteryCharging
                                className="w-6 h-6"
                                strokeWidth={1.75}
                              />
                            }
                            value={`${batteryKwh} kWh`}
                            label={tPackageSelector('specBattery')}
                          />
                        )}
                        <SpecItem
                          icon={
                            <Car className="w-6 h-6" strokeWidth={1.75} />
                          }
                          value={tPackageSelector('specEvValue')}
                          label={tPackageSelector('specEvLabel')}
                        />
                        <SpecItem
                          icon={
                            <Smartphone
                              className="w-6 h-6"
                              strokeWidth={1.75}
                            />
                          }
                          value="App &"
                          label={tPackageSelector('specMonitoring').replace(
                            /^App\s*&\s*/,
                            ''
                          )}
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-[#062E25]">
                        <span className="flex items-center gap-1.5">
                          <BulletIcon />
                          <span className="font-light tracking-tight">
                            {tPackageSelector('featureNoInvestment')}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BulletIcon />
                          <span className="font-light tracking-tight">
                            {tPackageSelector('featureCheapElectricity')}
                          </span>
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {!packagesLoading && equipmentWithNames.length > 0 && (
          <div className="mt-16">
            <SectionHeader
              title={t('whatsIncluded.label')}
              subtitle={t('whatsIncluded.subtitle')}
            />
            <div className="rounded-xl bg-white/60 border border-[#062E25]/10 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {equipmentWithNames.map((eq, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center"
                  >
                    {eq.imageUrl ? (
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                        <Image
                          src={eq.imageUrl}
                          alt={eq.name}
                          fill
                          className="object-contain p-4"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square rounded-xl flex items-center justify-center">
                        <span className="w-3 h-3 rounded-full bg-[#062E25]/40" />
                      </div>
                    )}
                    <p className="mt-3 text-base text-[#062E25]">{eq.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-16">
          <SectionHeader
            title={t('energyFlow.label')}
            subtitle={t('energyFlow.subtitle')}
          />
          <EnergyFlowDiagram
            annualProduction={annualProduction}
            estimatedConsumption={estimatedConsumption}
            selfConsumptionRate={selfConsumptionRate}
          />
        </div>

        <div className="mt-16">
          <SectionHeader
            title={t('monthly.label')}
            subtitle={t('monthly.subtitle')}
          />
          <MonthlyAnalysisChart
            monthlyProduction={monthlyProduction}
            estimatedConsumption={estimatedConsumption}
            selfConsumptionRate={selfConsumptionRate}
          />
        </div>

        {error && (
          <div className="mt-6 text-base text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <section className="mt-16">
          <div
            className="flex flex-col items-center text-center gap-5"
            aria-disabled={!signingEnabled}
          >
            <EyebrowPill>{tActions('contractTitle')}</EyebrowPill>
            <h2 className="text-5xl lg:text-[65px] font-medium text-[#062E25] tracking-tight">
              {tActions('contractTitle')}
            </h2>
            <p className="text-base sm:text-xl font-light text-[#062E25]/80 tracking-tight max-w-md">
              {tActions('contractHeroSubtitle')}
            </p>
            <button
              type="button"
              onClick={() => setSignDialogOpen(true)}
              disabled={!signingEnabled}
              aria-disabled={!signingEnabled}
              title={
                signingEnabled
                  ? tActions('contractButton')
                  : tActions('contractInReviewLabel')
              }
              className={cn(
                'mt-2 inline-flex items-center gap-3 rounded-full bg-[#B7FE1A] pl-6 pr-1.5 py-1.5 text-base font-medium text-[#062E25] tracking-tight transition-opacity',
                signingEnabled
                  ? 'hover:opacity-90 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              )}
            >
              {tActions('contractButton')}
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#062E25] text-[#B7FE1A]">
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </span>
            </button>
            {!signingEnabled && (
              <span className="text-sm font-medium uppercase tracking-widest text-[#062E25]/60">
                {tActions('contractInReviewLabel')}
              </span>
            )}
            <div className="mt-2 flex items-center gap-3">
              <p className="text-base font-light italic text-[#062E25]/80 tracking-tight">
                {tActions('swisscomNote')}
              </p>
              <Image
                src="/images/swisscom-logo.png"
                alt="Swisscom"
                width={122}
                height={33}
                className="h-7 w-auto"
                unoptimized
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <ActionRow
              icon={<Download className="w-6 h-6" strokeWidth={1.75} />}
              title={tActions('reportTitle')}
              subtitle={tActions('reportDescription')}
              buttonLabel={tActions('reportButton')}
              onClick={handleDownloadReport}
              disabled={downloading || !panelDataReady}
              loading={downloading}
            />
            <ActionRow
              icon={<Mail className="w-6 h-6" strokeWidth={1.75} />}
              title={tActions('downloadTitle')}
              subtitle={tActions('downloadDescription')}
              buttonLabel={
                emailSent ? tActions('emailSent') : tActions('downloadButton')
              }
              onClick={handleEmailReport}
              disabled={emailSending || emailSent}
              loading={emailSending}
              done={emailSent}
            />
            <ActionRow
              icon={<FileText className="w-6 h-6" strokeWidth={1.75} />}
              title={tActions('offerTitle')}
              subtitle={tActions('offerDescription')}
              buttonLabel={
                offerRequested ? tActions('offerSent') : tActions('offerButton')
              }
              onClick={handleRequestOffer}
              disabled={offerRequesting || offerRequested}
              loading={offerRequesting}
              done={offerRequested}
            />
          </div>
        </section>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4"
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            onClick={store.prevStep}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
        </div>

        <SignContractDialog
          open={signDialogOpen}
          onOpenChange={setSignDialogOpen}
        />
      </div>
    </>
  )
}
