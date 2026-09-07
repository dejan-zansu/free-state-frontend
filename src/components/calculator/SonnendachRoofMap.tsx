'use client'

import { Loader2 } from 'lucide-react'
import { Feature, Map, View } from 'ol'
import { defaults as defaultControls } from 'ol/control'
import { Polygon } from 'ol/geom'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat, toLonLat } from 'ol/proj'
import { getRenderPixel } from 'ol/render'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Stroke, Style } from 'ol/style'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import type { RoofSegment, SonnendachBuilding } from '@/types/sonnendach'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

import 'ol/ol.css'

const SWISS_SATELLITE_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
const SONNENDACH_URL =
  'https://wmts.geo.admin.ch/1.0.0/ch.bfe.solarenergie-eignung-daecher/default/current/3857/{z}/{x}/{y}.png'
const SONNENDACH_MAX_ZOOM = 19
const ROOF_CAPTURE_DEADLINE_MS = 6000
const TAP_HIT_TOLERANCE = 8
const BUILDING_ZOOM = 20
const ADDRESS_ZOOM = 19
const SWITZERLAND_CENTER: [number, number] = [8.2275, 46.8182]
const MAP_BACKGROUND = '#0B1B17'

const SELECTED_COLOR = '#1B332D'
const SELECTED_STROKE = '#b7fe1a'

const selectedStyle = new Style({
  fill: new Fill({ color: `${SELECTED_COLOR}CC` }),
  stroke: new Stroke({ color: SELECTED_STROKE, width: 3 }),
})

export interface SonnendachRoofMapCapture {
  capture: () => Promise<string | null>
}

export interface SonnendachRoofMapProps {
  building: SonnendachBuilding | null
  selectedSegmentIds: string[]
  center: { lat: number; lng: number } | null
  onToggleSegment: (id: string) => void
  onTapBuildingAt: (lat: number, lng: number) => Promise<void>
  onTapMiss: () => void
  captureRef?: React.MutableRefObject<SonnendachRoofMapCapture | null>
  className?: string
  ariaLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
}

const lv95ToWgs84 = (easting: number, northing: number): [number, number] => {
  const y1 = (easting - 2600000) / 1000000
  const x1 = (northing - 1200000) / 1000000
  const lat =
    16.9023892 +
    3.238272 * x1 -
    0.270978 * y1 * y1 -
    0.002528 * x1 * x1 -
    0.0447 * y1 * y1 * x1 -
    0.014 * x1 * x1 * x1
  const lng =
    2.6779094 +
    4.728982 * y1 +
    0.791484 * y1 * x1 +
    0.1306 * y1 * x1 * x1 -
    0.0436 * y1 * y1 * y1
  return [(lng * 100) / 36, (lat * 100) / 36]
}

const segmentRingWgs84 = (segment: RoofSegment): number[][] | null => {
  let wgs84 = segment.geometry.coordinatesWGS84
  if (!wgs84 || wgs84.length === 0) {
    const lv95 = segment.geometry.coordinates
    if (!lv95 || lv95.length === 0) return null
    wgs84 = lv95.map(ring =>
      ring.map(point => lv95ToWgs84(point[0], point[1]))
    )
  }
  const ring = wgs84[0]
  if (!ring || ring.length < 3) return null
  return ring
}

const compositeMapCanvases = (map: Map): string | null => {
  const size = map.getSize()
  const canvases = map
    .getViewport()
    .querySelectorAll<HTMLCanvasElement>('.ol-layer canvas, canvas.ol-layer')
  if (!size || canvases.length === 0) return null
  const mapCanvas = document.createElement('canvas')
  mapCanvas.width = size[0]
  mapCanvas.height = size[1]
  const ctx = mapCanvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = MAP_BACKGROUND
  ctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height)
  canvases.forEach(c => {
    if (c.width === 0 || c.height === 0) return
    const parent = c.parentNode as HTMLElement | null
    const opacity = parent?.style.opacity || c.style.opacity
    ctx.globalAlpha = opacity === '' || opacity == null ? 1 : Number(opacity)
    const match = c.style.transform.match(/^matrix\(([^)]*)\)$/)
    if (match) {
      const matrix = match[1].split(',').map(Number) as [
        number,
        number,
        number,
        number,
        number,
        number,
      ]
      ctx.setTransform(...matrix)
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
    try {
      ctx.drawImage(c, 0, 0)
    } catch {}
  })
  ctx.globalAlpha = 1
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  return mapCanvas.toDataURL('image/jpeg', 0.85)
}

export default function SonnendachRoofMap({
  building,
  selectedSegmentIds,
  center,
  onToggleSegment,
  onTapBuildingAt,
  onTapMiss,
  captureRef,
  className,
  ariaLabel,
  zoomInLabel,
  zoomOutLabel,
}: SonnendachRoofMapProps) {
  const zoomLabelsRef = useRef({ zoomIn: zoomInLabel, zoomOut: zoomOutLabel })
  zoomLabelsRef.current = { zoomIn: zoomInLabel, zoomOut: zoomOutLabel }
  const [isLoadingMap, setIsLoadingMap] = useState(true)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<Map | null>(null)
  const vectorSourceRef = useRef<VectorSource | null>(null)
  const sonnendachLayerRef = useRef<TileLayer<XYZ> | null>(null)
  const buildingRef = useRef(building)
  const selectedIdsRef = useRef(selectedSegmentIds)
  const centerRef = useRef(center)
  const onToggleSegmentRef = useRef(onToggleSegment)
  const onTapBuildingAtRef = useRef(onTapBuildingAt)
  const onTapMissRef = useRef(onTapMiss)
  const isTapPendingRef = useRef(false)
  buildingRef.current = building
  selectedIdsRef.current = selectedSegmentIds
  centerRef.current = center
  onToggleSegmentRef.current = onToggleSegment
  onTapBuildingAtRef.current = onTapBuildingAt
  onTapMissRef.current = onTapMiss

  const drawSegmentOnMap = useCallback(
    (segment: RoofSegment, isSelected: boolean) => {
      const source = vectorSourceRef.current
      if (!source) return
      const ring = segmentRingWgs84(segment)
      if (!ring) return
      const polygon = new Polygon([ring.map(coord => fromLonLat(coord))])
      const feature = new Feature({ geometry: polygon, segmentId: segment.id })
      if (isSelected) {
        feature.setStyle(selectedStyle)
      } else {
        const color =
          segment.suitability?.color ||
          SUITABILITY_CLASSES[segment.suitability?.class || 3]?.color ||
          '#22C55E'
        feature.setStyle(
          new Style({
            fill: new Fill({ color: `${color}80` }),
            stroke: new Stroke({ color, width: 2 }),
          })
        )
      }
      source.addFeature(feature)
    },
    []
  )

  const redrawAllSegments = useCallback(() => {
    const source = vectorSourceRef.current
    if (!source) return
    source.clear()
    const segments = buildingRef.current?.roofSegments
    if (!segments) return
    segments.forEach(segment => {
      drawSegmentOnMap(segment, selectedIdsRef.current.includes(segment.id))
    })
  }, [drawSegmentOnMap])

  const handleMapClick = useCallback(
    async (coordinate: number[], pixel: number[]) => {
      const map = mapInstanceRef.current
      if (!map) return
      const clickedFeature = map.forEachFeatureAtPixel(pixel, f => f, {
        hitTolerance: TAP_HIT_TOLERANCE,
      })
      const segmentId = clickedFeature?.get('segmentId')
      if (typeof segmentId === 'string' && segmentId) {
        onToggleSegmentRef.current(segmentId)
        return
      }
      if (isTapPendingRef.current) return
      isTapPendingRef.current = true
      const [lng, lat] = toLonLat(coordinate)
      try {
        await onTapBuildingAtRef.current(lat, lng)
      } catch {
        onTapMissRef.current()
      } finally {
        isTapPendingRef.current = false
      }
    },
    []
  )

  useEffect(() => {
    const target = mapRef.current
    if (!target || mapInstanceRef.current) return

    const vectorSource = new VectorSource()
    vectorSourceRef.current = vectorSource

    const sonnendachLayer = new TileLayer({
      source: new XYZ({
        url: SONNENDACH_URL,
        crossOrigin: 'anonymous',
        maxZoom: SONNENDACH_MAX_ZOOM,
      }),
      opacity: 0.7,
      visible: !!buildingRef.current,
    })
    sonnendachLayerRef.current = sonnendachLayer
    const clipSaved = { current: false }

    sonnendachLayer.on('prerender', event => {
      const ctx = event.context as CanvasRenderingContext2D | undefined
      const map = mapInstanceRef.current
      const b = buildingRef.current
      if (!ctx || !map || !b?.roofSegments) return
      clipSaved.current = true
      ctx.save()
      ctx.beginPath()
      for (const segment of b.roofSegments) {
        const ring = segmentRingWgs84(segment)
        if (!ring) continue
        ring.forEach((coord, i) => {
          const cssPixel = map.getPixelFromCoordinate(fromLonLat(coord))
          if (!cssPixel) return
          const [x, y] = getRenderPixel(event, cssPixel)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
      }
      ctx.clip()
    })

    sonnendachLayer.on('postrender', event => {
      const ctx = event.context as CanvasRenderingContext2D | undefined
      if (!ctx || !clipSaved.current) return
      clipSaved.current = false
      ctx.restore()
    })

    const initialBuilding = buildingRef.current
    const initialCenter = initialBuilding
      ? { lat: initialBuilding.center.lat, lng: initialBuilding.center.lng }
      : centerRef.current
    const map = new Map({
      target,
      controls: defaultControls({
        zoom: true,
        rotate: false,
        attribution: false,
        zoomOptions: {
          zoomInTipLabel: zoomLabelsRef.current.zoomIn,
          zoomOutTipLabel: zoomLabelsRef.current.zoomOut,
        },
      }),
      layers: [
        new TileLayer({
          source: new XYZ({
            url: SWISS_SATELLITE_URL,
            crossOrigin: 'anonymous',
          }),
        }),
        sonnendachLayer,
        new VectorLayer({ source: vectorSource }),
      ],
      view: new View({
        center: initialCenter
          ? fromLonLat([initialCenter.lng, initialCenter.lat])
          : fromLonLat(SWITZERLAND_CENTER),
        zoom: initialBuilding
          ? BUILDING_ZOOM
          : initialCenter
            ? ADDRESS_ZOOM
            : 8,
        minZoom: 7,
      }),
    })

    map.on('click', evt => {
      void handleMapClick(evt.coordinate, evt.pixel as unknown as number[])
    })

    mapInstanceRef.current = map
    map.once('rendercomplete', () => setIsLoadingMap(false))
    redrawAllSegments()

    return () => {
      map.setTarget(undefined)
      mapInstanceRef.current = null
      vectorSourceRef.current = null
      sonnendachLayerRef.current = null
    }
  }, [handleMapClick, redrawAllSegments])

  useEffect(() => {
    redrawAllSegments()
  }, [building, selectedSegmentIds, redrawAllSegments])

  useEffect(() => {
    const layer = sonnendachLayerRef.current
    if (!layer) return
    layer.setVisible(!!building)
    layer.changed()
  }, [building])

  const buildingId = building?.buildingId ?? null
  const buildingCenterLat = building?.center.lat ?? null
  const buildingCenterLng = building?.center.lng ?? null

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || buildingId === null) return
    if (buildingCenterLat === null || buildingCenterLng === null) return
    map.getView().animate({
      center: fromLonLat([buildingCenterLng, buildingCenterLat]),
      zoom: BUILDING_ZOOM,
      duration: 500,
    })
  }, [buildingId, buildingCenterLat, buildingCenterLng])

  const centerLat = center?.lat ?? null
  const centerLng = center?.lng ?? null

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || buildingRef.current) return
    if (centerLat === null || centerLng === null) return
    map.getView().animate({
      center: fromLonLat([centerLng, centerLat]),
      zoom: ADDRESS_ZOOM,
      duration: 500,
    })
  }, [centerLat, centerLng])

  const capture = useCallback((): Promise<string | null> => {
    const map = mapInstanceRef.current
    if (!map) return Promise.resolve(null)
    return new Promise<string | null>(resolve => {
      let settled = false
      let deadlineId = 0
      const finish = (withImage: boolean) => {
        if (settled) return
        settled = true
        window.clearTimeout(deadlineId)
        map.un('rendercomplete', onRenderComplete)
        if (!withImage) {
          resolve(null)
          return
        }
        try {
          resolve(compositeMapCanvases(map))
        } catch {
          resolve(null)
        }
      }
      function onRenderComplete() {
        finish(true)
      }
      map.on('rendercomplete', onRenderComplete)
      deadlineId = window.setTimeout(
        () => finish(false),
        ROOF_CAPTURE_DEADLINE_MS
      )
      try {
        map.renderSync()
      } catch {
        finish(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!captureRef) return
    captureRef.current = { capture }
    return () => {
      captureRef.current = null
    }
  }, [captureRef, capture])

  return (
    <div className={cn('relative', className)}>
      <div
        ref={mapRef}
        tabIndex={0}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full"
        style={{ backgroundColor: MAP_BACKGROUND }}
      />
      {isLoadingMap && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#EAEDDF]/70" />
        </div>
      )}
    </div>
  )
}
