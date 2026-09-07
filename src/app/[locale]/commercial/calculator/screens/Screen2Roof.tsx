'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import SonnendachRoofMap, {
  type SonnendachRoofMapCapture,
} from '@/components/calculator/SonnendachRoofMap'
import { Button } from '@/components/ui/button'
import { trackFunnelEventOnce } from '@/lib/analytics/funnel-events'
import { commercialFlowMeta } from '@/lib/commercial-calculator-flow'
import {
  sonnendachService,
  type BuildingLookupResult,
} from '@/services/sonnendach.service'
import {
  useCommercialCalculatorStore,
  type BuildingMissReason,
} from '@/stores/commercial-calculator.store'
import type { SonnendachBuilding } from '@/types/sonnendach'

import ManualCheckCapture from './ManualCheckCapture'
import RoofSegmentList from './RoofSegmentList'

const LOOKUP_TIMEOUT_MS = 8000
const LOOKUP_SLOW_MS = 4000
const TAP_NOTICE_MS = 4000
const MIN_SEGMENT_AREA_M2 = 5
const MIN_SUITABILITY_CLASS = 3
const SCREEN_STEP = 2

const PANEL_STYLE = {
  background: 'rgba(30, 42, 38, 0.92)',
  backdropFilter: 'blur(20px)',
}

async function lookupBuilding(
  lat: number,
  lng: number
): Promise<BuildingLookupResult> {
  let timer = 0
  const deadline = new Promise<never>((_, reject) => {
    timer = window.setTimeout(
      () => reject(new Error('Sonnendach lookup timed out')),
      LOOKUP_TIMEOUT_MS
    )
  })
  const lookup = (async () => {
    const lv95 = await sonnendachService.convertToLV95(lat, lng)
    return sonnendachService.getBuildingData(lv95.y, lv95.x)
  })()
  try {
    return await Promise.race([lookup, deadline])
  } finally {
    window.clearTimeout(timer)
  }
}

function autoSelectSegmentIds(building: SonnendachBuilding): string[] {
  const qualifying = building.roofSegments.filter(segment => {
    const suitClass = segment.suitability?.class || MIN_SUITABILITY_CLASS
    return (
      segment.area >= MIN_SEGMENT_AREA_M2 && suitClass >= MIN_SUITABILITY_CLASS
    )
  })
  if (qualifying.length > 0) return qualifying.map(segment => segment.id)
  if (building.roofSegments.length === 0) return []
  const largest = building.roofSegments.reduce((best, segment) =>
    segment.area > best.area ? segment : best
  )
  return [largest.id]
}

export default function Screen2Roof() {
  const t = useTranslations('commercialCalculator.screen2')

  const address = useCommercialCalculatorStore(state => state.address)
  const postalCode = useCommercialCalculatorStore(state => state.postalCode)
  const city = useCommercialCalculatorStore(state => state.city)
  const lat = useCommercialCalculatorStore(state => state.lat)
  const lng = useCommercialCalculatorStore(state => state.lng)
  const building = useCommercialCalculatorStore(state => state.building)
  const selectedSegmentIds = useCommercialCalculatorStore(
    state => state.selectedSegmentIds
  )
  const isFetchingBuilding = useCommercialCalculatorStore(
    state => state.isFetchingBuilding
  )
  const buildingMissReason = useCommercialCalculatorStore(
    state => state.buildingMissReason
  )
  const setBuilding = useCommercialCalculatorStore(state => state.setBuilding)
  const setSelectedSegmentIds = useCommercialCalculatorStore(
    state => state.setSelectedSegmentIds
  )
  const toggleSegment = useCommercialCalculatorStore(
    state => state.toggleSegment
  )
  const setIsFetchingBuilding = useCommercialCalculatorStore(
    state => state.setIsFetchingBuilding
  )
  const setBuildingMissReason = useCommercialCalculatorStore(
    state => state.setBuildingMissReason
  )
  const setRoofImage = useCommercialCalculatorStore(state => state.setRoofImage)
  const fetchTariff = useCommercialCalculatorStore(state => state.fetchTariff)
  const fetchSubsidyRate = useCommercialCalculatorStore(
    state => state.fetchSubsidyRate
  )
  const nextStep = useCommercialCalculatorStore(state => state.nextStep)
  const clearAddress = useCommercialCalculatorStore(state => state.clearAddress)

  const [isFetchSlow, setIsFetchSlow] = useState(false)
  const [pendingBuilding, setPendingBuilding] =
    useState<SonnendachBuilding | null>(null)
  const [isTapNoticeVisible, setIsTapNoticeVisible] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isManualCheckOpen, setIsManualCheckOpen] = useState(false)

  const captureRef = useRef<SonnendachRoofMapCapture | null>(null)
  const isLookupRunningRef = useRef(false)
  const lookedUpKeyRef = useRef<string | null>(null)
  const tapNoticeTimerRef = useRef<number | null>(null)
  const buildingRef = useRef(building)
  buildingRef.current = building

  const center = useMemo(
    () => (lat !== null && lng !== null ? { lat, lng } : null),
    [lat, lng]
  )

  const selectedArea = useMemo(() => {
    if (!building) return 0
    return building.roofSegments
      .filter(segment => selectedSegmentIds.includes(segment.id))
      .reduce((sum, segment) => sum + segment.area, 0)
  }, [building, selectedSegmentIds])

  useEffect(() => {
    if (!isFetchingBuilding) {
      setIsFetchSlow(false)
      return
    }
    const timer = window.setTimeout(() => setIsFetchSlow(true), LOOKUP_SLOW_MS)
    return () => window.clearTimeout(timer)
  }, [isFetchingBuilding])

  useEffect(() => {
    return () => {
      if (tapNoticeTimerRef.current) {
        window.clearTimeout(tapNoticeTimerRef.current)
      }
    }
  }, [])

  const showTapNotice = useCallback(() => {
    setIsTapNoticeVisible(true)
    if (tapNoticeTimerRef.current) {
      window.clearTimeout(tapNoticeTimerRef.current)
    }
    tapNoticeTimerRef.current = window.setTimeout(
      () => setIsTapNoticeVisible(false),
      TAP_NOTICE_MS
    )
  }, [])

  const applyBuilding = useCallback(
    (found: SonnendachBuilding) => {
      setBuilding(found)
      setSelectedSegmentIds(autoSelectSegmentIds(found))
    },
    [setBuilding, setSelectedSegmentIds]
  )

  const recordMiss = useCallback(
    (reason: BuildingMissReason) => {
      trackFunnelEventOnce('building_not_found', {
        step: SCREEN_STEP,
        meta: { ...commercialFlowMeta, reason },
      })
      setBuilding(null)
      setBuildingMissReason(reason)
    },
    [setBuilding, setBuildingMissReason]
  )

  const runAddressLookup = useCallback(
    async (atLat: number, atLng: number) => {
      if (isLookupRunningRef.current) return
      isLookupRunningRef.current = true
      setIsFetchingBuilding(true)
      setBuildingMissReason(null)
      try {
        const result = await lookupBuilding(atLat, atLng)
        const found = result.building
        if (found && found.roofSegments.length > 0) {
          trackFunnelEventOnce('building_found', {
            step: SCREEN_STEP,
            meta: {
              ...commercialFlowMeta,
              segmentCount: found.roofSegments.length,
              totalAreaM2: Math.round(
                found.roofSegments.reduce(
                  (sum, segment) => sum + segment.area,
                  0
                )
              ),
            },
          })
          applyBuilding(found)
        } else {
          recordMiss(result.reason ?? 'no_segments')
        }
      } catch {
        recordMiss('error')
      } finally {
        setIsFetchingBuilding(false)
        isLookupRunningRef.current = false
      }
    },
    [applyBuilding, recordMiss, setBuildingMissReason, setIsFetchingBuilding]
  )

  useEffect(() => {
    if (building || buildingMissReason) return
    if (lat === null || lng === null) return
    const key = `${lat},${lng}`
    if (lookedUpKeyRef.current === key) return
    lookedUpKeyRef.current = key
    void runAddressLookup(lat, lng)
  }, [building, buildingMissReason, lat, lng, runAddressLookup])

  const handleTapBuildingAt = useCallback(
    async (atLat: number, atLng: number) => {
      if (isLookupRunningRef.current) return
      isLookupRunningRef.current = true
      setIsFetchingBuilding(true)
      try {
        const result = await lookupBuilding(atLat, atLng)
        const found = result.building
        if (!found || found.roofSegments.length === 0) {
          showTapNotice()
          return
        }
        const current = buildingRef.current
        if (!current) {
          applyBuilding(found)
          return
        }
        if (current.buildingId !== found.buildingId) {
          setPendingBuilding(found)
        }
      } finally {
        setIsFetchingBuilding(false)
        isLookupRunningRef.current = false
      }
    },
    [applyBuilding, setIsFetchingBuilding, showTapNotice]
  )

  const handleNext = async () => {
    if (isCapturing) return
    setIsCapturing(true)
    try {
      const image = captureRef.current
        ? await captureRef.current.capture()
        : null
      setRoofImage(image)
    } catch {
      setRoofImage(null)
    } finally {
      setIsCapturing(false)
    }
    void fetchTariff()
    void fetchSubsidyRate()
    nextStep()
  }

  const manualCheckPrefill = {
    address,
    postalCode: postalCode || undefined,
    city: city || undefined,
    lat: lat ?? undefined,
    lng: lng ?? undefined,
  }

  const canProceed = !!building && selectedSegmentIds.length > 0
  const loadingText = isFetchSlow ? t('loadingSlow') : t('loading')

  if (buildingMissReason) {
    const missReasonMessage =
      buildingMissReason === 'no_segments'
        ? t('errors.noSegments')
        : buildingMissReason === 'error'
          ? t('errors.requestFailed')
          : t('errors.noBuilding')
    return (
      <div className="flex flex-col items-center px-4 py-12 sm:py-16">
        <p
          role="status"
          className="w-full max-w-md text-base text-[#062E25]/80"
        >
          {missReasonMessage}
        </p>
        <div className="mt-6 flex w-full flex-col items-center">
          <ManualCheckCapture source="no_roof" prefill={manualCheckPrefill} />
        </div>
        <Button
          variant="outline"
          onClick={clearAddress}
          className="mt-8 min-h-[44px] w-full max-w-md text-base"
          style={{ borderColor: '#062E25', color: '#062E25' }}
        >
          {t('otherAddress')}
        </Button>
      </div>
    )
  }

  if (!center) {
    return (
      <div className="flex flex-col items-center px-4 py-12 sm:py-16">
        <p
          role="status"
          className="max-w-md text-center text-base text-[#062E25] tracking-tight"
        >
          {t('loading')}
        </p>
        <Button
          variant="outline"
          onClick={clearAddress}
          className="mt-8 min-h-[44px] w-full max-w-md text-base"
          style={{ borderColor: '#062E25', color: '#062E25' }}
        >
          {t('otherAddress')}
        </Button>
      </div>
    )
  }

  const noneSelectedRescue = building && selectedSegmentIds.length === 0 && (
    <div className="mt-4">
      <p role="alert" className="text-base text-amber-300">
        {t('errors.noneSelected')}
      </p>
      <Button
        variant="outline"
        onClick={() => setIsManualCheckOpen(true)}
        className="mt-3 min-h-[44px] w-full border-[#EAEDDF]/40 bg-transparent text-base text-[#EAEDDF] hover:bg-white/10 hover:text-white"
      >
        {t('errors.noneSelectedAction')}
      </Button>
    </div>
  )

  return (
    <div className="relative flex h-full flex-col bg-[#0B1B17] lg:flex-row">
      <div className="relative h-[55svh] min-h-[320px] w-full lg:h-auto lg:min-h-[560px] lg:flex-1">
        <SonnendachRoofMap
          building={building}
          selectedSegmentIds={selectedSegmentIds}
          center={center}
          onToggleSegment={toggleSegment}
          onTapBuildingAt={handleTapBuildingAt}
          onTapMiss={showTapNotice}
          captureRef={captureRef}
          ariaLabel={t('mapAriaLabel')}
          zoomInLabel={t('zoomIn')}
          zoomOutLabel={t('zoomOut')}
          className="absolute inset-0"
        />

        {isFetchingBuilding && (
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
            <p
              role="status"
              className="flex max-w-md items-center gap-2 rounded-xl px-4 py-3 text-base text-[#B7FE1A]"
              style={PANEL_STYLE}
            >
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{loadingText}</span>
            </p>
          </div>
        )}

        {isTapNoticeVisible && (
          <div className="absolute left-1/2 top-16 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2">
            <p
              role="status"
              className="rounded-xl bg-white/95 px-4 py-3 text-center text-base text-[#062E25] shadow-lg"
            >
              {t('errors.tapNoData')}
            </p>
          </div>
        )}

        {pendingBuilding && (
          <div className="absolute bottom-4 left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2 lg:bottom-auto lg:top-20">
            <div className="rounded-2xl bg-white p-5 shadow-xl">
              <p role="alert" className="text-base text-[#062E25]">
                {t('errors.tapSwitchBuilding')}
              </p>
              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPendingBuilding(null)}
                  className="min-h-[44px] text-base"
                  style={{ borderColor: '#062E25', color: '#062E25' }}
                >
                  {t('errors.tapSwitchCancel')}
                </Button>
                <Button
                  onClick={() => {
                    applyBuilding(pendingBuilding)
                    setPendingBuilding(null)
                  }}
                  className="min-h-[44px] text-base"
                >
                  {t('errors.tapSwitchConfirm')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside
        className="flex w-full flex-col gap-4 p-4 text-[#EAEDDF] sm:p-6 lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:pt-28"
        style={{ background: 'rgba(30, 42, 38, 0.97)' }}
      >
        <div>
          <h2 className="text-xl font-medium text-white sm:text-2xl">
            {t('headline')}
          </h2>
          <p className="mt-2 text-base font-light text-[#EAEDDF]/80">
            {t('helper')}
          </p>
          {isFetchingBuilding && (
            <p
              role="status"
              className="mt-3 flex items-center gap-2 text-base text-[#B7FE1A]"
            >
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>{loadingText}</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="text-base text-[#EAEDDF]" aria-live="polite">
            {t('areaReadout', { n: Math.round(selectedArea) })}
          </p>
          <div className="mt-3">
            <RoofSegmentList idPrefix="commercial" />
          </div>
          {noneSelectedRescue}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row-reverse sm:justify-start">
          <Button
            onClick={handleNext}
            disabled={!canProceed || isCapturing}
            className="min-h-[44px] bg-[#B7FE1A] text-base text-[#062E25] hover:bg-[#B7FE1A]/90"
          >
            {isCapturing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('button')}
          </Button>
          <Button
            variant="outline"
            onClick={clearAddress}
            className="min-h-[44px] border-[#EAEDDF]/40 bg-transparent text-base text-[#EAEDDF] hover:bg-white/10 hover:text-white"
          >
            {t('otherAddress')}
          </Button>
        </div>
      </aside>

      {isManualCheckOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#062E25]/50 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-[#EAEDDF] p-6 shadow-xl">
            <ManualCheckCapture
              source="no_roof"
              prefill={manualCheckPrefill}
              compact
            />
            <Button
              variant="outline"
              onClick={() => setIsManualCheckOpen(false)}
              className="mt-4 min-h-[44px] w-full text-base"
              style={{ borderColor: '#062E25', color: '#062E25' }}
            >
              {t('errors.tapSwitchCancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
