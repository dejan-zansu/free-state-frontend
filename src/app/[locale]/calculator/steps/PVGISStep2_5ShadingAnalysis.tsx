'use client'

import { AlertTriangle, Loader2, Mountain } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

interface HorizonDataPoint {
  A: number // Azimuth angle (degrees, 0=North)
  H_hor: number // Horizon height (degrees above horizontal)
}

interface HorizonResponse {
  inputs: {
    location: {
      latitude: number
      longitude: number
      elevation: number
    }
  }
  outputs: {
    horizon_profile: HorizonDataPoint[]
  }
}

export default function PVGISStep2_5ShadingAnalysis() {
  const { latitude, longitude, roofPolygon, setHorizonData, horizonData } =
    usePVGISCalculatorStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elevation, setElevation] = useState<number | null>(null)

  // Calculate actual roof centroid for horizon analysis
  const { actualLat, actualLon } = (() => {
    if (roofPolygon && roofPolygon.coordinates.length >= 3) {
      const centroidLat =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) /
        roofPolygon.coordinates.length
      const centroidLng =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) /
        roofPolygon.coordinates.length
      return { actualLat: centroidLat, actualLon: centroidLng }
    }
    return { actualLat: latitude, actualLon: longitude }
  })()

  // Fetch horizon data on mount
  useEffect(() => {
    if (horizonData) {
      // Already have data, don't refetch
      return
    }

    if (!actualLat || !actualLon) {
      setError('Location coordinates not available')
      return
    }

    fetchHorizonData()
  }, []) // Run only once on mount

  const fetchHorizonData = async () => {
    setLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(
        `${apiUrl}/api/pvgis/horizon?lat=${actualLat}&lon=${actualLon}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch horizon data')
      }

      const data: HorizonResponse = await response.json()

      // Store in state
      setHorizonData(data.outputs.horizon_profile)
      setElevation(data.inputs.location.elevation)
    } catch (err) {
      console.error('Error fetching horizon data:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch horizon data'
      )
    } finally {
      setLoading(false)
    }
  }

  // Retry handler
  const handleRetry = () => {
    fetchHorizonData()
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mountain className='w-6 h-6 text-solar' />
            Automatic Shading Analysis
          </CardTitle>
          <CardDescription>
            We analyze obstacles around your location (buildings, mountains,
            trees) using PVGIS satellite data to accurately calculate shading
            effects on solar production.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Location Info */}
          <div className='bg-muted/30 p-4 rounded-lg space-y-2'>
            <div className='text-sm font-medium'>Analysis Location:</div>
            <div className='grid grid-cols-2 gap-2 text-sm text-muted-foreground'>
              <div>
                <span className='font-medium'>Latitude:</span>{' '}
                {actualLat?.toFixed(6)}
              </div>
              <div>
                <span className='font-medium'>Longitude:</span>{' '}
                {actualLon?.toFixed(6)}
              </div>
              {elevation !== null && (
                <div className='col-span-2'>
                  <span className='font-medium'>Elevation:</span>{' '}
                  {elevation.toFixed(0)}m above sea level
                </div>
              )}
            </div>
            {roofPolygon && (
              <div className='text-xs text-blue-600 mt-2'>
                ℹ️ Using roof polygon centroid for accurate shading analysis
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
              <Loader2 className='w-12 h-12 text-solar animate-spin' />
              <div className='text-center space-y-2'>
                <p className='font-medium'>Analyzing shading conditions...</p>
                <p className='text-sm text-muted-foreground'>
                  Fetching horizon profile from PVGIS satellite data
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertTitle>Error Loading Shading Data</AlertTitle>
              <AlertDescription className='space-y-3'>
                <p>{error}</p>
                <Button onClick={handleRetry} variant='outline' size='sm'>
                  Retry Analysis
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
