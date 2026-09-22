import { describe, expect, test } from 'vitest'
import { isSceneZoneId, parseZoneHash, SCENE_ZONE_IDS } from '../scene-zones'

describe('scene zones', () => {
  test('lists the four zones in display order', () => {
    expect(SCENE_ZONE_IDS).toEqual(['zev', 'vzev', 'leg', 'praxismodell'])
  })

  test('parses a zone hash with or without the hash sign', () => {
    expect(parseZoneHash('#zev')).toBe('zev')
    expect(parseZoneHash('vzev')).toBe('vzev')
    expect(parseZoneHash('#LEG')).toBe('leg')
  })

  test('returns null for anything else', () => {
    expect(parseZoneHash('')).toBeNull()
    expect(parseZoneHash('#kosten')).toBeNull()
    expect(isSceneZoneId('solar')).toBe(false)
  })
})
