'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { ChevronDown, ChevronUp, Loader2, MapPin, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Point, Polygon } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat, toLonLat } from 'ol/proj'
import { getRenderPixel } from 'ol/render'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  type RoofLookupOutcome,
  type RoofPinFrom,
  lastRoofPinFrom,
  trackRoofLookupRetry,
  trackRoofPinMode,
} from '@/lib/address/address-events'
import {
  type AddressMatchVia,
  awaitAddressMatch,
  fromIdentifyRow,
} from '@/lib/address/address-match'
import { fold } from '@/lib/address/resolve-address'
import {
  type SwissIdentifyRow,
  identifyAddresses,
} from '@/lib/address/swiss-address'
import { trackFunnelEventOnce } from '@/lib/analytics/funnel-events'
import {
  addressFlowMeta,
  calculatorFlowV2Enabled,
  flowVersionMeta,
} from '@/lib/calculator-flow'
import { cn } from '@/lib/utils'
import {
  type BuildingLookupResult,
  SonnendachRequestError,
  sonnendachService,
} from '@/services/sonnendach.service'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import type { RoofSegment, SonnendachBuilding } from '@/types/sonnendach'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

import { useCalculatorEmbed } from '../CalculatorEmbedContext'
import ManualCheckCapture from '../v2/ManualCheckCapture'
import RoofSegmentList from '../v2/RoofSegmentList'

import 'ol/ol.css'

const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
const SONNENDACH_MAX_ZOOM = 19
const ROOF_CAPTURE_DEADLINE_MS = 6000
const SONNENDACH_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/3857/{z}/{x}/{y}.png'

const SELECTED_COLOR = '#1B332D'
const SELECTED_STROKE = '#b7fe1a'

const selectedStyle = new Style({
  fill: new Fill({ color: `${SELECTED_COLOR}CC` }),
  stroke: new Stroke({ color: SELECTED_STROKE, width: 3 }),
})

const estimateMarkerStyle = new Style({
  image: new CircleStyle({
    radius: 11,
    fill: new Fill({ color: SELECTED_STROKE }),
    stroke: new Stroke({ color: SELECTED_COLOR, width: 4 }),
  }),
})

const MOBILE_QUERY = '(max-width: 639px)'
const ESTIMATE_VIEW_SHIFT = 0.25
const FAST_FAILURE_MS = 5000
const AUTO_RETRY_DELAY_MS = 1500
const PIN_ADDRESS_RADIUS_M = 30

let latestBuildingFetch = 0

type AddressMatchMeta = AddressMatchVia | 'none' | 'late'

interface LookupPlan {
  x: number
  y: number
  gwrId: string | null
  addressMatch: AddressMatchMeta
}

type LookupAttempt =
  | { ok: true; lookup: BuildingLookupResult; plan: LookupPlan }
  | { ok: false; error: unknown; fast: boolean }

const isFastFailure = (error: unknown, elapsedMs: number) => {
  if (!(error instanceof SonnendachRequestError)) return false
  if (error.kind === 'network') return true
  if (error.kind === 'timeout') return false
  return (
    typeof error.status === 'number' &&
    error.status >= 500 &&
    elapsedMs <= FAST_FAILURE_MS
  )
}

const delay = (ms: number) =>
  new Promise<void>(resolve => window.setTimeout(resolve, ms))

const sameLocation = (
  a: { lat: number; lng: number } | null,
  b: { lat: number; lng: number } | null
) => (!a && !b) || (!!a && !!b && a.lat === b.lat && a.lng === b.lng)

const lv95ToWgs84 = (easting: number, northing: number): [number, number] => {
  const y1 = (easting - 2600000) / 1000000
  const x1 = (northing - 1200000) / 1000000
  const lat =
    16.9023892 +
    3.238272 * x1 -
    0.270978 * y1 * y1 -
    0.002528 * x1 * x1 -
    0.0447 * y1 * y1 * x1 -
    0.014 * x1 * x1 * x1
  const lng =
    2.6779094 +
    4.728982 * y1 +
    0.791484 * y1 * x1 +
    0.1306 * y1 * x1 * x1 -
    0.0436 * y1 * y1 * y1
  return [(lng * 100) / 36, (lat * 100) / 36]
}

const buildingViewCenter = (map: Map, target: SonnendachBuilding) => {
  const center = fromLonLat([target.center.lng, target.center.lat])
  const size = map.getSize()
  if (
    !calculatorFlowV2Enabled ||
    !target.estimate ||
    !size ||
    !window.matchMedia(MOBILE_QUERY).matches
  ) {
    return center
  }
  const resolution = map.getView().getResolutionForZoom(20)
  return [center[0], center[1] - size[1] * ESTIMATE_VIEW_SHIFT * resolution]
}

const findPinAddress = async (
  lat: number,
  lng: number
): Promise<SwissIdentifyRow | null> => {
  const target = fold(useSolarAboCalculatorStore.getState().contact.street)
  if (!target) return null
  try {
    const rows = await identifyAddresses(lat, lng, PIN_ADDRESS_RADIUS_M)
    return (
      rows.find(
        row =>
          !!row.number &&
          row.streets.some(alternative => fold(alternative) === target)
      ) ?? null
    )
  } catch {
    return null
  }
}

export default function Step4RoofAreas() {
  const t = useTranslations('solarAboCalculator.step5')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const t2 = useTranslations('calculatorV2.screen2')

  const {
    address,
    setAddress,
    building,
    setBuilding,
    selectedLocation,
    contact,
    selectedSegmentIds,
    toggleSegment,
    isFetchingBuilding,
    setIsFetchingBuilding,
    getSelectedArea,
    getSelectedSegments,
    prevStep,
    nextStep,
    setRoofImage,
  } = useSolarAboCalculatorStore()

  const embedded = useCalculatorEmbed()
  const Heading = embedded ? 'h3' : 'h1'

  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [focusedLat, setFocusedLat] = useState<number | null>(null)
  const [focusedLng, setFocusedLng] = useState<number | null>(null)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [buildingMissReason, setBuildingMissReason] = useState<
    'no_building' | 'no_segments' | 'error' | null
  >(null)
  const [pendingBuilding, setPendingBuilding] =
    useState<SonnendachBuilding | null>(null)
  const [isTapNoticeVisible, setIsTapNoticeVisible] = useState(false)
  const [isFetchSlow, setIsFetchSlow] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isManualCheckOpen, setIsManualCheckOpen] = useState(false)
  const [pinFrom, setPinFrom] = useState<RoofPinFrom | null>(() => {
    if (!calculatorFlowV2Enabled) return null
    const state = useSolarAboCalculatorStore.getState()
    return state.locationPrecision === 'street' && !state.building
      ? (lastRoofPinFrom() ?? 'screen1')
      : null
  })

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const sonnendachLayerRef = useRef<TileLayer<XYZ> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInitializedRef = useRef(false)
  const tapNoticeTimerRef = useRef<number | null>(null)
  const selectedSegmentsRef = useRef<string[]>([])
  const buildingRef = useRef(building)
  const isFetchingRef = useRef(false)
  const pinFromRef = useRef(pinFrom)
  const retryCountRef = useRef(0)
  const aliveRef = useRef(true)
  selectedSegmentsRef.current = selectedSegmentIds
  buildingRef.current = building
  pinFromRef.current = pinFrom

  const hasBuilding = !!(building || (focusedLat && focusedLng))
  const pinMode = calculatorFlowV2Enabled && !!pinFrom && !building
  const isEstimate = !!building?.estimate
  const buildingId = building?.buildingId ?? null

  const drawSegmentOnMap = useCallback(
    (segment: RoofSegment, isSelected: boolean) => {
      if (!vectorSourceRef.current) return
      let wgs84Coords = segment.geometry.coordinatesWGS84
      if (!wgs84Coords || wgs84Coords.length === 0) {
        const lv95Coords = segment.geometry.coordinates
        if (!lv95Coords || lv95Coords.length === 0) return
        wgs84Coords = lv95Coords.map(ring =>
          ring.map(point => lv95ToWgs84(point[0], point[1]))
        )
      }
      const coordinates = wgs84Coords[0]
      if (!coordinates || coordinates.length < 3) return
      const webMercatorCoords = coordinates.map(coord => fromLonLat(coord))
      const polygon = new Polygon([webMercatorCoords])
      const feature = new Feature({ geometry: polygon, segmentId: segment.id })
      if (isSelected) {
        feature.setStyle(selectedStyle)
      } else {
        const color =
          segment.suitability?.color ||
          SUITABILITY_CLASSES[segment.suitability?.class || 3]?.color ||
          '#22C55E'
        feature.setStyle(
          new Style({
            fill: new Fill({ color: `${color}80` }),
            stroke: new Stroke({ color, width: 2 }),
          })
        )
      }
      vectorSourceRef.current.addFeature(feature)
    },
    []
  )

  const redrawAllSegments = useCallback(() => {
    if (!vectorSourceRef.current || !buildingRef.current?.roofSegments) return
    vectorSourceRef.current.clear()
    buildingRef.current.roofSegments.forEach(segment => {
      const isSelected = selectedSegmentsRef.current.includes(segment.id)
      drawSegmentOnMap(segment, isSelected)
    })
    const current = buildingRef.current
    if (current.estimate) {
      const marker = new Feature({
        geometry: new Point(
          fromLonLat([current.center.lng, current.center.lat])
        ),
      })
      marker.setStyle(estimateMarkerStyle)
      vectorSourceRef.current.addFeature(marker)
    }
  }, [drawSegmentOnMap])

  useEffect(() => {
    if (building) redrawAllSegments()
  }, [selectedSegmentIds, building, redrawAllSegments])

  useEffect(() => {
    const layer = sonnendachLayerRef.current
    if (!layer) return
    layer.setVisible(!!building || pinMode)
    layer.changed()
  }, [building, pinMode])

  useEffect(() => {
    if (calculatorFlowV2Enabled && isEstimate) setIsMobilePanelOpen(true)
  }, [isEstimate, buildingId])

  useEffect(() => {
    if (!isFetchingBuilding) {
      setIsFetchSlow(false)
      return
    }
    const timer = window.setTimeout(() => setIsFetchSlow(true), 8000)
    return () => window.clearTimeout(timer)
  }, [isFetchingBuilding])

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
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
      4000
    )
  }, [])

  const applyBuilding = useCallback(
    (buildingData: SonnendachBuilding) => {
      setBuilding(buildingData)
      const MIN_SEGMENT_AREA = 5

      let selectedCount = 0
      buildingData.roofSegments.forEach(segment => {
        const suitClass = segment.suitability?.class || 3
        const willSelect = segment.area >= MIN_SEGMENT_AREA && suitClass >= 3
        if (willSelect) {
          selectedCount += 1
          if (!selectedSegmentsRef.current.includes(segment.id)) {
            toggleSegment(segment.id)
          }
        }
      })
      if (selectedCount === 0) {
        const largest = buildingData.roofSegments.reduce((best, seg) =>
          seg.area > best.area ? seg : best
        )
        if (!selectedSegmentsRef.current.includes(largest.id)) {
          toggleSegment(largest.id)
        }
      }
      if (mapInstanceRef.current) {
        const center = buildingViewCenter(mapInstanceRef.current, buildingData)
        mapInstanceRef.current
          .getView()
          .animate({ center, zoom: 20, duration: 500 })
      }
    },
    [toggleSegment, setBuilding]
  )

  const planLookup = useCallback(
    async (
      lat: number,
      lng: number,
      origin: 'address' | 'tap'
    ): Promise<LookupPlan> => {
      let addressMatchMeta: AddressMatchMeta = 'none'
      if (origin === 'address') {
        const start = useSolarAboCalculatorStore.getState()
        let match = start.addressMatch
        if (!match) {
          const awaited = await awaitAddressMatch()
          const current = useSolarAboCalculatorStore.getState()
          if (
            current.addressMatch &&
            sameLocation(current.selectedLocation, start.selectedLocation)
          ) {
            match = current.addressMatch
          } else if (awaited.state === 'pending') {
            addressMatchMeta = 'late'
          }
        }
        if (match) {
          const current = useSolarAboCalculatorStore.getState()
          if (!current.building) {
            current.setSelectedLocation({ lat: match.lat, lng: match.lng })
            current.setAddressMatch(match)
          }
          return {
            x: match.n,
            y: match.e,
            gwrId: match.gwrId,
            addressMatch: match.via,
          }
        }
      }
      const lv95 = await sonnendachService.convertToLV95(lat, lng)
      return {
        x: lv95.y,
        y: lv95.x,
        gwrId: null,
        addressMatch: addressMatchMeta,
      }
    },
    []
  )

  const attemptLookup = useCallback(
    async (
      lat: number,
      lng: number,
      origin: 'address' | 'tap'
    ): Promise<LookupAttempt> => {
      const startedAt = Date.now()
      try {
        const plan = await planLookup(lat, lng, origin)
        const lookup = await sonnendachService.getBuildingData(plan.x, plan.y, {
          gwrId: plan.gwrId,
        })
        return { ok: true, lookup, plan }
      } catch (error) {
        return {
          ok: false,
          error,
          fast: isFastFailure(error, Date.now() - startedAt),
        }
      }
    },
    [planLookup]
  )

  const applyPinAddress = useCallback((row: SwissIdentifyRow) => {
    const state = useSolarAboCalculatorStore.getState()
    const target = fold(state.contact.street)
    const street =
      row.streets.find(alternative => fold(alternative) === target) ??
      row.street
    const postalCodeChanged = row.postalCode !== state.contact.postalCode
    state.setParsedAddress({
      street,
      streetNumber: row.number,
      postalCode: row.postalCode || state.contact.postalCode,
      city: row.locality || state.contact.city,
      canton: state.contact.canton,
    })
    state.setSelectedLocation({ lat: row.lat, lng: row.lng })
    state.setAddressMatch(fromIdentifyRow(row))
    state.setLocationPrecision('address')
    state.setAddress(
      `${street} ${row.number}, ${row.postalCode} ${row.locality}`.trim()
    )
    if (postalCodeChanged) void state.fetchElectricityPriceForAddress()
    trackFunnelEventOnce('address_resolved', {
      meta: {
        hasPostalCode: !!row.postalCode,
        hasCity: !!row.locality,
        hasStreet: !!street,
        hasStreetNumber: !!row.number,
        hasCanton: !!state.contact.canton,
        source: 'pin',
        provider: 'federal',
        pick: 'user',
        trigger: 'pin',
        ...flowVersionMeta,
        ...addressFlowMeta,
      },
    })
  }, [])

  const fetchBuildingAt = useCallback(
    async (
      lat: number,
      lng: number,
      origin: 'address' | 'tap' = 'address',
      manualRetry = false
    ) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      latestBuildingFetch += 1
      const fetchToken = latestBuildingFetch
      setIsFetchingBuilding(true)
      if (origin === 'address' && !manualRetry) setBuildingMissReason(null)
      const pinOrigin =
        origin === 'tap' && !buildingRef.current ? pinFromRef.current : null
      const pinAddress =
        pinOrigin &&
        useSolarAboCalculatorStore.getState().locationPrecision === 'street'
          ? findPinAddress(lat, lng)
          : null
      let retry: { attempt: number; auto: boolean } | null = null
      if (manualRetry) {
        retryCountRef.current += 1
        retry = { attempt: retryCountRef.current, auto: false }
      }
      let lookupOutcome: RoofLookupOutcome = 'error'
      try {
        let attempt = await attemptLookup(lat, lng, origin)
        if (
          !attempt.ok &&
          attempt.fast &&
          origin === 'address' &&
          !manualRetry
        ) {
          await delay(AUTO_RETRY_DELAY_MS)
          if (!aliveRef.current) return
          retryCountRef.current += 1
          retry = { attempt: retryCountRef.current, auto: true }
          attempt = await attemptLookup(lat, lng, origin)
        }
        if (!aliveRef.current) return
        if (!attempt.ok) throw attempt.error
        const { lookup, plan } = attempt
        const buildingData = lookup.building
        if (buildingData && buildingData.roofSegments.length > 0) {
          lookupOutcome = 'found'
          trackFunnelEventOnce('building_found', {
            meta: {
              segmentCount: buildingData.roofSegments.length,
              totalAreaM2: Math.round(
                buildingData.roofSegments.reduce(
                  (sum, segment) => sum + segment.area,
                  0
                )
              ),
              estimated: !!buildingData.estimate,
              match: lookup.match ?? null,
              addressMatch: plan.addressMatch,
              ...flowVersionMeta,
              ...addressFlowMeta,
            },
          })
          const current = buildingRef.current
          if (origin === 'tap' && calculatorFlowV2Enabled && current) {
            if (current.buildingId !== buildingData.buildingId) {
              setPendingBuilding(buildingData)
            }
          } else {
            if (pinAddress) {
              const row = await pinAddress
              if (!aliveRef.current) return
              if (row) applyPinAddress(row)
            }
            if (origin === 'address') setBuildingMissReason(null)
            applyBuilding(buildingData)
            if (pinOrigin) setPinFrom(null)
          }
          if (pinOrigin) {
            trackRoofPinMode({
              from: pinOrigin,
              outcome: buildingData.estimate ? 'estimate' : 'buildingFound',
            })
          }
        } else if (origin === 'address') {
          lookupOutcome = 'miss'
          const missReason = lookup.reason ?? 'no_segments'
          trackFunnelEventOnce('building_not_found', {
            meta: {
              reason: missReason,
              ...flowVersionMeta,
              ...addressFlowMeta,
            },
          })
          setBuilding(null)
          setBuildingMissReason(missReason)
        } else if (calculatorFlowV2Enabled) {
          lookupOutcome = 'miss'
          if (pinOrigin) trackRoofPinMode({ from: pinOrigin, outcome: 'miss' })
          showTapNotice()
        }
      } catch (error) {
        console.error('No building data at this location:', error)
        if (origin === 'address') {
          trackFunnelEventOnce('building_not_found', {
            meta: { reason: 'error', ...flowVersionMeta, ...addressFlowMeta },
          })
          setBuilding(null)
          setBuildingMissReason('error')
        } else if (calculatorFlowV2Enabled) {
          if (pinOrigin) trackRoofPinMode({ from: pinOrigin, outcome: 'miss' })
          showTapNotice()
        }
      } finally {
        if (retry && aliveRef.current) {
          trackRoofLookupRetry({ ...retry, outcome: lookupOutcome })
        }
        if (fetchToken === latestBuildingFetch) setIsFetchingBuilding(false)
        isFetchingRef.current = false
      }
    },
    [
      applyBuilding,
      applyPinAddress,
      attemptLookup,
      setBuilding,
      setIsFetchingBuilding,
      showTapNotice,
    ]
  )

  const openPinMode = useCallback(() => {
    setPinFrom('roofMiss')
    setBuildingMissReason(null)
    setIsMobilePanelOpen(false)
    trackRoofPinMode({ from: 'roofMiss', outcome: 'opened' })
  }, [])

  const retryLookup = useCallback(() => {
    const location = useSolarAboCalculatorStore.getState().selectedLocation
    const lat = location?.lat ?? focusedLat
    const lng = location?.lng ?? focusedLng
    if (lat === null || lng === null) return
    void fetchBuildingAt(lat, lng, 'address', true)
  }, [fetchBuildingAt, focusedLat, focusedLng])

  const handleMapClick = useCallback(
    async (coordinate: number[], pixel: number[]) => {
      const map = mapInstanceRef.current
      if (!map) return
      const clickedFeature = map.forEachFeatureAtPixel(pixel, f => f, {
        hitTolerance: 8,
      })
      if (clickedFeature) {
        const segmentId = clickedFeature.get('segmentId')
        if (segmentId) {
          toggleSegment(segmentId)
          return
        }
      }
      const [lng, lat] = toLonLat(coordinate)
      await fetchBuildingAt(lat, lng, 'tap')
    },
    [toggleSegment, fetchBuildingAt]
  )

  const handleMapClickRef = useRef(handleMapClick)
  handleMapClickRef.current = handleMapClick

  useEffect(() => {
    if (!hasBuilding || !mapRef.current || mapInitializedRef.current) return

    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

    // Sonnendach suitability overlay from swisstopo. Rendered under the vector
    // layer and clipped at draw-time to the user's own building polygon so that
    // neighbouring roofs stay uncoloured. Hidden until a building is loaded.
    const sonnendachLayer = new TileLayer({
      source: new XYZ({
        url: SONNENDACH_URL,
        crossOrigin: 'anonymous',
        maxZoom: SONNENDACH_MAX_ZOOM,
      }),
      opacity: 0.7,
      visible: !!buildingRef.current || !!pinFromRef.current,
    })
    sonnendachLayerRef.current = sonnendachLayer

    sonnendachLayer.on('prerender', event => {
      const ctx = event.context as CanvasRenderingContext2D | undefined
      const map = mapInstanceRef.current
      const b = buildingRef.current
      if (!ctx || !map || !b?.roofSegments) return

      ctx.save()
      ctx.beginPath()
      for (const segment of b.roofSegments) {
        let wgs84 = segment.geometry.coordinatesWGS84
        if (!wgs84 || wgs84.length === 0) {
          const lv95 = segment.geometry.coordinates
          if (!lv95 || lv95.length === 0) continue
          wgs84 = lv95.map(ring =>
            ring.map(point => lv95ToWgs84(point[0], point[1]))
          )
        }
        const ring = wgs84[0]
        if (!ring || ring.length < 3) continue
        ring.forEach((coord, i) => {
          const webMerc = fromLonLat(coord)
          const cssPixel = map.getPixelFromCoordinate(webMerc)
          if (!cssPixel) return
          const [x, y] = getRenderPixel(event, cssPixel)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
      }
      ctx.clip()
    })

    sonnendachLayer.on('postrender', event => {
      const ctx = event.context as CanvasRenderingContext2D | undefined
      if (!ctx) return
      ctx.restore()
    })

    const map = new Map({
      target: mapRef.current,
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: false,
      }),
      layers: [
        new TileLayer({
          source: new XYZ({
            url: SWISS_SATELLITE_URL,
            crossOrigin: 'anonymous',
          }),
        }),
        sonnendachLayer,
        new VectorLayer({ source: vectorSource }),
      ],
      view: new View({
        center:
          focusedLng && focusedLat
            ? fromLonLat([focusedLng, focusedLat])
            : fromLonLat([8.2275, 46.8182]),
        zoom: focusedLat ? (pinFromRef.current ? 18 : 19) : 8,
        minZoom: 7,
      }),
    })

    map.on('click', evt => {
      handleMapClickRef.current(
        evt.coordinate,
        evt.pixel as unknown as number[]
      )
    })

    mapInstanceRef.current = map
    mapInitializedRef.current = true
    map.once('rendercomplete', () => setIsLoadingMap(false))

    if (buildingRef.current) {
      const center = buildingViewCenter(map, buildingRef.current)
      map.getView().animate({ center, zoom: 20, duration: 500 })
      redrawAllSegments()
    } else if (focusedLat && focusedLng && !pinFromRef.current) {
      fetchBuildingAt(focusedLat, focusedLng, 'address')
    }

    return () => {
      map.setTarget(undefined)
      mapInitializedRef.current = false
      sonnendachLayerRef.current = null
    }
  }, [hasBuilding, focusedLat, focusedLng, redrawAllSegments, fetchBuildingAt])

  const mapLayoutShown =
    hasBuilding && !(calculatorFlowV2Enabled && buildingMissReason)

  useEffect(() => {
    if (!mapLayoutShown) return
    const map = mapInstanceRef.current
    const element = mapRef.current
    if (!map || !element || map.getTargetElement() === element) return
    map.setTarget(element)
    map.updateSize()
    const current = buildingRef.current
    if (current) {
      const view = map.getView()
      view.setCenter(buildingViewCenter(map, current))
      view.setZoom(20)
    }
  }, [mapLayoutShown, pinMode])

  useEffect(() => {
    if (!calculatorFlowV2Enabled) return
    if (building || !selectedLocation) return
    if (focusedLat !== null && focusedLng !== null) return
    setFocusedLat(selectedLocation.lat)
    setFocusedLng(selectedLocation.lng)
  }, [building, selectedLocation, focusedLat, focusedLng])

  const placesLoadedRef = useRef(false)
  const autocompleteLibRef = useRef<
    typeof google.maps.places.Autocomplete | null
  >(null)

  useEffect(() => {
    if (calculatorFlowV2Enabled) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || placesLoadedRef.current) return
    placesLoadedRef.current = true
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    })
    loader
      .importLibrary('places')
      .then(({ Autocomplete }) => {
        autocompleteLibRef.current = Autocomplete
        if (inputRef.current) attachAutocomplete(inputRef.current)
      })
      .catch(err => console.error('Failed to load Google Places:', err))
  }, [])

  const attachAutocomplete = useCallback(
    (el: HTMLInputElement) => {
      const AutocompleteClass = autocompleteLibRef.current
      if (!AutocompleteClass) return
      const autocomplete = new AutocompleteClass(el, {
        componentRestrictions: { country: 'ch' },
        fields: ['formatted_address', 'geometry', 'address_components'],
        types: ['address'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        const hasStreetNumber = place?.address_components?.some(c =>
          c.types?.includes('street_number')
        )
        if (!place?.geometry?.location || !place.formatted_address) {
          return
        }
        if (!hasStreetNumber) {
          setAddressError(t('addressIncomplete'))
          setFocusedLat(null)
          setFocusedLng(null)
          return
        }
        setAddressError(null)

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setAddress(place.formatted_address)
        setFocusedLat(lat)
        setFocusedLng(lng)
        setIsMobilePanelOpen(false)

        if (mapInstanceRef.current) {
          mapInstanceRef.current.getView().animate({
            center: fromLonLat([lng, lat]),
            zoom: 20,
            duration: 500,
          })
          fetchBuildingAt(lat, lng)
        }
      })
    },
    [setAddress, fetchBuildingAt, t]
  )

  const initGooglePlaces = useCallback(
    (el: HTMLInputElement | null) => {
      if (!el) {
        inputRef.current = null
        return
      }
      inputRef.current = el
      if (autocompleteLibRef.current) attachAutocomplete(el)
    },
    [attachAutocomplete]
  )

  const handleNext = () => {
    const map = mapInstanceRef.current
    if (!map) {
      nextStep()
      return
    }

    setIsCapturing(true)
    let advanced = false
    let deadlineId = 0
    const finish = (withImage: boolean) => {
      if (advanced) return
      advanced = true
      window.clearTimeout(deadlineId)
      map.un('rendercomplete', onRenderComplete)
      if (!withImage) {
        nextStep()
        return
      }
      try {
        const size = map.getSize()
        const canvases = map
          .getViewport()
          .querySelectorAll<HTMLCanvasElement>(
            '.ol-layer canvas, canvas.ol-layer'
          )
        if (size && canvases.length > 0) {
          const mapCanvas = document.createElement('canvas')
          mapCanvas.width = size[0]
          mapCanvas.height = size[1]
          const ctx = mapCanvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#0B1B17'
            ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height)
            canvases.forEach(c => {
              if (c.width === 0 || c.height === 0) return
              const parent = c.parentNode as HTMLElement | null
              const opacity = parent?.style.opacity || c.style.opacity
              ctx.globalAlpha =
                opacity === '' || opacity == null ? 1 : Number(opacity)
              const match = c.style.transform.match(/^matrix\(([^)]*)\)$/)
              if (match) {
                const matrix = match[1].split(',').map(Number) as [
                  number,
                  number,
                  number,
                  number,
                  number,
                  number,
                ]
                ctx.setTransform(...matrix)
              } else {
                ctx.setTransform(1, 0, 0, 1, 0, 0)
              }
              try {
                ctx.drawImage(c, 0, 0)
              } catch {}
            })
            ctx.globalAlpha = 1
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            setRoofImage(mapCanvas.toDataURL('image/jpeg', 0.85))
          }
        }
      } catch {}
      nextStep()
    }

    function onRenderComplete() {
      finish(true)
    }

    map.on('rendercomplete', onRenderComplete)
    deadlineId = window.setTimeout(
      () => finish(false),
      ROOF_CAPTURE_DEADLINE_MS
    )
    map.renderSync()
  }

  const selectedArea = getSelectedArea()
  const canProceed = selectedSegmentIds.length > 0

  const manualCheckPrefill = {
    address,
    postalCode: contact.postalCode || undefined,
    city: contact.city || undefined,
    lat: selectedLocation?.lat,
    lng: selectedLocation?.lng,
  }

  const resolvedAddress = address.trim()
  const renderAddressLine = (
    tone: 'light' | 'dark',
    className?: string,
    singleLine = false
  ) =>
    resolvedAddress ? (
      <p
        data-hj-suppress
        data-cs-mask
        className={cn(
          'flex items-start gap-2 text-base',
          tone === 'dark' ? 'text-white' : 'text-[#062E25]',
          className
        )}
      >
        <MapPin
          aria-hidden
          className={cn(
            'mt-0.5 h-5 w-5 shrink-0',
            tone === 'dark' ? 'text-[#B7FE1A]' : 'text-[#062E25]/70'
          )}
        />
        <span
          className={cn('min-w-0', singleLine ? 'truncate' : 'break-words')}
        >
          {resolvedAddress}
        </span>
      </p>
    ) : null

  if (calculatorFlowV2Enabled && buildingMissReason) {
    const isRequestError = buildingMissReason === 'error'
    const missReasonMessage =
      buildingMissReason === 'no_segments'
        ? t2('errors.noSegments')
        : isRequestError
          ? t2('errors.requestFailed')
          : t2('errors.noBuilding')
    return (
      <div className="h-full flex flex-col">
        <div
          className={cn(
            'flex-1 flex flex-col items-center overflow-y-auto px-4 pt-24 sm:pt-28',
            embedded ? 'pb-12 sm:pb-16' : 'pb-24'
          )}
        >
          {renderAddressLine('light', 'w-full max-w-md mb-3')}
          <p
            role="status"
            className="w-full max-w-md text-base text-[#062E25]/80"
          >
            {missReasonMessage}
          </p>
          {isRequestError ? (
            <Button
              onClick={retryLookup}
              aria-disabled={isFetchingBuilding || undefined}
              className="mt-4 h-12 w-full max-w-md bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
            >
              {isFetchingBuilding && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t2('retry')}
            </Button>
          ) : (
            <Button
              onClick={openPinMode}
              className="mt-4 h-12 w-full max-w-md bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
            >
              <MapPin aria-hidden className="mr-2 h-5 w-5" />
              {t2('pin.action')}
            </Button>
          )}
          <div className="mt-8 w-full flex flex-col items-center">
            <ManualCheckCapture
              source={isRequestError ? 'roof_unavailable' : 'no_roof'}
              prefill={manualCheckPrefill}
            />
          </div>
        </div>

        <div
          className={cn(
            'flex justify-end gap-3 px-6 py-4',
            !embedded && 'fixed bottom-0 left-0 right-0 z-50'
          )}
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            onClick={prevStep}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {t2('otherAddress')}
          </Button>
        </div>
      </div>
    )
  }

  if (!hasBuilding) {
    if (calculatorFlowV2Enabled) {
      return (
        <div className="h-full flex items-center justify-center px-4 py-12">
          <p
            role="status"
            className="max-w-md text-center text-base text-[#062E25] tracking-tight"
          >
            {t2('loading')}
          </p>
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center mb-10">
            <Heading className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
              {t('title')}
            </Heading>
            <p className="mt-5 text-lg sm:text-[22px] text-[#062E25] tracking-tight">
              {t('helper')}
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#062E25]/30 pointer-events-none" />
              <Input
                ref={initGooglePlaces}
                defaultValue={address}
                placeholder={t('searchPlaceholder')}
                aria-invalid={!!addressError}
                className={cn(
                  'h-14 text-base pl-12 pr-4 rounded-xl border-[#062E25]/20 bg-white shadow-sm focus-visible:border-[#062E25]/40',
                  addressError && 'border-red-500 focus-visible:border-red-500'
                )}
              />
            </div>
            {addressError && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {addressError}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm text-[#062E25]/75 italic">
            {t('officialMap')}
          </p>
        </div>

        <div
          className={cn(
            'flex justify-end gap-3 px-6 py-4',
            !embedded && 'fixed bottom-0 left-0 right-0 z-50'
          )}
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            onClick={prevStep}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapRef}
        tabIndex={0}
        {...(calculatorFlowV2Enabled
          ? { 'aria-label': t2('mapAriaLabel') }
          : {})}
        {...(embedded ? { 'data-lenis-prevent-wheel': '' } : {})}
        className="absolute inset-0 w-full h-full bg-muted"
      />
      {isLoadingMap && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <div
        data-lenis-prevent
        className={cn(
          'absolute left-4 z-10 hidden sm:flex w-[320px] flex-col',
          calculatorFlowV2Enabled
            ? 'top-[84px] gap-2 max-h-[calc(100svh-180px)] overflow-y-auto'
            : 'top-[100px] gap-3'
        )}
      >
        <div
          className={cn('rounded-2xl', calculatorFlowV2Enabled ? 'p-4' : 'p-5')}
          style={{
            background: 'rgba(30, 42, 38, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {calculatorFlowV2Enabled ? (
            <>
              {renderAddressLine('dark', 'mb-3')}
              <p className="text-base font-medium text-white">
                {pinMode ? t2('pin.title') : t2('headline')}
              </p>
              <p className="mt-1 text-base font-light text-[#EAEDDF]/80">
                {pinMode
                  ? t2('pin.helper')
                  : building?.estimate
                    ? t2('registerNote')
                    : t2('helper')}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#EAEDDF]/70 mb-1.5">
                {t('locationLabel')}
              </p>
              <Input
                ref={initGooglePlaces}
                defaultValue={address}
                placeholder={t('searchPlaceholder')}
                aria-invalid={!!addressError}
                className={cn(
                  'bg-[#2A3B36] border-[#4A5B56] text-white placeholder:text-white/40',
                  addressError && 'border-red-400 focus-visible:border-red-400'
                )}
              />
              {addressError && (
                <p className="mt-2 text-sm text-red-300" role="alert">
                  {addressError}
                </p>
              )}
              <div className="mt-4 flex items-start gap-2 text-sm text-[#EAEDDF]/80">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M8 5v3M8 10h.01"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{t('clickHint')}</span>
              </div>
            </>
          )}
          {isFetchingBuilding && (
            <div
              className={cn(
                'mt-3 flex items-center gap-2 text-[#B7FE1A]',
                calculatorFlowV2Enabled ? 'text-base' : 'text-sm'
              )}
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              {calculatorFlowV2Enabled
                ? isFetchSlow
                  ? t2('loadingSlow')
                  : t2('loading')
                : t('loading')}
            </div>
          )}
          {pinMode && (
            <Button
              variant="outline"
              onClick={() => setIsManualCheckOpen(true)}
              className="mt-4 h-12 w-full border-[#EAEDDF]/40 bg-transparent text-base text-[#EAEDDF] hover:bg-white/10 hover:text-white"
            >
              {t2('errors.noneSelectedAction')}
            </Button>
          )}
        </div>

        <div
          className={cn(
            'rounded-2xl',
            calculatorFlowV2Enabled ? 'p-4' : 'p-5',
            pinMode && 'hidden'
          )}
          style={{
            background: 'rgba(30, 42, 38, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {calculatorFlowV2Enabled ? (
            <p className="text-base text-[#EAEDDF]">
              {t2('areaReadout', { n: Math.round(selectedArea) })}
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#EAEDDF]/70">{t('selected')}:</p>
              <p className="text-2xl font-medium text-[#B7FE1A]">
                {Math.round(selectedArea)} m²
              </p>
            </div>
          )}

          {calculatorFlowV2Enabled && (
            <div className="mt-3">
              <RoofSegmentList idPrefix="sidebar" />
            </div>
          )}

          {calculatorFlowV2Enabled &&
            building &&
            selectedSegmentIds.length === 0 && (
              <div className="mt-4">
                <p role="alert" className="text-base text-amber-300">
                  {t2('errors.noneSelected')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsManualCheckOpen(true)}
                  className="mt-3 w-full border-[#EAEDDF]/40 bg-transparent text-base text-[#EAEDDF] hover:bg-white/10 hover:text-white"
                >
                  {t2('errors.noneSelectedAction')}
                </Button>
              </div>
            )}

          {!calculatorFlowV2Enabled && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-sm text-[#EAEDDF]/70">{t('suitability')}</p>
              <div className="mt-2 h-2 rounded-full overflow-hidden flex">
                {[1, 2, 3, 4, 5].map(cls => (
                  <div
                    key={cls}
                    className="flex-1"
                    style={{ backgroundColor: SUITABILITY_CLASSES[cls]?.color }}
                  />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-sm text-[#EAEDDF]/70">
                <span>{t('low')}</span>
                <span>{t('excellent')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[84px] z-20 px-3 sm:hidden">
        <div
          className="overflow-hidden rounded-2xl border border-white/10"
          style={{
            background: 'rgba(30, 42, 38, 0.88)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {calculatorFlowV2Enabled &&
            renderAddressLine('dark', 'px-4 pt-3', true)}
          {calculatorFlowV2Enabled && isFetchingBuilding && (
            <p role="status" className="px-4 pt-3 text-base text-[#B7FE1A]">
              {isFetchSlow ? t2('loadingSlow') : t2('loading')}
            </p>
          )}
          {pinMode && (
            <div className="px-4 pb-4 pt-3">
              <p className="text-base font-medium text-white">
                {t2('pin.title')}
              </p>
              <p className="mt-1 text-base font-light text-[#EAEDDF]/80">
                {t2('pin.helper')}
              </p>
              <Button
                variant="outline"
                onClick={() => setIsManualCheckOpen(true)}
                className="mt-3 h-12 w-full border-[#EAEDDF]/40 bg-transparent text-base text-[#EAEDDF] hover:bg-white/10 hover:text-white"
              >
                {t2('errors.noneSelectedAction')}
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen(open => !open)}
            className={cn(
              'flex w-full items-center justify-between px-4 py-3 text-left text-white',
              pinMode && 'hidden'
            )}
          >
            {calculatorFlowV2Enabled ? (
              <span className="text-base">
                {t2('areaReadout', { n: Math.round(selectedArea) })}
              </span>
            ) : (
              <span className="text-sm font-medium">{t('selected')}</span>
            )}
            <div className="flex items-center gap-2">
              {!calculatorFlowV2Enabled && (
                <span className="text-sm text-[#B7FE1A]">
                  {Math.round(selectedArea)} m²
                </span>
              )}
              {isMobilePanelOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </button>
          <div
            className={cn(
              'transition-[max-height,opacity] duration-300',
              isMobilePanelOpen && !pinMode
                ? 'max-h-[70vh] opacity-100'
                : 'max-h-0 opacity-0'
            )}
          >
            {calculatorFlowV2Enabled ? (
              <div className="px-4 pb-4">
                <p className="text-base font-medium text-white">
                  {t2('headline')}
                </p>
                <p className="mt-1 text-base font-light text-[#EAEDDF]/80">
                  {building?.estimate ? t2('registerNote') : t2('helper')}
                </p>
                <div className="mt-3">
                  <RoofSegmentList idPrefix="mobile" />
                </div>
                {building && selectedSegmentIds.length === 0 && (
                  <div className="mt-3">
                    <p role="alert" className="text-base text-amber-300">
                      {t2('errors.noneSelected')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsManualCheckOpen(true)}
                      className="mt-3 w-full border-[#EAEDDF]/40 bg-transparent text-base text-[#EAEDDF] hover:bg-white/10 hover:text-white"
                    >
                      {t2('errors.noneSelectedAction')}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 pb-3 text-sm text-[#EAEDDF]/70">
                {t('clickHint')}
              </div>
            )}
          </div>
        </div>
      </div>

      {calculatorFlowV2Enabled && (
        <p className="pointer-events-none absolute right-2 top-[68px] z-10 rounded bg-[#062E25]/60 px-2 py-0.5 text-xs text-white/90 sm:top-auto sm:bottom-[80px] sm:text-base">
          {t2('mapAttribution')}
        </p>
      )}

      {calculatorFlowV2Enabled && isTapNoticeVisible && (
        <div className="absolute left-1/2 top-16 z-30 w-[calc(100%-24px)] max-w-md -translate-x-1/2">
          <p
            role="status"
            className="rounded-xl bg-white/95 px-4 py-3 text-center text-base text-[#062E25] shadow-lg"
          >
            {t2('errors.tapNoData')}
          </p>
        </div>
      )}

      {calculatorFlowV2Enabled && pendingBuilding && (
        <div className="absolute bottom-[84px] left-1/2 z-40 w-[calc(100%-24px)] max-w-md -translate-x-1/2 sm:bottom-auto sm:top-24">
          <div className="rounded-2xl bg-white p-5 shadow-xl">
            <p role="alert" className="text-base text-[#062E25]">
              {t2('errors.tapSwitchBuilding')}
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPendingBuilding(null)}
                style={{ borderColor: '#062E25', color: '#062E25' }}
              >
                {t2('errors.tapSwitchCancel')}
              </Button>
              <Button
                onClick={() => {
                  applyBuilding(pendingBuilding)
                  setPendingBuilding(null)
                }}
              >
                {t2('errors.tapSwitchConfirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {calculatorFlowV2Enabled && isManualCheckOpen && (
        <div className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[#062E25]/50 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-[#EAEDDF] p-6 shadow-xl">
            <ManualCheckCapture
              source="no_roof"
              prefill={manualCheckPrefill}
              compact
              trigger="click"
            />
            <Button
              variant="outline"
              onClick={() => setIsManualCheckOpen(false)}
              className="mt-4 w-full text-base"
              style={{ borderColor: '#062E25', color: '#062E25' }}
            >
              {t2('errors.tapSwitchCancel')}
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex justify-end gap-3 px-6 py-4',
          embedded
            ? 'absolute bottom-0 left-0 right-0 z-30'
            : 'fixed bottom-0 left-0 right-0 z-50'
        )}
        style={{
          background: 'rgba(234, 237, 223, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Button
          variant="outline"
          onClick={prevStep}
          style={{ borderColor: '#062E25', color: '#062E25' }}
        >
          {calculatorFlowV2Enabled ? t2('otherAddress') : tNav('back')}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed || isCapturing}>
          {isCapturing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {calculatorFlowV2Enabled ? t2('button') : tNav('next')}
        </Button>
      </div>
    </div>
  )
}
