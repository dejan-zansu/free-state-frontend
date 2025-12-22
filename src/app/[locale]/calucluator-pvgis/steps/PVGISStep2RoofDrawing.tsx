'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, PenTool, Save, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep2RoofDrawing() {
  const { latitude, longitude, roofPolygon, setRoofPolygon } = usePVGISCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>([])

  // Calculate polygon area using Shoelace formula
  const calculateArea = useCallback((coords: Array<{ lat: number; lng: number }>): number => {
    if (coords.length < 3) return 0

    // Convert lat/lng to approximate meters
    const avgLat = coords.reduce((sum, p) => sum + p.lat, 0) / coords.length
    const metersPerDegreeLat = 111320
    const metersPerDegreeLng = 111320 * Math.cos((avgLat * Math.PI) / 180)

    let area = 0
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length
      const xi = coords[i].lng * metersPerDegreeLng
      const yi = coords[i].lat * metersPerDegreeLat
      const xj = coords[j].lng * metersPerDegreeLng
      const yj = coords[j].lat * metersPerDegreeLat
      area += xi * yj - xj * yi
    }

    return Math.abs(area / 2)
  }, [])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !latitude || !longitude) return

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      const loader = new Loader({ apiKey, version: 'weekly' })
      await loader.importLibrary('maps')

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

      // Load existing polygon if any
      if (roofPolygon && roofPolygon.coordinates.length >= 3) {
        setPoints(roofPolygon.coordinates)
        drawPolygon(roofPolygon.coordinates, true)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [latitude, longitude, roofPolygon])

  // Draw polygon on map
  const drawPolygon = (coords: Array<{ lat: number; lng: number }>, editable: boolean = false) => {
    if (!mapInstanceRef.current || coords.length < 1) return

    // Remove existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
    }

    const polygon = new google.maps.Polygon({
      paths: coords,
      strokeColor: '#FFD700',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#FFD700',
      fillOpacity: 0.2,
      editable,
      draggable: false,
      map: mapInstanceRef.current,
    })

    polygonRef.current = polygon

    // If editable, listen for changes
    if (editable) {
      google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
        const path = polygon.getPath()
        const newPoints: Array<{ lat: number; lng: number }> = []
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i)
          newPoints.push({ lat: point.lat(), lng: point.lng() })
        }
        setPoints(newPoints)
      })

      google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
        const path = polygon.getPath()
        const newPoints: Array<{ lat: number; lng: number }> = []
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i)
          newPoints.push({ lat: point.lat(), lng: point.lng() })
        }
        setPoints(newPoints)
      })
    }
  }

  // Start drawing
  const startDrawing = () => {
    if (!mapInstanceRef.current) return

    setIsDrawing(true)
    setPoints([])

    // Remove existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
    }

    // Add click listener
    mapClickListenerRef.current = mapInstanceRef.current.addListener(
      'click',
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const newPoint = { lat: event.latLng.lat(), lng: event.latLng.lng() }
        setPoints((prev) => {
          const updated = [...prev, newPoint]
          drawPolygon(updated, false)
          return updated
        })
      }
    )
  }

  // Finish drawing
  const finishDrawing = () => {
    if (points.length < 3) {
      alert('Please draw at least 3 points to create a polygon')
      return
    }

    // Remove click listener
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current)
      mapClickListenerRef.current = null
    }

    // Make polygon editable
    drawPolygon(points, true)
    setIsDrawing(false)
  }

  // Save polygon
  const savePolygon = () => {
    if (points.length < 3) {
      alert('Please draw at least 3 points')
      return
    }

    const area = calculateArea(points)
    setRoofPolygon({
      coordinates: points,
      area,
    })
  }

  // Clear polygon
  const clearPolygon = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
    }
    if (mapClickListenerRef.current) {
      google.maps.event.removeListener(mapClickListenerRef.current)
      mapClickListenerRef.current = null
    }
    setPoints([])
    setIsDrawing(false)
    setRoofPolygon(null)
  }

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  useEffect(() => {
    return () => {
      if (mapClickListenerRef.current) {
        google.maps.event.removeListener(mapClickListenerRef.current)
      }
    }
  }, [])

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='w-5 h-5 text-solar' />
            Draw Your Roof Area
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Click on the map to outline the area where you want to install solar panels.
            You can draw around your entire roof or just a specific section.
          </p>

          <div className='flex gap-2'>
            {!isDrawing && points.length === 0 && (
              <Button onClick={startDrawing} className='gap-2'>
                <PenTool className='w-4 h-4' />
                Start Drawing
              </Button>
            )}
            {isDrawing && (
              <>
                <Button onClick={finishDrawing} variant='default' className='gap-2'>
                  Complete Polygon ({points.length} points)
                </Button>
                <Button onClick={clearPolygon} variant='destructive' className='gap-2'>
                  <Trash2 className='w-4 h-4' />
                  Clear
                </Button>
              </>
            )}
            {!isDrawing && points.length >= 3 && (
              <>
                <Button onClick={savePolygon} className='gap-2 bg-solar'>
                  <Save className='w-4 h-4' />
                  Save Area ({calculateArea(points).toFixed(1)} m²)
                </Button>
                <Button onClick={clearPolygon} variant='outline' className='gap-2'>
                  <Trash2 className='w-4 h-4' />
                  Redraw
                </Button>
              </>
            )}
          </div>

          {roofPolygon && (
            <div className='p-4 rounded-lg bg-solar/10 border border-solar/20'>
              <p className='text-sm font-medium'>
                Roof Area: {roofPolygon.area.toFixed(1)} m²
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                {roofPolygon.coordinates.length} points defined
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-0'>
          <div ref={mapRef} className='w-full h-[600px] rounded-lg' />
        </CardContent>
      </Card>
    </div>
  )
}
