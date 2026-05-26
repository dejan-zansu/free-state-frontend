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

import sitemap from '../sitemap'

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
    const hub = entries.find(e => e.url === 'https://www.freestate.ch/foerderung')
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

  it('includes the seeded cantonal Förderung pages with per-canton lastModified', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    const slugs = ['aargau', 'luzern', 'st-gallen', 'schaffhausen']
    for (const slug of slugs) {
      expect(urls).toContain(`https://www.freestate.ch/foerderung/${slug}`)
    }
    const luzern = entries.find(
      e => e.url === 'https://www.freestate.ch/foerderung/luzern'
    )
    expect(luzern?.lastModified).toBeInstanceOf(Date)
  })
})
