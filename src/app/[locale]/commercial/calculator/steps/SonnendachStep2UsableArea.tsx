'use client'

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Home,
  Layers,
  Trash2,
  Plus,
  Square,
  Check,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Polygon } from 'ol/geom'
import { Draw } from 'ol/interaction'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { fromLonLat, toLonLat } from 'ol/proj'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useSonnendachCalculatorStore,
  RoofType,
  RoofMaterial,
  RestrictedArea,
} from '@/stores/sonnendach-calculator.store'

import 'ol/ol.css'

// Swiss WMTS URLs
const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
const SONNENDACH_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/3857/{z}/{x}/{y}.png'

// Colors
const SELECTED_SEGMENT_COLOR = '#1B332D'
const SELECTED_SEGMENT_STROKE = '#b7fe1a'
const NON_SELECTED_SEGMENT_COLOR = '#6B7280'  // Gray for non-selected segments
const NON_SELECTED_SEGMENT_STROKE = '#9CA3AF'
const RESTRICTED_FILL_COLOR = '#EF4444'
const RESTRICTED_STROKE_COLOR = '#DC2626'
const DRAWING_FILL_COLOR = '#F97316'
const DRAWING_STROKE_COLOR = '#EA580C'

// Styles
const selectedSegmentStyle = new Style({
  fill: new Fill({ color: `${SELECTED_SEGMENT_COLOR}66` }),
  stroke: new Stroke({ color: SELECTED_SEGMENT_STROKE, width: 2 }),
})

const nonSelectedSegmentStyle = new Style({
  fill: new Fill({ color: `${NON_SELECTED_SEGMENT_COLOR}33` }),
  stroke: new Stroke({ color: NON_SELECTED_SEGMENT_STROKE, width: 1, lineDash: [4, 4] }),
})

const restrictedAreaStyle = new Style({
  fill: new Fill({ color: `${RESTRICTED_FILL_COLOR}88` }),
  stroke: new Stroke({ color: RESTRICTED_STROKE_COLOR, width: 2 }),
})

const drawingStyle = new Style({
  fill: new Fill({ color: `${DRAWING_FILL_COLOR}66` }),
  stroke: new Stroke({ color: DRAWING_STROKE_COLOR, width: 2, lineDash: [5, 5] }),
})

// Convert LV95 to WGS84
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

// Calculate polygon area in m² from WGS84 coordinates
const calculatePolygonArea = (coords: number[][]): number => {
  if (coords.length < 3) return 0

  const centerLat = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
  const metersPerDegreeLat = 111320
  const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)

  // Convert to meters
  const metersCoords = coords.map(c => [
    c[0] * metersPerDegreeLng,
    c[1] * metersPerDegreeLat,
  ])

  // Shoelace formula
  let area = 0
  for (let i = 0; i < metersCoords.length; i++) {
    const j = (i + 1) % metersCoords.length
    area += metersCoords[i][0] * metersCoords[j][1]
    area -= metersCoords[j][0] * metersCoords[i][1]
  }

  return Math.abs(area / 2)
}

// Check if polygon A contains polygon B (simplified - checks if all points of B are inside A)
const isPolygonInsidePolygon = (innerCoords: number[][], outerCoords: number[][]): boolean => {
  if (innerCoords.length < 3 || outerCoords.length < 3) return false

  // Check if all points of inner polygon are inside outer polygon
  for (const point of innerCoords) {
    let inside = false
    for (let i = 0, j = outerCoords.length - 1; i < outerCoords.length; j = i++) {
      const xi = outerCoords[i][0], yi = outerCoords[i][1]
      const xj = outerCoords[j][0], yj = outerCoords[j][1]
      const intersect = yi > point[1] !== yj > point[1] &&
        point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
      if (intersect) inside = !inside
    }
    if (!inside) return false
  }
  return true
}

// Diagnostic function to analyze segment nesting
const analyzeSegmentNesting = (segments: { id: string; area: number; geometry: { coordinatesWGS84?: number[][][] } }[]) => {
  console.log('=== SEGMENT NESTING ANALYSIS ===')
  console.log(`Total segments: ${segments.length}`)

  const analysis: Array<{
    segmentId: string
    reportedArea: number
    calculatedArea: number
    areaDifference: number
    containedSegments: string[]
    containedTotalArea: number
  }> = []

  for (const segment of segments) {
    const coords = segment.geometry.coordinatesWGS84?.[0] || []
    if (coords.length < 3) continue

    const calculatedArea = calculatePolygonArea(coords)
    const containedSegments: string[] = []
    let containedTotalArea = 0

    // Check if this segment contains any other segments
    for (const otherSegment of segments) {
      if (otherSegment.id === segment.id) continue

      const otherCoords = otherSegment.geometry.coordinatesWGS84?.[0] || []
      if (otherCoords.length < 3) continue

      if (isPolygonInsidePolygon(otherCoords, coords)) {
        containedSegments.push(otherSegment.id)
        containedTotalArea += otherSegment.area
      }
    }

    analysis.push({
      segmentId: segment.id,
      reportedArea: segment.area,
      calculatedArea: Math.round(calculatedArea * 10) / 10,
      areaDifference: Math.round((calculatedArea - segment.area) * 10) / 10,
      containedSegments,
      containedTotalArea,
    })
  }

  // Log segments that contain other segments
  const containingSegments = analysis.filter(a => a.containedSegments.length > 0)

  if (containingSegments.length > 0) {
    console.log('\n📦 SEGMENTS CONTAINING OTHER SEGMENTS:')
    for (const seg of containingSegments) {
      console.log(`\nSegment ${seg.segmentId}:`)
      console.log(`  - Reported area (API): ${seg.reportedArea} m²`)
      console.log(`  - Calculated polygon area: ${seg.calculatedArea} m²`)
      console.log(`  - Difference: ${seg.areaDifference} m²`)
      console.log(`  - Contains ${seg.containedSegments.length} inner segment(s): ${seg.containedSegments.join(', ')}`)
      console.log(`  - Total area of contained segments: ${seg.containedTotalArea} m²`)

      // Determine if API already excludes inner segments
      const expectedAreaIfExcluded = seg.calculatedArea - seg.containedTotalArea
      const closerToCalculated = Math.abs(seg.reportedArea - seg.calculatedArea) < Math.abs(seg.reportedArea - expectedAreaIfExcluded)

      if (closerToCalculated) {
        console.log(`  ⚠️ API area ≈ full polygon area → Inner segments likely INCLUDED in outer area`)
      } else {
        console.log(`  ✓ API area ≈ polygon minus inner → Inner segments likely EXCLUDED from outer area`)
      }
    }
  } else {
    console.log('\n✓ No nested segments found - all segments are independent')
  }

  console.log('\n=== END ANALYSIS ===')
  return analysis
}

export default function SonnendachStep2UsableArea() {
  const t = useTranslations('sonnendach.step2Usable')
  const {
    building,
    selectedSegmentIds,
    getSelectedSegments,
    selectedArea,
    roofProperties,
    restrictedAreas,
    setRoofProperties,
    addRestrictedArea,
    removeRestrictedArea,
    clearRestrictedAreas,
    getUsableArea,
    getTotalRestrictedArea,
    getRestrictedAreasInNonSelectedSegments,
    goToStep,
  } = useSonnendachCalculatorStore()

  // Get non-selected segments from the same building
  const nonSelectedSegments = building?.roofSegments.filter(
    s => !selectedSegmentIds.includes(s.id)
  ) || []

  // Get restricted areas that overlap with non-selected segments
  const overlappingRestrictedAreas = getRestrictedAreasInNonSelectedSegments()

  const selectedSegments = getSelectedSegments()
  // Store segments in a ref to avoid re-initialization
  const selectedSegmentsRef = useRef(selectedSegments)
  selectedSegmentsRef.current = selectedSegments

  const [isDrawing, setIsDrawing] = useState(false)
  const [isLoadingMap, setIsLoadingMap] = useState(true)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const segmentSourceRef = useRef<VectorSource | null>(null)
  const restrictedSourceRef = useRef<VectorSource | null>(null)
  const drawSourceRef = useRef<VectorSource | null>(null)
  const drawInteractionRef = useRef<Draw | null>(null)
  const mapInitializedRef = useRef(false)

  // Run segment nesting analysis for debugging
  useEffect(() => {
    if (building?.roofSegments && building.roofSegments.length > 1) {
      analyzeSegmentNesting(building.roofSegments)
    }
  }, [building?.roofSegments])

  // Initialize map - only run once
  useEffect(() => {
    if (!mapRef.current || mapInitializedRef.current) return
    const segments = selectedSegmentsRef.current
    if (segments.length === 0) return

    console.log('[Map] Initializing map...')

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: SWISS_SATELLITE_URL,
        maxZoom: 28,  // Swiss imagery supports very high zoom
        crossOrigin: 'anonymous',
      }),
    })

    const sonnendachLayer = new TileLayer({
      source: new XYZ({
        url: SONNENDACH_URL,
        maxZoom: 19,  // Source stops at 19 (prevents 400 errors), but tiles will be upscaled beyond
        crossOrigin: 'anonymous',
      }),
      opacity: 0.5,
      minZoom: 15,
      // No layer maxZoom - allows tiles to be upscaled at higher zoom levels
    })

    const segmentSource = new VectorSource()
    segmentSourceRef.current = segmentSource

    const segmentLayer = new VectorLayer({
      source: segmentSource,
      zIndex: 50,
    })

    const restrictedSource = new VectorSource()
    restrictedSourceRef.current = restrictedSource

    const restrictedLayer = new VectorLayer({
      source: restrictedSource,
      zIndex: 75,
    })

    // Drawing layer for active drawing
    const drawSource = new VectorSource()
    drawSourceRef.current = drawSource

    const drawLayer = new VectorLayer({
      source: drawSource,
      zIndex: 100,
      style: drawingStyle,
    })

    // Calculate center from selected segments
    let centerLng = 0, centerLat = 0, count = 0
    for (const segment of segments) {
      const coords = segment.geometry.coordinatesWGS84?.[0] ||
        segment.geometry.coordinates?.[0]?.map(c => lv95ToWgs84(c[0], c[1])) || []
      for (const coord of coords) {
        centerLng += coord[0]
        centerLat += coord[1]
        count++
      }
    }
    if (count > 0) {
      centerLng /= count
      centerLat /= count
    } else {
      centerLng = 8.5417
      centerLat = 47.3769
    }

    const map = new Map({
      target: mapRef.current,
      layers: [satelliteLayer, sonnendachLayer, segmentLayer, restrictedLayer, drawLayer],
      view: new View({
        center: fromLonLat([centerLng, centerLat]),
        zoom: 20,
        maxZoom: 28,  // Allow very close zoom (~0.5 meter scale)
        minZoom: 15,
      }),
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: false,
      }),
    })

    mapInstanceRef.current = map
    mapInitializedRef.current = true
    setIsLoadingMap(false)
    console.log('[Map] Map initialized successfully:', map)

    // Get all segments from the building (including non-selected)
    const allSegments = useSonnendachCalculatorStore.getState().building?.roofSegments || []
    const selectedIds = useSonnendachCalculatorStore.getState().selectedSegmentIds

    // Draw non-selected segments first (so selected ones appear on top)
    for (const segment of allSegments) {
      if (selectedIds.includes(segment.id)) continue // Skip selected segments for now

      let wgs84Coords = segment.geometry.coordinatesWGS84
      if (!wgs84Coords || wgs84Coords.length === 0) {
        const lv95Coords = segment.geometry.coordinates
        if (lv95Coords && lv95Coords.length > 0) {
          wgs84Coords = lv95Coords.map(ring =>
            ring.map(point => lv95ToWgs84(point[0], point[1]))
          )
        }
      }

      if (wgs84Coords && wgs84Coords[0] && wgs84Coords[0].length >= 3) {
        const webMercatorCoords = wgs84Coords[0].map(coord => fromLonLat(coord))
        const polygon = new Polygon([webMercatorCoords])
        const feature = new Feature({
          geometry: polygon,
          segmentId: segment.id,
          isNonSelected: true,
        })
        feature.setStyle(nonSelectedSegmentStyle)
        segmentSource.addFeature(feature)
      }
    }

    // Draw selected segments
    for (const segment of segments) {
      let wgs84Coords = segment.geometry.coordinatesWGS84
      if (!wgs84Coords || wgs84Coords.length === 0) {
        const lv95Coords = segment.geometry.coordinates
        if (lv95Coords && lv95Coords.length > 0) {
          wgs84Coords = lv95Coords.map(ring =>
            ring.map(point => lv95ToWgs84(point[0], point[1]))
          )
        }
      }

      if (wgs84Coords && wgs84Coords[0] && wgs84Coords[0].length >= 3) {
        const webMercatorCoords = wgs84Coords[0].map(coord => fromLonLat(coord))
        const polygon = new Polygon([webMercatorCoords])
        const feature = new Feature({
          geometry: polygon,
          segmentId: segment.id,
        })
        feature.setStyle(selectedSegmentStyle)
        segmentSource.addFeature(feature)
      }
    }

    return () => {
      console.log('[Map] Cleanup called')
      map.setTarget(undefined)
      mapInstanceRef.current = null
      segmentSourceRef.current = null
      restrictedSourceRef.current = null
      drawSourceRef.current = null
      // Don't reset mapInitializedRef here - only reset on unmount
    }
  }, []) // Empty dependency - only initialize once

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Map] Component unmounting, resetting mapInitializedRef')
      mapInitializedRef.current = false
    }
  }, [])

  // Draw existing restricted areas
  useEffect(() => {
    if (!restrictedSourceRef.current) return

    restrictedSourceRef.current.clear()

    for (const area of restrictedAreas) {
      const webMercatorCoords = area.coordinates.map(c => fromLonLat(c))
      const polygon = new Polygon([webMercatorCoords])
      const feature = new Feature({
        geometry: polygon,
        restrictedId: area.id,
      })
      feature.setStyle(restrictedAreaStyle)
      restrictedSourceRef.current.addFeature(feature)
    }
  }, [restrictedAreas])

  // Start drawing mode
  const startDrawing = () => {
    console.log('[Drawing] startDrawing called')
    const map = mapInstanceRef.current
    const drawSource = drawSourceRef.current
    if (!map) {
      console.log('[Drawing] ERROR: map is null')
      return
    }
    if (!drawSource) {
      console.log('[Drawing] ERROR: drawSource is null')
      return
    }
    console.log('[Drawing] map exists:', map)
    console.log('[Drawing] drawSource exists:', drawSource)

    // Remove any existing draw interaction first
    if (drawInteractionRef.current) {
      console.log('[Drawing] Removing existing draw interaction')
      map.removeInteraction(drawInteractionRef.current)
      drawInteractionRef.current = null
    }

    // Clear any previous drawing
    drawSource.clear()

    const draw = new Draw({
      source: drawSource,
      type: 'Polygon',
      style: drawingStyle,
    })
    console.log('[Drawing] Created Draw interaction:', draw)

    draw.on('drawstart', (event) => {
      console.log('[Drawing] drawstart event fired', event)
    })

    draw.on('drawend', (event) => {
      console.log('[Drawing] drawend event fired', event)
      const geometry = event.feature.getGeometry() as Polygon
      const coords = geometry.getCoordinates()[0]
      console.log('[Drawing] Polygon coords (Web Mercator):', coords)

      // Convert from Web Mercator to WGS84
      const wgs84Coords = coords.map(c => toLonLat(c))
      console.log('[Drawing] Polygon coords (WGS84):', wgs84Coords)

      // Calculate area
      const area = calculatePolygonArea(wgs84Coords)
      console.log('[Drawing] Calculated area:', area)

      // Create new restricted area
      const newArea: RestrictedArea = {
        id: `restricted-${Date.now()}`,
        coordinates: wgs84Coords,
        area: Math.round(area * 10) / 10,
      }
      console.log('[Drawing] New restricted area:', newArea)

      // Use the store directly to avoid stale closure
      useSonnendachCalculatorStore.getState().addRestrictedArea(newArea)
      console.log('[Drawing] Added to store')

      // Stop drawing after polygon is complete
      setTimeout(() => {
        console.log('[Drawing] Cleanup timeout fired')
        if (mapInstanceRef.current && drawInteractionRef.current) {
          mapInstanceRef.current.removeInteraction(drawInteractionRef.current)
          drawInteractionRef.current = null
          setIsDrawing(false)
          // Clear the drawing source
          if (drawSourceRef.current) {
            drawSourceRef.current.clear()
          }
          console.log('[Drawing] Cleaned up draw interaction')
        }
      }, 0)
    })

    draw.on('drawabort', (event) => {
      console.log('[Drawing] drawabort event fired', event)
    })

    map.addInteraction(draw)
    drawInteractionRef.current = draw
    setIsDrawing(true)
    console.log('[Drawing] Draw interaction added to map, isDrawing set to true')
  }

  // Stop drawing mode
  const stopDrawing = () => {
    console.log('[Drawing] stopDrawing called')
    const map = mapInstanceRef.current
    const draw = drawInteractionRef.current

    if (map && draw) {
      console.log('[Drawing] Removing draw interaction')
      map.removeInteraction(draw)
    } else {
      console.log('[Drawing] Cannot remove - map:', !!map, 'draw:', !!draw)
    }
    drawInteractionRef.current = null
    setIsDrawing(false)
    // Clear the drawing source
    if (drawSourceRef.current) {
      drawSourceRef.current.clear()
    }
    console.log('[Drawing] isDrawing set to false')
  }

  // Handle removing a restricted area
  const handleRemoveArea = (id: string) => {
    removeRestrictedArea(id)
  }

  const usableArea = getUsableArea()
  const totalRestrictedArea = getTotalRestrictedArea()

  const canProceed = selectedSegments.length > 0

  if (selectedSegments.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('noSegments')}</p>
          <Button onClick={() => goToStep(1)}>{t('backToSelection')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-[420px] shrink-0 overflow-y-auto border-r bg-background">
        <div className="p-4 space-y-4">
          {/* Area Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{t('totalArea')}</p>
                  <p className="text-xl font-bold">{selectedArea} m²</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('restricted')}</p>
                  <p className="text-xl font-bold text-destructive">
                    -{Math.round(totalRestrictedArea * 10) / 10} m²
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('usable')}</p>
                  <p className="text-xl font-bold text-primary">
                    {Math.round(usableArea * 10) / 10} m²
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roof Properties */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-4 h-4" />
                {t('roofProperties')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Roof Type */}
              <div className="space-y-2">
                <Label>{t('roofType')}</Label>
                <Select
                  value={roofProperties.roofType}
                  onValueChange={(value: RoofType) =>
                    setRoofProperties({ roofType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">{t('roofTypes.flat')}</SelectItem>
                    <SelectItem value="low_slope">{t('roofTypes.lowSlope')}</SelectItem>
                    <SelectItem value="medium">{t('roofTypes.medium')}</SelectItem>
                    <SelectItem value="steep">{t('roofTypes.steep')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Building Floors */}
              <div className="space-y-2">
                <Label>{t('buildingFloors')}</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={roofProperties.buildingFloors}
                  onChange={(e) =>
                    setRoofProperties({ buildingFloors: parseInt(e.target.value) || 1 })
                  }
                />
              </div>

              {/* Roof Material */}
              <div className="space-y-2">
                <Label>{t('roofMaterial')}</Label>
                <Select
                  value={roofProperties.roofMaterial}
                  onValueChange={(value: RoofMaterial) =>
                    setRoofProperties({ roofMaterial: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitumen">{t('materials.bitumen')}</SelectItem>
                    <SelectItem value="gravel">{t('materials.gravel')}</SelectItem>
                    <SelectItem value="green_roof">{t('materials.greenRoof')}</SelectItem>
                    <SelectItem value="granulate">{t('materials.granulate')}</SelectItem>
                    <SelectItem value="tiles">{t('materials.tiles')}</SelectItem>
                    <SelectItem value="metal">{t('materials.metal')}</SelectItem>
                    <SelectItem value="unknown">{t('materials.unknown')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Restricted Areas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {t('restrictedAreas')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('restrictedInfo')}</p>

              {/* Drawing Controls */}
              <div className="flex gap-2">
                {isDrawing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stopDrawing}
                      className="flex-1 gap-2"
                    >
                      <X className="w-4 h-4" />
                      {t('cancelDrawing')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startDrawing}
                    className="flex-1 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('addRestrictedArea')}
                  </Button>
                )}
              </div>

              {isDrawing && (
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
                  <p className="font-medium text-orange-600">{t('drawingMode')}</p>
                  <p className="text-muted-foreground">{t('drawingInstructions')}</p>
                </div>
              )}

              {/* List of Restricted Areas */}
              {restrictedAreas.length > 0 && (
                <div className="space-y-2">
                  {restrictedAreas.map((area, index) => (
                    <div
                      key={area.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5"
                    >
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">
                          {t('area')} {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {area.area} m²
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveArea(area.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={clearRestrictedAreas}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('clearAll')}
                  </Button>
                </div>
              )}

              {restrictedAreas.length === 0 && !isDrawing && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noRestrictedAreas')}
                </p>
              )}

              {/* Warning about restricted areas overlapping with non-selected segments */}
              {overlappingRestrictedAreas.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                  <p className="font-medium text-amber-600">{t('overlapWarning')}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {t('overlapWarningDetail', { count: overlappingRestrictedAreas.length })}
                  </p>
                </div>
              )}

              {/* Info about non-selected segments if there are any */}
              {nonSelectedSegments.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <p>{t('nonSelectedSegmentsInfo', { count: nonSelectedSegments.length })}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t sticky bottom-0 bg-background">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goToStep(1)} className="gap-2 flex-1">
              <ChevronLeft className="w-4 h-4" />
              {t('back')}
            </Button>
            <Button
              onClick={() => goToStep(3)}
              disabled={!canProceed}
              className="gap-2 flex-1"
            >
              {t('continue')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />

        {isLoadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t('loadingMap')}</span>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border text-xs">
          <p className="font-medium mb-2">{t('legend')}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-3 rounded-sm border"
                style={{ backgroundColor: `${SELECTED_SEGMENT_COLOR}66`, borderColor: SELECTED_SEGMENT_STROKE }}
              />
              <span>{t('legendSegment')}</span>
            </div>
            {nonSelectedSegments.length > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm border border-dashed"
                  style={{ backgroundColor: `${NON_SELECTED_SEGMENT_COLOR}33`, borderColor: NON_SELECTED_SEGMENT_STROKE }}
                />
                <span>{t('legendNonSelected')}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-3 rounded-sm border"
                style={{ backgroundColor: `${RESTRICTED_FILL_COLOR}88`, borderColor: RESTRICTED_STROKE_COLOR }}
              />
              <span>{t('legendRestricted')}</span>
            </div>
          </div>
        </div>

        {/* Drawing Mode Indicator */}
        {isDrawing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            {t('drawingModeActive')}
          </div>
        )}
      </div>
    </div>
  )
}
