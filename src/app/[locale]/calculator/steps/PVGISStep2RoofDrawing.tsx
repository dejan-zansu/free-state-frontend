'use client'

import { Loader } from '@googlemaps/js-api-loader'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  PenTool,
  Save,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep2RoofDrawing() {
  const {
    latitude,
    longitude,
    roofPolygon,
    setRoofPolygon,
    nextStep,
    prevStep,
    isLoading,
  } = usePVGISCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const mapMouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(
    null
  )
  const mapInitializedRef = useRef(false)
  const previewLineRef = useRef<google.maps.Polyline | null>(null)
  const edgeLabelsRef = useRef<google.maps.Marker[]>([])
  const vertexMarkersRef = useRef<google.maps.Marker[]>([])

  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>([])
  const [cursorPosition, setCursorPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [nearFirstPoint, setNearFirstPoint] = useState(false)

  // Calculate polygon area using Google Maps Geometry library (spherical calculation)
  // Falls back to Shoelace formula if geometry library not loaded
  const calculateArea = useCallback(
    (coords: Array<{ lat: number; lng: number }>): number => {
      if (coords.length < 3) return 0

      // Try to use Google Maps spherical geometry (more accurate)
      if (
        typeof google !== 'undefined' &&
        google.maps?.geometry?.spherical?.computeArea
      ) {
        const path = coords.map((c) => new google.maps.LatLng(c.lat, c.lng))
        return google.maps.geometry.spherical.computeArea(path)
      }

      // Fallback: Shoelace formula with improved coordinate conversion
      // Using WGS84 ellipsoid parameters for better accuracy
      const avgLat = coords.reduce((sum, p) => sum + p.lat, 0) / coords.length
      const latRad = (avgLat * Math.PI) / 180

      // WGS84 ellipsoid parameters
      const a = 6378137 // semi-major axis in meters
      const b = 6356752.3142 // semi-minor axis in meters
      const e2 = 1 - (b * b) / (a * a) // eccentricity squared

      // More accurate meters per degree calculation
      const metersPerDegreeLat =
        (Math.PI * a * (1 - e2)) /
        (180 * Math.pow(1 - e2 * Math.sin(latRad) * Math.sin(latRad), 1.5))
      const metersPerDegreeLng =
        (Math.PI * a * Math.cos(latRad)) /
        (180 * Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad)))

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
    },
    []
  )

  // Calculate perimeter of polygon
  const calculatePerimeter = useCallback(
    (coords: Array<{ lat: number; lng: number }>): number => {
      if (coords.length < 2) return 0

      // Try to use Google Maps spherical geometry
      if (
        typeof google !== 'undefined' &&
        google.maps?.geometry?.spherical?.computeLength
      ) {
        // Create closed path (add first point at end)
        const path = [...coords, coords[0]].map(
          (c) => new google.maps.LatLng(c.lat, c.lng)
        )
        return google.maps.geometry.spherical.computeLength(path)
      }

      // Fallback: Haversine formula
      let perimeter = 0
      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length
        const lat1 = (coords[i].lat * Math.PI) / 180
        const lat2 = (coords[j].lat * Math.PI) / 180
        const dLat = lat2 - lat1
        const dLng = ((coords[j].lng - coords[i].lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        perimeter += 6371000 * c // Earth radius in meters
      }
      return perimeter
    },
    []
  )

  // Check if polygon is self-intersecting (simple check for adjacent edge intersections)
  const checkSelfIntersection = useCallback(
    (coords: Array<{ lat: number; lng: number }>): boolean => {
      if (coords.length < 4) return false

      // Helper: Check if two line segments intersect
      const segmentsIntersect = (
        p1: { lat: number; lng: number },
        p2: { lat: number; lng: number },
        p3: { lat: number; lng: number },
        p4: { lat: number; lng: number }
      ): boolean => {
        const ccw = (
          A: { lat: number; lng: number },
          B: { lat: number; lng: number },
          C: { lat: number; lng: number }
        ) => {
          return (
            (C.lng - A.lng) * (B.lat - A.lat) > (B.lng - A.lng) * (C.lat - A.lat)
          )
        }
        return (
          ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
        )
      }

      // Check each pair of non-adjacent edges
      for (let i = 0; i < coords.length; i++) {
        for (let j = i + 2; j < coords.length; j++) {
          // Skip adjacent edges
          if (i === 0 && j === coords.length - 1) continue

          const p1 = coords[i]
          const p2 = coords[(i + 1) % coords.length]
          const p3 = coords[j]
          const p4 = coords[(j + 1) % coords.length]

          if (segmentsIntersect(p1, p2, p3, p4)) {
            return true
          }
        }
      }
      return false
    },
    []
  )

  const isSelfIntersecting = points.length >= 4 && checkSelfIntersection(points)

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback(
    (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
      if (
        typeof google !== 'undefined' &&
        google.maps?.geometry?.spherical?.computeDistanceBetween
      ) {
        return google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(point1.lat, point1.lng),
          new google.maps.LatLng(point2.lat, point2.lng)
        )
      }

      // Fallback: Haversine formula
      const R = 6371000 // Earth radius in meters
      const lat1 = (point1.lat * Math.PI) / 180
      const lat2 = (point2.lat * Math.PI) / 180
      const dLat = lat2 - lat1
      const dLng = ((point2.lng - point1.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },
    []
  )

  // Check if a point is near another point (for auto-complete detection)
  const isNearPoint = useCallback(
    (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): boolean => {
      const distance = calculateDistance(point1, point2)
      // Consider "near" if within 5 meters
      return distance < 5
    },
    [calculateDistance]
  )

  // Calculate centroid of polygon
  const getPolygonCentroid = useCallback(
    (coords: Array<{ lat: number; lng: number }>) => {
      if (coords.length === 0) return null
      const centroidLat =
        coords.reduce((sum, p) => sum + p.lat, 0) / coords.length
      const centroidLng =
        coords.reduce((sum, p) => sum + p.lng, 0) / coords.length
      return { lat: centroidLat, lng: centroidLng }
    },
    []
  )

  // Initialize map - only runs once per component mount
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !latitude || !longitude) return

    // Prevent re-initialization if already initialized
    if (mapInitializedRef.current && mapInstanceRef.current) {
      return
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      const loader = new Loader({ apiKey, version: 'weekly' })
      await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('geometry'), // For accurate area calculation
      ])

      // Get current roofPolygon from store to determine initial view
      const currentRoofPolygon = usePVGISCalculatorStore.getState().roofPolygon

      // Determine initial center: use polygon centroid if exists, otherwise address
      let initialCenter = { lat: latitude, lng: longitude }

      if (currentRoofPolygon && currentRoofPolygon.coordinates.length >= 3) {
        const centroid = getPolygonCentroid(currentRoofPolygon.coordinates)
        if (centroid) {
          initialCenter = centroid
        }
      }

      const mapOptions: google.maps.MapOptions = {
        center: initialCenter,
        zoom: 20,
        mapTypeId: 'satellite',
        tilt: 0,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      }

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions)
      mapInitializedRef.current = true

      // Load existing polygon if any
      if (currentRoofPolygon && currentRoofPolygon.coordinates.length >= 3) {
        setPoints(currentRoofPolygon.coordinates)
        drawPolygon(currentRoofPolygon.coordinates, true)

        // Fit map bounds to show entire polygon
        const bounds = new google.maps.LatLngBounds()
        currentRoofPolygon.coordinates.forEach((coord) => {
          bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
        })
        mapInstanceRef.current.fitBounds(bounds, 50) // 50px padding
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [latitude, longitude, getPolygonCentroid])

  // Clear edge labels and vertex markers
  const clearEdgeLabels = useCallback(() => {
    edgeLabelsRef.current.forEach((marker) => marker.setMap(null))
    edgeLabelsRef.current = []
    vertexMarkersRef.current.forEach((marker) => marker.setMap(null))
    vertexMarkersRef.current = []
  }, [])

  // Draw edge labels showing distances
  const drawEdgeLabels = useCallback(
    (coords: Array<{ lat: number; lng: number }>) => {
      if (!mapInstanceRef.current || coords.length < 2) return

      clearEdgeLabels()

      // Draw labels for each edge
      for (let i = 0; i < coords.length; i++) {
        const p1 = coords[i]
        const p2 = coords[(i + 1) % coords.length]
        const distance = calculateDistance(p1, p2)

        // Calculate midpoint
        const midLat = (p1.lat + p2.lat) / 2
        const midLng = (p1.lng + p2.lng) / 2

        // Create label
        const label = new google.maps.Marker({
          position: { lat: midLat, lng: midLng },
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
          },
          label: {
            text: `${distance.toFixed(1)}m`,
            color: '#1E40AF',
            fontSize: '12px',
            fontWeight: 'bold',
            className: 'edge-label',
          },
          clickable: false,
        })

        edgeLabelsRef.current.push(label)

        // Draw vertex markers
        const vertexMarker = new google.maps.Marker({
          position: p1,
          map: mapInstanceRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FFD700',
            fillOpacity: 1,
            strokeColor: '#1E40AF',
            strokeWeight: 2,
            scale: 5,
          },
          clickable: false,
        })

        vertexMarkersRef.current.push(vertexMarker)
      }
    },
    [calculateDistance, clearEdgeLabels]
  )

  // Update preview line showing next edge
  const updatePreviewLine = useCallback(() => {
    if (!mapInstanceRef.current || points.length === 0 || !cursorPosition) {
      if (previewLineRef.current) {
        previewLineRef.current.setMap(null)
        previewLineRef.current = null
      }
      return
    }

    const lastPoint = points[points.length - 1]
    const path = [lastPoint, cursorPosition]

    // Check if near first point for auto-complete
    if (points.length >= 3) {
      const nearFirst = isNearPoint(cursorPosition, points[0])
      setNearFirstPoint(nearFirst)
      if (nearFirst) {
        // Show preview line to first point
        path[1] = points[0]
      }
    }

    if (previewLineRef.current) {
      previewLineRef.current.setPath(path)
    } else {
      previewLineRef.current = new google.maps.Polyline({
        path,
        strokeColor: nearFirstPoint ? '#10B981' : '#6B7280',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: mapInstanceRef.current,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 2,
            },
            offset: '0',
            repeat: '10px',
          },
        ],
      })
    }

    // Update color based on proximity to first point
    if (previewLineRef.current) {
      previewLineRef.current.setOptions({
        strokeColor: nearFirstPoint ? '#10B981' : '#6B7280',
      })
    }
  }, [points, cursorPosition, isNearPoint, nearFirstPoint])

  // Draw polygon on map
  const drawPolygon = (
    coords: Array<{ lat: number; lng: number }>,
    editable: boolean = false
  ) => {
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

    // Draw edge labels if polygon is complete
    if (coords.length >= 3 && !editable) {
      drawEdgeLabels(coords)
    }

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
        drawEdgeLabels(newPoints)
      })

      google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
        const path = polygon.getPath()
        const newPoints: Array<{ lat: number; lng: number }> = []
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i)
          newPoints.push({ lat: point.lat(), lng: point.lng() })
        }
        setPoints(newPoints)
        drawEdgeLabels(newPoints)
      })

      // Draw initial labels
      drawEdgeLabels(coords)
    }
  }

  // Start drawing
  const startDrawing = () => {
    if (!mapInstanceRef.current) return

    setIsDrawing(true)
    setPoints([])
    setNearFirstPoint(false)
    setCursorPosition(null)

    // Remove existing polygon and labels
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
    }
    clearEdgeLabels()

    // Add mouse move listener for preview
    mapMouseMoveListenerRef.current = mapInstanceRef.current.addListener(
      'mousemove',
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return
        setCursorPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() })
      }
    )

    // Add click listener
    mapClickListenerRef.current = mapInstanceRef.current.addListener(
      'click',
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return

        const newPoint = { lat: event.latLng.lat(), lng: event.latLng.lng() }

        setPoints((prev) => {
          // Auto-complete if clicking near first point and have at least 3 points
          if (prev.length >= 3 && isNearPoint(newPoint, prev[0])) {
            // Complete the polygon
            finishDrawing(prev)
            return prev
          }

          const updated = [...prev, newPoint]
          drawPolygon(updated, false)
          return updated
        })
      }
    )
  }

  // Undo last point
  const undoLastPoint = useCallback(() => {
    if (points.length === 0) return

    setPoints((prev) => {
      const updated = prev.slice(0, -1)
      if (updated.length > 0) {
        drawPolygon(updated, false)
      } else {
        if (polygonRef.current) {
          polygonRef.current.setMap(null)
        }
        clearEdgeLabels()
      }
      return updated
    })
  }, [points.length, clearEdgeLabels])

  // Finish drawing
  const finishDrawing = useCallback(
    (pointsToFinish?: Array<{ lat: number; lng: number }>) => {
      const finalPoints = pointsToFinish || points

      if (finalPoints.length < 3) {
        alert('Please draw at least 3 points to create a polygon')
        return
      }

      // Remove click and mouse move listeners
      if (mapClickListenerRef.current) {
        google.maps.event.removeListener(mapClickListenerRef.current)
        mapClickListenerRef.current = null
      }
      if (mapMouseMoveListenerRef.current) {
        google.maps.event.removeListener(mapMouseMoveListenerRef.current)
        mapMouseMoveListenerRef.current = null
      }

      // Remove preview line
      if (previewLineRef.current) {
        previewLineRef.current.setMap(null)
        previewLineRef.current = null
      }

      // Make polygon editable
      drawPolygon(finalPoints, true)
      setIsDrawing(false)
      setNearFirstPoint(false)
      setCursorPosition(null)
    },
    [points]
  )

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
    // @ts-expect-error FIXME: Roof polygon is not typed
    setRoofPolygon(null)
  }

  useEffect(() => {
    initializeMap()

    // Cleanup on unmount
    return () => {
      if (mapClickListenerRef.current) {
        google.maps.event.removeListener(mapClickListenerRef.current)
        mapClickListenerRef.current = null
      }
      // Clean up polygon listeners
      if (polygonRef.current) {
        google.maps.event.clearInstanceListeners(polygonRef.current)
      }
      // Reset initialization flag for next mount
      mapInitializedRef.current = false
    }
  }, [initializeMap])

  return (
    <div className='grid grid-cols-[400px_1fr] gap-6 h-full'>
      <div className='overflow-y-auto'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-primary' />
              Draw Your Roof Area
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-sm text-muted-foreground space-y-2'>
              <p>
                Click on the map to outline the area where you want to install
                solar panels.
              </p>
              <ul className='list-disc list-inside space-y-1 text-xs'>
                <li>Draw the outline of your roof as seen from above</li>
                <li>Click to add points, complete when you have at least 3</li>
                <li>After completing, you can drag points to adjust</li>
                <li>Avoid overlapping lines for accurate measurements</li>
              </ul>
            </div>

            <div className='flex flex-col gap-2'>
              {!isDrawing && points.length === 0 && (
                <Button onClick={startDrawing} className='gap-2 w-full'>
                  <PenTool className='w-4 h-4' />
                  Start Drawing
                </Button>
              )}
              {isDrawing && (
                <>
                  <Button
                    onClick={finishDrawing}
                    variant='default'
                    className='gap-2 w-full'
                  >
                    Complete Polygon ({points.length} points)
                  </Button>
                  <Button
                    onClick={clearPolygon}
                    variant='destructive'
                    className='gap-2 w-full'
                  >
                    <Trash2 className='w-4 h-4' />
                    Clear
                  </Button>
                </>
              )}
              {!isDrawing && points.length >= 3 && (
                <>
                  {isSelfIntersecting && (
                    <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm'>
                      ⚠️ Polygon lines are crossing. Please redraw without
                      overlapping edges for accurate area calculation.
                    </div>
                  )}
                  <div className='p-3 rounded-lg bg-muted text-sm space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Area:</span>
                      <span className='font-medium'>
                        {calculateArea(points).toFixed(1)} m²
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Perimeter:</span>
                      <span className='font-medium'>
                        {calculatePerimeter(points).toFixed(1)} m
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={savePolygon}
                    className='gap-2 w-full'
                    disabled={isSelfIntersecting}
                  >
                    <Save className='w-4 h-4' />
                    Save Area
                  </Button>
                  <Button
                    onClick={clearPolygon}
                    variant='outline'
                    className='gap-2 w-full'
                  >
                    <Trash2 className='w-4 h-4' />
                    Redraw
                  </Button>
                </>
              )}
            </div>

            {roofPolygon && (
              <div className='p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-muted-foreground'>
                    Roof Area:
                  </span>
                  <span className='text-lg font-semibold text-primary'>
                    {roofPolygon.area.toFixed(1)} m²
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Perimeter:</span>
                  <span className='font-medium'>
                    {calculatePerimeter(roofPolygon.coordinates).toFixed(1)} m
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Points:</span>
                  <span className='font-medium'>
                    {roofPolygon.coordinates.length}
                  </span>
                </div>
                <p className='text-xs text-muted-foreground pt-2 border-t'>
                  💡 This is the horizontal projection area. Actual roof surface
                  will be calculated based on roof pitch in later steps.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className='flex flex-col gap-2 pt-4 border-t'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={isLoading}
            className='gap-2 w-full'
          >
            <ChevronLeft className='w-4 h-4' />
            Back
          </Button>

          <Button
            onClick={nextStep}
            disabled={!roofPolygon || isLoading}
            className='gap-2 w-full'
          >
            {isLoading ? (
              <>
                <svg
                  className='animate-spin w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='none'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                Next
                <ChevronRight className='w-4 h-4' />
              </>
            )}
          </Button>
        </div>
      </div>

      <div className='relative'>
        <div ref={mapRef} className='w-full h-full rounded-lg' />
      </div>
    </div>
  )
}
