'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Polygon } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat, toLonLat } from 'ol/proj'
import { getRenderPixel } from 'ol/render'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackFunnelEventOnce } from '@/lib/analytics/funnel-events'
import { calculatorFlowV2Enabled, flowVersionMeta } from '@/lib/calculator-flow'
import { cn } from '@/lib/utils'
import { sonnendachService } from '@/services/sonnendach.service'
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
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(true)
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
  selectedSegmentsRef.current = selectedSegmentIds
  buildingRef.current = building

  const hasBuilding = !!(building || (focusedLat && focusedLng))

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
  }, [drawSegmentOnMap])

  useEffect(() => {
    if (building) redrawAllSegments()
  }, [selectedSegmentIds, building, redrawAllSegments])

  useEffect(() => {
    const layer = sonnendachLayerRef.current
    if (!layer) return
    layer.setVisible(!!building)
    layer.changed()
  }, [building])

  useEffect(() => {
    if (!isFetchingBuilding) {
      setIsFetchSlow(false)
      return
    }
    const timer = window.setTimeout(() => setIsFetchSlow(true), 8000)
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
        const center = fromLonLat([
          buildingData.center.lng,
          buildingData.center.lat,
        ])
        mapInstanceRef.current
          .getView()
          .animate({ center, zoom: 20, duration: 500 })
      }
    },
    [toggleSegment, setBuilding]
  )

  const fetchBuildingAt = useCallback(
    async (lat: number, lng: number, origin: 'address' | 'tap' = 'address') => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setIsFetchingBuilding(true)
      if (origin === 'address') setBuildingMissReason(null)
      try {
        const lv95 = await sonnendachService.convertToLV95(lat, lng)
        const lookup = await sonnendachService.getBuildingData(lv95.y, lv95.x)
        const buildingData = lookup.building
        if (buildingData && buildingData.roofSegments.length > 0) {
          trackFunnelEventOnce('building_found', {
            meta: {
              segmentCount: buildingData.roofSegments.length,
              totalAreaM2: Math.round(
                buildingData.roofSegments.reduce(
                  (sum, segment) => sum + segment.area,
                  0
                )
              ),
              ...flowVersionMeta,
            },
          })
          const current = buildingRef.current
          if (origin === 'tap' && calculatorFlowV2Enabled && current) {
            if (current.buildingId !== buildingData.buildingId) {
              setPendingBuilding(buildingData)
            }
          } else {
            applyBuilding(buildingData)
          }
        } else if (origin === 'address') {
          const missReason = lookup.reason ?? 'no_segments'
          trackFunnelEventOnce('building_not_found', {
            meta: { reason: missReason, ...flowVersionMeta },
          })
          setBuilding(null)
          setBuildingMissReason(missReason)
        } else if (calculatorFlowV2Enabled) {
          showTapNotice()
        }
      } catch (error) {
        console.error('No building data at this location:', error)
        if (origin === 'address') {
          trackFunnelEventOnce('building_not_found', {
            meta: { reason: 'error', ...flowVersionMeta },
          })
          setBuilding(null)
          setBuildingMissReason('error')
        } else if (calculatorFlowV2Enabled) {
          showTapNotice()
        }
      } finally {
        setIsFetchingBuilding(false)
        isFetchingRef.current = false
      }
    },
    [applyBuilding, setBuilding, setIsFetchingBuilding, showTapNotice]
  )

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
      visible: !!buildingRef.current,
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
        zoom: focusedLat ? 19 : 8,
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
      const center = fromLonLat([
        buildingRef.current.center.lng,
        buildingRef.current.center.lat,
      ])
      map.getView().animate({ center, zoom: 20, duration: 500 })
      redrawAllSegments()
    } else if (focusedLat && focusedLng) {
      fetchBuildingAt(focusedLat, focusedLng, 'address')
    }

    return () => {
      map.setTarget(undefined)
      mapInitializedRef.current = false
      sonnendachLayerRef.current = null
    }
  }, [hasBuilding, focusedLat, focusedLng, redrawAllSegments, fetchBuildingAt])

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
          .querySelectorAll<HTMLCanvasElement>('.ol-layer canvas, canvas.ol-layer')
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
              ctx.globalAlpha = opacity === '' || opacity == null ? 1 : Number(opacity)
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
    deadlineId = window.setTimeout(() => finish(false), ROOF_CAPTURE_DEADLINE_MS)
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

  if (calculatorFlowV2Enabled && buildingMissReason) {
    const missReasonMessage =
      buildingMissReason === 'no_segments'
        ? t2('errors.noSegments')
        : buildingMissReason === 'error'
          ? t2('errors.requestFailed')
          : t2('errors.noBuilding')
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center overflow-y-auto px-4 py-12 sm:py-16">
          <p
            role="status"
            className="w-full max-w-md text-base text-[#062E25]/80"
          >
            {missReasonMessage}
          </p>
          <div className="mt-6 w-full flex flex-col items-center">
            <ManualCheckCapture source="no_roof" prefill={manualCheckPrefill} />
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
            className="max-w-md text-center text-base font-light text-[#062E25]/80 tracking-tight"
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
            <p className="mt-5 text-lg sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
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

          <p className="mt-5 text-sm text-[#062E25]/40 italic">
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
              <p className="text-base font-medium text-white">
                {t2('headline')}
              </p>
              <p className="mt-1 text-base font-light text-[#EAEDDF]/80">
                {t2('helper')}
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
        </div>

        <div
          className={cn('rounded-2xl', calculatorFlowV2Enabled ? 'p-4' : 'p-5')}
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
              <div className="mt-1 flex justify-between text-sm text-[#EAEDDF]/40">
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
          {calculatorFlowV2Enabled && isFetchingBuilding && (
            <p role="status" className="px-4 pt-3 text-base text-[#B7FE1A]">
              {isFetchSlow ? t2('loadingSlow') : t2('loading')}
            </p>
          )}
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen(open => !open)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-white"
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
              isMobilePanelOpen
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
                  {t2('helper')}
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
