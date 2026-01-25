'use client'

import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Polygon } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'

import {
  useSonnendachCalculatorStore,
  SolarPanel,
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
const PANEL_FILL_COLOR = '#1E40AF'
const PANEL_STROKE_COLOR = '#3B82F6'

// Styles
const selectedSegmentStyle = new Style({
  fill: new Fill({ color: `${SELECTED_SEGMENT_COLOR}66` }),
  stroke: new Stroke({ color: SELECTED_SEGMENT_STROKE, width: 2 }),
})

const panelStyle = new Style({
  fill: new Fill({ color: `${PANEL_FILL_COLOR}CC` }),
  stroke: new Stroke({ color: PANEL_STROKE_COLOR, width: 1 }),
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

export interface RoofVisualizationMapRef {
  captureImage: () => Promise<string | null>
}

interface RoofVisualizationMapProps {
  className?: string
  showLegend?: boolean
  height?: string
}

const RoofVisualizationMap = forwardRef<RoofVisualizationMapRef, RoofVisualizationMapProps>(
  ({ className = '', showLegend = true, height = '300px' }, ref) => {
    const {
      getSelectedSegments,
      restrictedAreas,
      selectedPanel,
      panelCount,
    } = useSonnendachCalculatorStore()

    const selectedSegments = getSelectedSegments()

    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<Map | null>(null)
    const segmentSourceRef = useRef<VectorSource | null>(null)
    const panelSourceRef = useRef<VectorSource | null>(null)
    const mapInitializedRef = useRef(false)
    const [_isReady, setIsReady] = useState(false)

    // Point in polygon check helper
    const isPointInPolygonHelper = useCallback((lng: number, lat: number, polygonCoords: number[][]): boolean => {
      let inside = false
      for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
        const xi = polygonCoords[i][0], yi = polygonCoords[i][1]
        const xj = polygonCoords[j][0], yj = polygonCoords[j][1]
        const intersect = yi > lat !== yj > lat &&
          lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
      }
      return inside
    }, [])

    // Check if any corner of a panel is in any restricted area
    const isPanelInRestrictedArea = useCallback((corners: number[][]): boolean => {
      for (const area of restrictedAreas) {
        for (const corner of corners) {
          if (isPointInPolygonHelper(corner[0], corner[1], area.coordinates)) {
            return true
          }
        }
      }
      return false
    }, [restrictedAreas, isPointInPolygonHelper])

    // Calculate panel positions within a polygon
    const calculatePanelPositionsInPolygon = useCallback(
      (
        polygonCoords: number[][],
        panel: SolarPanel
      ): Array<{ corners: number[][] }> => {
        if (polygonCoords.length < 3) return []

        const centerLng = polygonCoords.reduce((sum, p) => sum + p[0], 0) / polygonCoords.length
        const centerLat = polygonCoords.reduce((sum, p) => sum + p[1], 0) / polygonCoords.length

        const metersPerDegreeLat = 111320
        const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)

        const panelWidth = panel.width
        const panelHeight = panel.height
        const panelGap = 0.02

        const spacingX = panelWidth + panelGap
        const spacingY = panelHeight + panelGap

        const isPointInPolygon = (lng: number, lat: number): boolean => {
          return isPointInPolygonHelper(lng, lat, polygonCoords)
        }

        const isPanelInPolygon = (corners: number[][]): boolean => {
          return corners.every(c => isPointInPolygon(c[0], c[1]))
        }

        const lngs = polygonCoords.map(p => p[0])
        const lats = polygonCoords.map(p => p[1])
        const extentLng = Math.max(...lngs) - Math.min(...lngs)
        const extentLat = Math.max(...lats) - Math.min(...lats)
        const maxExtent = Math.max(extentLng, extentLat) * 1.5

        const positions: Array<{ corners: number[][] }> = []

        const gridStepsX = Math.ceil((maxExtent * metersPerDegreeLng) / spacingX) + 2
        const gridStepsY = Math.ceil((maxExtent * metersPerDegreeLat) / spacingY) + 2

        let longestLength = 0
        let angle = 0
        for (let i = 0; i < polygonCoords.length; i++) {
          const j = (i + 1) % polygonCoords.length
          const dx = (polygonCoords[j][0] - polygonCoords[i][0]) * metersPerDegreeLng
          const dy = (polygonCoords[j][1] - polygonCoords[i][1]) * metersPerDegreeLat
          const length = Math.sqrt(dx * dx + dy * dy)
          if (length > longestLength) {
            longestLength = length
            angle = Math.atan2(dy, dx)
          }
        }

        for (let gy = -gridStepsY; gy <= gridStepsY; gy++) {
          for (let gx = -gridStepsX; gx <= gridStepsX; gx++) {
            const localX = gx * spacingX
            const localY = gy * spacingY

            const rotatedX = localX * Math.cos(angle) - localY * Math.sin(angle)
            const rotatedY = localX * Math.sin(angle) + localY * Math.cos(angle)

            const panelCenterLng = centerLng + rotatedX / metersPerDegreeLng
            const panelCenterLat = centerLat + rotatedY / metersPerDegreeLat

            const halfW = panelWidth / 2
            const halfH = panelHeight / 2
            const localCorners = [
              { x: -halfW, y: -halfH },
              { x: halfW, y: -halfH },
              { x: halfW, y: halfH },
              { x: -halfW, y: halfH },
            ]

            const corners = localCorners.map(c => {
              const rx = c.x * Math.cos(angle) - c.y * Math.sin(angle)
              const ry = c.x * Math.sin(angle) + c.y * Math.cos(angle)
              return [
                panelCenterLng + rx / metersPerDegreeLng,
                panelCenterLat + ry / metersPerDegreeLat,
              ]
            })

            if (isPanelInPolygon(corners) && !isPanelInRestrictedArea(corners)) {
              positions.push({ corners })
            }
          }
        }

        return positions
      },
      [isPointInPolygonHelper, isPanelInRestrictedArea]
    )

    // Helper function to capture the map canvas
    const captureMapCanvas = (): string | null => {
      try {
        console.log('[RoofVisualizationMap] captureMapCanvas called')

        // Use the DOM ref directly instead of map.getTargetElement()
        // because the map might be detached from the DOM after re-renders
        const mapElement = mapRef.current
        console.log('[RoofVisualizationMap] Map element from ref:', mapElement ? 'exists' : 'null')
        if (!mapElement) {
          console.log('[RoofVisualizationMap] No map element from ref')
          return null
        }

        // Get size from DOM element
        const rect = mapElement.getBoundingClientRect()
        console.log('[RoofVisualizationMap] Element size:', rect.width, 'x', rect.height)
        if (rect.width === 0 || rect.height === 0) {
          console.log('[RoofVisualizationMap] Invalid element size')
          return null
        }
        const size: [number, number] = [rect.width, rect.height]

        const mapCanvas = document.createElement('canvas')
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        console.log('[RoofVisualizationMap] Canvas size:', mapCanvas.width, 'x', mapCanvas.height)

        const mapContext = mapCanvas.getContext('2d')
        if (!mapContext) {
          console.log('[RoofVisualizationMap] No canvas context')
          return null
        }

        const canvases = mapElement.querySelectorAll('canvas')
        console.log('[RoofVisualizationMap] Found', canvases.length, 'canvases in DOM')

        let canvasesDrawn = 0
        canvases.forEach((canvas, index) => {
          console.log(`[RoofVisualizationMap] Canvas ${index}: ${canvas.width}x${canvas.height}`)
          if (canvas.width > 0 && canvas.height > 0) {
            const opacity = (canvas.parentNode as HTMLElement)?.style?.opacity
            mapContext.globalAlpha = opacity === '' || opacity === undefined ? 1 : Number(opacity)

            const transform = canvas.style.transform
            const matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)?.[1]
              ?.split(',')
              .map(Number)

            if (matrix && matrix.length === 6) {
              mapContext.setTransform(
                matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]
              )
            }

            try {
              mapContext.drawImage(canvas, 0, 0)
              canvasesDrawn++
              console.log(`[RoofVisualizationMap] Drew canvas ${index}`)
            } catch (drawError) {
              console.error(`[RoofVisualizationMap] Error drawing canvas ${index}:`, drawError)
            }
          }
        })

        console.log('[RoofVisualizationMap] Total canvases drawn:', canvasesDrawn)

        if (canvasesDrawn === 0) {
          console.log('[RoofVisualizationMap] No canvases were drawn!')
          return null
        }

        mapContext.globalAlpha = 1
        mapContext.setTransform(1, 0, 0, 1, 0, 0)

        const dataUrl = mapCanvas.toDataURL('image/png')
        console.log('[RoofVisualizationMap] Generated data URL, length:', dataUrl.length)
        return dataUrl
      } catch (error) {
        console.error('[RoofVisualizationMap] Error capturing map:', error)
        return null
      }
    }

    // Expose capture method
    useImperativeHandle(ref, () => ({
      captureImage: async () => {
        console.log('[RoofVisualizationMap] captureImage called')
        if (!mapInstanceRef.current) {
          console.log('[RoofVisualizationMap] No map instance')
          return null
        }

        const map = mapInstanceRef.current

        return new Promise<string | null>((resolve) => {
          let resolved = false

          const doCapture = () => {
            if (resolved) return
            resolved = true
            const result = captureMapCanvas()
            resolve(result)
          }

          // Set a timeout to capture after 2 seconds regardless
          const timeoutId = setTimeout(() => {
            console.log('[RoofVisualizationMap] Timeout reached, capturing now')
            doCapture()
          }, 2000)

          // Also try on rendercomplete event
          map.once('rendercomplete', () => {
            console.log('[RoofVisualizationMap] rendercomplete event fired')
            clearTimeout(timeoutId)
            doCapture()
          })

          // Trigger a render
          console.log('[RoofVisualizationMap] Triggering renderSync')
          map.renderSync()

          // Also try after a short delay in case map is already rendered
          setTimeout(() => {
            if (!resolved) {
              console.log('[RoofVisualizationMap] Quick capture attempt')
              // Check if there are loaded canvases
              const mapElement = map.getTargetElement()
              if (mapElement) {
                const canvases = mapElement.querySelectorAll('canvas')
                const hasContent = Array.from(canvases).some(c => c.width > 0)
                if (hasContent) {
                  clearTimeout(timeoutId)
                  doCapture()
                }
              }
            }
          }, 500)
        })
      }
    }), [])

    // Initialize map
    useEffect(() => {
      if (!mapRef.current || mapInitializedRef.current || selectedSegments.length === 0) return

      const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: SWISS_SATELLITE_URL,
          maxZoom: 28,
          crossOrigin: 'anonymous',
        }),
      })

      const sonnendachLayer = new TileLayer({
        source: new XYZ({
          url: SONNENDACH_URL,
          maxZoom: 19,
          crossOrigin: 'anonymous',
        }),
        opacity: 0.5,
        minZoom: 15,
      })

      const segmentSource = new VectorSource()
      segmentSourceRef.current = segmentSource

      const segmentLayer = new VectorLayer({
        source: segmentSource,
        zIndex: 50,
      })

      const panelSource = new VectorSource()
      panelSourceRef.current = panelSource

      const panelLayer = new VectorLayer({
        source: panelSource,
        zIndex: 100,
      })

      // Calculate center from selected segments
      let centerLng = 0, centerLat = 0, count = 0
      for (const segment of selectedSegments) {
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
        layers: [satelliteLayer, sonnendachLayer, segmentLayer, panelLayer],
        view: new View({
          center: fromLonLat([centerLng, centerLat]),
          zoom: 20,
          maxZoom: 28,
          minZoom: 15,
        }),
        controls: defaultControls({
          zoom: false,
          rotate: false,
          attribution: false,
        }),
      })

      mapInstanceRef.current = map
      mapInitializedRef.current = true

      // Draw selected segments
      for (const segment of selectedSegments) {
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

      // Mark as ready after a short delay to ensure tiles load
      setTimeout(() => setIsReady(true), 500)

      return () => {
        map.setTarget(undefined)
        mapInstanceRef.current = null
        segmentSourceRef.current = null
        panelSourceRef.current = null
        mapInitializedRef.current = false
      }
    }, [selectedSegments])

    // Draw panels on map
    useEffect(() => {
      if (!panelSourceRef.current || !selectedPanel || selectedSegments.length === 0) return

      panelSourceRef.current.clear()

      if (panelCount === 0) return

      let panelsDrawn = 0
      const panelsToShow = panelCount

      for (const segment of selectedSegments) {
        if (panelsDrawn >= panelsToShow) break

        const coords = segment.geometry.coordinatesWGS84?.[0] || []
        if (coords.length < 3) continue

        const positions = calculatePanelPositionsInPolygon(coords, selectedPanel)

        for (const pos of positions) {
          if (panelsDrawn >= panelsToShow) break

          const webMercatorCorners = pos.corners.map(c => fromLonLat(c))
          const polygon = new Polygon([webMercatorCorners])
          const feature = new Feature({ geometry: polygon })
          feature.setStyle(panelStyle)
          panelSourceRef.current!.addFeature(feature)
          panelsDrawn++
        }
      }
    }, [selectedPanel, panelCount, selectedSegments, calculatePanelPositionsInPolygon])

    if (selectedSegments.length === 0) {
      return null
    }

    return (
      <div className={`relative ${className}`}>
        <div ref={mapRef} className="w-full rounded-lg overflow-hidden" style={{ height }} />

        {showLegend && (
          <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg border text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm border"
                  style={{ backgroundColor: `${SELECTED_SEGMENT_COLOR}66`, borderColor: SELECTED_SEGMENT_STROKE }}
                />
                <span>Roof Segment</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm border"
                  style={{ backgroundColor: `${PANEL_FILL_COLOR}CC`, borderColor: PANEL_STROKE_COLOR }}
                />
                <span>Solar Panel</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

RoofVisualizationMap.displayName = 'RoofVisualizationMap'

export default RoofVisualizationMap
