import { describe, it, expect, vi } from 'vitest'

vi.mock('@/services/blog.service', () => ({
  blogService: {
    listPublished: async () => ({
      success: true,
      data: [],
      meta: { total: 0, page: 1, limit: 1000, totalPages: 0 },
    }),
  },
}))

vi.mock('@/data/foerderung-cantons', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/data/foerderung-cantons')>()
  const unverified = {
    ...actual.FOERDERUNG_CANTONS[0],
    code: 'BE' as const,
    name: 'Bern',
    nameSlug: 'bern',
    cantonalProgramSummary: '[PLACEHOLDER Programm noch nicht geprüft]',
  }
  return {
    ...actual,
    FOERDERUNG_CANTONS: [...actual.FOERDERUNG_CANTONS, unverified],
  }
})

import sitemap from '../sitemap'
import {
  FOERDERUNG_CANTONS,
  isPlaceholderCanton,
} from '@/data/foerderung-cantons'

describe('sitemap', () => {
  it('includes the home page with all locale alternates', async () => {
    const entries = await sitemap()
    const home = entries.find(e => e.url === 'https://www.freestate.ch/')
    expect(home).toBeDefined()
    expect(home?.alternates?.languages).toBeDefined()
    expect(Object.keys(home!.alternates!.languages!).sort()).toEqual([
      'de',
      'en',
      'fr',
      'it',
      'x-default',
    ])
  })

  it('includes the localized pathname for about-us', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    expect(urls).toContain('https://www.freestate.ch/ueber-uns')
  })

  it('does not include admin, dashboard, or auth paths', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    for (const url of urls) {
      expect(url).not.toContain('/admin')
      expect(url).not.toContain('/dashboard')
      expect(url).not.toContain('/login')
      expect(url).not.toContain('/register')
    }
  })

  it('produces a non-empty entry list', async () => {
    const entries = await sitemap()
    expect(entries.length).toBeGreaterThan(40)
  })

  it('emits more than one distinct lastModified across entries', async () => {
    const entries = await sitemap()
    const stamps = new Set(
      entries
        .map(e => e.lastModified)
        .filter((d): d is Date => d instanceof Date)
        .map(d => d.toISOString())
    )
    expect(stamps.size).toBeGreaterThan(1)
  })

  it('includes the foerderung hub with hreflang alternates', async () => {
    const entries = await sitemap()
    const hub = entries.find(
      e => e.url === 'https://www.freestate.ch/foerderung'
    )
    expect(hub).toBeDefined()
    expect(hub?.alternates?.languages).toBeDefined()
    expect(Object.keys(hub!.alternates!.languages!).sort()).toEqual([
      'de',
      'en',
      'fr',
      'it',
      'x-default',
    ])
  })

  it('lists verified cantonal Förderung pages and excludes placeholder ones', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    const verified = FOERDERUNG_CANTONS.filter(c => !isPlaceholderCanton(c))
    const placeholders = FOERDERUNG_CANTONS.filter(isPlaceholderCanton)
    expect(verified.length).toBeGreaterThan(0)
    expect(placeholders.length).toBeGreaterThan(0)
    for (const c of verified) {
      expect(urls).toContain(
        `https://www.freestate.ch/foerderung/${c.nameSlug}`
      )
    }
    for (const c of placeholders) {
      expect(urls).not.toContain(
        `https://www.freestate.ch/foerderung/${c.nameSlug}`
      )
    }
  })

  it('lists the German-only Ratgeber pages with de and x-default alternates only', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    for (const path of [
      '/ratgeber',
      '/ratgeber/energiegemeinschaften',
      '/ratgeber/zev',
      '/ratgeber/vzev',
      '/ratgeber/leg',
    ]) {
      expect(urls).toContain(`https://www.freestate.ch${path}`)
    }
    const zev = entries.find(
      e => e.url === 'https://www.freestate.ch/ratgeber/zev'
    )
    expect(Object.keys(zev!.alternates!.languages!).sort()).toEqual([
      'de',
      'x-default',
    ])
    expect(urls.filter(u => u.includes('/ratgeber/zev'))).toHaveLength(1)
  })
})
