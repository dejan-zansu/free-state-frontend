'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2, CheckCircle2, Download, Pencil, Check, X } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
} from '@/services/residential-calculator.service'

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
  const [consumptionEditing, setConsumptionEditing] = useState(false)
  const [consumptionDraft, setConsumptionDraft] = useState('')

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
    residentialCalculatorService
      .getPackages(locale)
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
          const recommended =
            pickRecommendedPackage(data, realKwp) || data[0]
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
        <div>
          <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
            {t('yourSystem.label')}
          </p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div>
            {panelDataReady ? (
              <>
                <div className="text-2xl font-semibold text-[#062E25] tabular-nums">
                  {t('yourSystem.size', { kwp: systemSizeKwp.toFixed(1) })}
                </div>
                <div className="text-base text-[#062E25]/50">
                  {t('yourSystem.panels', { count: panelCount })}
                </div>
              </>
            ) : (
              <>
                <div className="h-8 w-32 rounded bg-[#062E25]/10 animate-pulse" />
                <div className="mt-2 h-5 w-24 rounded bg-[#062E25]/10 animate-pulse" />
              </>
            )}
          </div>
          <div>
            <div className="text-2xl font-semibold text-[#062E25] tabular-nums">
              {t('yourSystem.production', { kwh: fmt(annualProduction) })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-[#062E25] text-white p-6 sm:p-8">
        <p className="text-base font-medium text-white/60 uppercase tracking-wider mb-2">
          {t('yourYearlySaving.label')}
        </p>
        {panelDataReady ? (
          <>
            <div className="text-4xl sm:text-5xl font-bold tabular-nums">
              {t('yourYearlySaving.amount', { amount: fmt(annualSavings) })}
            </div>
            <p className="mt-2 text-base text-white/80">
              {t('yourYearlySaving.suffix')}
            </p>
            <p className="mt-4 text-base text-[#B7FE1A]">
              {t('yourYearlySaving.footnote')}
            </p>
          </>
        ) : (
          <>
            <div className="h-14 w-56 rounded bg-white/10 animate-pulse" />
            <div className="mt-3 h-5 w-40 rounded bg-white/10 animate-pulse" />
            <div className="mt-5 h-5 w-48 rounded bg-white/10 animate-pulse" />
          </>
        )}
      </div>

      <div className="mt-8">
        <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
          {t('yourImpact.label')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/60 border border-[#062E25]/10 p-4">
            <div className="text-xl font-semibold text-[#062E25]">
              {t('yourImpact.co2', { kg: fmt(co2Savings) })}
            </div>
          </div>
          <div className="rounded-xl bg-white/60 border border-[#062E25]/10 p-4">
            <div className="text-xl font-semibold text-[#062E25]">
              {t('yourImpact.selfSufficient', { pct: selfSufficientPct })}
            </div>
          </div>
        </div>
      </div>

      {!packagesLoading && packages.length > 1 && (
        <div className="mt-8">
          <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
            {tPackageSelector('label')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map(pkg => {
              const isSelected = pkg.id === store.selectedPackageId
              const isRecommended = pkg.id === recommendedPkg?.id
              const min = pkg.minCapacityKwp
              const max = pkg.maxCapacityKwp
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() =>
                    applyPackageToStore(store.setSelectedPackage, pkg)
                  }
                  className={cn(
                    'text-left rounded-xl border p-4 transition-colors relative',
                    isSelected
                      ? 'border-[#062E25] bg-white'
                      : 'border-[#062E25]/10 bg-white/60 hover:bg-white'
                  )}
                >
                  {isRecommended && (
                    <span className="absolute top-2 right-2 text-sm font-medium px-2 py-0.5 rounded-full bg-[#B7FE1A] text-[#062E25]">
                      {tPackageSelector('recommended')}
                    </span>
                  )}
                  <div className="text-xl font-semibold text-[#062E25]">
                    {pkg.name}
                  </div>
                  {min != null && max != null && (
                    <div className="mt-1 text-base text-[#062E25]/60 tabular-nums">
                      {tPackageSelector('capacityRange', { min, max })}
                    </div>
                  )}
                  {pkg.description && (
                    <div className="mt-2 text-base text-[#062E25]/70">
                      {pkg.description}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!packagesLoading && equipmentWithNames.length > 0 && (
        <div className="mt-8">
          <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
            {t('whatsIncluded.label')}
          </p>
          <div className="rounded-xl bg-white/60 border border-[#062E25]/10 p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {equipmentWithNames.map((eq, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  {eq.imageUrl ? (
                    <div className="relative w-full aspect-square rounded-xl bg-[#F5F7EE] overflow-hidden">
                      <Image
                        src={eq.imageUrl}
                        alt={eq.name}
                        fill
                        className="object-contain p-4"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-[#F5F7EE] flex items-center justify-center">
                      <span className="w-3 h-3 rounded-full bg-[#062E25]/40" />
                    </div>
                  )}
                  <p className="mt-3 text-base text-[#062E25]">{eq.name}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-base text-[#062E25]/50 text-center">
              {t('whatsIncluded.footnote')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
          Jährlicher Stromverbrauch
        </p>
        <div className="rounded-xl bg-white/60 border border-[#062E25]/10 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {consumptionEditing ? (
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    value={consumptionDraft}
                    onChange={e => setConsumptionDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveConsumptionEdit()
                      if (e.key === 'Escape') cancelConsumptionEdit()
                    }}
                    className="text-2xl font-semibold text-[#062E25] tabular-nums bg-transparent border-b-2 border-[#062E25]/40 focus:border-[#062E25] outline-none w-40 py-0.5"
                    min={500}
                    max={50000}
                  />
                  <span className="text-base text-[#062E25]/60">kWh</span>
                  <button
                    type="button"
                    onClick={saveConsumptionEdit}
                    className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#062E25] text-white hover:bg-[#062E25]/90"
                    aria-label="Speichern"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelConsumptionEdit}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
                    aria-label="Abbrechen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-[#062E25] tabular-nums">
                    {fmt(estimatedConsumption)}
                  </span>
                  <span className="text-base text-[#062E25]/60">kWh</span>
                  <button
                    type="button"
                    onClick={startConsumptionEdit}
                    className="ml-2 inline-flex items-center gap-1 text-sm text-[#062E25]/60 hover:text-[#062E25] underline underline-offset-4"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    anpassen
                  </button>
                </div>
              )}
              <p className="mt-2 text-sm text-[#062E25]/60">
                {consumptionIsOverride
                  ? 'Von Ihnen eingegeben — basierend auf Ihrer Stromrechnung.'
                  : 'Geschätzt aus Haushaltsgrösse und Geräten. Ihr tatsächlicher Verbrauch ist auf Ihrer Jahresrechnung zu finden.'}
              </p>
            </div>
            {consumptionIsOverride && !consumptionEditing && (
              <button
                type="button"
                onClick={resetConsumptionOverride}
                className="text-sm text-[#062E25]/60 hover:text-[#062E25] underline underline-offset-4 shrink-0"
              >
                Auf Schätzung zurücksetzen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
          {t('energyFlow.label')}
        </p>
        <EnergyFlowDiagram
          annualProduction={annualProduction}
          estimatedConsumption={estimatedConsumption}
          selfConsumptionRate={selfConsumptionRate}
        />
      </div>

      <div className="mt-6">
        <p className="text-base font-medium text-[#062E25]/40 uppercase tracking-wider mb-3">
          {t('monthly.label')}
        </p>
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

      <div className="mt-10 space-y-3">
        <div className="rounded-xl border border-[#062E25]/10 bg-white/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-[#062E25]">
                {tActions('reportTitle')}
              </p>
              <p className="mt-0.5 text-base text-[#062E25]/50">
                {tActions('reportDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              disabled={downloading || !panelDataReady}
              className="shrink-0 border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
            >
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {tActions('reportButton')}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#062E25]/10 bg-white/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-[#062E25]">
                {tActions('downloadTitle')}
              </p>
              <p className="mt-0.5 text-base text-[#062E25]/50">
                {tActions('downloadDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleEmailReport}
              disabled={emailSending || emailSent}
              className="shrink-0 border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
            >
              {emailSending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {emailSent && (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              )}
              {emailSent ? tActions('emailSent') : tActions('downloadButton')}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-[#062E25]/10 bg-white/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-[#062E25]">
                {tActions('offerTitle')}
              </p>
              <p className="mt-0.5 text-base text-[#062E25]/50">
                {tActions('offerDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRequestOffer}
              disabled={offerRequesting || offerRequested}
              className="shrink-0 border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
            >
              {offerRequesting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {offerRequested && (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              )}
              {offerRequested ? tActions('offerSent') : tActions('offerButton')}
            </Button>
          </div>
        </div>

        <div
          className="rounded-xl border border-[#062E25]/20 bg-[#062E25] p-5"
          aria-disabled="true"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-white">
                  {tActions('contractTitle')}
                </p>
                <span className="inline-flex items-center rounded-full bg-[#B7FE1A] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-[#062E25]">
                  {tActions('contractInReviewLabel')}
                </span>
              </div>
              <p className="mt-0.5 text-base text-white/55">
                {tActions('contractDescriptionInReview')}
              </p>
            </div>
            <Button
              type="button"
              disabled
              aria-disabled="true"
              title={tActions('contractInReviewLabel')}
              className="shrink-0 bg-white/10 text-white/55 border border-white/15 cursor-not-allowed hover:bg-white/10 disabled:opacity-100 font-semibold"
            >
              {tActions('contractButton')}
            </Button>
          </div>
        </div>
      </div>

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
