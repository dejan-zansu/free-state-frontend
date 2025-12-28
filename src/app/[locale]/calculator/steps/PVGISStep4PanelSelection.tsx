'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Check, Eye, EyeOff, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { SolarPanel, usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

// Mocked panel data (in a real app, fetch from API)
const AVAILABLE_PANELS: SolarPanel[] = [
  {
    id: '1',
    name: 'Standard Efficiency 400W',
    power: 400,
    width: 1.7,
    height: 1.0,
    efficiency: 20.5,
    manufacturer: 'Generic Solar',
    price: 350,
  },
  {
    id: '2',
    name: 'High Efficiency 450W',
    power: 450,
    width: 1.7,
    height: 1.0,
    efficiency: 22.8,
    manufacturer: 'Premium Solar',
    price: 450,
  },
  {
    id: '3',
    name: 'Premium 500W',
    power: 500,
    width: 1.9,
    height: 1.0,
    efficiency: 23.5,
    manufacturer: 'Elite Solar',
    price: 550,
  },
]

export default function PVGISStep4PanelSelection() {
  const {
    latitude,
    longitude,
    roofPolygon,
    selectedPanel,
    panelCount,
    maxPanelCount,
    selectPanel,
    setPanelCount,
    setMaxPanelCount,
  } = usePVGISCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const roofPolygonRef = useRef<google.maps.Polygon | null>(null)
  const panelPolygonsRef = useRef<google.maps.Polygon[]>([])
  const [showPanels, setShowPanels] = useState(true)
  const [geometryLib, setGeometryLib] = useState<google.maps.GeometryLibrary | null>(null)

  // Calculate max panel count based on roof area
  useEffect(() => {
    if (roofPolygon && selectedPanel) {
      const panelArea = selectedPanel.width * selectedPanel.height
      const usableArea = roofPolygon.area * 0.6 // 60% usable (accounting for spacing, edges, obstacles)
      const maxPanels = Math.floor(usableArea / panelArea)
      setMaxPanelCount(maxPanels)

      // Set initial panel count to max if not set
      if (panelCount === 0) {
        setPanelCount(maxPanels)
      }
    }
  }, [roofPolygon, selectedPanel, panelCount, setMaxPanelCount, setPanelCount])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !latitude || !longitude || !roofPolygon) return

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      const loader = new Loader({ apiKey, version: 'weekly' })
      const [mapsLib, geometryLibrary] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('geometry'),
      ])

      setGeometryLib(geometryLibrary as google.maps.GeometryLibrary)

      const mapOptions: google.maps.MapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      }

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions)

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
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [latitude, longitude, roofPolygon])

  // Calculate panel positions and draw them on map
  const drawPanels = useCallback(() => {
    if (!mapInstanceRef.current || !roofPolygon || !selectedPanel || !geometryLib) return

    // Clear existing panels
    panelPolygonsRef.current.forEach((p) => p.setMap(null))
    panelPolygonsRef.current = []

    if (!showPanels || panelCount === 0) return

    // Calculate roof bounding box
    const lats = roofPolygon.coordinates.map((p) => p.lat)
    const lngs = roofPolygon.coordinates.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    // Calculate meters per degree
    const metersPerDegreeLat = 111320
    const metersPerDegreeLng = 111320 * Math.cos((centerLat * Math.PI) / 180)

    // Panel spacing (add 0.1m gap between panels)
    const panelSpacingLat = (selectedPanel.width + 0.1) / metersPerDegreeLat
    const panelSpacingLng = (selectedPanel.height + 0.1) / metersPerDegreeLng

    // Helper function to check if point is inside polygon
    function isPointInPolygon(lat: number, lng: number): boolean {
      let inside = false
      const coords = roofPolygon!.coordinates
      for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i].lng
        const yi = coords[i].lat
        const xj = coords[j].lng
        const yj = coords[j].lat

        const intersect =
          yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

        if (intersect) inside = !inside
      }
      return inside
    }

    // Generate grid of panel positions
    const panelPositions: Array<{ lat: number; lng: number }> = []
    let currentLat = minLat + panelSpacingLat / 2
    let rowOffset = 0

    while (currentLat < maxLat && panelPositions.length < panelCount) {
      let currentLng = minLng + panelSpacingLng / 2 + (rowOffset % 2) * (panelSpacingLng / 2)

      while (currentLng < maxLng && panelPositions.length < panelCount) {
        if (isPointInPolygon(currentLat, currentLng)) {
          panelPositions.push({ lat: currentLat, lng: currentLng })
        }
        currentLng += panelSpacingLng
      }

      currentLat += panelSpacingLat
      rowOffset++
    }

    // Draw each panel
    panelPositions.slice(0, panelCount).forEach((position, index) => {
      const halfWidth = selectedPanel.width / 2 / metersPerDegreeLat
      const halfHeight = selectedPanel.height / 2 / metersPerDegreeLng

      // Create panel rectangle
      const panelPath = [
        { lat: position.lat - halfWidth, lng: position.lng - halfHeight },
        { lat: position.lat - halfWidth, lng: position.lng + halfHeight },
        { lat: position.lat + halfWidth, lng: position.lng + halfHeight },
        { lat: position.lat + halfWidth, lng: position.lng - halfHeight },
      ]

      // Color gradient based on position (simulate energy production)
      const intensity = 0.3 + (index / panelCount) * 0.7 // 30% to 100%
      const blue = Math.round(255 * intensity)

      const panel = new google.maps.Polygon({
        paths: panelPath,
        strokeColor: '#1E40AF',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: `rgb(59, 130, ${blue})`,
        fillOpacity: 0.7,
        map: mapInstanceRef.current,
      })

      panelPolygonsRef.current.push(panel)
    })
  }, [roofPolygon, selectedPanel, panelCount, showPanels, geometryLib])

  // Initialize map
  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  // Redraw panels when panel count, selection, or visibility changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedPanel) {
      drawPanels()
    }
  }, [selectedPanel, panelCount, showPanels, drawPanels])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-CH').format(num)
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Left side: Panel selection and settings */}
        <div className='lg:col-span-1 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='w-5 h-5 text-solar' />
                Select Solar Panels
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-3'>
                {AVAILABLE_PANELS.map((panel) => (
                  <button
                    key={panel.id}
                    onClick={() => selectPanel(panel)}
                    className={`relative p-3 border-2 rounded-lg text-left transition-all ${
                      selectedPanel?.id === panel.id
                        ? 'border-solar bg-solar/5 shadow-md'
                        : 'border-border hover:border-solar/50'
                    }`}
                  >
                    {selectedPanel?.id === panel.id && (
                      <div className='absolute top-2 right-2 w-5 h-5 bg-solar rounded-full flex items-center justify-center'>
                        <Check className='w-3 h-3 text-white' />
                      </div>
                    )}
                    <div className='space-y-1'>
                      <h3 className='font-semibold text-sm'>{panel.name}</h3>
                      <div className='text-xl font-bold text-solar'>{panel.power}W</div>
                      <div className='space-y-0.5 text-xs text-muted-foreground'>
                        <div>Efficiency: {panel.efficiency}%</div>
                        <div>Size: {panel.width}m × {panel.height}m</div>
                        <div className='font-semibold text-foreground text-sm'>
                          CHF {formatNumber(panel.price)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPanel && maxPanelCount > 0 && (
                <div className='mt-4 p-4 border rounded-lg bg-muted/30'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Number of Panels</span>
                      <span className='text-2xl font-bold text-solar'>{panelCount}</span>
                    </div>
                    <Slider
                      value={[panelCount]}
                      onValueChange={(value) => setPanelCount(value[0])}
                      min={1}
                      max={maxPanelCount}
                      step={1}
                      className='w-full'
                    />
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>1 panel</span>
                      <span>Max: {maxPanelCount}</span>
                    </div>

                    {/* Summary */}
                    <div className='grid grid-cols-2 gap-3 pt-3 border-t text-sm'>
                      <div>
                        <div className='text-xs text-muted-foreground'>Total Capacity</div>
                        <div className='font-semibold'>
                          {((selectedPanel.power * panelCount) / 1000).toFixed(2)} kWp
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground'>Total Cost</div>
                        <div className='font-semibold'>
                          CHF {formatNumber(selectedPanel.price * panelCount)}
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground'>Coverage</div>
                        <div className='font-semibold'>
                          {roofPolygon
                            ? (
                                (panelCount * selectedPanel.width * selectedPanel.height) /
                                roofPolygon.area *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-muted-foreground'>Panel Area</div>
                        <div className='font-semibold'>
                          {(panelCount * selectedPanel.width * selectedPanel.height).toFixed(1)} m²
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Map visualization */}
        <div className='lg:col-span-2 space-y-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-3'>
              <CardTitle>Panel Visualization</CardTitle>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowPanels(!showPanels)}
                className='gap-2'
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
            </CardHeader>
            <CardContent className='p-0'>
              <div ref={mapRef} className='w-full h-[600px] rounded-b-lg' />
            </CardContent>
          </Card>

          {selectedPanel && panelCount > 0 && (
            <Card className='bg-solar/5 border-solar/20'>
              <CardContent className='pt-6'>
                <div className='text-sm text-center space-y-1'>
                  <p className='font-medium'>
                    {panelCount} × {selectedPanel.name}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Panels are automatically placed within your roof area.
                    In the next steps, you can adjust orientation and placement details.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
