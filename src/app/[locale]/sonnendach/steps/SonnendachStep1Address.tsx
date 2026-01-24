'use client'

import { Loader } from '@googlemaps/js-api-loader'
import {
  MapPin,
  ChevronRight,
  Loader2,
  Building2,
  Info,
  CheckCircle2,
  XCircle,
  X,
  Sun,
  Ruler,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Polygon } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { useEffect, useRef, useState } from 'react'
import { toLonLat, fromLonLat } from 'ol/proj'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { sonnendachService } from '@/services/sonnendach.service'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'
import type { RoofSegment } from '@/types/sonnendach'

import 'ol/ol.css'

// Swiss WMTS base URL with Web Mercator (EPSG:3857) support
const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
const SONNENDACH_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/3857/{z}/{x}/{y}.png'

// Colors for selection
const SELECTED_COLOR = '#1B332D'
const SELECTED_STROKE = '#b7fe1a'

// Selected segment style
const selectedStyle = new Style({
  fill: new Fill({ color: `${SELECTED_COLOR}` }),
  stroke: new Stroke({ color: SELECTED_STROKE, width: 3 }),
})

// Convert LV95 coordinates to WGS84
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

export default function SonnendachStep1Address() {
  const t = useTranslations('sonnendach.step1')
  const { goToStep, error, clearError } = useSonnendachCalculatorStore()

  const [inputValue, setInputValue] = useState('')
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [isFetchingSegment, setIsFetchingSegment] = useState(false)
  const [selectedSegments, setSelectedSegments] = useState<RoofSegment[]>([])

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInitializedRef = useRef(false)

  // Use ref for selectedSegments to avoid stale closures in map event handlers
  const selectedSegmentsRef = useRef<RoofSegment[]>([])
  selectedSegmentsRef.current = selectedSegments

  // Draw a segment on the map
  const drawSegmentOnMap = (segment: RoofSegment) => {
    if (!vectorSourceRef.current) {
      console.log('No vector source')
      return
    }

    // Get WGS84 coordinates
    let wgs84Coords = segment.geometry.coordinatesWGS84

    if (!wgs84Coords || wgs84Coords.length === 0) {
      const lv95Coords = segment.geometry.coordinates
      if (!lv95Coords || lv95Coords.length === 0) {
        console.log('No coordinates for segment', segment.id)
        return
      }

      // Convert LV95 to WGS84
      wgs84Coords = lv95Coords.map(ring =>
        ring.map(point => lv95ToWgs84(point[0], point[1]))
      )
    }

    const coordinates = wgs84Coords[0]
    if (!coordinates || coordinates.length < 3) {
      console.log('Insufficient coordinates for segment', segment.id)
      return
    }

    // Convert to Web Mercator for OpenLayers
    const webMercatorCoords = coordinates.map(coord => fromLonLat(coord))

    const polygon = new Polygon([webMercatorCoords])
    const feature = new Feature({
      geometry: polygon,
      segmentId: segment.id,
    })

    feature.setStyle(selectedStyle)
    vectorSourceRef.current.addFeature(feature)

    console.log(
      'Drew segment on map:',
      segment.id,
      'coords:',
      coordinates.length
    )
  }

  // Remove a segment from the map
  const removeSegmentFromMap = (segmentId: string) => {
    if (!vectorSourceRef.current) return

    const features = vectorSourceRef.current.getFeatures()
    const feature = features.find(f => f.get('segmentId') === segmentId)
    if (feature) {
      vectorSourceRef.current.removeFeature(feature)
      console.log('Removed segment from map:', segmentId)
    }
  }

  // Handle map click
  const handleMapClick = async (lat: number, lng: number, pixel: number[]) => {
    // Check if clicked on an existing selected segment
    if (mapInstanceRef.current && vectorSourceRef.current) {
      const feature = mapInstanceRef.current.forEachFeatureAtPixel(
        pixel,
        f => f
      )

      if (feature) {
        const segmentId = feature.get('segmentId')
        if (segmentId) {
          // Remove from selection
          setSelectedSegments(prev => prev.filter(s => s.id !== segmentId))
          removeSegmentFromMap(segmentId)
          return
        }
      }
    }

    // Fetch new segment at click location
    setIsFetchingSegment(true)
    clearError()

    try {
      const lv95 = await sonnendachService.convertToLV95(lat, lng)
      const building = await sonnendachService.getBuildingData(lv95.y, lv95.x)

      if (building && building.roofSegments.length > 0) {
        // Find the exact segment that was clicked using clickedSegmentId
        const clickedSegment = building.clickedSegmentId
          ? building.roofSegments.find(s => s.id === building.clickedSegmentId)
          : building.roofSegments[0]

        if (!clickedSegment) {
          console.log('Could not find clicked segment')
          return
        }

        // Check if already selected
        const isAlreadySelected = selectedSegmentsRef.current.some(
          s => s.id === clickedSegment.id
        )

        if (!isAlreadySelected) {
          // Add to selection
          setSelectedSegments(prev => [...prev, clickedSegment])
          drawSegmentOnMap(clickedSegment)
        }
      }
    } catch (err) {
      console.error('Failed to fetch segment:', err)
    } finally {
      setIsFetchingSegment(false)
    }
  }

  // Initialize map once on mount
  useEffect(() => {
    if (!mapRef.current || mapInitializedRef.current) return

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: SWISS_SATELLITE_URL,
        maxZoom: 20,
        crossOrigin: 'anonymous',
      }),
    })

    const sonnendachLayer = new TileLayer({
      source: new XYZ({
        url: SONNENDACH_URL,
        maxZoom: 20,
        crossOrigin: 'anonymous',
      }),
      opacity: 0.7,
      minZoom: 15,
    })

    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 100,
    })

    const map = new Map({
      target: mapRef.current,
      layers: [satelliteLayer, sonnendachLayer, vectorLayer],
      view: new View({
        center: fromLonLat([8.5417, 47.3769]),
        zoom: 18,
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
    mapInitializedRef.current = true
    setIsLoadingMap(false)

    // Handle map clicks
    map.on('click', async event => {
      const coordinate = event.coordinate
      const [lng, lat] = toLonLat(coordinate)
      await handleMapClick(lat, lng, event.pixel)
    })

    // Pointer cursor
    map.on('pointermove', () => {
      map.getTargetElement().style.cursor = 'pointer'
    })

    return () => {
      map.setTarget(undefined)
      mapInstanceRef.current = null
      vectorSourceRef.current = null
      mapInitializedRef.current = false
    }
  }, []) // Empty deps - only run once

  // Initialize Google Places
  useEffect(() => {
    const initGooglePlaces = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey || !inputRef.current) return

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places'],
        })

        await loader.importLibrary('places')

        const autocomplete = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            componentRestrictions: { country: 'ch' },
            fields: ['formatted_address', 'geometry', 'name'],
          }
        )

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()

            setInputValue(place.formatted_address || place.name || '')

            // Just center the map - don't reset zoom if already zoomed in
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
      } catch (err) {
        console.error('Failed to load Google Places:', err)
      }
    }

    initGooglePlaces()
  }, [])

  // Calculate totals
  const totalArea = selectedSegments.reduce((sum, s) => sum + s.area, 0)
  const totalPotential = selectedSegments.reduce(
    (sum, s) => sum + s.electricityYield,
    0
  )
  const totalPanels = selectedSegments.reduce(
    (sum, s) => sum + (s.estimatedPanels || 0),
    0
  )

  const canContinue = selectedSegments.length > 0

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedSegments([])
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear()
    }
  }

  // Handle continue
  const handleContinue = () => {
    const { setSelectedSegmentsData } = useSonnendachCalculatorStore.getState()
    setSelectedSegmentsData(selectedSegments)
    goToStep(3)
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-[400px] border-r bg-background overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('title')}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Address Search */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={t('placeholder')}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            className="pl-10 pr-10 h-12 text-base"
          />
        </div>

        {/* Info Box */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t('clickRoofInfo')}
            </p>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isFetchingSegment && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Selection Summary */}
        {selectedSegments.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t('selectedSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('selectedSegments')}
                </span>
                <span className="font-medium">{selectedSegments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('selectedArea')}
                </span>
                <span className="font-medium">
                  {Math.round(totalArea * 10) / 10} m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('selectedPotential')}
                </span>
                <span className="font-medium">
                  {totalPotential.toLocaleString()} kWh/year
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('estimatedPanels')}
                </span>
                <span className="font-medium">{totalPanels}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-muted-foreground"
                onClick={handleClearSelection}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t('clearSelection')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Selected Segments List */}
        {selectedSegments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('selectedRoofParts')}
            </p>
            {selectedSegments.map((segment, index) => (
              <div
                key={segment.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: segment.suitability.color }}
                    />
                    <span className="text-sm font-medium">
                      {t('roofPart')} {index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      ({segment.suitability.label})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      {segment.area} m²
                    </span>
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3" />
                      {segment.electricityYield.toLocaleString()} kWh
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setSelectedSegments(prev =>
                      prev.filter(s => s.id !== segment.id)
                    )
                    removeSegmentFromMap(segment.id)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!canContinue || isFetchingSegment}
          className="w-full h-12 text-base gap-2"
        >
          {t('continue')}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {isLoadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Loading map...
              </span>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border text-xs">
          <p className="font-medium mb-2">{t('legend')}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>{t('legendExcellent')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>{t('legendVeryGood')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>{t('legendGood')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>{t('legendMedium')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>{t('legendLow')}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SELECTED_COLOR }}
              />
              <span>{t('legendSelected')}</span>
            </div>
          </div>
        </div>

        {/* Help tooltip */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border text-xs max-w-[200px]">
          <p className="text-muted-foreground">{t('clickToSelect')}</p>
        </div>
      </div>
    </div>
  )
}
