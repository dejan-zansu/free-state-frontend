'use client'

import { AlertTriangle, CheckCircle2, Loader2, Mountain } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ShadingProfileChart } from '@/components/ShadingProfileChart'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  const { latitude, longitude, roofPolygon, setHorizonData, horizonData } = usePVGISCalculatorStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [elevation, setElevation] = useState<number | null>(null)

  // Calculate actual roof centroid for horizon analysis
  const { actualLat, actualLon } = (() => {
    if (roofPolygon && roofPolygon.coordinates.length >= 3) {
      const centroidLat =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lat, 0) / roofPolygon.coordinates.length
      const centroidLng =
        roofPolygon.coordinates.reduce((sum, p) => sum + p.lng, 0) / roofPolygon.coordinates.length
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
      const response = await fetch(`${apiUrl}/api/pvgis/horizon?lat=${actualLat}&lon=${actualLon}`)

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
      setError(err instanceof Error ? err.message : 'Failed to fetch horizon data')
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
            We analyze obstacles around your location (buildings, mountains, trees) using PVGIS satellite
            data to accurately calculate shading effects on solar production.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Location Info */}
          <div className='bg-muted/30 p-4 rounded-lg space-y-2'>
            <div className='text-sm font-medium'>Analysis Location:</div>
            <div className='grid grid-cols-2 gap-2 text-sm text-muted-foreground'>
              <div>
                <span className='font-medium'>Latitude:</span> {actualLat?.toFixed(6)}
              </div>
              <div>
                <span className='font-medium'>Longitude:</span> {actualLon?.toFixed(6)}
              </div>
              {elevation !== null && (
                <div className='col-span-2'>
                  <span className='font-medium'>Elevation:</span> {elevation.toFixed(0)}m above sea level
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

          {/* Success State - Show Chart */}
          {horizonData && !loading && (
            <div className='space-y-4'>
              <Alert className='border-green-200 bg-green-50'>
                <CheckCircle2 className='h-4 w-4 text-green-600' />
                <AlertTitle className='text-green-900'>Shading Analysis Complete</AlertTitle>
                <AlertDescription className='text-green-800'>
                  PVGIS has analyzed {horizonData.length} directions around your location. The results
                  will be automatically used in the final production calculations.
                </AlertDescription>
              </Alert>

              <ShadingProfileChart horizonData={horizonData} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card className='bg-blue-50 border-blue-200'>
          <CardContent className='pt-6 space-y-2'>
            <div className='flex items-start gap-3'>
              <div className='text-2xl'>🛰️</div>
              <div>
                <h4 className='font-semibold text-blue-900 mb-1'>Satellite-Based Analysis</h4>
                <p className='text-sm text-blue-800'>
                  PVGIS uses Digital Elevation Models (DEM) from satellite data to detect obstacles like
                  buildings, mountains, and hills around your location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-green-50 border-green-200'>
          <CardContent className='pt-6 space-y-2'>
            <div className='flex items-start gap-3'>
              <div className='text-2xl'>📊</div>
              <div>
                <h4 className='font-semibold text-green-900 mb-1'>Automatic Accuracy Boost</h4>
                <p className='text-sm text-green-800'>
                  By including horizon data in calculations, PVGIS provides 7-10% more accurate production
                  estimates compared to basic calculations without shading analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Important Note About Shading Detection</AlertTitle>
        <AlertDescription className='text-sm space-y-2'>
          <p>
            This analysis detects <strong>permanent obstacles</strong> visible from satellite data:
            buildings, mountains, and hills.
          </p>
          <p className='text-muted-foreground'>
            ⚠️ It may NOT detect: trees, chimneys, roof vents, nearby poles, or other small obstacles. For
            a binding quote, we recommend a professional on-site shading assessment.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
