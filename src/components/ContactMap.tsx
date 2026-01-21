'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { useEffect, useRef } from 'react'

const ContactMap = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || initializedRef.current) return

    const initializeMap = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.error('Google Maps API key not found')
          return
        }

        const loader = new Loader({ apiKey, version: 'weekly' })
        await loader.importLibrary('maps')

        const location = { lat: 47.72236775065768, lng: 8.655320035601854 }

        if (mapRef.current) {
          // Custom map styles to match the green/teal color scheme - minimal display
          const mapStyles: google.maps.MapTypeStyle[] = [
            // Base styling - land/background in light mint-teal
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#E0F4EA' }],
            },
            {
              featureType: 'landscape.natural',
              elementType: 'geometry',
              stylers: [{ color: '#D3EDDF' }],
            },
            // Water features in darker teal
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#A7E2C6' }],
            },
            {
              featureType: 'water',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            // Major highways in prominent teal - show labels
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#8ED5B5' }, { weight: 2 }],
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8ED5B5' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#ffffff' }],
            },
            // Minor roads in light grey - show labels in green
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }, { lightness: 100 }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8ED5B5' }],
            },
            {
              featureType: 'road.local',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }, { lightness: 100 }],
            },
            {
              featureType: 'road.local',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8ED5B5' }],
            },
            // Borders in muted green/teal
            {
              featureType: 'administrative.locality',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#8ED5B5' }, { weight: 1 }, { opacity: 0.5 }],
            },
            {
              featureType: 'administrative.country',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#8ED5B5' }, { weight: 2 }, { opacity: 0.7 }],
            },
            // Show city/town names for location reference
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#333333' }],
            },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#ffffff' }, { weight: 0.5 }],
            },
            // Hide neighborhood and land parcel labels
            {
              featureType: 'administrative.land_parcel',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'administrative.neighborhood',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            // Country labels
            {
              featureType: 'administrative.country',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#000000' }],
            },
            // Hide all POI features
            {
              featureType: 'poi',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.business',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.attraction',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            // Hide transit features
            {
              featureType: 'transit',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit.line',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit.station',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
          ]

          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: location,
            zoom: 15,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
            styles: mapStyles,
          })

          // Create custom pin icon with the specified color
          // SVG path for a classic map pin (teardrop shape)
          // This creates a pin with a circular head and pointed tip
          // The path starts at the tip (0,0) and creates a teardrop shape
          const pinPath =
            'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'

          const markerIcon = {
            path: pinPath,
            fillColor: '#062E25',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.5,
            anchor: new google.maps.Point(12, 24), // Anchor at the tip of the pin
          }

          markerRef.current = new google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            icon: markerIcon,
            title: 'Location',
          })

          initializedRef.current = true
        }
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initializeMap()

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
    }
  }, [])

  return (
    <div className='w-full h-[713px]'>
      <div ref={mapRef} className='w-full h-full' />
    </div>
  )
}

export default ContactMap
