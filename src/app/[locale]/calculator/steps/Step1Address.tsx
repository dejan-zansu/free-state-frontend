'use client'

import { Loader } from '@googlemaps/js-api-loader'
import {
  Building2,
  Factory,
  Home,
  Loader2,
  MapPin,
  Search,
  Warehouse,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCalculatorStore } from '@/stores/calculator.store'

// Property type options
const propertyTypes = [
  {
    id: 'residential',
    label: 'Residential',
    icon: Home,
    description: 'Single family home',
  },
  {
    id: 'apartment',
    label: 'Apartment',
    icon: Building2,
    description: 'Multi-unit building',
  },
  {
    id: 'commercial',
    label: 'Commercial',
    icon: Factory,
    description: 'Business/Office',
  },
  {
    id: 'agricultural',
    label: 'Agricultural',
    icon: Warehouse,
    description: 'Farm/Agricultural',
  },
]

export default function Step1Address() {
  const { address, latitude, longitude, setLocation } = useCalculatorStore()

  const [inputValue, setInputValue] = useState(address)
  const [isLoadingMaps, setIsLoadingMaps] = useState(true)
  const [selectedPropertyType, setSelectedPropertyType] =
    useState('residential')
  const [mapError, setMapError] = useState<string | null>(null)

  // Initialize loading ref
  useEffect(() => {
    isLoadingRef.current = isLoadingMaps
  }, [isLoadingMaps])

  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  )
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const isLoadingRef = useRef(false)

  const initializeMap = useCallback(() => {
    if (!window.google) {
      console.error('Google Maps API not loaded')
      return false
    }

    if (!mapRef.current) {
      console.warn('Map container not available yet, will retry...')
      // Retry after a short delay
      setTimeout(() => initializeMap(), 200)
      return false
    }

    // Ensure map container has dimensions
    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      console.warn('Map container has no dimensions, retrying...')
      setTimeout(() => initializeMap(), 200)
      return false
    }

    try {
      const defaultCenter = {
        lat: latitude || 47.3769,
        lng: longitude || 8.5417,
      }
      const defaultZoom = latitude ? 19 : 8

      const mapOptions: google.maps.MapOptions = {
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: false,
        streetViewControl: false,
        tilt: 0,
      }

      // Only add mapId if AdvancedMarkerElement is available
      // Otherwise use regular markers
      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        mapOptions.mapId = 'solar-calculator-map'
      }

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions)

      if (latitude && longitude) {
        // Use AdvancedMarkerElement if available, otherwise fall back to regular Marker
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
          markerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: { lat: latitude, lng: longitude },
            title: address,
          })
        } else {
          // Fallback to regular Marker
          new google.maps.Marker({
            map: mapInstanceRef.current,
            position: { lat: latitude, lng: longitude },
            title: address,
          })
        }
      }

      setIsLoadingMaps(false)
      isLoadingRef.current = false
      setMapError(null)
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError(
        `Failed to load map: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
      setIsLoadingMaps(false)
      isLoadingRef.current = false
    }
  }, [latitude, longitude, address])

  const initializeAutocomplete = useCallback(() => {
    if (!window.google || !inputRef.current) return

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: {
            country: ['ch', 'de', 'at', 'fr', 'it', 'li'],
          },
          fields: [
            'formatted_address',
            'geometry',
            'name',
            'address_components',
          ],
        }
      )

      if (!autocompleteRef.current) return

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()

        if (!place?.geometry?.location) {
          return
        }

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const formattedAddress = place.formatted_address || place.name || ''

        // Extract postal code and administrative area
        let postalCode = ''
        let adminArea = ''
        place.address_components?.forEach((component) => {
          if (component.types.includes('postal_code')) {
            postalCode = component.long_name
          }
          if (component.types.includes('administrative_area_level_1')) {
            adminArea = component.short_name
          }
        })

        // Update store
        setLocation(formattedAddress, lat, lng, postalCode, adminArea)
        setInputValue(formattedAddress)

        // Update map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng })
          mapInstanceRef.current.setZoom(19)

          // Update or create marker
          if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            if (markerRef.current) {
              markerRef.current.position = { lat, lng }
            } else {
              markerRef.current = new google.maps.marker.AdvancedMarkerElement({
                map: mapInstanceRef.current,
                position: { lat, lng },
                title: formattedAddress,
              })
            }
          } else {
            // Fallback to regular Marker
            new google.maps.Marker({
              map: mapInstanceRef.current,
              position: { lat, lng },
              title: formattedAddress,
            })
          }
        }
      })
    } catch (error) {
      console.error('Error initializing autocomplete:', error)
    }
  }, [setLocation])

  // Load Google Maps API using official loader
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const loadGoogleMaps = async () => {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (isMounted && isLoadingRef.current) {
          console.error('Google Maps loading timeout')
          setMapError(
            'Map loading timed out. Please refresh the page or check your network connection.'
          )
          setIsLoadingMaps(false)
          isLoadingRef.current = false
        }
      }, 30000) // 30 second timeout

      // Check if already loaded
      if (window.google?.maps) {
        console.log('Google Maps already loaded')
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          // Wait for DOM to be ready and container to be available
          const tryInitialize = (attempts = 0) => {
            if (!isMounted) return

            if (mapRef.current && mapRef.current.offsetWidth > 0) {
              initializeMap()
              initializeAutocomplete()
            } else if (attempts < 10) {
              // Retry up to 10 times (2 seconds total)
              setTimeout(() => tryInitialize(attempts + 1), 200)
            } else {
              console.error('Map container never became available')
              setMapError(
                'Map container not available. Please refresh the page.'
              )
              setIsLoadingMaps(false)
              isLoadingRef.current = false
            }
          }

          // Start trying after a short delay
          setTimeout(() => tryInitialize(), 100)
        }
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          setMapError(
            'Google Maps API key not configured. Please check your environment variables.'
          )
          setIsLoadingMaps(false)
          isLoadingRef.current = false
        }
        return
      }

      try {
        console.log('Loading Google Maps API...')
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'marker', 'geometry'],
        })

        await loader.load()
        console.log('Google Maps API loaded successfully')

        if (timeoutId) clearTimeout(timeoutId)

        if (isMounted && window.google?.maps) {
          // Wait for DOM to be ready and container to be available
          const tryInitialize = (attempts = 0) => {
            if (!isMounted) return

            if (mapRef.current && mapRef.current.offsetWidth > 0) {
              initializeMap()
              initializeAutocomplete()
            } else if (attempts < 10) {
              // Retry up to 10 times (2 seconds total)
              setTimeout(() => tryInitialize(attempts + 1), 200)
            } else {
              console.error('Map container never became available')
              setMapError(
                'Map container not available. Please refresh the page.'
              )
              setIsLoadingMaps(false)
              isLoadingRef.current = false
            }
          }

          // Start trying after a short delay
          setTimeout(() => tryInitialize(), 100)
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
          setMapError(
            `Failed to load Google Maps: ${errorMessage}. Please check your API key and network connection.`
          )
          setIsLoadingMaps(false)
          isLoadingRef.current = false
        }
      }
    }

    loadGoogleMaps()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [initializeMap, initializeAutocomplete])

  // Handle manual coordinate entry (for testing)
  const handleManualEntry = () => {
    // Default to Zurich for testing
    const lat = 47.3769
    const lng = 8.5417
    setLocation('Zurich, Switzerland', lat, lng, '8001', 'ZH')
    setInputValue('Zurich, Switzerland')

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng })
      mapInstanceRef.current.setZoom(19)
    }
  }

  return (
    <div className='grid lg:grid-cols-2 gap-6'>
      {/* Left: Form */}
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-solar' />
              Enter Your Address
            </CardTitle>
            <CardDescription>
              Search for your property address to analyze its solar potential
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='address'>Property Address</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  ref={inputRef}
                  id='address'
                  type='text'
                  placeholder='Enter your address...'
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className='pl-10 h-12'
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Start typing and select from the suggestions
              </p>
            </div>

            {/* Location confirmation */}
            {latitude && longitude && (
              <div className='p-3 rounded-lg bg-energy/10 border border-energy/20'>
                <p className='text-sm font-medium text-energy'>
                  Location confirmed
                </p>
                <p className='text-xs text-muted-foreground mt-1'>{address}</p>
              </div>
            )}

            {/* Demo button for testing */}
            {!latitude && (
              <Button
                variant='outline'
                onClick={handleManualEntry}
                className='w-full'
              >
                Use Demo Location (Zurich)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Property Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Property Type</CardTitle>
            <CardDescription>Select the type of building</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-3'>
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedPropertyType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedPropertyType === type.id
                      ? 'border-solar bg-solar/5'
                      : 'border-border hover:border-solar/50'
                  }`}
                >
                  <type.icon
                    className={`w-6 h-6 mb-2 ${
                      selectedPropertyType === type.id
                        ? 'text-solar'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <p className='font-medium'>{type.label}</p>
                  <p className='text-xs text-muted-foreground'>
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Map */}
      <Card className='h-[500px] lg:h-auto overflow-hidden'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-lg'>Location Preview</CardTitle>
        </CardHeader>
        <CardContent className='p-0 h-[calc(100%-60px)] relative'>
          {/* Map container - always rendered so ref is available */}
          <div ref={mapRef} className='w-full h-full' />

          {/* Loading overlay */}
          {isLoadingMaps && (
            <div className='absolute inset-0 flex items-center justify-center bg-muted/50 z-10'>
              <div className='text-center'>
                <Loader2 className='w-8 h-8 animate-spin text-solar mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>Loading map...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {mapError && !isLoadingMaps && (
            <div className='absolute inset-0 flex items-center justify-center bg-muted/50 z-10'>
              <div className='text-center p-8'>
                <MapPin className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground'>{mapError}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
