'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Search, Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Polygon } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { useEffect, useRef, useState, useCallback } from 'react'
import { fromLonLat } from 'ol/proj'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sonnendachService } from '@/services/sonnendach.service'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import type { SonnendachLocation, RoofSegment } from '@/types/sonnendach'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'
import { cn } from '@/lib/utils'

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
  const t = useTranslations('solarAboCalculator.step4')
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
  selectedSegmentsRef.current = selectedSegmentIds

  const drawSegmentOnMap = useCallback((segment: RoofSegment, isSelected: boolean) => {
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
      const color = segment.suitability?.color || SUITABILITY_CLASSES[segment.suitability?.class || 3]?.color || '#22C55E'
      feature.setStyle(new Style({
        fill: new Fill({ color: `${color}80` }),
        stroke: new Stroke({ color, width: 2 }),
      }))
    }

    vectorSourceRef.current.addFeature(feature)
  }, [])

  const redrawAllSegments = useCallback(() => {
    if (!vectorSourceRef.current || !building) return
    vectorSourceRef.current.clear()
    building.roofSegments.forEach(segment => {
      const isSelected = selectedSegmentsRef.current.includes(segment.id)
      drawSegmentOnMap(segment, isSelected)
    })
  }, [building, drawSegmentOnMap])

  useEffect(() => {
    redrawAllSegments()
  }, [selectedSegmentIds, redrawAllSegments])

  useEffect(() => {
    if (!mapRef.current || mapInitializedRef.current) return

    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

    const map = new Map({
      target: mapRef.current,
      controls: defaultControls({ zoom: true, rotate: false, attribution: false }),
      layers: [
        new TileLayer({ source: new XYZ({ url: SWISS_SATELLITE_URL, crossOrigin: 'anonymous' }) }),
        new TileLayer({ source: new XYZ({ url: SONNENDACH_URL, crossOrigin: 'anonymous' }), opacity: 0.7 }),
        new VectorLayer({ source: vectorSource }),
      ],
      view: new View({
        center: fromLonLat([8.2275, 46.8182]),
        zoom: 8,
      }),
    })

    map.on('click', (evt) => {
      const clickedFeature = map.forEachFeatureAtPixel(evt.pixel, f => f)
      if (clickedFeature) {
        const segmentId = clickedFeature.get('segmentId')
        if (segmentId) {
          toggleSegment(segmentId)
        }
      }
    })

    mapInstanceRef.current = map
    mapInitializedRef.current = true
    setIsLoadingMap(false)

    if (building) {
      const center = fromLonLat([building.center.lng, building.center.lat])
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

        autocomplete.addListener('place_changed', async () => {
          const place = autocomplete?.getPlace()
          if (place?.geometry?.location && place.formatted_address) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()

            setAddress(place.formatted_address)
            setShowResults(false)
            setIsFetchingBuilding(true)

            try {
              const buildingData = await sonnendachService.getBuildingDataFromWGS84(lat, lng)
              setBuilding(buildingData)

              if (mapInstanceRef.current) {
                const center = fromLonLat([lng, lat])
                mapInstanceRef.current.getView().animate({ center, zoom: 19, duration: 500 })
              }
            } catch (error) {
              console.error('Failed to fetch building data:', error)
            } finally {
              setIsFetchingBuilding(false)
            }
          }
        })
      } catch (error) {
        console.error('Failed to load Google Places:', error)
      }
    }

    initAutocomplete()
  }, [setAddress, setBuilding, setIsFetchingBuilding])

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

  const handleSelectResult = async (location: SonnendachLocation) => {
    setSelectedLocation(location)
    setAddress(location.attrs.label)
    setShowResults(false)
    setIsFetchingBuilding(true)

    try {
      const buildingData = await sonnendachService.getBuildingData(location.attrs.x, location.attrs.y)
      setBuilding(buildingData)

      if (mapInstanceRef.current) {
        const center = fromLonLat([location.attrs.lon, location.attrs.lat])
        mapInstanceRef.current.getView().animate({ center, zoom: 19, duration: 500 })
      }
    } catch (error) {
      console.error('Failed to fetch building:', error)
    } finally {
      setIsFetchingBuilding(false)
    }
  }

  const selectedArea = getSelectedArea()
  const canProceed = selectedSegmentIds.length > 0

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='mt-2 text-muted-foreground'>{t('helper')}</p>
        </div>

        <div className='grid lg:grid-cols-[1fr,400px] gap-6'>
          <div className='space-y-4'>
            <div className='relative'>
              <Input
                ref={inputRef}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('searchPlaceholder')}
                className='pr-10'
              />
              <button
                type='button'
                onClick={handleSearch}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground'
              >
                {isSearching ? <Loader2 className='h-5 w-5 animate-spin' /> : <Search className='h-5 w-5' />}
              </button>

              {showResults && searchResults.length > 0 && (
                <div className='absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md'>
                  <div className='flex items-center justify-between border-b px-3 py-2'>
                    <span className='text-sm text-muted-foreground'>{searchResults.length} {t('results')}</span>
                    <button onClick={() => setShowResults(false)} className='text-muted-foreground hover:text-foreground'>
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                  <ul className='max-h-60 overflow-auto py-1'>
                    {searchResults.map((result) => (
                      <li key={result.id}>
                        <button
                          type='button'
                          onClick={() => handleSelectResult(result)}
                          className='w-full px-3 py-2 text-left text-sm hover:bg-accent'
                        >
                          {result.attrs.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            <div
              ref={mapRef}
              className={cn(
                'h-[350px] w-full rounded-lg border bg-muted overflow-hidden',
                isLoadingMap && 'flex items-center justify-center'
              )}
            >
              {isLoadingMap && <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />}
            </div>

            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('suitability')}</p>
                <div className='mt-1 flex gap-1'>
                  {[1, 2, 3, 4, 5].map((cls) => (
                    <div
                      key={cls}
                      className='h-2 w-8 rounded'
                      style={{ backgroundColor: SUITABILITY_CLASSES[cls]?.color }}
                    />
                  ))}
                </div>
                <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                  <span>{t('veryGood')}</span>
                  <span>{t('moderate')}</span>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-sm text-muted-foreground'>{t('selected')}</p>
                <p className='text-2xl font-bold'>{Math.round(selectedArea)} m²</p>
              </div>
            </div>

            {isFetchingBuilding && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('loading')}
              </div>
            )}
          </div>
        </div>

        <div className='mt-8 flex gap-4'>
          <Button variant='outline' onClick={prevStep}>
            {tNav('back')}
          </Button>
          <Button className='flex-1' onClick={nextStep} disabled={!canProceed}>
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
