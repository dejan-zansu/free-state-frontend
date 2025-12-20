'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Search } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCalculatorStore } from '@/stores/new-calculator.store'

export default function Step1Address() {
  const { setLocation, latitude, address } = useCalculatorStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current) return

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      // Load Google Maps Places library
      const loader = new Loader({
        apiKey,
        version: 'weekly',
      })

      await loader.importLibrary('places')

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        fields: ['formatted_address', 'geometry', 'name'],
        componentRestrictions: { country: ['ch', 'de', 'at', 'fr', 'it', 'li'] },
      })

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace()

        if (!place?.geometry?.location) {
          console.error('No geometry found for selected place')
          return
        }

        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        const selectedAddress = place.formatted_address || place.name || ''

        setLocation(selectedAddress, lat, lng)
      })
    } catch (error) {
      console.error('Error initializing autocomplete:', error)
    }
  }, [setLocation])

  useEffect(() => {
    initializeAutocomplete()

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [initializeAutocomplete])

  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl'>
            <MapPin className='w-6 h-6 text-solar' />
            Enter Your Address
          </CardTitle>
          <CardDescription>
            Enter your building address to analyze its solar potential
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
            <Input
              ref={inputRef}
              type='text'
              placeholder='Search for an address...'
              className='pl-10 h-12 text-lg'
              defaultValue={address}
            />
          </div>

          {latitude && address && (
            <div className='p-4 rounded-lg bg-solar/10 border border-solar/20'>
              <div className='flex items-start gap-3'>
                <MapPin className='w-5 h-5 text-solar mt-0.5 flex-shrink-0' />
                <div>
                  <p className='font-medium text-sm text-muted-foreground'>Selected Address</p>
                  <p className='text-base'>{address}</p>
                </div>
              </div>
            </div>
          )}

          <div className='text-sm text-muted-foreground'>
            <p>💡 Start typing your address and select from the suggestions</p>
            <p className='mt-1'>
              Supported regions: Switzerland, Germany, Austria, France, Italy, Liechtenstein
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
