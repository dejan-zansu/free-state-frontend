'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, ChevronRight, Loader2, Building2, Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Point } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Circle, Fill, Stroke, Style } from 'ol/style'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toLonLat, fromLonLat } from 'ol/proj'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { sonnendachService } from '@/services/sonnendach.service'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

import 'ol/ol.css'

// Swiss WMTS base URL with Web Mercator (EPSG:3857) support
const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
const SONNENDACH_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/3857/{z}/{x}/{y}.png'

export default function SonnendachStep1Address() {
  const t = useTranslations('sonnendach.step1')
  const {
    fetchBuildingDataAtPoint,
    isFetchingBuilding,
    building,
    nextStep,
    error,
    clearError,
  } = useSonnendachCalculatorStore()

  const [inputValue, setInputValue] = useState('')
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle fetching building at a WGS84 location
  const fetchBuildingAtWGS84 = useCallback(
    async (lat: number, lng: number) => {
      try {
        clearError()

        // Convert WGS84 to LV95 for the API call
        const lv95 = await sonnendachService.convertToLV95(lat, lng)

        // Fetch building data (backend expects x=Northing, y=Easting in GeoAdmin convention)
        await fetchBuildingDataAtPoint(lv95.y, lv95.x)
      } catch (err) {
        console.error('Failed to fetch building:', err)
      }
    },
    [fetchBuildingDataAtPoint, clearError]
  )

  // Update marker on map
  const updateMarker = useCallback((lng: number, lat: number) => {
    if (!markerLayerRef.current) return

    const source = markerLayerRef.current.getSource()
    if (!source) return

    source.clear()

    const marker = new Feature({
      geometry: new Point(fromLonLat([lng, lat])),
    })

    marker.setStyle(
      new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({ color: '#b7fe1a' }),
          stroke: new Stroke({ color: '#062e25', width: 3 }),
        }),
      })
    )

    source.addFeature(marker)
  }, [])

  // Initialize OpenLayers map with Swiss tiles
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Swiss satellite imagery layer
    const satelliteSource = new XYZ({
      url: SWISS_SATELLITE_URL,
      maxZoom: 20,
      crossOrigin: 'anonymous',
    })

    const satelliteLayer = new TileLayer({
      source: satelliteSource,
    })

    // Sonnendach overlay layer - shows colored roof segments
    // Note: Roof data is only visible at zoom levels 16+ (individual roofs)
    const sonnendachSource = new XYZ({
      url: SONNENDACH_URL,
      maxZoom: 20,
      crossOrigin: 'anonymous',
    })

    // Add error logging for debugging tile loading issues
    sonnendachSource.on('tileloaderror', (event) => {
      console.error('Sonnendach tile load error:', event.tile.getTileCoord())
    })

    const sonnendachLayer = new TileLayer({
      source: sonnendachSource,
      opacity: 0.7,
      minZoom: 15, // Only show overlay at zoom levels where roofs are visible
    })

    // Marker layer
    const markerSource = new VectorSource()
    const markerLayer = new VectorLayer({
      source: markerSource,
      zIndex: 20,
    })
    markerLayerRef.current = markerLayer

    // Create map centered on Zurich (high zoom to show roofs)
    const map = new Map({
      target: mapRef.current,
      layers: [satelliteLayer, sonnendachLayer, markerLayer],
      view: new View({
        center: fromLonLat([8.5417, 47.3769]), // Zurich
        zoom: 18, // Start at zoom level where roof overlays are visible
        maxZoom: 22,
        minZoom: 10,
      }),
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: true,
      }),
    })

    mapInstanceRef.current = map
    setIsLoadingMap(false)

    // Handle map clicks
    map.on('click', async (event) => {
      const coordinate = event.coordinate
      const [lng, lat] = toLonLat(coordinate)

      // Update marker
      updateMarker(lng, lat)

      // Fetch building data
      await fetchBuildingAtWGS84(lat, lng)
    })

    // Change cursor on hover
    map.on('pointermove', () => {
      map.getTargetElement().style.cursor = 'pointer'
    })
  }, [fetchBuildingAtWGS84, updateMarker])

  // Initialize Google Places Autocomplete
  const initGooglePlaces = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !inputRef.current) return

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      })

      await loader.importLibrary('places')
      setIsGoogleLoaded(true)

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ch' },
        fields: ['formatted_address', 'geometry', 'name'],
      })

      autocomplete.addListener('place_changed', async () => {
        const place = autocomplete.getPlace()
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()

          setInputValue(place.formatted_address || place.name || '')

          // Center map and zoom in
          if (mapInstanceRef.current) {
            mapInstanceRef.current.getView().animate({
              center: fromLonLat([lng, lat]),
              zoom: 19,
              duration: 500,
            })
          }

          // Update marker
          updateMarker(lng, lat)

          // Fetch building data
          await fetchBuildingAtWGS84(lat, lng)
        }
      })

      autocompleteRef.current = autocomplete
    } catch (err) {
      console.error('Failed to load Google Places:', err)
    }
  }, [fetchBuildingAtWGS84, updateMarker])

  // Initialize map and Google Places on mount
  useEffect(() => {
    initializeMap()
    initGooglePlaces()

    // Cleanup on unmount (for hot reload support)
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined)
        mapInstanceRef.current = null
      }
      markerLayerRef.current = null
    }
  }, [initializeMap, initGooglePlaces])

  const canContinue = building !== null

  return (
    <div className='h-full flex'>
      {/* Sidebar */}
      <div className='w-[400px] border-r bg-background overflow-y-auto p-4 space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Building2 className='w-5 h-5 text-primary' />
            <h2 className='text-lg font-semibold'>{t('title')}</h2>
          </div>
          <p className='text-sm text-muted-foreground'>{t('subtitle')}</p>
        </div>

        {/* Address Search with Google Places */}
        <div className='relative'>
          <div className='relative'>
            <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10' />
            <Input
              ref={inputRef}
              type='text'
              placeholder={t('placeholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className='pl-10 pr-10 h-12 text-base'
            />
          </div>
        </div>

        {/* Info Box */}
        <Card className='bg-muted/50'>
          <CardContent className='p-4 flex items-start gap-3'>
            <Info className='w-5 h-5 text-muted-foreground shrink-0 mt-0.5' />
            <p className='text-sm text-muted-foreground'>{t('mapInfo')}</p>
          </CardContent>
        </Card>

        {/* Selected Building Info */}
        {building && (
          <Card className='border-primary/50 bg-primary/5'>
            <CardContent className='p-4 space-y-3'>
              <div className='flex items-center gap-2'>
                <Building2 className='w-5 h-5 text-primary' />
                <span className='font-medium'>{t('buildingFound')}</span>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('roofSegments')}</span>
                  <span className='font-medium'>{building.roofSegments.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('totalArea')}</span>
                  <span className='font-medium'>{building.totalArea} m²</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>{t('totalPotential')}</span>
                  <span className='font-medium'>
                    {building.totalPotentialKwh.toLocaleString()} kWh/year
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
            {error}
          </div>
        )}

        {/* Loading State */}
        {isFetchingBuilding && (
          <div className='flex items-center gap-3 p-4 rounded-lg bg-muted/50'>
            <Loader2 className='w-5 h-5 animate-spin text-primary' />
            <span className='text-sm'>{t('loading')}</span>
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={nextStep}
          disabled={!canContinue || isFetchingBuilding}
          className='w-full h-12 text-base gap-2'
        >
          {t('continue')}
          <ChevronRight className='w-5 h-5' />
        </Button>
      </div>

      {/* Map */}
      <div className='flex-1 relative'>
        <div ref={mapRef} className='w-full h-full' style={{ minHeight: '400px' }} />

        {isLoadingMap && (
          <div className='absolute inset-0 flex items-center justify-center bg-background/80'>
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
              <span className='text-sm text-muted-foreground'>Loading map...</span>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className='absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border text-xs'>
          <p className='font-medium mb-2'>{t('legend')}</p>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-red-500' />
              <span>{t('legendExcellent')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-orange-500' />
              <span>{t('legendVeryGood')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-yellow-500' />
              <span>{t('legendGood')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-green-500' />
              <span>{t('legendMedium')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-blue-500' />
              <span>{t('legendLow')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
