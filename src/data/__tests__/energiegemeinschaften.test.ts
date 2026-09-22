import { describe, expect, test } from 'vitest'
import {
  COMMUNITY_MODELS,
  FSA_STEPS,
  getCommunityModel,
  HUB,
  SCENE_ZONE_COPY,
  type SceneZoneCopy,
} from '../energiegemeinschaften'
import { SCENE_STEP_IDS, type SceneStepId } from '@/lib/ratgeber/scene-zones'

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach(v => strings(v, out))
  else if (value && typeof value === 'object')
    Object.values(value).forEach(v => strings(v, out))
  return out
}

describe('energiegemeinschaften content', () => {
  test('every model has a since date, checked legal refs and at least six FAQ items', () => {
    for (const m of COMMUNITY_MODELS) {
      expect(m.since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(m.legal.refs.length).toBeGreaterThanOrEqual(1)
      for (const ref of m.legal.refs) {
        expect(ref.checked).toMatch(/^2026-\d{2}-\d{2}$/)
        expect(ref.url).toMatch(/^https:\/\//)
      }
      expect(m.faq.length).toBeGreaterThanOrEqual(6)
      expect(m.example.sourceDate).toMatch(/^2026-/)
    }
  })

  test('no string contains an em dash', () => {
    for (const s of strings(COMMUNITY_MODELS)) {
      expect(s.includes(String.fromCharCode(8212))).toBe(false)
    }
  })

  test('every model spells out ZEV on its page', () => {
    for (const m of COMMUNITY_MODELS) {
      expect(strings(m).join(' ')).toContain(
        'Zusammenschluss zum Eigenverbrauch'
      )
    }
  })

  test('getCommunityModel returns null for unknown slugs', () => {
    expect(getCommunityModel('kosten')).toBeNull()
    expect(getCommunityModel('zev')?.slug).toBe('zev')
  })

  test('ships the three models in order', () => {
    expect(COMMUNITY_MODELS.map(m => m.slug)).toEqual(['zev', 'vzev', 'leg'])
  })

  test('FSA steps carry no prices and no platform claim', () => {
    const all = [
      ...strings(FSA_STEPS),
      ...COMMUNITY_MODELS.flatMap(m => strings(m.fsaSteps)),
    ]
    for (const s of all) {
      expect(s).not.toContain('CHF')
      expect(s).not.toContain('Plattform')
    }
  })

  test('hub has a decision helper, a comparison with all four columns and no em dash', () => {
    expect(HUB.decision.length).toBeGreaterThanOrEqual(3)
    expect(HUB.comparison.length).toBeGreaterThanOrEqual(6)
    for (const row of HUB.comparison) {
      for (const cell of [row.zev, row.vzev, row.praxismodell, row.leg])
        expect(cell.length).toBeGreaterThan(0)
    }
    for (const s of strings([HUB, SCENE_ZONE_COPY]))
      expect(s.includes(String.fromCharCode(8212))).toBe(false)
    expect(SCENE_ZONE_COPY.map(z => z.id)).toEqual([
      'zev',
      'vzev',
      'leg',
      'praxismodell',
    ])
  })

  test('every SCENE_ZONE_COPY entry has three steps and matching labels', () => {
    const expectedLabels: Record<string, string[]> = {
      zev: ['hak', 'pv'],
      vzev: ['verteilkabine', 'meter', 'pv'],
      leg: ['trafo', 'meter', 'pv', 'netz'],
      praxismodell: ['vnbmeter', 'pv'],
    }

    for (const zone of SCENE_ZONE_COPY) {
      expect(zone.steps).toBeDefined()
      expect(zone.steps).toHaveLength(3)
      expect(zone.steps.map(s => s.id)).toEqual([
        'production',
        'distribution',
        'grid',
      ])

      expect(zone.labels).toBeDefined()
      const labelIds = Object.keys(zone.labels).sort()
      const expectedIds = expectedLabels[zone.id].sort()
      expect(labelIds).toEqual(expectedIds)

      for (const step of zone.steps) {
        expect(step.label).toBeDefined()
        expect(typeof step.label).toBe('string')
        expect(step.text).toBeDefined()
        expect(typeof step.text).toBe('string')
      }

      for (const [id, label] of Object.entries(zone.labels)) {
        expect(typeof id).toBe('string')
        expect(typeof label).toBe('string')
      }
    }
  })
})
