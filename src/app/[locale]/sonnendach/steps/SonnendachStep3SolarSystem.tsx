'use client'

import {
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Battery,
  Loader2,
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
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useSonnendachCalculatorStore,
  SolarPanel,
  Inverter,
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

export default function SonnendachStep3SolarSystem() {
  const t = useTranslations('sonnendach.step3System')
  const {
    building,
    getSelectedSegments,
    restrictedAreas,
    selectedPanel,
    selectedInverter,
    panelCount,
    maxPanelCount,
    selectPanel,
    selectInverter,
    setPanelCount,
    setMaxPanelCount,
    goToStep,
  } = useSonnendachCalculatorStore()

  const selectedSegments = getSelectedSegments()

  const [activeTab, setActiveTab] = useState<string>('panels')
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [equipmentError, setEquipmentError] = useState<string | null>(null)
  const [availablePanels, setAvailablePanels] = useState<SolarPanel[]>([])
  const [availableInverters, setAvailableInverters] = useState<Inverter[]>([])
  const [isLoadingMap, setIsLoadingMap] = useState(true)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const segmentSourceRef = useRef<VectorSource | null>(null)
  const panelSourceRef = useRef<VectorSource | null>(null)
  const mapInitializedRef = useRef(false)

  // Fetch equipment from API
  useEffect(() => {
    const fetchEquipment = async () => {
      setEquipmentLoading(true)
      setEquipmentError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      try {
        const [panelsRes, invertersRes] = await Promise.all([
          fetch(`${apiUrl}/api/equipment/solar-panels?country=CH`),
          fetch(`${apiUrl}/api/equipment/inverters?country=CH`),
        ])

        if (!panelsRes.ok || !invertersRes.ok) {
          throw new Error('Failed to fetch equipment data')
        }

        const panelsData = await panelsRes.json()
        const invertersData = await invertersRes.json()

        const panels: SolarPanel[] = (panelsData.data || []).map(
          (p: {
            id: string
            displayName: string
            pmaxStcW: number
            widthMm?: number
            lengthMm?: number
            series?: { widthMm?: number; lengthMm?: number }
            efficiencyStcPercent: number
            manufacturer?: { name?: string }
            price: number
          }) => ({
            id: p.id,
            name: p.displayName,
            power: p.pmaxStcW,
            width: (p.widthMm || p.series?.widthMm || 1000) / 1000,
            height: (p.lengthMm || p.series?.lengthMm || 1700) / 1000,
            efficiency: p.efficiencyStcPercent,
            manufacturer: p.manufacturer?.name || 'Unknown',
            price: p.price,
          })
        )

        const inverters: Inverter[] = (invertersData.data || []).map(
          (i: {
            id: string
            displayName: string
            ratedPowerKw: number
            manufacturer?: { name?: string }
            maxEfficiencyPercent: number
            price: number
          }) => ({
            id: i.id,
            name: i.displayName,
            power: i.ratedPowerKw,
            manufacturer: i.manufacturer?.name || 'Unknown',
            efficiency: i.maxEfficiencyPercent,
            price: i.price,
          })
        )

        setAvailablePanels(panels)
        setAvailableInverters(inverters)

        // Auto-select first panel if none selected
        if (panels.length > 0 && !selectedPanel) {
          selectPanel(panels[0])
        }
      } catch (err) {
        console.error('Error fetching equipment:', err)
        setEquipmentError('Failed to load equipment')
      } finally {
        setEquipmentLoading(false)
      }
    }

    fetchEquipment()
  }, [selectedPanel, selectPanel])

  // Calculate system power
  const systemPowerKw = selectedPanel && panelCount
    ? (selectedPanel.power * panelCount) / 1000
    : 0

  // Auto-select best inverter based on system power
  useEffect(() => {
    if (systemPowerKw > 0 && !selectedInverter && availableInverters.length > 0) {
      const bestInverter = availableInverters.reduce((best, inv) => {
        const ratio = systemPowerKw / inv.power
        const bestRatio = systemPowerKw / best.power
        // Prefer DC/AC ratio between 1.2 and 1.5
        if (ratio >= 1.2 && ratio <= 1.5) {
          if (bestRatio < 1.2 || bestRatio > 1.5) return inv
          if (inv.efficiency > best.efficiency) return inv
        }
        const bestDistance = Math.abs(bestRatio - 1.35)
        const invDistance = Math.abs(ratio - 1.35)
        if (invDistance < bestDistance) return inv
        return best
      }, availableInverters[0])

      selectInverter(bestInverter)
    }
  }, [systemPowerKw, selectedInverter, selectInverter, availableInverters])

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

      // Calculate centroid
      const centerLng = polygonCoords.reduce((sum, p) => sum + p[0], 0) / polygonCoords.length
      const centerLat = polygonCoords.reduce((sum, p) => sum + p[1], 0) / polygonCoords.length

      const metersPerDegreeLat = 111320
      const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)

      // Panel dimensions (landscape orientation)
      const panelWidth = panel.width
      const panelHeight = panel.height

      // Spacing (5cm gap)
      const spacingX = panelWidth + 0.05
      const spacingY = panelHeight + 0.05

      // Point in polygon check
      const isPointInPolygon = (lng: number, lat: number): boolean => {
        return isPointInPolygonHelper(lng, lat, polygonCoords)
      }

      // Check if all 4 corners of a panel are inside the roof segment
      const isPanelInPolygon = (corners: number[][]): boolean => {
        return corners.every(c => isPointInPolygon(c[0], c[1]))
      }

      // Get bounding box
      const lngs = polygonCoords.map(p => p[0])
      const lats = polygonCoords.map(p => p[1])
      const extentLng = Math.max(...lngs) - Math.min(...lngs)
      const extentLat = Math.max(...lats) - Math.min(...lats)
      const maxExtent = Math.max(extentLng, extentLat) * 1.5

      const positions: Array<{ corners: number[][] }> = []

      const gridStepsX = Math.ceil((maxExtent * metersPerDegreeLng) / spacingX) + 2
      const gridStepsY = Math.ceil((maxExtent * metersPerDegreeLat) / spacingY) + 2

      // Calculate longest edge angle for rotation
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

          // Check if panel is inside the roof segment AND not in any restricted area
          if (isPanelInPolygon(corners) && !isPanelInRestrictedArea(corners)) {
            positions.push({ corners })
          }
        }
      }

      return positions
    },
    [isPointInPolygonHelper, isPanelInRestrictedArea]
  )

  // Calculate max panels that fit in all selected segments (excluding restricted areas)
  const calculateMaxPanels = useCallback(() => {
    if (!selectedPanel || selectedSegments.length === 0) return 0

    let totalPanels = 0
    for (const segment of selectedSegments) {
      const coords = segment.geometry.coordinatesWGS84?.[0] || []
      if (coords.length < 3) continue
      const positions = calculatePanelPositionsInPolygon(coords, selectedPanel)
      totalPanels += positions.length
    }
    return totalPanels
  }, [selectedPanel, selectedSegments, calculatePanelPositionsInPolygon, restrictedAreas])

  // Track previous panel ID to detect panel changes
  const prevPanelIdRef = useRef<string | null>(null)

  // Update max panel count when panel or segments change
  useEffect(() => {
    if (!selectedPanel || selectedSegments.length === 0) return

    const max = calculateMaxPanels()

    // Only update if max actually changed
    if (max !== maxPanelCount) {
      setMaxPanelCount(max)
    }

    // Set to max when panel changes, or if current count is invalid
    const panelChanged = prevPanelIdRef.current !== selectedPanel.id
    if (panelChanged || panelCount === 0 || panelCount > max) {
      setPanelCount(max)
      prevPanelIdRef.current = selectedPanel.id
    }
  }, [selectedPanel?.id, selectedSegments.length, calculateMaxPanels]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInitializedRef.current || selectedSegments.length === 0) return

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
        maxZoom: 19,  // Sonnendach layer doesn't support zoom 20+
        crossOrigin: 'anonymous',
      }),
      opacity: 0.5,
      minZoom: 15,
      maxZoom: 19,
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
        maxZoom: 22,
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

    // Clear existing panels
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

  // Calculate costs
  const totalPanelCost = selectedPanel ? selectedPanel.price * panelCount : 0
  const totalInverterCost = selectedInverter ? selectedInverter.price : 0
  const totalCost = totalPanelCost + totalInverterCost

  const formatNumber = (num: number) => new Intl.NumberFormat('de-CH').format(num)

  const canProceed = selectedPanel && panelCount > 0 && selectedInverter

  // Get inverter status for recommendation badge
  const getInverterStatus = (inverter: Inverter) => {
    if (systemPowerKw === 0) return 'neutral'
    const ratio = systemPowerKw / inverter.power
    if (ratio >= 1.2 && ratio <= 1.5) return 'recommended'
    if (ratio > 1.5 && ratio <= 1.8) return 'acceptable'
    return 'neutral'
  }

  if (!building || selectedSegments.length === 0) {
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
          {/* System Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{t('systemSize')}</p>
                  <p className="text-xl font-bold text-primary">
                    {systemPowerKw.toFixed(1)} kWp
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('panels')}</p>
                  <p className="text-xl font-bold">{panelCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('estCost')}</p>
                  <p className="text-xl font-bold">CHF {formatNumber(totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="panels" className="gap-2">
                <Zap className="w-4 h-4" />
                {t('tabPanels')}
              </TabsTrigger>
              <TabsTrigger value="inverter" className="gap-2">
                <Battery className="w-4 h-4" />
                {t('tabInverter')}
              </TabsTrigger>
            </TabsList>

            {/* Panels Tab */}
            <TabsContent value="panels" className="space-y-4 mt-4">
              {equipmentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">{t('loadingPanels')}</span>
                </div>
              ) : equipmentError ? (
                <div className="text-center py-8 text-destructive">
                  <p>{equipmentError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    {t('retry')}
                  </Button>
                </div>
              ) : availablePanels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('noPanels')}</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {availablePanels.map((panel) => (
                      <button
                        key={panel.id}
                        onClick={() => selectPanel(panel)}
                        className={`relative p-3 border-2 rounded-lg text-left transition-all ${
                          selectedPanel?.id === panel.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {selectedPanel?.id === panel.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-sm">{panel.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {panel.efficiency.toFixed(1)}% {t('efficiency')} •{' '}
                              {panel.width.toFixed(2)}×{panel.height.toFixed(2)}m
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{panel.power}W</p>
                            <p className="text-xs text-muted-foreground">CHF {panel.price}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPanel && maxPanelCount > 0 && (
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">{t('numberOfPanels')}</span>
                        <span className="text-2xl font-bold text-primary">{panelCount}</span>
                      </div>
                      <Slider
                        value={[panelCount]}
                        onValueChange={(value) => setPanelCount(value[0])}
                        min={1}
                        max={maxPanelCount}
                        step={1}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>1</span>
                        <span>{t('maxFit')}: {maxPanelCount}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('capacity')}</p>
                          <p className="font-semibold">{systemPowerKw.toFixed(2)} kWp</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('panelCost')}</p>
                          <p className="font-semibold">CHF {formatNumber(totalPanelCost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('panelArea')}</p>
                          <p className="font-semibold">
                            {(panelCount * selectedPanel.width * selectedPanel.height).toFixed(1)} m²
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('roofSegments')}</p>
                          <p className="font-semibold">{selectedSegments.length}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Inverter Tab */}
            <TabsContent value="inverter" className="space-y-4 mt-4">
              {systemPowerKw > 0 && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p>
                    {t('recommendedInverter')}{' '}
                    <span className="font-semibold">
                      {(systemPowerKw / 1.5).toFixed(1)} - {(systemPowerKw / 1.2).toFixed(1)} kW
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('dcAcRatioInfo')}
                  </p>
                </div>
              )}

              {equipmentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">{t('loadingInverters')}</span>
                </div>
              ) : availableInverters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('noInverters')}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableInverters.map((inverter) => {
                    const status = getInverterStatus(inverter)
                    return (
                      <button
                        key={inverter.id}
                        onClick={() => selectInverter(inverter)}
                        className={`relative p-3 border-2 rounded-lg text-left transition-all ${
                          selectedInverter?.id === inverter.id
                            ? 'border-primary bg-primary/5'
                            : status === 'recommended'
                            ? 'border-green-500/50 bg-green-500/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {selectedInverter?.id === inverter.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {status === 'recommended' && selectedInverter?.id !== inverter.id && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                            {t('bestFit')}
                          </span>
                        )}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-sm">{inverter.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {inverter.manufacturer} • {inverter.efficiency}% {t('efficiency')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{inverter.power} kW</p>
                            <p className="text-xs text-muted-foreground">
                              CHF {formatNumber(inverter.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedInverter && systemPowerKw > 0 && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('dcAcRatio')}</p>
                      <p className="text-lg font-semibold">
                        {(systemPowerKw / selectedInverter.power).toFixed(2)}:1
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('inverterCost')}</p>
                      <p className="text-lg font-semibold">
                        CHF {formatNumber(selectedInverter.price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Navigation */}
        <div className="p-4 border-t sticky bottom-0 bg-background">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => goToStep(2)} className="gap-2 flex-1">
              <ChevronLeft className="w-4 h-4" />
              {t('back')}
            </Button>
            <Button
              onClick={() => goToStep(4)}
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
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-3 rounded-sm border"
                style={{ backgroundColor: `${PANEL_FILL_COLOR}CC`, borderColor: PANEL_STROKE_COLOR }}
              />
              <span>{t('legendPanel')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
