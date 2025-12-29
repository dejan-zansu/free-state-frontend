'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { ChevronLeft, ChevronRight, Compass, Ruler } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep5PanelPlacement() {
  const {
    panelPlacement,
    updatePanelPlacement,
    buildingDetails,
    latitude,
    longitude,
    roofPolygon,
    nextStep,
    prevStep,
    isLoading,
  } = usePVGISCalculatorStore()

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const polygonRef = useRef<google.maps.Polygon | null>(null)

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

      // Draw roof polygon if available
      if (roofPolygon && roofPolygon.coordinates.length >= 3) {
        if (polygonRef.current) {
          polygonRef.current.setMap(null)
        }

        polygonRef.current = new google.maps.Polygon({
          paths: roofPolygon.coordinates,
          strokeColor: '#FFD700',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: '#FFD700',
          fillOpacity: 0.2,
          editable: false,
          draggable: false,
          map: mapInstanceRef.current,
        })
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [latitude, longitude, roofPolygon])

  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  return (
    <div className='grid grid-cols-[400px_1fr] gap-6 h-full'>
      {/* Left sidebar - Panel Placement Configuration */}
      <div className='overflow-y-auto'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Compass className='w-5 h-5 text-solar' />
              Panel Placement Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Orientation (Azimuth) */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>
                Orientation (Azimuth)
              </Label>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    0° = North, 90° = East, 180° = South, 270° = West
                  </span>
                  <span className='font-semibold'>
                    {panelPlacement.orientation}°
                  </span>
                </div>
                <Slider
                  value={[panelPlacement.orientation]}
                  onValueChange={(value) =>
                    updatePanelPlacement({ orientation: value[0] })
                  }
                  min={0}
                  max={360}
                  step={5}
                  className='w-full'
                />
                <div className='text-xs text-muted-foreground text-center'>
                  {panelPlacement.orientation === 0 && 'North'}
                  {panelPlacement.orientation === 90 && 'East'}
                  {panelPlacement.orientation === 180 &&
                    'South (Optimal for Northern Hemisphere)'}
                  {panelPlacement.orientation === 270 && 'West'}
                </div>
              </div>
            </div>

            {/* Tilt Angle */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>Tilt Angle</Label>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Angle from horizontal
                  </span>
                  <span className='font-semibold'>{panelPlacement.tilt}°</span>
                </div>
                <Slider
                  value={[panelPlacement.tilt]}
                  onValueChange={(value) =>
                    updatePanelPlacement({ tilt: value[0] })
                  }
                  min={0}
                  max={60}
                  step={5}
                  className='w-full'
                />
                <div className='text-xs text-muted-foreground'>
                  {buildingDetails?.roofType === 'flat'
                    ? 'Recommended: 30° for optimal yield in Switzerland'
                    : `Current roof pitch: ${
                        buildingDetails?.roofPitch || 30
                      }°`}
                </div>
              </div>
            </div>

            {/* Distances */}
            <div className='space-y-4'>
              <Label className='text-base font-semibold flex items-center gap-2'>
                <Ruler className='w-4 h-4' />
                Safety Distances
              </Label>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label className='text-sm'>Ridge Distance (m)</Label>
                  <Input
                    type='number'
                    value={panelPlacement.ridgeDistance}
                    onChange={(e) =>
                      updatePanelPlacement({
                        ridgeDistance: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={0.1}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm'>Gable End Distance (m)</Label>
                  <Input
                    type='number'
                    value={panelPlacement.gableEndDistance}
                    onChange={(e) =>
                      updatePanelPlacement({
                        gableEndDistance: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={0.1}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm'>Eaves Distance (m)</Label>
                  <Input
                    type='number'
                    value={panelPlacement.eavesDistance}
                    onChange={(e) =>
                      updatePanelPlacement({
                        eavesDistance: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={0.1}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-sm'>Obstacle Clearance (m)</Label>
                  <Input
                    type='number'
                    value={panelPlacement.obstacleClearance}
                    onChange={(e) =>
                      updatePanelPlacement({
                        obstacleClearance: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            {/* Module Orientation */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>
                Module Orientation
              </Label>
              <RadioGroup
                value={panelPlacement.moduleOrientation}
                onValueChange={(value) =>
                  updatePanelPlacement({
                    moduleOrientation: value as 'horizontal' | 'vertical',
                  })
                }
              >
                <div className='flex gap-4'>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <RadioGroupItem value='horizontal' />
                    <span>Horizontal (Landscape)</span>
                  </label>
                  <label className='flex items-center space-x-2 cursor-pointer'>
                    <RadioGroupItem value='vertical' />
                    <span>Vertical (Portrait)</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Module Rotation */}
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>Module Rotation</Label>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Fine-tune panel rotation
                  </span>
                  <span className='font-semibold'>
                    {panelPlacement.moduleRotation.toFixed(1)}°
                  </span>
                </div>
                <Slider
                  value={[panelPlacement.moduleRotation]}
                  onValueChange={(value) =>
                    updatePanelPlacement({ moduleRotation: value[0] })
                  }
                  min={-45}
                  max={45}
                  step={1}
                  className='w-full'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
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
            disabled={isLoading}
            className='gap-2 bg-solar hover:bg-solar/90 text-solar-foreground w-full'
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

      {/* Right side - Map */}
      <div className='relative'>
        <div ref={mapRef} className='w-full h-full rounded-lg' />
      </div>
    </div>
  )
}
