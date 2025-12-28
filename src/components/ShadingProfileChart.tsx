'use client'

import { useMemo } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HorizonDataPoint {
  A: number // Azimuth angle (degrees, 0=North)
  H_hor: number // Horizon height (degrees above horizontal)
}

interface ShadingProfileChartProps {
  horizonData: HorizonDataPoint[]
  className?: string
}

export function ShadingProfileChart({ horizonData, className }: ShadingProfileChartProps) {
  // Calculate SVG path for horizon profile
  const horizonPath = useMemo(() => {
    if (!horizonData || horizonData.length === 0) return ''

    const width = 600
    const height = 200
    const padding = 40

    // Scale: Azimuth 0-360 maps to x: 0-width, Horizon 0-90 maps to y: height-0
    const maxHorizon = Math.max(...horizonData.map((d) => d.H_hor))
    const scaleX = (azimuth: number) => padding + (azimuth / 360) * (width - 2 * padding)
    const scaleY = (horizon: number) => height - padding - (horizon / Math.max(maxHorizon, 30)) * (height - 2 * padding)

    // Start path
    let path = `M ${scaleX(0)} ${height - padding}`

    // Draw horizon profile
    horizonData.forEach((point) => {
      path += ` L ${scaleX(point.A)} ${scaleY(point.H_hor)}`
    })

    // Close path at the bottom
    path += ` L ${scaleX(360)} ${height - padding}`
    path += ' Z'

    return path
  }, [horizonData])

  // Calculate shading statistics
  const stats = useMemo(() => {
    if (!horizonData || horizonData.length === 0) {
      return {
        avgHorizonHeight: 0,
        maxHorizonHeight: 0,
        shadingRisk: 'unknown',
      }
    }

    const avgHorizonHeight = horizonData.reduce((sum, d) => sum + d.H_hor, 0) / horizonData.length
    const maxHorizonHeight = Math.max(...horizonData.map((d) => d.H_hor))

    let shadingRisk: 'low' | 'medium' | 'high' | 'unknown' = 'low'
    if (maxHorizonHeight > 20) {
      shadingRisk = 'high'
    } else if (maxHorizonHeight > 10) {
      shadingRisk = 'medium'
    }

    return {
      avgHorizonHeight: avgHorizonHeight.toFixed(1),
      maxHorizonHeight: maxHorizonHeight.toFixed(1),
      shadingRisk,
    }
  }, [horizonData])

  const riskColor =
    stats.shadingRisk === 'low'
      ? 'text-green-600'
      : stats.shadingRisk === 'medium'
        ? 'text-yellow-600'
        : 'text-red-600'

  const riskLabel =
    stats.shadingRisk === 'low'
      ? 'Low shading risk'
      : stats.shadingRisk === 'medium'
        ? 'Medium shading risk'
        : 'High shading risk'

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <span>🏔️</span>
          Horizon Shading Profile
        </CardTitle>
        <CardDescription>
          This chart shows obstacles (buildings, mountains, trees) around your location that may cast
          shadows on your solar panels throughout the day.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* SVG Chart */}
        <div className='w-full overflow-x-auto'>
          <svg width='600' height='200' className='mx-auto'>
            {/* Background */}
            <rect x='0' y='0' width='600' height='200' fill='#f8fafc' />

            {/* Grid lines */}
            <g stroke='#e2e8f0' strokeWidth='1'>
              {/* Horizontal grid lines */}
              {[0, 10, 20, 30].map((deg) => {
                const y = 200 - 40 - (deg / 30) * (200 - 80)
                return (
                  <g key={`h-${deg}`}>
                    <line x1='40' y1={y} x2='560' y2={y} />
                    <text x='10' y={y + 4} fontSize='10' fill='#64748b'>
                      {deg}°
                    </text>
                  </g>
                )
              })}
              {/* Vertical grid lines */}
              {['N', 'E', 'S', 'W', 'N'].map((dir, i) => {
                const x = 40 + (i * (600 - 80)) / 4
                return (
                  <g key={`v-${dir}-${i}`}>
                    <line x1={x} y1='40' x2={x} y2='160' />
                    <text x={x - 5} y='180' fontSize='12' fill='#64748b' fontWeight='bold'>
                      {dir}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Horizon profile */}
            <path d={horizonPath} fill='rgba(59, 130, 246, 0.3)' stroke='#3b82f6' strokeWidth='2' />

            {/* Axes */}
            <line x1='40' y1='160' x2='560' y2='160' stroke='#1e293b' strokeWidth='2' />
            <line x1='40' y1='40' x2='40' y2='160' stroke='#1e293b' strokeWidth='2' />

            {/* Labels */}
            <text x='300' y='198' fontSize='12' fontWeight='bold' textAnchor='middle' fill='#1e293b'>
              Direction (Azimuth)
            </text>
            <text
              x='10'
              y='100'
              fontSize='12'
              fontWeight='bold'
              textAnchor='middle'
              fill='#1e293b'
              transform='rotate(-90 10 100)'
            >
              Obstacle Height (°)
            </text>
          </svg>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-3 gap-4 pt-4 border-t'>
          <div className='text-center'>
            <div className='text-xs text-muted-foreground'>Average Height</div>
            <div className='text-lg font-semibold'>{stats.avgHorizonHeight}°</div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-muted-foreground'>Max Obstacle</div>
            <div className='text-lg font-semibold'>{stats.maxHorizonHeight}°</div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-muted-foreground'>Shading Risk</div>
            <div className={`text-sm font-semibold ${riskColor}`}>{riskLabel}</div>
          </div>
        </div>

        {/* Interpretation guide */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm'>
          <p className='font-medium text-blue-900 mb-1'>How to read this chart:</p>
          <ul className='text-blue-800 space-y-0.5 text-xs'>
            <li>• The blue area shows obstacles visible from your roof</li>
            <li>• Higher peaks indicate taller obstacles (buildings, mountains, trees)</li>
            <li>• South-facing obstacles have the most impact on solar production</li>
            <li>• PVGIS uses this data to calculate accurate shading losses</li>
          </ul>
        </div>

        {/* Recommendations */}
        {stats.shadingRisk === 'high' && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-3 text-sm'>
            <p className='font-medium text-red-900 mb-1'>⚠️ High shading detected</p>
            <p className='text-red-800 text-xs'>
              Tall obstacles may significantly reduce solar production. Consider professional shading
              analysis and potential solutions like microinverters or power optimizers.
            </p>
          </div>
        )}

        {stats.shadingRisk === 'medium' && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm'>
            <p className='font-medium text-yellow-900 mb-1'>⚠️ Moderate shading detected</p>
            <p className='text-yellow-800 text-xs'>
              Some obstacles are present. The PVGIS calculation includes these shading effects in the
              production estimates.
            </p>
          </div>
        )}

        {stats.shadingRisk === 'low' && (
          <div className='bg-green-50 border border-green-200 rounded-lg p-3 text-sm'>
            <p className='font-medium text-green-900 mb-1'>✅ Excellent conditions</p>
            <p className='text-green-800 text-xs'>
              Very low shading detected. Your location has good solar exposure with minimal obstacles.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
