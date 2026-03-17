'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Loader2, Search, X } from 'lucide-react'
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
import type { RoofSegment, SonnendachLocation } from '@/types/sonnendach'
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
    setSelectedLocation,
    building,
    setBuilding,
    selectedSegmentIds,
    toggleSegment,
    isSearching,
    setIsSearching,
    isFetchingBuilding,
    setIsFetchingBuilding,
    getSelectedArea,
    prevStep,
    nextStep,
  } = useSolarAboCalculatorStore()

  const [searchResults, setSearchResults] = useState<SonnendachLocation[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoadingMap, setIsLoadingMap] = useState(true)

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
      const feature = new Feature({
        geometry: polygon,
        segmentId: segment.id,
      })

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
    if (building) {
      redrawAllSegments()
    }
  }, [selectedSegmentIds, building, redrawAllSegments])

  const handleMapClick = useCallback(
    async (coordinate: number[], pixel: number[]) => {
      const map = mapInstanceRef.current
      if (!map) return

      const clickedFeature = map.forEachFeatureAtPixel(pixel, f => f)
      if (clickedFeature) {
        const segmentId = clickedFeature.get('segmentId')
        if (segmentId) {
          toggleSegment(segmentId)
          return
        }
      }

      if (isFetchingRef.current) return
      isFetchingRef.current = true
      setIsFetchingBuilding(true)

      try {
        const [lng, lat] = toLonLat(coordinate)
        const lv95 = await sonnendachService.convertToLV95(lat, lng)
        const buildingData = await sonnendachService.getBuildingData(
          lv95.y,
          lv95.x
        )

        if (buildingData && buildingData.roofSegments.length > 0) {
          setBuilding(buildingData)

          buildingData.roofSegments.forEach(segment => {
            if (!selectedSegmentsRef.current.includes(segment.id)) {
              toggleSegment(segment.id)
            }
          })

          const center = fromLonLat([
            buildingData.center.lng,
            buildingData.center.lat,
          ])
          map.getView().animate({ center, zoom: 19, duration: 500 })
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

  const handleMapClickRef = useRef(handleMapClick)
  handleMapClickRef.current = handleMapClick

  useEffect(() => {
    if (!mapRef.current || mapInitializedRef.current) return

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
        center: fromLonLat([8.2275, 46.8182]),
        zoom: 8,
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
    }

    return () => {
      map.setTarget(undefined)
      mapInitializedRef.current = false
    }
  }, [])

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null

    const initAutocomplete = async () => {
      if (!inputRef.current) return

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places'],
      })

      try {
        const { Autocomplete } = await loader.importLibrary('places')
        autocomplete = new Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'ch' },
          fields: ['formatted_address', 'geometry'],
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete?.getPlace()
          if (place?.geometry?.location && place.formatted_address) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()

            setAddress(place.formatted_address)
            setShowResults(false)

            if (mapInstanceRef.current) {
              const view = mapInstanceRef.current.getView()
              const currentZoom = view.getZoom() || 18
              view.animate({
                center: fromLonLat([lng, lat]),
                zoom: Math.max(currentZoom, 19),
                duration: 500,
              })
            }
          }
        })
      } catch (error) {
        console.error('Failed to load Google Places:', error)
      }
    }

    initAutocomplete()
  }, [setAddress])

  const handleSearch = async () => {
    if (!address.trim()) return
    setIsSearching(true)
    setShowResults(true)
    try {
      const results = await sonnendachService.searchAddress(address)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (location: SonnendachLocation) => {
    setSelectedLocation(location)
    setAddress(location.attrs.label)
    setShowResults(false)

    if (mapInstanceRef.current) {
      const center = fromLonLat([location.attrs.lon, location.attrs.lat])
      const view = mapInstanceRef.current.getView()
      const currentZoom = view.getZoom() || 18
      view.animate({
        center,
        zoom: Math.max(currentZoom, 19),
        duration: 500,
      })
    }
  }

  const selectedArea = getSelectedArea()
  const canProceed = selectedSegmentIds.length > 0

  return (
    <div className="relative h-full w-full">
      {/* Full-screen map */}
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

      <div className="absolute top-[100px] left-4 z-10 flex flex-col gap-3 w-[320px]">
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(30, 42, 38, 0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h2 className="text-xl font-medium text-white">{t('title')}</h2>

          <p className="mt-4 text-sm text-[#EAEDDF]/70">{t('locationLabel')}</p>
          <div className="mt-1.5 relative">
            <Input
              ref={inputRef}
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('searchPlaceholder')}
              className="bg-[#2A3B36] border-[#4A5B56] text-white placeholder:text-white/40 pr-10"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white"
            >
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-[#4A5B56] bg-[#2A3B36] shadow-md">
                <div className="flex items-center justify-between border-b border-[#4A5B56] px-3 py-2">
                  <span className="text-sm text-white/60">
                    {searchResults.length} {t('results')}
                  </span>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ul className="max-h-60 overflow-auto py-1">
                  {searchResults.map(result => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectResult(result)}
                        className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                      >
                        {result.attrs.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="mt-2 text-sm text-[#EAEDDF]/50 italic">
            {t('officialMap')}
          </p>

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
          <h2 className="text-xl font-medium text-white">{t('title')}</h2>

          <p className="mt-4 text-sm text-[#EAEDDF]/70">{t('suitability')}</p>
          <div className="mt-2 h-2.5 rounded-full overflow-hidden flex">
            {[1, 2, 3, 4, 5].map(cls => (
              <div
                key={cls}
                className="flex-1"
                style={{ backgroundColor: SUITABILITY_CLASSES[cls]?.color }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-sm text-[#EAEDDF]/50">
            <span>{t('veryGood')}</span>
            <span>{t('moderate')}</span>
          </div>

          <p className="mt-4 text-sm text-[#EAEDDF]/70">{t('selected')}:</p>
          <p className="text-3xl font-medium text-[#B7FE1A]">
            {Math.round(selectedArea)} m²
          </p>
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
        <Button onClick={nextStep} disabled={!canProceed}>
          {tNav('next')}
        </Button>
      </div>
    </div>
  )
}
