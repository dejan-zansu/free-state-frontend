'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  Sun,
  Loader2,
  AlertCircle,
  SquareStack,
  Thermometer,
  Leaf,
  RefreshCw,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useCalculatorStore } from '@/stores/calculator.store'
import { getBuildingId, isPointInPolygon } from '@/lib/utils'

export default function Step2BuildingInsights() {
  const {
    address,
    latitude,
    longitude,
    buildingInsights,
    isLoading,
    error,
    showPanels,
    selectedConfigIndex,
    nearbyBuildings,
    selectedBuildingId,
    isFetchingNearby,
    nearbyFetchError,
    isDrawingMode,
    customRoofPolygon,
    setShowPanels,
    fetchBuildingInsights,
    fetchNearbyBuildings,
    selectBuilding,
    addBuildingFromClick,
    setDrawingMode,
    setCustomRoofPolygon,
    clearCustomPolygon,
  } = useCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const panelsRef = useRef<google.maps.Polygon[]>([])
  const buildingPolygonsMapRef = useRef<Map<string, google.maps.Polygon>>(new Map())
  const customPolygonRef = useRef<google.maps.Polygon | null>(null)
  const drawingPointsRef = useRef<Array<{ lat: number; lng: number }>>([])
  const tempMarkersRef = useRef<google.maps.Marker[]>([])
  const [mapReady, setMapReady] = useState(false)

  // Fetch building insights on mount
  useEffect(() => {
    if (latitude && longitude && !buildingInsights && !isLoading) {
      fetchBuildingInsights()
    }
  }, [latitude, longitude, buildingInsights, isLoading, fetchBuildingInsights])

  // Fetch nearby buildings after main building is loaded
  useEffect(() => {
    if (buildingInsights && nearbyBuildings.length === 0 && !isFetchingNearby && mapReady) {
      fetchNearbyBuildings()
    }
  }, [buildingInsights, nearbyBuildings.length, isFetchingNearby, mapReady, fetchNearbyBuildings])

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!window.google || !mapRef.current || !latitude || !longitude) return

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 20,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: false,
        streetViewControl: false,
        tilt: 0,
        mapId: 'solar-calculator-map',
      })

      mapInstanceRef.current = map
      setMapReady(true)
    } catch (err) {
      console.error('Error initializing map:', err)
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (window.google && latitude && longitude) {
      initializeMap()
    }
  }, [initializeMap, latitude, longitude])


  // Handle drawing mode - click to add points
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
      if (!isDrawingMode || !e.latLng) return

      const point = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      drawingPointsRef.current.push(point)

      // Add marker for the point
      const marker = new google.maps.Marker({
        position: point,
        map: mapInstanceRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        draggable: true,
      })

      // Allow dragging points
      marker.addListener('drag', () => {
        const newPos = marker.getPosition()
        if (newPos) {
          const idx = tempMarkersRef.current.indexOf(marker)
          if (idx !== -1) {
            drawingPointsRef.current[idx] = { lat: newPos.lat(), lng: newPos.lng() }
            updateDrawingPolygon()
          }
        }
      })

      tempMarkersRef.current.push(marker)
      updateDrawingPolygon()
    }

    const updateDrawingPolygon = () => {
      // Clear existing polygon
      if (customPolygonRef.current) {
        customPolygonRef.current.setMap(null)
      }

      if (drawingPointsRef.current.length >= 2) {
        customPolygonRef.current = new google.maps.Polygon({
          paths: drawingPointsRef.current,
          strokeColor: '#10B981',
          strokeOpacity: 1,
          strokeWeight: 3,
          fillColor: '#10B981',
          fillOpacity: 0.2,
          map: mapInstanceRef.current,
          editable: false,
        })
      }
    }

    const clickListener = mapInstanceRef.current.addListener('click', handleMapClick)

    return () => {
      google.maps.event.removeListener(clickListener)
    }
  }, [mapReady, isDrawingMode])

  // Clear drawing when exiting drawing mode
  useEffect(() => {
    if (!isDrawingMode && tempMarkersRef.current.length > 0) {
      // Clear temp markers and polygon
      tempMarkersRef.current.forEach((marker) => marker.setMap(null))
      tempMarkersRef.current = []
      drawingPointsRef.current = []

      if (customPolygonRef.current && !customRoofPolygon) {
        customPolygonRef.current.setMap(null)
        customPolygonRef.current = null
      }
    }
  }, [isDrawingMode, customRoofPolygon])

  // Handle map clicks to fetch building at any location (when not drawing)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || isDrawingMode) return

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || isDrawingMode) return

      const clickedLat = e.latLng.lat()
      const clickedLng = e.latLng.lng()

      // Fetch and select building at clicked location
      addBuildingFromClick(clickedLat, clickedLng)
    }

    const clickListener = mapInstanceRef.current.addListener('click', handleMapClick)

    return () => {
      google.maps.event.removeListener(clickListener)
    }
  }, [mapReady, isDrawingMode, addBuildingFromClick])

  // Draw solar panels on map
  useEffect(() => {
    if (!mapInstanceRef.current || !buildingInsights || !mapReady) return

    // Clear existing panels
    panelsRef.current.forEach((panel) => panel.setMap(null))
    panelsRef.current = []

    if (!showPanels) return

    if (!window.google?.maps?.geometry) return

    const solarPotential = buildingInsights.solarPotential
    const config = solarPotential.solarPanelConfigs[selectedConfigIndex]
    const panelsToShow = config?.panelsCount || 0

    // Filter panels by custom polygon OR show all
    const panelsToRender = solarPotential.solarPanels
      .slice(0, panelsToShow)
      .filter((panel) => {
        // If custom polygon is drawn, only show panels inside it
        if (customRoofPolygon) {
          return isPointInPolygon(
            { lat: panel.center.latitude, lng: panel.center.longitude },
            customRoofPolygon
          )
        }
        // Otherwise show all panels for the selected building
        return true
      })

    if (panelsToRender.length === 0) return

    // Color palette for panels (energy efficiency gradient)
    const palette = [
      '#1a237e', '#283593', '#303f9f', '#3949ab', '#3f51b5',
      '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6',
    ]

    // Calculate min/max energy for color scaling
    const panelEnergies = panelsToRender.map((p) => p.yearlyEnergyDcKwh)
    const minEnergy = Math.min(...panelEnergies)
    const maxEnergy = Math.max(...panelEnergies)

    panelsToRender.forEach((panel) => {
      const w = solarPotential.panelWidthMeters / 2
      const h = solarPotential.panelHeightMeters / 2

      const points = [
        { x: +w, y: +h },
        { x: +w, y: -h },
        { x: -w, y: -h },
        { x: -w, y: +h },
        { x: +w, y: +h },
      ]

      const orientation = panel.orientation === 'PORTRAIT' ? 90 : 0
      const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex]?.azimuthDegrees || 0

      // Calculate color based on energy
      const energyRatio = (panel.yearlyEnergyDcKwh - minEnergy) / (maxEnergy - minEnergy || 1)
      const colorIndex = Math.floor(energyRatio * (palette.length - 1))

      const polygon = new google.maps.Polygon({
        paths: points.map(({ x, y }) =>
          google.maps.geometry.spherical.computeOffset(
            { lat: panel.center.latitude, lng: panel.center.longitude },
            Math.sqrt(x * x + y * y),
            (Math.atan2(y, x) * 180) / Math.PI + orientation + azimuth
          )
        ),
        strokeColor: '#FFB300',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: palette[colorIndex] || palette[0],
        fillOpacity: 0.85,
        map: mapInstanceRef.current,
      })

      panelsRef.current.push(polygon)
    })
  }, [buildingInsights, selectedConfigIndex, showPanels, mapReady, customRoofPolygon])

  // Add new building polygons when nearbyBuildings changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    nearbyBuildings.forEach((building) => {
      const buildingId = getBuildingId(building)

      // Skip if we already have a polygon for this building
      if (buildingPolygonsMapRef.current.has(buildingId)) return

      // Create polygon for new building
      const bounds = building.boundingBox

      const paths = [
        { lat: bounds.ne.latitude, lng: bounds.ne.longitude },
        { lat: bounds.ne.latitude, lng: bounds.sw.longitude },
        { lat: bounds.sw.latitude, lng: bounds.sw.longitude },
        { lat: bounds.sw.latitude, lng: bounds.ne.longitude },
      ]

      const polygon = new google.maps.Polygon({
        paths,
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.8,
        strokeWeight: 1.5,
        fillColor: '#64748B',
        fillOpacity: 0.12,
        map: mapInstanceRef.current,
        clickable: true,
        zIndex: 70,
      })

      // Add click handler to select this building
      polygon.addListener('click', () => {
        selectBuilding(buildingId)
      })

      // Add hover effect
      polygon.addListener('mouseover', () => {
        const isSelected = buildingId === selectedBuildingId
        if (!isSelected) {
          polygon.setOptions({
            strokeColor: '#F59E0B',
            strokeOpacity: 1,
            fillColor: '#F59E0B',
            fillOpacity: 0.15,
            strokeWeight: 2,
            zIndex: 90,
          })
        }
      })

      polygon.addListener('mouseout', () => {
        const isSelected = buildingId === selectedBuildingId
        if (!isSelected) {
          polygon.setOptions({
            strokeColor: '#FFFFFF',
            strokeOpacity: 0.8,
            fillColor: '#64748B',
            fillOpacity: 0.12,
            strokeWeight: 1.5,
            zIndex: 70,
          })
        }
      })

      // Store polygon in map
      buildingPolygonsMapRef.current.set(buildingId, polygon)
    })
  }, [nearbyBuildings, mapReady, selectBuilding, selectedBuildingId])

  // Update polygon colors when selection changes
  useEffect(() => {
    if (!selectedBuildingId) return

    buildingPolygonsMapRef.current.forEach((polygon, buildingId) => {
      const isSelected = buildingId === selectedBuildingId

      polygon.setOptions({
        strokeColor: isSelected ? '#F59E0B' : '#FFFFFF',
        strokeOpacity: isSelected ? 1 : 0.8,
        strokeWeight: isSelected ? 2.5 : 1.5,
        fillColor: isSelected ? '#F59E0B' : '#64748B',
        fillOpacity: isSelected ? 0.2 : 0.12,
        zIndex: isSelected ? 100 : 70,
      })
    })
  }, [selectedBuildingId])

  // Note: Removed individual roof segment selection - now showing all panels for selected building

  const solarPotential = buildingInsights?.solarPotential
  const currentConfig = solarPotential?.solarPanelConfigs[selectedConfigIndex]

  // Format numbers for display
  const formatNumber = (num: number) => num.toLocaleString('de-CH', { maximumFractionDigits: 0 })
  const formatDecimal = (num: number) => num.toLocaleString('de-CH', { maximumFractionDigits: 1 })

  return (
    <div className='grid lg:grid-cols-5 gap-6'>
      {/* Left: Map (larger) */}
      <Card className='lg:col-span-3 h-[500px] lg:h-[600px] overflow-hidden'>
        <CardHeader className='pb-2 flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Sun className='w-5 h-5 text-solar' />
              Roof Analysis
            </CardTitle>
            <CardDescription className='text-xs'>
              {nearbyBuildings.length > 1
                ? `Click any building to analyze (${nearbyBuildings.length} buildings found)`
                : address}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Label htmlFor='show-panels' className='text-sm'>
              Show Panels
            </Label>
            <Switch
              id='show-panels'
              checked={showPanels}
              onCheckedChange={setShowPanels}
            />
          </div>
        </CardHeader>
        <CardContent className='p-0 h-[calc(100%-80px)] relative'>
          {isLoading ? (
            <div className='h-full flex items-center justify-center bg-muted/50'>
              <div className='text-center'>
                <Loader2 className='w-8 h-8 animate-spin text-solar mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>Analyzing roof...</p>
              </div>
            </div>
          ) : error ? (
            <div className='h-full flex items-center justify-center bg-muted/50 p-8'>
              <div className='text-center'>
                <AlertCircle className='w-12 h-12 text-destructive mx-auto mb-4' />
                <p className='font-medium text-destructive mb-2'>Analysis Failed</p>
                <p className='text-sm text-muted-foreground mb-4'>{error}</p>
                <Button onClick={fetchBuildingInsights} variant='outline' className='gap-2'>
                  <RefreshCw className='w-4 h-4' />
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className='w-full h-full' />
              {isFetchingNearby && (
                <div className='absolute top-4 left-4 right-4 p-3 rounded-lg bg-solar/10 border border-solar/20 z-10 backdrop-blur-sm'>
                  <div className='flex items-center gap-2'>
                    <Loader2 className='w-4 h-4 animate-spin text-solar' />
                    <span className='text-sm text-solar font-medium'>Finding nearby buildings...</span>
                  </div>
                </div>
              )}
              {nearbyFetchError && (
                <div className='absolute top-4 left-4 right-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 z-10 backdrop-blur-sm'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4 text-yellow-600' />
                    <span className='text-sm text-yellow-700'>
                      Could not load all nearby buildings. Showing available buildings only.
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Right: Stats */}
      <div className='lg:col-span-2 space-y-4'>
        {/* Selected Building Indicator */}
        {nearbyBuildings.length > 1 && buildingInsights && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Selected Building</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-xs text-muted-foreground'>
                {buildingInsights.administrativeArea || address}
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Showing{' '}
                {nearbyBuildings.findIndex((b) => getBuildingId(b) === selectedBuildingId) + 1} of{' '}
                {nearbyBuildings.length} buildings
              </p>
            </CardContent>
          </Card>
        )}

        {/* Roof Area Selection */}
        {solarPotential && (
          <Card className='border-energy/30 bg-energy/5'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm flex items-center justify-between'>
                <span>{isDrawingMode ? 'Draw Roof Area' : customRoofPolygon ? 'Custom Area' : 'Panel Configuration'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {isDrawingMode ? (
                <>
                  <p className='text-xs text-muted-foreground'>
                    Click on the map to place corner points. Drag points to adjust.
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='default'
                      onClick={() => {
                        if (drawingPointsRef.current.length >= 3) {
                          setCustomRoofPolygon(drawingPointsRef.current)
                          setDrawingMode(false)
                        }
                      }}
                      className='flex-1 text-xs h-8 bg-energy'
                      disabled={drawingPointsRef.current.length < 3}
                    >
                      Finish ({drawingPointsRef.current.length} points)
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setDrawingMode(false)
                        drawingPointsRef.current = []
                      }}
                      className='flex-1 text-xs h-8'
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : customRoofPolygon ? (
                <>
                  <p className='text-xs text-muted-foreground'>
                    Custom area defined with {customRoofPolygon.length} points
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setDrawingMode(true)
                        clearCustomPolygon()
                      }}
                      className='flex-1 text-xs h-8'
                    >
                      Redraw
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={clearCustomPolygon}
                      className='flex-1 text-xs h-8'
                    >
                      Clear
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Draw a custom area to define specific roof section for panels
                  </p>
                  <Button
                    size='sm'
                    variant='default'
                    onClick={() => setDrawingMode(true)}
                    className='w-full text-xs h-8 bg-energy'
                  >
                    Draw Custom Area
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {solarPotential && (
          <>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>Building Stats</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-3 rounded-lg bg-muted/50'>
                    <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                      <SquareStack className='w-4 h-4' />
                      <span className='text-xs'>Roof Area</span>
                    </div>
                    <p className='text-xl font-bold'>
                      {formatNumber(solarPotential.wholeRoofStats.areaMeters2)} m²
                    </p>
                  </div>
                  <div className='p-3 rounded-lg bg-muted/50'>
                    <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                      <Sun className='w-4 h-4' />
                      <span className='text-xs'>Sunshine Hours</span>
                    </div>
                    <p className='text-xl font-bold'>
                      {formatNumber(solarPotential.maxSunshineHoursPerYear)} h/yr
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-3 rounded-lg bg-solar/10'>
                    <div className='flex items-center gap-2 text-solar mb-1'>
                      <SquareStack className='w-4 h-4' />
                      <span className='text-xs'>Max Panels</span>
                    </div>
                    <p className='text-xl font-bold'>{solarPotential.maxArrayPanelsCount}</p>
                  </div>
                  <div className='p-3 rounded-lg bg-energy/10'>
                    <div className='flex items-center gap-2 text-energy mb-1'>
                      <Leaf className='w-4 h-4' />
                      <span className='text-xs'>CO₂ Factor</span>
                    </div>
                    <p className='text-xl font-bold'>
                      {formatDecimal(solarPotential.carbonOffsetFactorKgPerMwh)} kg/MWh
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Configuration */}
            {currentConfig && (
              <Card className='border-solar/30 bg-solar/5'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <Thermometer className='w-5 h-5 text-solar' />
                    Current Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Panels</span>
                      <span className='font-bold text-lg'>{currentConfig.panelsCount}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>System Size</span>
                      <span className='font-bold text-lg'>
                        {formatDecimal(
                          (currentConfig.panelsCount * solarPotential.panelCapacityWatts) / 1000
                        )}{' '}
                        kWp
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Annual Production</span>
                      <span className='font-bold text-lg text-energy'>
                        {formatNumber(currentConfig.yearlyEnergyDcKwh * 0.85)} kWh
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Roof Segments */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg'>Roof Segments</CardTitle>
                <CardDescription>
                  {solarPotential.roofSegmentStats.length} segments detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2 max-h-[200px] overflow-y-auto'>
                  {solarPotential.roofSegmentStats.map((segment, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 rounded-lg bg-muted/50'
                    >
                      <div>
                        <p className='text-sm font-medium'>Segment {index + 1}</p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDecimal(segment.stats.areaMeters2)} m² •{' '}
                          {formatDecimal(segment.pitchDegrees)}° pitch
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>
                          {formatDecimal(segment.azimuthDegrees)}°
                        </p>
                        <p className='text-xs text-muted-foreground'>azimuth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

