'use client'

import { Loader } from '@googlemaps/js-api-loader'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  Battery,
  Loader2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  SolarPanel,
  Inverter,
  usePVGISCalculatorStore,
} from '@/stores/pvgis-calculator.store'

export default function Step4SolarSystem() {
  const {
    latitude,
    longitude,
    roofPolygon,
    selectedPanel,
    panelCount,
    maxPanelCount,
    selectedInverter,
    selectPanel,
    setPanelCount,
    setMaxPanelCount,
    selectInverter,
    nextStep,
    prevStep,
    isLoading,
  } = usePVGISCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const roofPolygonRef = useRef<google.maps.Polygon | null>(null)
  const panelPolygonsRef = useRef<google.maps.Polygon[]>([])
  const mapInitializedRef = useRef(false)

  const [showPanels, setShowPanels] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('panels')
  const [panelLayout, setPanelLayout] = useState<'portrait' | 'landscape'>(
    'landscape'
  )
  const [gridRotation, setGridRotation] = useState<number>(0) // Manual rotation in degrees
  const [detectedAngle, setDetectedAngle] = useState<number>(0) // Auto-detected from polygon

  // Equipment from API
  const [availablePanels, setAvailablePanels] = useState<SolarPanel[]>([])
  const [availableInverters, setAvailableInverters] = useState<Inverter[]>([])
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [equipmentError, setEquipmentError] = useState<string | null>(null)

  // Fetch equipment from API
  useEffect(() => {
    const fetchEquipment = async () => {
      setEquipmentLoading(true)
      setEquipmentError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      try {
        // Fetch panels and inverters in parallel
        const [panelsRes, invertersRes] = await Promise.all([
          fetch(`${apiUrl}/api/equipment/solar-panels?country=CH`),
          fetch(`${apiUrl}/api/equipment/inverters?country=CH`),
        ])

        if (!panelsRes.ok || !invertersRes.ok) {
          throw new Error('Failed to fetch equipment data')
        }

        const panelsData = await panelsRes.json()
        const invertersData = await invertersRes.json()

        // Map API response to frontend format
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
            // Convert mm to meters, use series dimensions if available
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
        setEquipmentError('Failed to load equipment. Please try again.')
      } finally {
        setEquipmentLoading(false)
      }
    }

    fetchEquipment()
  }, [selectedPanel, selectPanel])

  // Calculate the longest edge angle of the polygon (for auto-alignment)
  const calculateLongestEdgeAngle = useCallback(
    (coords: Array<{ lat: number; lng: number }>) => {
      if (coords.length < 3) return 0

      const centerLat =
        coords.reduce((sum, p) => sum + p.lat, 0) / coords.length
      const metersPerDegreeLat = 111320
      const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)

      let longestLength = 0
      let longestAngle = 0

      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length
        const dx = (coords[j].lng - coords[i].lng) * metersPerDegreeLng
        const dy = (coords[j].lat - coords[i].lat) * metersPerDegreeLat
        const length = Math.sqrt(dx * dx + dy * dy)

        if (length > longestLength) {
          longestLength = length
          // Calculate angle in degrees (0 = East, 90 = North)
          longestAngle = (Math.atan2(dy, dx) * 180) / Math.PI
        }
      }

      return longestAngle
    },
    []
  )

  // Auto-detect angle when polygon changes
  useEffect(() => {
    if (roofPolygon && roofPolygon.coordinates.length >= 3) {
      const angle = calculateLongestEdgeAngle(roofPolygon.coordinates)
      setDetectedAngle(angle)
      setGridRotation(angle) // Initialize with detected angle
    }
  }, [roofPolygon, calculateLongestEdgeAngle])

  // Calculate system power
  const systemPowerKw =
    selectedPanel && panelCount ? (selectedPanel.power * panelCount) / 1000 : 0

  // Auto-select best inverter based on system power
  // DC/AC ratio: 1.2-1.5:1 is optimal (inverter should be 67-83% of DC power)
  useEffect(() => {
    if (
      systemPowerKw > 0 &&
      !selectedInverter &&
      availableInverters.length > 0
    ) {
      const bestInverter = availableInverters.reduce((best, inv) => {
        const ratio = systemPowerKw / inv.power // DC/AC ratio
        const bestRatio = systemPowerKw / best.power
        // Prefer inverters with DC/AC ratio between 1.2 and 1.5
        if (ratio >= 1.2 && ratio <= 1.5) {
          if (bestRatio < 1.2 || bestRatio > 1.5) return inv
          // If both are in range, prefer higher efficiency
          if (inv.efficiency > best.efficiency) return inv
        }
        // If no inverter in optimal range, prefer closest to 1.35 (middle of range)
        const bestDistance = Math.abs(bestRatio - 1.35)
        const invDistance = Math.abs(ratio - 1.35)
        if (invDistance < bestDistance) return inv
        return best
      }, availableInverters[0])

      selectInverter(bestInverter)
    }
  }, [systemPowerKw, selectedInverter, selectInverter, availableInverters])

  // Calculate actual panel positions that fit in the polygon
  const calculatePanelPositions = useCallback(
    (
      rotation: number,
      layout: 'portrait' | 'landscape'
    ): Array<{
      center: { lat: number; lng: number }
      corners: Array<{ lat: number; lng: number }>
    }> => {
      if (!roofPolygon || !selectedPanel) return []

      const centerLat =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) /
        roofPolygon.coordinates.length
      const centerLng =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) /
        roofPolygon.coordinates.length

      const metersPerDegreeLat = 111320
      const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)

      // Panel dimensions based on layout
      const panelWidth =
        layout === 'landscape' ? selectedPanel.width : selectedPanel.height
      const panelHeight =
        layout === 'landscape' ? selectedPanel.height : selectedPanel.width

      // Spacing in meters (5cm gap)
      const spacingX = panelWidth + 0.05
      const spacingY = panelHeight + 0.05

      // Point in polygon check
      function isPointInPolygon(lat: number, lng: number): boolean {
        let inside = false
        const coords = roofPolygon!.coordinates
        for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
          const xi = coords[i].lng,
            yi = coords[i].lat
          const xj = coords[j].lng,
            yj = coords[j].lat
          const intersect =
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
          if (intersect) inside = !inside
        }
        return inside
      }

      // Check if all 4 corners of a panel are inside the polygon
      function isPanelInPolygon(corners: Array<{ lat: number; lng: number }>) {
        return corners.every((c) => isPointInPolygon(c.lat, c.lng))
      }

      // Get bounding box extent
      const lats = roofPolygon.coordinates.map((p) => p.lat)
      const lngs = roofPolygon.coordinates.map((p) => p.lng)
      const extentLat = Math.max(...lats) - Math.min(...lats)
      const extentLng = Math.max(...lngs) - Math.min(...lngs)
      const maxExtent = Math.max(extentLat, extentLng) * 1.5

      const positions: Array<{
        center: { lat: number; lng: number }
        corners: Array<{ lat: number; lng: number }>
      }> = []

      const gridStepsX =
        Math.ceil((maxExtent * metersPerDegreeLng) / spacingX) + 2
      const gridStepsY =
        Math.ceil((maxExtent * metersPerDegreeLat) / spacingY) + 2

      const angleRad = (rotation * Math.PI) / 180

      for (let gy = -gridStepsY; gy <= gridStepsY; gy++) {
        for (let gx = -gridStepsX; gx <= gridStepsX; gx++) {
          const localX = gx * spacingX
          const localY = gy * spacingY

          const rotatedX =
            localX * Math.cos(angleRad) - localY * Math.sin(angleRad)
          const rotatedY =
            localX * Math.sin(angleRad) + localY * Math.cos(angleRad)

          const panelCenter = {
            lat: centerLat + rotatedY / metersPerDegreeLat,
            lng: centerLng + rotatedX / metersPerDegreeLng,
          }

          const halfW = panelWidth / 2
          const halfH = panelHeight / 2
          const localCorners = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: halfW, y: halfH },
            { x: -halfW, y: halfH },
          ]

          const corners = localCorners.map((c) => {
            const rx = c.x * Math.cos(angleRad) - c.y * Math.sin(angleRad)
            const ry = c.x * Math.sin(angleRad) + c.y * Math.cos(angleRad)
            return {
              lat: panelCenter.lat + ry / metersPerDegreeLat,
              lng: panelCenter.lng + rx / metersPerDegreeLng,
            }
          })

          if (isPanelInPolygon(corners)) {
            positions.push({ center: panelCenter, corners })
          }
        }
      }

      // Sort by distance from center
      positions.sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(a.center.lat - centerLat, 2) +
            Math.pow(a.center.lng - centerLng, 2)
        )
        const distB = Math.sqrt(
          Math.pow(b.center.lat - centerLat, 2) +
            Math.pow(b.center.lng - centerLng, 2)
        )
        return distA - distB
      })

      return positions
    },
    [roofPolygon, selectedPanel]
  )

  // Track actual max panels that fit
  const [actualMaxPanels, setActualMaxPanels] = useState(0)

  // Calculate max panel count based on actual fit (not 60% estimate)
  useEffect(() => {
    if (roofPolygon && selectedPanel) {
      const positions = calculatePanelPositions(gridRotation, panelLayout)
      const maxFit = positions.length
      setActualMaxPanels(maxFit)
      setMaxPanelCount(maxFit)

      // Auto-set to max if exceeds max
      if (panelCount > maxFit) {
        setPanelCount(maxFit)
      }
    }
  }, [
    roofPolygon,
    selectedPanel,
    gridRotation,
    panelLayout,
    calculatePanelPositions,
    setMaxPanelCount,
    setPanelCount,
    panelCount,
  ])

  // Track previous panel ID to detect panel selection changes
  const prevPanelIdRef = useRef<string | null>(null)

  // When panel selection changes, always set to max count
  useEffect(() => {
    if (selectedPanel && roofPolygon) {
      // Only reset to max when panel ID actually changes
      if (prevPanelIdRef.current !== selectedPanel.id) {
        const positions = calculatePanelPositions(gridRotation, panelLayout)
        const maxFit = positions.length
        setPanelCount(maxFit)
        prevPanelIdRef.current = selectedPanel.id
      }
    }
  }, [
    selectedPanel,
    roofPolygon,
    calculatePanelPositions,
    gridRotation,
    panelLayout,
    setPanelCount,
  ])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (mapInitializedRef.current) return
    if (!mapRef.current || !latitude || !longitude || !roofPolygon) return

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) return

      const loader = new Loader({ apiKey, version: 'weekly' })
      await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('geometry'),
      ])

      // Calculate centroid for centering
      const centroidLat =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) /
        roofPolygon.coordinates.length
      const centroidLng =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) /
        roofPolygon.coordinates.length

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: centroidLat, lng: centroidLng },
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      // Draw roof polygon
      roofPolygonRef.current = new google.maps.Polygon({
        paths: roofPolygon.coordinates,
        strokeColor: '#FFD700',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.1,
        map: mapInstanceRef.current,
      })

      // Fit bounds
      const bounds = new google.maps.LatLngBounds()
      roofPolygon.coordinates.forEach((coord) =>
        bounds.extend({ lat: coord.lat, lng: coord.lng })
      )
      mapInstanceRef.current.fitBounds(bounds, 50)

      mapInitializedRef.current = true
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [latitude, longitude, roofPolygon])

  // Draw panels on map using calculated positions
  const drawPanels = useCallback(() => {
    if (!mapInstanceRef.current || !roofPolygon || !selectedPanel) return

    // Clear existing panels
    panelPolygonsRef.current.forEach((p) => p.setMap(null))
    panelPolygonsRef.current = []

    if (!showPanels || panelCount === 0) return

    // Get panel positions using the shared calculation function
    const panelPositions = calculatePanelPositions(gridRotation, panelLayout)

    // Draw panels (limited to user-selected count)
    panelPositions.slice(0, panelCount).forEach((pos, index) => {
      const intensity = 0.4 + (index / Math.max(panelCount, 1)) * 0.6
      const blue = Math.round(220 * intensity)

      const panel = new google.maps.Polygon({
        paths: pos.corners,
        strokeColor: '#1E40AF',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: `rgb(37, 99, ${blue})`,
        fillOpacity: 0.75,
        map: mapInstanceRef.current,
      })

      panelPolygonsRef.current.push(panel)
    })
  }, [
    roofPolygon,
    selectedPanel,
    panelCount,
    showPanels,
    panelLayout,
    gridRotation,
    calculatePanelPositions,
  ])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  useEffect(() => {
    if (mapInstanceRef.current && selectedPanel) {
      drawPanels()
    }
  }, [selectedPanel, panelCount, showPanels, drawPanels])

  // Get inverter recommendation status
  // DC/AC ratio (Inverter Loading Ratio): Industry standard is 1.1-1.5:1 for residential systems
  // Optimal range: 1.2-1.5:1 (inverter should be 67-83% of DC power)
  // This oversizing maximizes energy harvest during low-light conditions while
  // allowing occasional clipping during peak hours, which is cost-effective.
  // Sources: EnergySage, NREL, industry best practices
  const getInverterStatus = (inverter: Inverter) => {
    if (systemPowerKw === 0) return 'neutral'
    const ratio = systemPowerKw / inverter.power // DC/AC ratio
    if (ratio >= 1.2 && ratio <= 1.5) return 'recommended'
    if (ratio > 1.5 && ratio <= 1.8) return 'acceptable'
    if (ratio < 1.2) return 'oversized' // Inverter too large for DC array
    return 'undersized' // Inverter too small for DC array (ratio > 1.8)
  }

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('de-CH').format(num)

  const canProceed = selectedPanel && panelCount > 0 && selectedInverter

  // Calculate totals
  const totalPanelCost = selectedPanel ? selectedPanel.price * panelCount : 0
  const totalInverterCost = selectedInverter ? selectedInverter.price : 0
  const totalCost = totalPanelCost + totalInverterCost

  return (
    <div className='h-full flex'>
      {/* Left Panel - Configuration */}
      <div className='w-[420px] shrink-0 overflow-y-auto border-r bg-background'>
        <div className='p-4 space-y-4'>
          {/* System Summary */}
          <Card className='bg-primary/5 border-primary/20'>
            <CardContent className='py-4'>
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <p className='text-xs text-muted-foreground'>System Size</p>
                  <p className='text-xl font-bold text-primary'>
                    {systemPowerKw.toFixed(1)} kWp
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Panels</p>
                  <p className='text-xl font-bold'>{panelCount}</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Est. Cost</p>
                  <p className='text-xl font-bold'>
                    CHF {formatNumber(totalCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='panels' className='gap-2'>
                <Zap className='w-4 h-4' />
                Panels
              </TabsTrigger>
              <TabsTrigger value='inverter' className='gap-2'>
                <Battery className='w-4 h-4' />
                Inverter
              </TabsTrigger>
            </TabsList>

            {/* Panels Tab */}
            <TabsContent value='panels' className='space-y-4 mt-4'>
              {equipmentLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-primary' />
                  <span className='ml-2 text-muted-foreground'>
                    Loading panels...
                  </span>
                </div>
              ) : equipmentError ? (
                <div className='text-center py-8 text-destructive'>
                  <p>{equipmentError}</p>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : availablePanels.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No panels available</p>
                </div>
              ) : (
                <>
                  <div className='grid gap-3'>
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
                          <div className='absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center'>
                            <Check className='w-3 h-3 text-white' />
                          </div>
                        )}
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='font-semibold text-sm'>
                              {panel.name}
                            </h3>
                            <p className='text-xs text-muted-foreground'>
                              {panel.efficiency.toFixed(1)}% efficiency •{' '}
                              {panel.width.toFixed(2)}×{panel.height.toFixed(2)}
                              m
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold text-primary'>
                              {panel.power}W
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              CHF {panel.price}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedPanel && maxPanelCount > 0 && (
                    <div className='p-4 border rounded-lg bg-muted/30'>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-sm font-medium'>
                          Number of Panels
                        </span>
                        <span className='text-2xl font-bold text-primary'>
                          {panelCount}
                        </span>
                      </div>
                      <Slider
                        value={[panelCount]}
                        onValueChange={(value) => setPanelCount(value[0])}
                        min={1}
                        max={maxPanelCount}
                        step={1}
                      />
                      <div className='flex justify-between text-xs text-muted-foreground mt-2'>
                        <span>1</span>
                        <span>
                          Max fit: {actualMaxPanels}{' '}
                          {roofPolygon && selectedPanel && (
                            <span className='text-primary'>
                              (
                              {(
                                ((actualMaxPanels *
                                  selectedPanel.width *
                                  selectedPanel.height) /
                                  roofPolygon.area) *
                                100
                              ).toFixed(0)}
                              % coverage)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className='grid grid-cols-2 gap-3 pt-3 mt-3 border-t text-sm'>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Capacity
                          </p>
                          <p className='font-semibold'>
                            {systemPowerKw.toFixed(2)} kWp
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Panel Cost
                          </p>
                          <p className='font-semibold'>
                            CHF {formatNumber(totalPanelCost)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Coverage
                          </p>
                          <p className='font-semibold'>
                            {roofPolygon
                              ? (
                                  ((panelCount *
                                    selectedPanel.width *
                                    selectedPanel.height) /
                                    roofPolygon.area) *
                                  100
                                ).toFixed(1)
                              : 0}
                            %
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Panel Area
                          </p>
                          <p className='font-semibold'>
                            {(
                              panelCount *
                              selectedPanel.width *
                              selectedPanel.height
                            ).toFixed(1)}{' '}
                            m²
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Inverter Tab */}
            <TabsContent value='inverter' className='space-y-4 mt-4'>
              {systemPowerKw > 0 && (
                <div className='p-3 rounded-lg bg-muted/50 text-sm'>
                  <p>
                    Recommended inverter size:{' '}
                    <span className='font-semibold'>
                      {(systemPowerKw / 1.5).toFixed(1)} -{' '}
                      {(systemPowerKw / 1.2).toFixed(1)} kW
                    </span>
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    (DC/AC ratio: 1.2-1.5:1 is optimal. Industry standard is
                    1.1-1.5:1 for residential systems. Multiple inverters are
                    common for larger systems.)
                  </p>
                </div>
              )}

              {equipmentLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='w-6 h-6 animate-spin text-primary' />
                  <span className='ml-2 text-muted-foreground'>
                    Loading inverters...
                  </span>
                </div>
              ) : availableInverters.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No inverters available</p>
                </div>
              ) : (
                <div className='grid gap-3'>
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
                          <div className='absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center'>
                            <Check className='w-3 h-3 text-white' />
                          </div>
                        )}
                        {status === 'recommended' &&
                          selectedInverter?.id !== inverter.id && (
                            <span className='absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full'>
                              Best fit
                            </span>
                          )}
                        <div className='flex justify-between items-start'>
                          <div>
                            <h3 className='font-semibold text-sm'>
                              {inverter.name}
                            </h3>
                            <p className='text-xs text-muted-foreground'>
                              {inverter.manufacturer} • {inverter.efficiency}%
                              efficiency
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-lg font-bold text-primary'>
                              {inverter.power} kW
                            </p>
                            <p className='text-xs text-muted-foreground'>
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
                <div className='p-4 border rounded-lg bg-muted/30'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        DC/AC Ratio
                      </p>
                      <p className='text-lg font-semibold'>
                        {(systemPowerKw / selectedInverter.power).toFixed(2)}:1
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Inverter Cost
                      </p>
                      <p className='text-lg font-semibold'>
                        CHF {formatNumber(selectedInverter.price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Panel Layout Controls */}
          {/* {selectedPanel && panelCount > 0 && (
            <div className='space-y-3 p-3 border rounded-lg bg-muted/30'>
              <p className='text-xs font-medium text-muted-foreground'>
                Panel Layout
              </p>

              <div className='flex gap-2'>
                <Button
                  variant={panelLayout === 'landscape' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setPanelLayout('landscape')}
                  className='flex-1 gap-1'
                >
                  <Rows className='w-3 h-3' />
                  Landscape
                </Button>
                <Button
                  variant={panelLayout === 'portrait' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setPanelLayout('portrait')}
                  className='flex-1 gap-1'
                >
                  <Columns className='w-3 h-3' />
                  Portrait
                </Button>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium'>
                    Grid Rotation: {Math.round(gridRotation)}°
                  </span>
                  <div className='flex gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setGridRotation(detectedAngle)}
                      className='h-6 px-2 text-xs'
                      title='Reset to auto-detected angle'
                    >
                      <RotateCcw className='w-3 h-3 mr-1' />
                      Auto
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => {
                        let bestAngle = gridRotation
                        let bestLayout = panelLayout
                        let maxCount = 0

                        for (let angle = -180; angle <= 180; angle += 5) {
                          for (const layout of [
                            'landscape',
                            'portrait',
                          ] as const) {
                            const count = calculatePanelPositions(
                              angle,
                              layout
                            ).length
                            if (count > maxCount) {
                              maxCount = count
                              bestAngle = angle
                              bestLayout = layout
                            }
                          }
                        }

                        for (
                          let angle = bestAngle - 5;
                          angle <= bestAngle + 5;
                          angle += 1
                        ) {
                          const count = calculatePanelPositions(
                            angle,
                            bestLayout
                          ).length
                          if (count > maxCount) {
                            maxCount = count
                            bestAngle = angle
                          }
                        }

                        setGridRotation(bestAngle)
                        setPanelLayout(bestLayout)
                      }}
                      className='h-6 px-2 text-xs'
                      title='Find optimal rotation for max panels'
                    >
                      <Zap className='w-3 h-3 mr-1' />
                      Optimize
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[gridRotation]}
                  onValueChange={(v) => setGridRotation(v[0])}
                  min={-180}
                  max={180}
                  step={1}
                  className='w-full'
                />
                <div className='flex justify-between text-[10px] text-muted-foreground'>
                  <span>-180°</span>
                  <span>0°</span>
                  <span>180°</span>
                </div>
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowPanels(!showPanels)}
                className='gap-2 w-full'
              >
                {showPanels ? (
                  <>
                    <Eye className='w-4 h-4' />
                    Hide Panels
                  </>
                ) : (
                  <>
                    <EyeOff className='w-4 h-4' />
                    Show Panels
                  </>
                )}
              </Button>
            </div>
          )} */}
        </div>

        {/* Navigation */}
        <div className='p-4 border-t sticky bottom-0 bg-background'>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={prevStep}
              disabled={isLoading}
              className='gap-2 flex-1'
            >
              <ArrowLeft className='w-4 h-4' />
              Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed || isLoading}
              className='gap-2 flex-1'
            >
              {isLoading ? (
                <span className='animate-spin'>⏳</span>
              ) : (
                <>
                  Calculate
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className='flex-1 relative'>
        <div ref={mapRef} className='w-full h-full' />
      </div>
    </div>
  )
}
