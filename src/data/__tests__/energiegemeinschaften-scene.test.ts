import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { CAMERA_ORBIT_MAX, CAMERA_ORBIT_MIN } from '@/lib/ratgeber/scene-zones'

const ZONES = ['zev', 'vzev', 'leg', 'praxismodell'] as const
const ORBIT = /^-?\d+(\.\d+)?deg \d+(\.\d+)?deg \d+(\.\d+)?m$/
const TARGET = /^-?\d+(\.\d+)?m -?\d+(\.\d+)?m -?\d+(\.\d+)?m$/

const LABEL_IDS: Record<(typeof ZONES)[number], string[]> = {
  zev: ['hak', 'pv'],
  vzev: ['verteilkabine', 'meter', 'pv'],
  leg: ['trafo', 'meter', 'pv', 'netz'],
  praxismodell: ['vnbmeter', 'pv'],
}

function load() {
  const file = path.resolve(__dirname, '../energiegemeinschaften-scene.json')
  return JSON.parse(readFileSync(file, 'utf8')) as {
    overview: { target: string; orbit: string }
    zones: Record<
      string,
      {
        anchor: number[]
        target: string
        orbit: string
        labels: { id: string; anchor: number[] }[]
      }
    >
  }
}

describe('energiegemeinschaften scene config', () => {
  test('has exactly the four zones', () => {
    expect(Object.keys(load().zones).sort()).toEqual([...ZONES].sort())
  })

  test('every zone has a 3-number anchor and model-viewer camera strings', () => {
    const { zones } = load()
    for (const id of ZONES) {
      expect(zones[id].anchor).toHaveLength(3)
      for (const n of zones[id].anchor) expect(typeof n).toBe('number')
      expect(zones[id].target).toMatch(TARGET)
      expect(zones[id].orbit).toMatch(ORBIT)
    }
  })

  test('every zone has at least two labels with a string id and a 3-number anchor', () => {
    const { zones } = load()
    for (const id of ZONES) {
      const labels = zones[id].labels
      expect(labels.length).toBeGreaterThanOrEqual(2)
      for (const label of labels) {
        expect(typeof label.id).toBe('string')
        expect(label.anchor).toHaveLength(3)
        for (const n of label.anchor) expect(typeof n).toBe('number')
      }
      expect(labels.map(l => l.id).sort()).toEqual([...LABEL_IDS[id]].sort())
    }
  })

  test('overview has camera strings', () => {
    const { overview } = load()
    expect(overview.target).toMatch(TARGET)
    expect(overview.orbit).toMatch(ORBIT)
  })

  test('every camera preset sits inside the viewer clamps', () => {
    const numbers = /(-?\d+(?:\.\d+)?)deg (\d+(?:\.\d+)?)deg (\d+(?:\.\d+)?)m/
    const clampNumbers = /(-?\d+(?:\.\d+)?)deg (\d+(?:\.\d+)?)m/

    const min = CAMERA_ORBIT_MIN.match(clampNumbers)
    const max = CAMERA_ORBIT_MAX.match(clampNumbers)
    expect(min).not.toBeNull()
    expect(max).not.toBeNull()
    const minPhi = Number(min![1])
    const minRadius = Number(min![2])
    const maxPhi = Number(max![1])
    const maxRadius = Number(max![2])

    const { overview, zones } = load()
    const orbits = [overview.orbit, ...Object.values(zones).map(z => z.orbit)]
    for (const orbit of orbits) {
      const match = orbit.match(numbers)
      expect(match).not.toBeNull()
      const phi = Number(match![2])
      const radius = Number(match![3])
      expect(phi).toBeGreaterThanOrEqual(minPhi)
      expect(phi).toBeLessThanOrEqual(maxPhi)
      expect(radius).toBeGreaterThanOrEqual(minRadius)
      expect(radius).toBeLessThanOrEqual(maxRadius)
    }
  })
})
