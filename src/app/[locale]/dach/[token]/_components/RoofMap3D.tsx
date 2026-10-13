'use client'

import { Loader } from '@googlemaps/js-api-loader'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { RoofPagePanels } from './roof-panels'

const ROOF_ABOVE_GROUND_M = 9
const MODULE_LIFT_M = 0.35
const METRES_PER_DEGREE_LAT = 111320
const MIN_RANGE_M = 60
const MAX_RANGE_M = 160
const BOUNDS_RADIUS_M = 220
const INITIAL_TILT = 55
const MIN_TILT = 25
const MAX_TILT = 75
const MIN_ABOVE_GROUND_M = 40
const MAX_ABOVE_GROUND_M = 320

type Status = 'loading' | 'ready' | 'error'

function roofExtentMetres(
  modules: RoofPagePanels['modules'],
  latitude: number
): number {
  const points = modules.flat()
  const lngs = points.map(([lng]) => lng)
  const lats = points.map(([, lat]) => lat)
  const widthM =
    (Math.max(...lngs) - Math.min(...lngs)) *
    METRES_PER_DEGREE_LAT *
    Math.cos((latitude * Math.PI) / 180)
  const depthM = (Math.max(...lats) - Math.min(...lats)) * METRES_PER_DEGREE_LAT
  return Math.max(widthM, depthM)
}

export default function RoofMap3D({
  panels,
  ariaLabel,
  onFail,
}: {
  panels: RoofPagePanels
  ariaLabel: string
  onFail: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onFailRef = useRef(onFail)
  onFailRef.current = onFail
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    const host = hostRef.current
    if (!host || panels.groundAltitudeM === null) return
    const groundAltitudeM = panels.groundAltitudeM
    let cancelled = false
    let element: HTMLElement | null = null

    const run = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) throw new Error('Google Maps key is not set')
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places'],
        })
        const { Map3DElement, Polygon3DElement } =
          await loader.importLibrary('maps3d')
        if (cancelled) return

        const { lat, lng } = panels.center
        const latSpan = BOUNDS_RADIUS_M / METRES_PER_DEGREE_LAT
        const lngSpan =
          BOUNDS_RADIUS_M /
          (METRES_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180))
        const range = Math.min(
          MAX_RANGE_M,
          Math.max(MIN_RANGE_M, roofExtentMetres(panels.modules, lat) * 1.8)
        )
        const options = {
          center: { lat, lng, altitude: groundAltitudeM + ROOF_ABOVE_GROUND_M },
          range,
          tilt: INITIAL_TILT,
          heading: 0,
          minTilt: MIN_TILT,
          maxTilt: MAX_TILT,
          minAltitude: groundAltitudeM + MIN_ABOVE_GROUND_M,
          maxAltitude: groundAltitudeM + MAX_ABOVE_GROUND_M,
          bounds: {
            north: lat + latSpan,
            south: lat - latSpan,
            east: lng + lngSpan,
            west: lng - lngSpan,
          },
          mode: 'SATELLITE',
          gestureHandling: 'COOPERATIVE',
        }
        const map = new Map3DElement(options)

        panels.modules.forEach(corners => {
          const polygon = new Polygon3DElement()
          Object.assign(polygon, {
            altitudeMode: 'RELATIVE_TO_MESH',
            fillColor: '#16315CE6',
            strokeColor: '#E8EEF7CC',
            strokeWidth: 1,
            drawsOccludedSegments: false,
            path: corners.map(([cornerLng, cornerLat]) => ({
              lat: cornerLat,
              lng: cornerLng,
              altitude: MODULE_LIFT_M,
            })),
          })
          map.append(polygon)
        })

        map.addEventListener('gmp-error', () => {
          if (!cancelled) onFailRef.current()
        })
        map.style.display = 'block'
        map.style.width = '100%'
        map.style.height = '100%'
        host.append(map)
        element = map
        setStatus('ready')
      } catch {
        if (cancelled) return
        setStatus('error')
        onFailRef.current()
      }
    }

    void run()

    return () => {
      cancelled = true
      element?.remove()
    }
  }, [panels])

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="absolute inset-0 bg-[#241C27]"
    >
      <div ref={hostRef} className="absolute inset-0" />
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#EAEDDF]/70" />
        </div>
      )}
    </div>
  )
}
