'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Home, MapPin, Zap, Sun, Square, MousePointer, PenTool, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useCalculatorStore } from '@/stores/new-calculator.store'

export default function Step2BuildingMap() {
  const {
    latitude,
    longitude,
    buildingInsights,
    selectedPanelCount,
    selectionMode,
    customPolygon,
    isDrawing,
    fetchBuildingInsights,
    setPanelCount,
    setSelectionMode,
    setCustomPolygon,
    setIsDrawing,
    clearCustomPolygon,
    calculateCustomPolygonData,
    isLoading,
    error,
  } = useCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const buildingPolygonRef = useRef<google.maps.Polygon | null>(null)
  const solarPanelsRef = useRef<google.maps.Polygon[]>([])
  const markerRef = useRef<google.maps.Marker | null>(null)
  const customPolygonRef = useRef<google.maps.Polygon | null>(null)
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  const [geometryLibrary, setGeometryLibrary] = useState<google.maps.GeometryLibrary | null>(null)

  // Initialize map
  const initializeMap = useCallback(async () => {
    console.log('🗺️ initializeMap called', { latitude, longitude, hasMapRef: !!mapRef.current })
    if (!mapRef.current || !latitude || !longitude) {
      console.log('⚠️ Missing required data for map initialization')
      return
    }

    try {
      console.log('🔧 Initializing map...')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
      })

      const geometryLib = await loader.importLibrary('geometry')
      await loader.importLibrary('maps')

      setGeometryLibrary(geometryLib as google.maps.GeometryLibrary)

      // Initialize map
      const mapOptions: google.maps.MapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        rotateControl: false,
      }

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions)
      console.log('✅ Map initialized successfully')

      // Add marker at address location (only in auto mode)
      if (selectionMode === 'auto') {
        markerRef.current = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstanceRef.current,
          title: 'Click on a building roof',
        })
        console.log('📍 Marker added at address location')

        // Set up click handler for auto mode
        mapClickListenerRef.current = mapInstanceRef.current.addListener(
          'click',
          (event: google.maps.MapMouseEvent) => {
            console.log('🖱️ Map clicked in auto mode at:', event.latLng?.toJSON())
            if (event.latLng) {
              fetchBuildingInsights(event.latLng.lat(), event.latLng.lng())
            }
          }
        )
        console.log('✅ Auto mode click listener added')
      }
    } catch (error) {
      console.error('❌ Error initializing map:', error)
    }
  }, [latitude, longitude, selectionMode, fetchBuildingInsights])

  // Create color palette from light blue to dark blue
  const createColorPalette = useCallback((): string[] => {
    const colors = ['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0']
    const palette: string[] = []
    const steps = 256

    for (let i = 0; i < steps; i++) {
      const position = i / (steps - 1)
      const colorIndex = Math.floor(position * (colors.length - 1))
      const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1)
      const localPosition = (position * (colors.length - 1)) % 1

      const color1 = hexToRgb(colors[colorIndex])
      const color2 = hexToRgb(colors[nextColorIndex])

      const r = Math.round(color1.r + (color2.r - color1.r) * localPosition)
      const g = Math.round(color1.g + (color2.g - color1.g) * localPosition)
      const b = Math.round(color1.b + (color2.b - color1.b) * localPosition)

      palette.push(`rgb(${r}, ${g}, ${b})`)
    }

    return palette
  }, [])

  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  // Draw building polygon and solar panels
  const drawBuildingAndPanels = useCallback(() => {
    console.log('🎨 drawBuildingAndPanels called', {
      hasBuildingInsights: !!buildingInsights,
      hasMap: !!mapInstanceRef.current,
      hasGeometryLib: !!geometryLibrary,
      panelCount: buildingInsights?.solarPotential.solarPanels.length,
    })
    if (!buildingInsights || !mapInstanceRef.current || !geometryLibrary) {
      console.log('⚠️ Missing required data for drawing')
      return
    }

    // Clear previous polygons
    buildingPolygonRef.current?.setMap(null)
    solarPanelsRef.current.forEach((panel) => panel.setMap(null))
    solarPanelsRef.current = []
    console.log('🧹 Cleared previous polygons')

    // Remove marker once building is selected
    markerRef.current?.setMap(null)

    const { boundingBox, solarPotential } = buildingInsights

    // Draw building outline
    const buildingBounds = [
      { lat: boundingBox.sw.latitude, lng: boundingBox.sw.longitude },
      { lat: boundingBox.ne.latitude, lng: boundingBox.sw.longitude },
      { lat: boundingBox.ne.latitude, lng: boundingBox.ne.longitude },
      { lat: boundingBox.sw.latitude, lng: boundingBox.ne.longitude },
    ]

    buildingPolygonRef.current = new google.maps.Polygon({
      paths: buildingBounds,
      strokeColor: '#FFD700',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FFD700',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
    })

    // Draw solar panels with color gradient based on energy output
    const panels = solarPotential.solarPanels
    console.log('🔆 Solar panels data:', {
      totalPanels: panels.length,
      selectedPanelCount,
      maxPanels: solarPotential.maxArrayPanelsCount,
    })
    if (panels.length === 0) {
      console.log('⚠️ No solar panels to draw')
      return
    }

    const minEnergy = panels[panels.length - 1].yearlyEnergyDcKwh
    const maxEnergy = panels[0].yearlyEnergyDcKwh

    // Create color palette (from light to dark blue)
    const palette = createColorPalette()

    // Only draw the selected number of panels (best ones first)
    const panelsToShow = panels.slice(0, selectedPanelCount)
    console.log(`🎨 Drawing ${panelsToShow.length} panels`)

    panelsToShow.forEach((panel) => {
      const [w, h] = [
        solarPotential.panelWidthMeters / 2,
        solarPotential.panelHeightMeters / 2,
      ]

      // Panel corner points
      const points = [
        { x: +w, y: +h },
        { x: +w, y: -h },
        { x: -w, y: -h },
        { x: -w, y: +h },
        { x: +w, y: +h },
      ]

      const orientation = panel.orientation === 'PORTRAIT' ? 90 : 0
      const azimuth = solarPotential.roofSegmentStats[panel.segmentIndex]?.azimuthDegrees ?? 180

      // Normalize energy to 0-1 range
      const normalizedEnergy = (panel.yearlyEnergyDcKwh - minEnergy) / (maxEnergy - minEnergy)
      const colorIndex = Math.round(normalizedEnergy * (palette.length - 1))

      // Calculate panel polygon coordinates using spherical geometry
      const panelPaths = points.map(({ x, y }) => {
        const distance = Math.sqrt(x * x + y * y)
        const angle = Math.atan2(y, x) * (180 / Math.PI) + orientation + azimuth
        return geometryLibrary.spherical.computeOffset(
          { lat: panel.center.latitude, lng: panel.center.longitude },
          distance,
          angle
        )
      })

      const solarPanel = new google.maps.Polygon({
        paths: panelPaths,
        strokeColor: '#B0BEC5',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: palette[colorIndex],
        fillOpacity: 0.9,
        map: mapInstanceRef.current,
      })

      solarPanelsRef.current.push(solarPanel)
    })

    // Center map on building
    const center = new google.maps.LatLng(
      buildingInsights.center.latitude,
      buildingInsights.center.longitude
    )
    mapInstanceRef.current.setCenter(center)
    console.log('✅ Drawing complete, map centered on building')
  }, [buildingInsights, geometryLibrary, createColorPalette, selectedPanelCount])

  // Start drawing custom polygon
  const startDrawing = useCallback(() => {
    console.log('✏️ startDrawing called')
    if (!mapInstanceRef.current) {
      console.log('⚠️ No map instance')
      return
    }

    setIsDrawing(true)
    clearCustomPolygon()
    console.log('✅ Drawing mode activated')

    // Create a new editable polygon
    const newPolygon = new google.maps.Polygon({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FF0000',
      fillOpacity: 0.2,
      editable: true,
      draggable: false,
      map: mapInstanceRef.current,
    })

    customPolygonRef.current = newPolygon

    // Add click listener to add points
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current)
    }

    mapClickListenerRef.current = mapInstanceRef.current.addListener(
      'click',
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return
        const path = newPolygon.getPath()
        path.push(event.latLng)
        console.log('📍 Point added to polygon, total points:', path.getLength())

        // Update store
        const coords = []
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i)
          coords.push({ lat: point.lat(), lng: point.lng() })
        }
        setCustomPolygon(coords)
        console.log('✅ Store updated with', coords.length, 'points')
      }
    )
  }, [setIsDrawing, clearCustomPolygon, setCustomPolygon])

  // Finish drawing (complete polygon)
  const finishDrawing = useCallback(() => {
    console.log('✏️ finishDrawing called')
    if (!customPolygonRef.current) {
      console.log('⚠️ No custom polygon ref')
      return
    }

    const path = customPolygonRef.current.getPath()
    console.log('📍 Polygon has', path.getLength(), 'points')
    if (path.getLength() < 3) {
      alert('Please draw at least 3 points to create a polygon')
      return
    }

    // Remove click listener
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current)
      mapClickListenerRef.current = null
      console.log('🔇 Map click listener removed')
    }

    // Make polygon non-editable but keep it draggable for adjustment
    customPolygonRef.current.setOptions({
      editable: true,
      strokeColor: '#FFD700',
      fillColor: '#FFD700',
    })
    console.log('🎨 Polygon style updated to gold')

    // Get polygon coordinates and calculate solar data
    const coords: Array<{ lat: number; lng: number }> = []
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i)
      coords.push({ lat: point.lat(), lng: point.lng() })
    }
    console.log('📍 Extracted coordinates:', coords)

    // Calculate solar potential for the custom polygon
    console.log('🚀 Calling calculateCustomPolygonData...')
    calculateCustomPolygonData(coords)

    setIsDrawing(false)
    console.log('✅ Drawing finished')
  }, [setIsDrawing, calculateCustomPolygonData])

  // Clear custom polygon
  const handleClearPolygon = useCallback(() => {
    if (customPolygonRef.current) {
      customPolygonRef.current.setMap(null)
      customPolygonRef.current = null
    }

    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current)
      mapClickListenerRef.current = null
    }

    clearCustomPolygon()
    setIsDrawing(false)
  }, [clearCustomPolygon, setIsDrawing])

  // Handle mode switch
  useEffect(() => {
    // Clean up when switching modes
    if (selectionMode === 'auto') {
      handleClearPolygon()
    } else {
      // Clear building insights in custom mode
      buildingPolygonRef.current?.setMap(null)
      solarPanelsRef.current.forEach((panel) => panel.setMap(null))
      solarPanelsRef.current = []
      markerRef.current?.setMap(null)
    }
  }, [selectionMode, handleClearPolygon])

  // Initialize map on mount
  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  // Draw building and panels when data is loaded
  useEffect(() => {
    console.log('👁️ buildingInsights changed:', !!buildingInsights)
    if (buildingInsights) {
      console.log('🎨 Triggering drawBuildingAndPanels')
      drawBuildingAndPanels()
    }
  }, [buildingInsights, drawBuildingAndPanels])

  // Log drawing state for debugging
  useEffect(() => {
    console.log('🔍 Drawing UI state:', { isDrawing, customPolygonPoints: customPolygon?.length })
  }, [isDrawing, customPolygon])

  // Format numbers
  const formatNumber = (num: number, decimals = 0): string => {
    return new Intl.NumberFormat('de-CH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  return (
    <div className='space-y-4'>
      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Selection Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <Button
              variant={selectionMode === 'auto' ? 'default' : 'outline'}
              onClick={() => setSelectionMode('auto')}
              className='flex-1 gap-2'
            >
              <MousePointer className='w-4 h-4' />
              Auto-Detect Building
            </Button>
            <Button
              variant={selectionMode === 'custom' ? 'default' : 'outline'}
              onClick={() => setSelectionMode('custom')}
              className='flex-1 gap-2'
            >
              <PenTool className='w-4 h-4' />
              Draw Custom Area
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {!buildingInsights && !customPolygon && (
        <Card className='bg-solar/10 border-solar/20'>
          <CardContent className='pt-6'>
            {selectionMode === 'auto' ? (
              <p className='text-center text-sm'>
                <MapPin className='inline w-4 h-4 mr-1' />
                Click on a building roof on the map to analyze its solar potential
              </p>
            ) : (
              <div className='text-center space-y-2'>
                <p className='text-sm font-medium'>Draw your custom roof area</p>
                <p className='text-xs text-muted-foreground'>
                  Click on the map to add points and outline your desired area
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Drawing Controls */}
      {selectionMode === 'custom' && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex gap-2'>
              {!isDrawing && !customPolygon && (
                <Button onClick={startDrawing} className='flex-1 gap-2'>
                  <PenTool className='w-4 h-4' />
                  Start Drawing
                </Button>
              )}
              {isDrawing && (
                <>
                  <Button onClick={finishDrawing} className='flex-1 gap-2' variant='default'>
                    Complete Polygon ({customPolygon?.length || 0} points)
                  </Button>
                  <Button onClick={handleClearPolygon} variant='destructive' className='gap-2'>
                    <Trash2 className='w-4 h-4' />
                    Clear
                  </Button>
                </>
              )}
              {!isDrawing && customPolygon && customPolygon.length >= 3 && (
                <Button onClick={handleClearPolygon} variant='outline' className='flex-1 gap-2'>
                  <Trash2 className='w-4 h-4' />
                  Clear & Redraw
                </Button>
              )}
            </div>
            {isDrawing && (
              <p className='text-xs text-muted-foreground mt-2 text-center'>
                Click on the map to add points. Need at least 3 points to complete.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error message */}
      {error && (
        <Card className='bg-destructive/10 border-destructive/20'>
          <CardContent className='pt-6'>
            <p className='text-center text-sm text-destructive'>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Map */}
        <div className='lg:col-span-2'>
          <Card>
            <CardContent className='p-0'>
              <div ref={mapRef} className='w-full h-[600px] rounded-lg' />
              {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='w-12 h-12 border-4 border-solar border-t-transparent rounded-full animate-spin' />
                    <p className='text-sm text-muted-foreground'>Analyzing building...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Building Info */}
        <div className='space-y-4'>
          {buildingInsights && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Home className='w-5 h-5 text-solar' />
                    Building Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between p-3 rounded-lg bg-muted'>
                    <div className='flex items-center gap-2'>
                      <Square className='w-4 h-4 text-muted-foreground' />
                      <span className='text-sm'>Roof Area</span>
                    </div>
                    <span className='font-semibold'>
                      {formatNumber(buildingInsights.solarPotential.wholeRoofStats.areaMeters2)} m²
                    </span>
                  </div>

                  <div className='flex items-center justify-between p-3 rounded-lg bg-muted'>
                    <div className='flex items-center gap-2'>
                      <Sun className='w-4 h-4 text-muted-foreground' />
                      <span className='text-sm'>Annual Sunshine</span>
                    </div>
                    <span className='font-semibold'>
                      {formatNumber(buildingInsights.solarPotential.maxSunshineHoursPerYear)} hrs
                    </span>
                  </div>

                  <div className='flex items-center justify-between p-3 rounded-lg bg-muted'>
                    <div className='flex items-center gap-2'>
                      <Zap className='w-4 h-4 text-muted-foreground' />
                      <span className='text-sm'>Max Panel Count</span>
                    </div>
                    <span className='font-semibold'>
                      {formatNumber(buildingInsights.solarPotential.maxArrayPanelsCount)} panels
                    </span>
                  </div>

                  <div className='flex items-center justify-between p-3 rounded-lg bg-solar/10'>
                    <div className='flex items-center gap-2'>
                      <Zap className='w-4 h-4 text-solar' />
                      <span className='text-sm font-medium'>Max Capacity</span>
                    </div>
                    <span className='font-bold text-solar'>
                      {formatNumber(
                        (buildingInsights.solarPotential.maxArrayPanelsCount *
                          buildingInsights.solarPotential.panelCapacityWatts) /
                          1000,
                        1
                      )}{' '}
                      kWp
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Zap className='w-5 h-5 text-energy' />
                    Panel Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Number of Panels</span>
                      <span className='text-lg font-bold text-solar'>{selectedPanelCount}</span>
                    </div>
                    <Slider
                      value={[selectedPanelCount]}
                      onValueChange={(value) => setPanelCount(value[0])}
                      min={1}
                      max={buildingInsights.solarPotential.maxArrayPanelsCount}
                      step={1}
                      className='w-full'
                    />
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>1 panel</span>
                      <span>{buildingInsights.solarPotential.maxArrayPanelsCount} panels</span>
                    </div>
                  </div>

                  <div className='pt-3 border-t space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>System Capacity</span>
                      <span className='font-semibold'>
                        {formatNumber(
                          (selectedPanelCount * buildingInsights.solarPotential.panelCapacityWatts) /
                            1000,
                          2
                        )}{' '}
                        kWp
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-muted-foreground'>Coverage</span>
                      <span className='font-semibold'>
                        {formatNumber(
                          (selectedPanelCount /
                            buildingInsights.solarPotential.maxArrayPanelsCount) *
                            100,
                          0
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-gradient-to-br from-solar/5 to-energy/5'>
                <CardContent className='pt-6'>
                  <div className='text-center space-y-2'>
                    <p className='text-sm text-muted-foreground'>Click &quot;Next&quot; to continue</p>
                    <p className='text-xs text-muted-foreground'>
                      Configure your solar system in the next step
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!buildingInsights && !isLoading && (
            <Card className='bg-muted/50'>
              <CardContent className='pt-6'>
                <div className='text-center space-y-2 text-muted-foreground'>
                  <Home className='w-12 h-12 mx-auto opacity-50' />
                  <p className='text-sm'>No building selected yet</p>
                  <p className='text-xs'>Click on the map to analyze a building</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
