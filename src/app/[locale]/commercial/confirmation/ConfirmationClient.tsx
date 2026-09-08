'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'
import {
  computeCommercialEstimate,
  type CommercialEstimate,
  type BuildingUse,
} from '@/lib/commercial-estimate'
import { COMPANY_MAIN_PHONE_DISPLAY } from '@/lib/company-contact'
import {
  commercialLeadService,
  type CommercialLeadPublicView,
} from '@/services/commercial-lead.service'
import type { CommercialTariff } from '@/stores/commercial-calculator.store'
import type { RoofSegment } from '@/types/sonnendach'

import ResultScreen from '../calculator/screens/ResultScreen'

const PAGE_BG =
  'linear-gradient(180deg, rgba(242, 244, 232, 1) 45%, rgba(220, 233, 230, 1) 84%)'

const PPA_DISCOUNT = 0.3

type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; data: CommercialLeadPublicView; token: string }
  | { status: 'notFound' }
  | { status: 'expired' }

type Snapshot = Record<string, unknown>

function isRecord(value: unknown): value is Snapshot {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readSegments(snapshot: Snapshot | null): RoofSegment[] | null {
  const raw = snapshot?.segments
  if (!Array.isArray(raw) || raw.length === 0) return null
  const segments: RoofSegment[] = []
  raw.forEach((entry, index) => {
    if (!isRecord(entry)) return
    const { area, tilt, azimuth, electricityYield, suitabilityClass, id } =
      entry
    if (
      typeof area !== 'number' ||
      typeof tilt !== 'number' ||
      typeof azimuth !== 'number' ||
      typeof electricityYield !== 'number'
    )
      return
    segments.push({
      id: typeof id === 'string' ? id : String(index),
      featureId: '',
      area,
      tilt,
      azimuth,
      azimuthCardinal: '',
      electricityYield,
      heatYield: 0,
      solarRadiation: 0,
      suitability: {
        class: typeof suitabilityClass === 'number' ? suitabilityClass : 0,
        label: '',
        color: '',
      },
      geometry: { type: 'Polygon', coordinates: [] },
    })
  })
  return segments.length > 0 ? segments : null
}

function readTariff(snapshot: Snapshot | null): CommercialTariff | null {
  const raw = snapshot?.tariff
  if (!isRecord(raw)) return null
  const { rpKwh, chfKwh, category, municipality, year, fallback, plz } = raw
  if (
    typeof rpKwh !== 'number' ||
    typeof chfKwh !== 'number' ||
    typeof category !== 'string' ||
    typeof municipality !== 'string' ||
    typeof year !== 'number'
  )
    return null
  return {
    rpKwh,
    chfKwh,
    category,
    municipality,
    year,
    fallback: fallback === true,
    plz: typeof plz === 'string' ? plz : '',
  }
}

const BUILDING_USES: BuildingUse[] = [
  'office_trade',
  'industry',
  'agriculture',
  'retail_gastro',
  'public',
  'multi_family',
  'other',
]

function readBuildingUse(value: unknown): BuildingUse | null {
  return typeof value === 'string' && (BUILDING_USES as string[]).includes(value)
    ? (value as BuildingUse)
    : null
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function buildEstimate(
  data: CommercialLeadPublicView,
  tariff: CommercialTariff | null
): CommercialEstimate {
  const calc = data.calculation
  const snapshot = isRecord(calc.snapshot) ? calc.snapshot : null
  const consumption = isRecord(snapshot?.consumption)
    ? snapshot.consumption
    : null
  const subsidyAboveTiers = readBoolean(snapshot?.subsidyAboveTiers, false)
  const segments = readSegments(snapshot)

  if (segments) {
    const computed = computeCommercialEstimate({
      segments,
      buildingUse: readBuildingUse(snapshot?.buildingUse),
      consumptionKwh: calc.annualConsumptionKwh,
      tariffChfKwh: tariff?.chfKwh ?? null,
      subsidyTiers: null,
    })
    const savings = calc.estimatedAnnualSavingsChf
    return {
      ...computed,
      subsidyChf: calc.estimatedSubsidyChf,
      subsidyAboveTiers,
      selfConsumptionValueChf: savings ?? computed.selfConsumptionValueChf,
      ppaSavingsChf:
        savings != null
          ? Math.round(savings * PPA_DISCOUNT)
          : computed.ppaSavingsChf,
    }
  }

  const grossAreaM2 = calc.roofAreaM2 ?? 0
  const usableAreaM2 = calc.usableRoofAreaM2 ?? grossAreaM2
  const productionKwh = calc.estimatedAnnualProductionKwh ?? 0
  const selfConsumption = isRecord(snapshot?.selfConsumption)
    ? snapshot.selfConsumption
    : null
  const selfConsumedKwh =
    typeof selfConsumption?.kwh === 'number' ? selfConsumption.kwh : 0
  const selfConsumptionShare =
    typeof selfConsumption?.share === 'number'
      ? selfConsumption.share
      : productionKwh > 0
        ? selfConsumedKwh / productionKwh
        : 0
  const savings = calc.estimatedAnnualSavingsChf

  return {
    grossAreaM2,
    usableAreaM2,
    panelCount: calc.estimatedPanelCount ?? 0,
    systemSizeKwp: calc.estimatedSystemKwp ?? 0,
    productionKwh,
    co2Kg: calc.estimatedCo2ReductionKg ?? 0,
    consumptionKwh: calc.annualConsumptionKwh,
    consumptionAssumed: readBoolean(consumption?.assumed, true),
    selfConsumedKwh,
    selfConsumptionShare,
    selfConsumptionValueChf: savings,
    ppaSavingsChf: savings != null ? Math.round(savings * PPA_DISCOUNT) : null,
    subsidyChf: calc.estimatedSubsidyChf,
    subsidyAboveTiers,
    isLowResult: readBoolean(snapshot?.lowResult, false),
  }
}

function errorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status
}

function ConfirmationInner() {
  const t = useTranslations('commercialCalculator.confirmation')
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const token = searchParams.get('token')
  const [state, setState] = useState<ViewState>({ status: 'loading' })

  useEffect(() => {
    if (!id || !token) {
      setState({ status: 'notFound' })
      return
    }
    let cancelled = false
    commercialLeadService
      .getPublic(id, token)
      .then(data => {
        if (!cancelled) setState({ status: 'ready', data, token })
      })
      .catch(err => {
        if (cancelled) return
        setState({
          status: errorStatus(err) === 410 ? 'expired' : 'notFound',
        })
      })
    return () => {
      cancelled = true
    }
  }, [id, token])

  if (state.status === 'ready') {
    const { data } = state
    const snapshot = isRecord(data.calculation.snapshot)
      ? data.calculation.snapshot
      : null
    const tariff = readTariff(snapshot)
    const estimate = buildEstimate(data, tariff)
    const existingPv = data.calculation.existingPv
    const uploadExpired =
      data.uploadTokenExpiresAt != null &&
      new Date(data.uploadTokenExpiresAt).getTime() < Date.now()
    return (
      <ResultScreen
        estimate={estimate}
        tariff={tariff}
        subsidyRate={
          typeof snapshot?.subsidyTierMaxKwp === 'number'
            ? {
                tier1MaxKwp: 0,
                tier1ChfPerKwp: 0,
                tier2MaxKwp: snapshot.subsidyTierMaxKwp,
                tier2ChfPerKwp: 0,
              }
            : null
        }
        hasExistingPv={existingPv != null && existingPv !== 'NONE'}
        addressLabel={data.addressLabel}
        roofImage={null}
        reference={data.reference}
        leadId={id ?? ''}
        uploadToken={uploadExpired ? null : state.token}
        source="confirmation"
      />
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center px-4 py-16 sm:py-24">
        <div
          aria-hidden
          className="h-10 w-10 animate-spin rounded-full border-4 border-[#062E25]/20 border-t-[#062E25]"
        />
        <p role="status" className="mt-4 text-base text-[#062E25] tracking-tight">
          {t('loading')}
        </p>
      </div>
    )
  }

  const expired = state.status === 'expired'
  return (
    <div className="flex flex-col items-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-2xl sm:text-[34px] font-medium text-[#062E25]">
          {expired ? t('expiredHeadline') : t('notFoundHeadline')}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-[#062E25]/80 tracking-tight">
          {expired
            ? t('expiredBody', { phone: COMPANY_MAIN_PHONE_DISPLAY })
            : t('notFoundBody')}
        </p>
        <Link
          href="/commercial/calculator"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-energy px-6 text-base font-medium text-white transition-colors hover:bg-energy/90"
        >
          {t('expiredCta')}
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationClient() {
  return (
    <div
      className="min-h-svh pb-20"
      style={{ paddingTop: '77px', background: PAGE_BG }}
    >
      <Suspense fallback={null}>
        <ConfirmationInner />
      </Suspense>
    </div>
  )
}
