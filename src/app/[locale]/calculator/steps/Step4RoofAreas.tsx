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
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { sonnendachService } from '@/services/sonnendach.service'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import type { RoofSegment } from '@/types/sonnendach'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

import 'ol/ol.css'

const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
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

  const {
    address,
    setAddress,
    building,
    setBuilding,
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

  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [focusedLat, setFocusedLat] = useState<number | null>(null)
  const [focusedLng, setFocusedLng] = useState<number | null>(null)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(true)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInitializedRef = useRef(false)
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
      const usedWgs84 = !!(wgs84Coords && wgs84Coords.length > 0)
      if (!wgs84Coords || wgs84Coords.length === 0) {
        const lv95Coords = segment.geometry.coordinates
        if (!lv95Coords || lv95Coords.length === 0) return
        wgs84Coords = lv95Coords.map(ring =>
          ring.map(point => lv95ToWgs84(point[0], point[1]))
        )
      }
      const coordinates = wgs84Coords[0]
      if (!coordinates || coordinates.length < 3) return
      console.log('[RoofAreas] drawSegment:', {
        id: segment.id,
        isSelected,
        usedWgs84,
        coordCount: coordinates.length,
        firstCoord: coordinates[0],
        lv95First: segment.geometry.coordinates?.[0]?.[0],
      })
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
    if (!vectorSourceRef.current || !buildingRef.current) return
    vectorSourceRef.current.clear()
    buildingRef.current.roofSegments.forEach(segment => {
      const isSelected = selectedSegmentsRef.current.includes(segment.id)
      drawSegmentOnMap(segment, isSelected)
    })
  }, [drawSegmentOnMap])

  useEffect(() => {
    if (building) redrawAllSegments()
  }, [selectedSegmentIds, building, redrawAllSegments])

  const fetchBuildingAt = useCallback(
    async (lat: number, lng: number) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setIsFetchingBuilding(true)
      try {
        const lv95 = await sonnendachService.convertToLV95(lat, lng)
        const buildingData = await sonnendachService
          .getBuildingData(lv95.y, lv95.x)
          .catch(() => null)
        console.log('[RoofAreas] fetchBuildingAt response:', {
          buildingId: buildingData?.buildingId,
          segmentCount: buildingData?.roofSegments.length,
          segments: buildingData?.roofSegments.map(s => ({
            id: s.id,
            area: s.area,
            tilt: s.tilt,
            azimuth: s.azimuth,
            azimuthCardinal: s.azimuthCardinal,
            suitabilityClass: s.suitability?.class,
            electricityYield: s.electricityYield,
          })),
          center: buildingData?.center,
          currentBuildingId: buildingRef.current?.buildingId,
        })
        if (buildingData && buildingData.roofSegments.length > 0) {
          setBuilding(buildingData)
          const MIN_SEGMENT_AREA = 5

          buildingData.roofSegments.forEach(segment => {
            const suitClass = segment.suitability?.class || 0
            const yieldPerM2 = segment.area > 0 ? Math.round(segment.electricityYield / segment.area) : 0
            const willSelect = segment.area >= MIN_SEGMENT_AREA && suitClass <= 3
            console.log('[RoofAreas] segment auto-select check:', {
              id: segment.id,
              suitClass,
              area: segment.area,
              azimuth: `${segment.azimuthCardinal} (${segment.azimuth}°)`,
              yieldPerM2,
              willSelect,
            })
            if (willSelect && !selectedSegmentsRef.current.includes(segment.id)) {
              toggleSegment(segment.id)
            }
          })
          if (mapInstanceRef.current) {
            const center = fromLonLat([
              buildingData.center.lng,
              buildingData.center.lat,
            ])
            mapInstanceRef.current
              .getView()
              .animate({ center, zoom: 19, duration: 500 })
          }
        }
      } catch (error) {
        console.error('No building data at this location:', error)
      } finally {
        setIsFetchingBuilding(false)
        isFetchingRef.current = false
      }
    },
    [toggleSegment, setBuilding, setIsFetchingBuilding]
  )

  const handleMapClick = useCallback(
    async (coordinate: number[], pixel: number[]) => {
      const map = mapInstanceRef.current
      if (!map) return
      const clickedFeature = map.forEachFeatureAtPixel(pixel, f => f)
      if (clickedFeature) {
        const segmentId = clickedFeature.get('segmentId')
        if (segmentId) {
          const wasSelected = selectedSegmentsRef.current.includes(segmentId)
          console.log('[RoofAreas] clicked segment:', {
            segmentId,
            action: wasSelected ? 'DESELECT' : 'SELECT',
            currentlySelected: [...selectedSegmentsRef.current],
          })
          toggleSegment(segmentId)
          return
        }
      }
      const [lng, lat] = toLonLat(coordinate)
      console.log('[RoofAreas] clicked empty space, fetching building at:', { lat, lng })
      await fetchBuildingAt(lat, lng)
    },
    [toggleSegment, fetchBuildingAt]
  )

  const handleMapClickRef = useRef(handleMapClick)
  handleMapClickRef.current = handleMapClick

  useEffect(() => {
    if (!hasBuilding || !mapRef.current || mapInitializedRef.current) return

    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

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
        new TileLayer({
          source: new XYZ({ url: SONNENDACH_URL, crossOrigin: 'anonymous' }),
          opacity: 0.7,
        }),
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
    setIsLoadingMap(false)

    if (buildingRef.current) {
      const center = fromLonLat([
        buildingRef.current.center.lng,
        buildingRef.current.center.lat,
      ])
      map.getView().animate({ center, zoom: 19, duration: 500 })
      redrawAllSegments()
    } else if (focusedLat && focusedLng) {
      fetchBuildingAt(focusedLat, focusedLng)
    }

    return () => {
      map.setTarget(undefined)
      mapInitializedRef.current = false
    }
  }, [hasBuilding, focusedLat, focusedLng, redrawAllSegments, fetchBuildingAt])

  const placesLoadedRef = useRef(false)
  const autocompleteLibRef = useRef<
    typeof google.maps.places.Autocomplete | null
  >(null)

  useEffect(() => {
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
        fields: ['formatted_address', 'geometry'],
        types: ['address'],
      })
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (place?.geometry?.location && place.formatted_address) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          setAddress(place.formatted_address)
          setFocusedLat(lat)
          setFocusedLng(lng)
          setIsMobilePanelOpen(false)

          if (mapInstanceRef.current) {
            mapInstanceRef.current.getView().animate({
              center: fromLonLat([lng, lat]),
              zoom: 19,
              duration: 500,
            })
            fetchBuildingAt(lat, lng)
          }
        }
      })
    },
    [setAddress, fetchBuildingAt]
  )

  const initGooglePlaces = useCallback(
    (el: HTMLInputElement | null) => {
      if (!el) return
      inputRef.current = el
      if (autocompleteLibRef.current) attachAutocomplete(el)
    },
    [attachAutocomplete]
  )

  const handleNext = () => {
    const map = mapInstanceRef.current
    const source = vectorSourceRef.current
    if (!map || !source) {
      nextStep()
      return
    }

    const selectedFeatures = source
      .getFeatures()
      .filter(f => selectedSegmentIds.includes(f.get('segmentId')))
    if (selectedFeatures.length === 0) {
      nextStep()
      return
    }

    const selectedSource = new VectorSource({ features: selectedFeatures })
    const extent = selectedSource.getExtent()
    if (!extent || !isFinite(extent[0])) {
      nextStep()
      return
    }

    map.getView().fit(extent, {
      padding: [60, 60, 60, 60],
      maxZoom: 20,
      duration: 500,
      callback: () => {
        const doCapture = () => {
          map.once('rendercomplete', () => {
            const target = map.getTargetElement() as HTMLElement
            const canvases = target.querySelectorAll('canvas')
            const firstCanvas = canvases[0]
            if (!firstCanvas) {
              nextStep()
              return
            }
            const mapCanvas = document.createElement('canvas')
            mapCanvas.width = firstCanvas.width
            mapCanvas.height = firstCanvas.height
            const ctx = mapCanvas.getContext('2d')
            if (!ctx) {
              nextStep()
              return
            }
            canvases.forEach(c => {
              if (c.width > 0 && c.height > 0) {
                try {
                  ctx.drawImage(c, 0, 0)
                } catch {}
              }
            })
            setRoofImage(mapCanvas.toDataURL('image/jpeg', 0.8))
            nextStep()
          })
          map.renderSync()
        }

        setTimeout(doCapture, 1000)
      },
    })
  }

  const selectedArea = getSelectedArea()
  const canProceed = selectedSegmentIds.length > 0

  if (!hasBuilding) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
              {t('title')}
            </h1>
            <p className="mt-5 text-lg sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
              {t('helper')}
            </p>
          </div>

          <div className="w-full max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#062E25]/30 pointer-events-none" />
            <Input
              ref={initGooglePlaces}
              defaultValue={address}
              placeholder={t('searchPlaceholder')}
              className="h-14 text-base pl-12 pr-4 rounded-xl border-[#062E25]/20 bg-white shadow-sm focus-visible:border-[#062E25]/40"
            />
          </div>

          <p className="mt-5 text-sm text-[#062E25]/40 italic">
            {t('officialMap')}
          </p>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-3 px-6 py-4"
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
        className={cn(
          'absolute inset-0 w-full h-full bg-muted',
          isLoadingMap && 'flex items-center justify-center'
        )}
      >
        {isLoadingMap && (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="absolute top-[100px] left-4 z-10 hidden sm:flex w-[320px] flex-col gap-3">
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(30, 42, 38, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-sm text-[#EAEDDF]/70 mb-1.5">
            {t('locationLabel')}
          </p>
          <Input
            ref={initGooglePlaces}
            defaultValue={address}
            placeholder={t('searchPlaceholder')}
            className="bg-[#2A3B36] border-[#4A5B56] text-white placeholder:text-white/40"
          />
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
          {isFetchingBuilding && (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#B7FE1A]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('loading')}
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(30, 42, 38, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#EAEDDF]/70">{t('selected')}:</p>
            <p className="text-2xl font-medium text-[#B7FE1A]">
              {Math.round(selectedArea)} m²
            </p>
          </div>

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
            <div className="mt-1 flex justify-between text-xs text-[#EAEDDF]/40">
              <span>{t('excellent')}</span>
              <span>{t('low')}</span>
            </div>
          </div>
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
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen(open => !open)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-white"
          >
            <span className="text-sm font-medium">{t('selected')}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#B7FE1A]">
                {Math.round(selectedArea)} m²
              </span>
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
            <div className="px-4 pb-3 text-sm text-[#EAEDDF]/70">
              {t('clickHint')}
            </div>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-3 px-6 py-4"
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
        <Button onClick={handleNext} disabled={!canProceed}>
          {tNav('next')}
        </Button>
      </div>
    </div>
  )
}
