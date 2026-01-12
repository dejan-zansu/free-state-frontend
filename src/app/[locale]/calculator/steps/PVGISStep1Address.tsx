'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Search } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep1Address() {
  const { setLocation, address, latitude, nextStep } = usePVGISCalculatorStore()
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const initializeAutocomplete = useCallback(async () => {
    if (!inputWrapperRef.current) return

    const inputElement = inputWrapperRef.current.querySelector(
      'input[data-slot="input"]'
    ) as HTMLInputElement
    if (!inputElement) {
      console.error('Input element not found')
      return
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        return
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
      })

      await loader.importLibrary('places')

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputElement,
        {
          fields: ['formatted_address', 'geometry', 'name'],
        }
      )

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
            <MapPin className='w-6 h-6 text-primary' />
            Enter Your Address
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <div className='relative flex-1' ref={inputWrapperRef}>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
              <Input
                type='text'
                placeholder='Search for an address...'
                className='pl-10 h-12 text-lg'
                defaultValue={address}
              />
            </div>
            <Button
              onClick={nextStep}
              disabled={!latitude || !address}
              className='h-12 px-8'
            >
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
