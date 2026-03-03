'use client'

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Sun,
  Ruler,
  Compass,
  CheckCircle2,
  XCircle,
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
import { fromLonLat } from 'ol/proj'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

import 'ol/ol.css'

// Swiss WMTS URLs with Web Mercator (EPSG:3857) - same as Step 1
const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
const SONNENDACH_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/3857/{z}/{x}/{y}.png'

export default function SonnendachStep2RoofSelection() {
  const t = useTranslations('sonnendach.step2')
  const {
    building,
    selectedSegmentIds,
    toggleSegmentSelection,
    selectAllSegments,
    clearSegmentSelection,
    selectSegmentsByMinSuitability,
    selectedArea,
    selectedPotentialKwh,
    estimatedPanelCount,
    fetchBuildingDataAtPoint,
    isFetchingBuilding,
    prevStep,
    nextStep,
    error,
  } = useSonnendachCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const mapInitializedRef = useRef(false)

  const [mapLoaded, setMapLoaded] = useState(false)

  // Highlight color for selected segments
  const SELECTED_COLOR = '#1B332D'
  const SELECTED_STROKE = '#b7fe1a' // Bright accent for visibility

  // Get style for a segment
  const getSegmentStyle = useCallback(
    (segmentId: string, isHovered: boolean = false) => {
      const segment = building?.roofSegments.find(s => s.id === segmentId)
      if (!segment) return new Style()

      const isSelected = selectedSegmentIds.includes(segmentId)
      const suitabilityColor = segment.suitability.color

      if (isSelected) {
        return new Style({
          fill: new Fill({
            color: `${SELECTED_COLOR}CC`, // 80% opacity
          }),
          stroke: new Stroke({
            color: SELECTED_STROKE,
            width: 3,
          }),
        })
      }

      return new Style({
        fill: new Fill({
          color: isHovered
            ? `${suitabilityColor}B3` // 70% opacity on hover
            : `${suitabilityColor}80`, // 50% opacity default (more visible)
        }),
        stroke: new Stroke({
          color: '#ffffff', // White border for visibility
          width: 2,
        }),
      })
    },
    [building, selectedSegmentIds]
  )

  // Convert LV95 coordinates to WGS84 (fallback if backend doesn't provide them)
  const lv95ToWgs84 = (easting: number, northing: number): [number, number] => {
    // Shift to origin
    const y1 = (easting - 2600000) / 1000000
    const x1 = (northing - 1200000) / 1000000

    // Calculate latitude
    const lat =
      16.9023892 +
      3.238272 * x1 -
      0.270978 * y1 * y1 -
      0.002528 * x1 * x1 -
      0.0447 * y1 * y1 * x1 -
      0.014 * x1 * x1 * x1

    // Calculate longitude
    const lng =
      2.6779094 +
      4.728982 * y1 +
      0.791484 * y1 * x1 +
      0.1306 * y1 * x1 * x1 -
      0.0436 * y1 * y1 * y1

    return [(lng * 100) / 36, (lat * 100) / 36] // [lng, lat]
  }

  // Draw roof segments on map
  const drawRoofSegments = useCallback(() => {
    if (!vectorSourceRef.current || !building) return

    // Clear existing features
    vectorSourceRef.current.clear()

    console.log('Drawing roof segments:', building.roofSegments.length)

    // Debug: log first segment's geometry
    if (building.roofSegments.length > 0) {
      const firstSeg = building.roofSegments[0]
      console.log('First segment geometry:', {
        hasCoordinates: !!firstSeg.geometry.coordinates?.length,
        hasWGS84: !!firstSeg.geometry.coordinatesWGS84?.length,
        lv95Sample: firstSeg.geometry.coordinates?.[0]?.[0],
        wgs84Sample: firstSeg.geometry.coordinatesWGS84?.[0]?.[0],
      })
    }

    // Add each segment as a feature
    building.roofSegments.forEach((segment, index) => {
      // Try WGS84 coordinates first, fall back to converting LV95
      let wgs84Coords = segment.geometry.coordinatesWGS84

      if (!wgs84Coords || wgs84Coords.length === 0) {
        // Convert LV95 coordinates to WGS84
        const lv95Coords = segment.geometry.coordinates
        if (!lv95Coords || lv95Coords.length === 0) {
          console.warn(`Segment ${index} has no coordinates`)
          return
        }

        wgs84Coords = lv95Coords.map(ring =>
          ring.map(point => lv95ToWgs84(point[0], point[1]))
        )
      }

      const coordinates = wgs84Coords[0]
      if (!coordinates || coordinates.length < 3) {
        console.warn(`Segment ${index} has insufficient coordinates`)
        return
      }

      // Convert WGS84 [lng, lat] to Web Mercator
      const webMercatorCoords = coordinates.map(coord => fromLonLat(coord))

      const polygon = new Polygon([webMercatorCoords])

      const feature = new Feature({
        geometry: polygon,
        segmentId: segment.id,
      })

      feature.setStyle(getSegmentStyle(segment.id))
      vectorSourceRef.current?.addFeature(feature)
    })

    console.log('Features added:', vectorSourceRef.current?.getFeatures().length)
  }, [building, getSegmentStyle])

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !building || mapInitializedRef.current) return

    try {
      // Swiss satellite imagery layer
      const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: SWISS_SATELLITE_URL,
          maxZoom: 20,
          crossOrigin: 'anonymous',
        }),
      })

      // Sonnendach overlay layer
      const sonnendachLayer = new TileLayer({
        source: new XYZ({
          url: SONNENDACH_URL,
          maxZoom: 20,
          crossOrigin: 'anonymous',
        }),
        opacity: 0.5, // Lower opacity so our segment overlays are more visible
        minZoom: 15,
      })

      // Create vector source for roof segments
      const vectorSource = new VectorSource()
      vectorSourceRef.current = vectorSource

      // Create vector layer for our segment overlays (high z-index to be on top)
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        zIndex: 100,
      })

      // Get center from building (WGS84)
      const center = fromLonLat([building.center.lng, building.center.lat])

      // Create map
      const map = new Map({
        target: mapRef.current,
        layers: [satelliteLayer, sonnendachLayer, vectorLayer],
        view: new View({
          center: center,
          zoom: 19,
          minZoom: 10,
          maxZoom: 22,
        }),
        controls: defaultControls({
          zoom: true,
          rotate: false,
          attribution: true,
        }),
      })

      mapInstanceRef.current = map
      mapInitializedRef.current = true
      setMapLoaded(true)

      // Draw initial segments
      drawRoofSegments()

      // Add click handler for segment selection
      map.on('click', async event => {
        const feature = map.forEachFeatureAtPixel(event.pixel, f => f)

        if (feature) {
          const segmentId = feature.get('segmentId')
          if (segmentId) {
            toggleSegmentSelection(segmentId)
          }
        }
      })

      // Add pointer cursor on hover
      map.on('pointermove', event => {
        const feature = map.forEachFeatureAtPixel(event.pixel, f => f)
        map.getTargetElement().style.cursor = feature ? 'pointer' : ''

        // Update hover styles
        vectorSource.getFeatures().forEach(f => {
          const segmentId = f.get('segmentId')
          const isHovered = f === feature
          f.setStyle(getSegmentStyle(segmentId, isHovered))
        })
      })
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [building, drawRoofSegments, getSegmentStyle, toggleSegmentSelection])

  // Update segment styles when selection changes
  useEffect(() => {
    if (!mapLoaded || !vectorSourceRef.current) return

    vectorSourceRef.current.getFeatures().forEach(feature => {
      const segmentId = feature.get('segmentId')
      feature.setStyle(getSegmentStyle(segmentId))
    })
  }, [selectedSegmentIds, mapLoaded, getSegmentStyle])

  // Initialize map when building data is available
  useEffect(() => {
    if (building && !mapInitializedRef.current) {
      initializeMap()
    }
  }, [building, initializeMap])

  // Update map when building changes
  useEffect(() => {
    if (mapLoaded && building && mapInstanceRef.current) {
      // Center map on new building
      const center = fromLonLat([building.center.lng, building.center.lat])
      mapInstanceRef.current.getView().setCenter(center)

      // Redraw segments
      drawRoofSegments()
    }
  }, [building, mapLoaded, drawRoofSegments])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined)
        mapInstanceRef.current = null
      }
      vectorSourceRef.current = null
      mapInitializedRef.current = false
    }
  }, [])

  const canContinue = selectedSegmentIds.length > 0

  if (!building) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">{t('loadingBuilding')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-[400px] border-r bg-background overflow-y-auto p-4 space-y-4">
        {/* Building Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t('buildingInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('totalArea')}</span>
              <span className="font-medium">{building.totalArea} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('totalPotential')}
              </span>
              <span className="font-medium">
                {building.totalPotentialKwh.toLocaleString()} kWh/year
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('roofSegments')}</span>
              <span className="font-medium">
                {building.roofSegments.length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Selection Summary */}
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
              <span className="font-medium">
                {selectedSegmentIds.length} / {building.roofSegments.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('selectedArea')}</span>
              <span className="font-medium">{selectedArea} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('selectedPotential')}
              </span>
              <span className="font-medium">
                {selectedPotentialKwh.toLocaleString()} kWh/year
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t('estimatedPanels')}
              </span>
              <span className="font-medium">{estimatedPanelCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('quickSelection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={selectAllSegments}
            >
              {t('selectAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => selectSegmentsByMinSuitability(3)}
            >
              {t('selectGoodAndAbove')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => selectSegmentsByMinSuitability(4)}
            >
              {t('selectVeryGoodAndAbove')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={clearSegmentSelection}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {t('clearSelection')}
            </Button>
          </CardContent>
        </Card>

        {/* Roof Segments List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('roofSegmentsList')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {building.roofSegments.map(segment => {
              const isSelected = selectedSegmentIds.includes(segment.id)
              const suitability = SUITABILITY_CLASSES[segment.suitability.class]

              return (
                <div
                  key={segment.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleSegmentSelection(segment.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSegmentSelection(segment.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: suitability?.color || '#888',
                          }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {suitability?.label || 'Unknown'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          {segment.area} m²
                        </div>
                        <div className="flex items-center gap-1">
                          <Compass className="w-3 h-3" />
                          {segment.azimuthCardinal} ({segment.azimuth}°)
                        </div>
                        <div className="flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          {segment.electricityYield.toLocaleString()} kWh
                        </div>
                        <div className="flex items-center gap-1">
                          Tilt: {segment.tilt}°
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('legend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(SUITABILITY_CLASSES).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: value.color }}
                  />
                  <span className="capitalize">{value.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={prevStep} className="flex-1 gap-2">
            <ChevronLeft className="w-4 h-4" />
            {t('back')}
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canContinue || isFetchingBuilding}
            className="flex-1 gap-2"
          >
            {isFetchingBuilding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {t('continue')}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        {isFetchingBuilding && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('loadingBuilding')}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 z-10 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg border text-xs">
          <p className="font-medium mb-1">{t('mapHelp.title')}</p>
          <ul className="text-muted-foreground space-y-0.5">
            <li>{t('mapHelp.click')}</li>
          </ul>
        </div>

        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  )
}
