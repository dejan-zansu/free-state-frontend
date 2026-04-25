import { describe, it, expect } from 'vitest'
import { siteConfig, getSiteUrl } from '../site-config'

describe('site-config', () => {
  it('exposes the production origin', () => {
    expect(siteConfig.url).toBe('https://www.freestate.ch')
  })

  it('exposes brand name', () => {
    expect(siteConfig.name).toBe('Free State AG')
  })

  it('exposes the default locale', () => {
    expect(siteConfig.defaultLocale).toBe('de')
  })

  it('lists all active locales in order', () => {
    expect(siteConfig.locales).toEqual(['de', 'en', 'fr', 'it'])
  })

  it('getSiteUrl returns the origin without trailing slash', () => {
    expect(getSiteUrl()).toBe('https://www.freestate.ch')
  })

  it('lists 19 cantons in areaServed', () => {
    expect(siteConfig.areaServed).toHaveLength(19)
  })
})
