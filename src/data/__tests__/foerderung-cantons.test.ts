import { describe, expect, test } from 'vitest'
import { FOERDERUNG_CANTONS } from '../foerderung-cantons'

test('every canton has at least 2 sources', () => {
  for (const c of FOERDERUNG_CANTONS) {
    expect(c.sources.length).toBeGreaterThanOrEqual(2)
  }
})

test('every canton has a lastUpdated in 2026', () => {
  for (const c of FOERDERUNG_CANTONS) {
    expect(c.lastUpdated.startsWith('2026-')).toBe(true)
  }
})

test('canton slugs are unique and lowercase', () => {
  const slugs = FOERDERUNG_CANTONS.map((c) => c.nameSlug)
  expect(new Set(slugs).size).toBe(slugs.length)
  for (const s of slugs) {
    expect(s).toBe(s.toLowerCase())
  }
})

test('initial seed has AG, LU, SG, SH', () => {
  const codes = FOERDERUNG_CANTONS.map((c) => c.code).sort()
  expect(codes).toEqual(['AG', 'LU', 'SG', 'SH'])
})
