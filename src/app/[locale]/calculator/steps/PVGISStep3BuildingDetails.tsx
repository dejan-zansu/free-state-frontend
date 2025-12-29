'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Building2, ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import {
  BuildingDetails,
  usePVGISCalculatorStore,
} from '@/stores/pvgis-calculator.store'

export default function PVGISStep3BuildingDetails() {
  const {
    buildingDetails,
    setBuildingDetails,
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

  const roofTypes: Array<{
    value: BuildingDetails['roofType']
    label: string
    description: string
  }> = [
    { value: 'flat', label: 'Flat Roof', description: '0-10° pitch' },
    { value: 'gable', label: 'Gable Roof', description: 'Two sloped sides' },
    { value: 'hip', label: 'Hip Roof', description: 'Four sloped sides' },
    { value: 'shed', label: 'Shed Roof', description: 'Single sloped side' },
  ]

  const handleSubmit = () => {
    if (!buildingDetails) {
      // Set defaults
      setBuildingDetails({
        roofType: 'gable',
        buildingHeight: 10,
        floors: 2,
        roofPitch: 30,
      })
    }
  }

  const updateDetail = (updates: Partial<BuildingDetails>) => {
    setBuildingDetails({
      roofType: buildingDetails?.roofType || 'gable',
      buildingHeight: buildingDetails?.buildingHeight || 10,
      floors: buildingDetails?.floors,
      roofPitch: buildingDetails?.roofPitch,
      ...updates,
    })
  }

  return (
    <div className='grid grid-cols-[400px_1fr] gap-6 h-full'>
      {/* Left sidebar - Building Details Form */}
      <div className='overflow-y-auto'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Home className='w-5 h-5 text-solar' />
              Building Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>Roof Type</Label>
              <RadioGroup
                value={buildingDetails?.roofType || 'gable'}
                onValueChange={(value) =>
                  updateDetail({
                    roofType: value as BuildingDetails['roofType'],
                  })
                }
              >
                <div className='grid grid-cols-2 gap-3'>
                  {roofTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        buildingDetails?.roofType === type.value
                          ? 'border-solar bg-solar/5'
                          : 'border-border hover:border-solar/50'
                      }`}
                    >
                      <RadioGroupItem value={type.value} />
                      <div className='flex-1'>
                        <div className='font-medium'>{type.label}</div>
                        <div className='text-sm text-muted-foreground'>
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className='space-y-3'>
              <Label className='text-base font-semibold flex items-center gap-2'>
                <Building2 className='w-4 h-4' />
                Building Height
              </Label>
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <Input
                    type='number'
                    value={buildingDetails?.buildingHeight || 10}
                    onChange={(e) =>
                      updateDetail({
                        buildingHeight: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={3}
                    max={50}
                    step={0.5}
                    className='w-32'
                  />
                  <span className='text-sm text-muted-foreground'>meters</span>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Or select number of floors:</span>
                    <span className='font-semibold'>
                      {buildingDetails?.floors || 2} floors
                    </span>
                  </div>
                  <Slider
                    value={[buildingDetails?.floors || 2]}
                    onValueChange={(value) => {
                      const floors = value[0]
                      updateDetail({
                        floors,
                        buildingHeight: floors * 3, // Approx 3m per floor
                      })
                    }}
                    min={1}
                    max={10}
                    step={1}
                    className='w-full'
                  />
                </div>
              </div>
            </div>

            {buildingDetails?.roofType !== 'flat' && (
              <div className='space-y-3'>
                <Label className='text-base font-semibold'>
                  Roof Pitch (Tilt Angle)
                </Label>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Angle from horizontal
                    </span>
                    <span className='font-semibold'>
                      {buildingDetails?.roofPitch || 30}°
                    </span>
                  </div>
                  <Slider
                    value={[buildingDetails?.roofPitch || 30]}
                    onValueChange={(value) =>
                      updateDetail({ roofPitch: value[0] })
                    }
                    min={0}
                    max={60}
                    step={5}
                    className='w-full'
                  />
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Flat (0°)</span>
                    <span>Steep (60°)</span>
                  </div>
                </div>
              </div>
            )}

            {!buildingDetails && (
              <Button onClick={handleSubmit} className='w-full bg-solar'>
                Continue with Default Values
              </Button>
            )}
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
            disabled={!buildingDetails || isLoading}
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
