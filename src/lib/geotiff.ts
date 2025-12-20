import { fromUrl, GeoTIFF } from 'geotiff'
import type { GeoTiff } from '@/types/solar'

/**
 * Fetch and parse a GeoTIFF file from a URL
 */
export async function fetchGeoTiff(url: string): Promise<GeoTiff> {
  const tiff: GeoTIFF = await fromUrl(url)
  const image = await tiff.getImage()
  const rasters = await image.readRasters()
  const bbox = image.getBoundingBox()

  return {
    width: image.getWidth(),
    height: image.getHeight(),
    rasters: Array.from({ length: rasters.length }, (_, i) =>
      Array.from(rasters[i] as unknown as ArrayLike<number>)
    ),
    bounds: {
      north: bbox[3],
      south: bbox[1],
      east: bbox[2],
      west: bbox[0],
    },
  }
}

/**
 * Convert pixel coordinates to lat/lng
 */
export function pixelToLatLng(
  x: number,
  y: number,
  geoTiff: GeoTiff
): { lat: number; lng: number } {
  const { bounds } = geoTiff
  const width = geoTiff.width
  const height = geoTiff.height

  const lng = bounds.west + (x / width) * (bounds.east - bounds.west)
  const lat = bounds.north - (y / height) * (bounds.north - bounds.south)

  return { lat, lng }
}

/**
 * Get pixel value at coordinates
 */
export function getPixelValue(
  x: number,
  y: number,
  geoTiff: GeoTiff,
  rasterIndex: number = 0
): number {
  const { width, rasters } = geoTiff
  const index = y * width + x
  return rasters[rasterIndex]?.[index] ?? 0
}

/**
 * Extract roof polygons from mask GeoTIFF
 * Returns array of polygon outlines for all roofs in the image
 */
export interface RoofPolygon {
  points: Array<{ lat: number; lng: number }>
  avgFlux: number // Average solar flux for this roof
}

/**
 * Trace contours from mask data to create polygon outlines
 * This uses a marching squares algorithm to find roof boundaries
 */
export function extractRoofPolygons(
  maskGeoTiff: GeoTiff,
  fluxGeoTiff: GeoTiff,
  threshold: number = 1 // Pixels with value >= threshold are considered roof
): RoofPolygon[] {
  const { width, height, rasters } = maskGeoTiff
  const maskData = rasters[0] // RGB mask uses first channel
  const fluxData = fluxGeoTiff.rasters[0] // Annual flux data

  const visited = new Set<string>()
  const roofPolygons: RoofPolygon[] = []

  // Scan for roof pixels and flood-fill to find connected regions
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if ((maskData[idx] ?? 0) < threshold) continue // Not a roof pixel

      // Found a new roof region - flood fill to find all pixels
      const roofPixels = floodFill(x, y, width, height, maskData, visited, threshold)

      if (roofPixels.length < 10) continue // Skip tiny regions (noise)

      // Calculate average flux for this roof
      let totalFlux = 0
      for (const pixel of roofPixels) {
        const pixelIdx = pixel.y * width + pixel.x
        totalFlux += fluxData[pixelIdx] ?? 0
      }
      const avgFlux = totalFlux / roofPixels.length

      // Trace the outline of this roof region
      const outline = traceOutline(roofPixels)

      // Convert pixel coordinates to lat/lng
      const points = outline.map((p) => pixelToLatLng(p.x, p.y, maskGeoTiff))

      roofPolygons.push({ points, avgFlux })
    }
  }

  return roofPolygons
}

/**
 * Flood fill algorithm to find connected roof pixels
 */
function floodFill(
  startX: number,
  startY: number,
  width: number,
  height: number,
  data: number[],
  visited: Set<string>,
  threshold: number
): Array<{ x: number; y: number }> {
  const pixels: Array<{ x: number; y: number }> = []
  const queue: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]

  while (queue.length > 0) {
    const { x, y } = queue.shift()!
    const key = `${x},${y}`

    if (visited.has(key)) continue
    if (x < 0 || x >= width || y < 0 || y >= height) continue

    const idx = y * width + x
    if ((data[idx] ?? 0) < threshold) continue

    visited.add(key)
    pixels.push({ x, y })

    // Add neighbors
    queue.push({ x: x + 1, y })
    queue.push({ x: x - 1, y })
    queue.push({ x, y: y + 1 })
    queue.push({ x, y: y - 1 })
  }

  return pixels
}

/**
 * Trace the outline of a pixel region using Moore boundary tracing
 */
function traceOutline(
  pixels: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> {
  // Create a 2D grid marking roof pixels
  const grid = new Set(pixels.map((p) => `${p.x},${p.y}`))

  // Find leftmost pixel (starting point for boundary trace)
  let start = pixels[0]
  for (const p of pixels) {
    if (p.x < start.x || (p.x === start.x && p.y < start.y)) {
      start = p
    }
  }

  const outline: Array<{ x: number; y: number }> = []
  const directions = [
    { dx: 1, dy: 0 },  // Right
    { dx: 1, dy: 1 },  // Down-right
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 1 }, // Down-left
    { dx: -1, dy: 0 }, // Left
    { dx: -1, dy: -1 }, // Up-left
    { dx: 0, dy: -1 }, // Up
    { dx: 1, dy: -1 }, // Up-right
  ]

  let current = start
  let dir = 0 // Start looking right
  const maxIterations = pixels.length * 4 // Safety limit
  let iterations = 0

  do {
    outline.push({ ...current })

    // Look for next boundary pixel
    let found = false
    for (let i = 0; i < 8; i++) {
      const checkDir = (dir + i) % 8
      const next = {
        x: current.x + directions[checkDir].dx,
        y: current.y + directions[checkDir].dy,
      }

      if (grid.has(`${next.x},${next.y}`)) {
        current = next
        dir = (checkDir + 6) % 8 // Turn left for next search
        found = true
        break
      }
    }

    if (!found) break
    iterations++
  } while (
    (current.x !== start.x || current.y !== start.y) &&
    iterations < maxIterations
  )

  // Simplify outline (Douglas-Peucker algorithm)
  return simplifyPolygon(outline, 1.5) // Tolerance in pixels
}

/**
 * Simplify polygon using Douglas-Peucker algorithm
 */
function simplifyPolygon(
  points: Array<{ x: number; y: number }>,
  tolerance: number
): Array<{ x: number; y: number }> {
  if (points.length < 3) return points

  const simplified = douglasPeucker(points, tolerance)
  return simplified.length >= 3 ? simplified : points
}

function douglasPeucker(
  points: Array<{ x: number; y: number }>,
  tolerance: number
): Array<{ x: number; y: number }> {
  if (points.length < 3) return points

  // Find point with maximum distance from line
  const first = points[0]
  const last = points[points.length - 1]
  let maxDist = 0
  let maxIndex = 0

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIndex = i
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance)
    const right = douglasPeucker(points.slice(maxIndex), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [first, last]
}

function perpendicularDistance(
  point: { x: number; y: number },
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number }
): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y

  if (dx === 0 && dy === 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
    )
  }

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy)

  if (t < 0) {
    return Math.sqrt(
      Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2)
    )
  }

  if (t > 1) {
    return Math.sqrt(
      Math.pow(point.x - lineEnd.x, 2) + Math.pow(point.y - lineEnd.y, 2)
    )
  }

  const projX = lineStart.x + t * dx
  const projY = lineStart.y + t * dy

  return Math.sqrt(Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2))
}

/**
 * Convert solar flux value to color (red = low, blue = high)
 * Returns hex color string
 */
export function fluxToColor(flux: number, maxFlux: number = 1800): string {
  // Normalize flux to 0-1 range
  const normalized = Math.min(flux / maxFlux, 1)

  // Color gradient: red (low) -> yellow -> green -> blue (high)
  // HSL color space works well for this
  const hue = normalized * 240 // 0 = red, 240 = blue
  const saturation = 80
  const lightness = 50

  return hslToHex(hue, saturation, lightness)
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
