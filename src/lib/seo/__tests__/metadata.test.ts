import { describe, it, expect } from 'vitest'
import {
  buildCanonicalUrl,
  buildHreflangAlternates,
  generateSEOMetadata,
} from '../metadata'

describe('buildCanonicalUrl', () => {
  it('returns root for home DE (no prefix)', () => {
    expect(buildCanonicalUrl({ pathname: '/', locale: 'de' })).toBe(
      'https://freestate.ch/'
    )
  })

  it('returns /en prefix for English home', () => {
    expect(buildCanonicalUrl({ pathname: '/', locale: 'en' })).toBe(
      'https://freestate.ch/en'
    )
  })

  it('returns localized slug for DE', () => {
    expect(buildCanonicalUrl({ pathname: '/about-us', locale: 'de' })).toBe(
      'https://freestate.ch/ueber-uns'
    )
  })

  it('returns localized slug under prefix for FR', () => {
    expect(buildCanonicalUrl({ pathname: '/about-us', locale: 'fr' })).toBe(
      'https://freestate.ch/fr/a-propos'
    )
  })
})

describe('buildHreflangAlternates', () => {
  it('returns one entry per active locale plus x-default', () => {
    const alts = buildHreflangAlternates('/about-us')
    expect(Object.keys(alts).sort()).toEqual(['de', 'en', 'fr', 'it', 'x-default'])
  })

  it('x-default points to DE version', () => {
    const alts = buildHreflangAlternates('/about-us')
    expect(alts['x-default']).toBe(alts['de'])
  })

  it('each entry is an absolute URL', () => {
    const alts = buildHreflangAlternates('/')
    for (const url of Object.values(alts)) {
      expect(url).toMatch(/^https:\/\/freestate\.ch/)
    }
  })
})

describe('generateSEOMetadata', () => {
  it('returns a Metadata object with title, description, and canonical', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: 'Solaranlagen Schweiz | Free State AG',
      description: 'Solaranlagen für dein Zuhause in der Schweiz.',
    })

    expect(meta.title).toBe('Solaranlagen Schweiz | Free State AG')
    expect(meta.description).toBe('Solaranlagen für dein Zuhause in der Schweiz.')
    expect(meta.alternates?.canonical).toBe('https://freestate.ch/')
  })

  it('sets hreflang alternates for all locales', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/about-us',
      title: 't',
      description: 'd',
    })
    expect(Object.keys(meta.alternates?.languages ?? {}).sort()).toEqual([
      'de',
      'en',
      'fr',
      'it',
      'x-default',
    ])
  })

  it('populates openGraph with locale and siteName', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: 't',
      description: 'd',
    })
    expect(meta.openGraph?.locale).toBe('de')
    expect(meta.openGraph?.siteName).toBe('Free State AG')
    expect(meta.openGraph?.url).toBe('https://freestate.ch/')
  })

  it('falls back to site name when title is empty', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: '',
      description: '',
    })
    expect(meta.title).toBe('Free State AG')
    expect(meta.description).toBe(
      'Solaranlagen, Batteriespeicher, Wärmepumpen und Ladestationen in der Schweiz. Kaufen oder als Solar-Abo ab CHF 0.00 Eigeninvestition.'
    )
  })

  it('defaults to index follow robots', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: 't',
      description: 'd',
    })
    expect(meta.robots).toEqual({ index: true, follow: true })
  })

  it('honors noIndex flag', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: 't',
      description: 'd',
      noIndex: true,
    })
    expect(meta.robots).toEqual({ index: false, follow: false })
  })
})
