import { describe, it, expect } from 'vitest'
import robots from '../robots'

describe('robots', () => {
  it('points at the sitemap', () => {
    const r = robots()
    expect(r.sitemap).toBe('https://www.freestate.ch/sitemap.xml')
  })

  it('disallows admin, dashboard, auth, api paths', () => {
    const r = robots()
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
    const disallows = rules.flatMap(rule =>
      Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []
    )
    expect(disallows).toContain('/admin/')
    expect(disallows).toContain('/dashboard/')
    expect(disallows).toContain('/api/')
  })

  it('allows public paths by default (wildcard)', () => {
    const r = robots()
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
    expect(rules.some(rule => rule.userAgent === '*')).toBe(true)
  })
})
