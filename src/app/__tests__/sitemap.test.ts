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
    const home = entries.find(e => e.url === 'https://freestate.ch/')
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
    expect(urls).toContain('https://freestate.ch/ueber-uns')
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
})
