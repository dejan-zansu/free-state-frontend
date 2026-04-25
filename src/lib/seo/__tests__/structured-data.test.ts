import { describe, it, expect } from 'vitest'
import {
  buildOrganizationJsonLd,
  buildLocalBusinessJsonLd,
  buildWebSiteJsonLd,
  buildBreadcrumbListJsonLd,
  buildBreadcrumbsFromPath,
  buildFAQPageJsonLd,
  buildArticleJsonLd,
  buildServiceJsonLd,
} from '../structured-data'

describe('buildOrganizationJsonLd', () => {
  it('has correct type and url', () => {
    const j = buildOrganizationJsonLd()
    expect(j['@type']).toBe('Organization')
    expect(j['@context']).toBe('https://schema.org')
    expect(j.url).toBe('https://freestate.ch')
    expect(j.name).toBe('Free State AG')
  })
  it('includes logo', () => {
    const j = buildOrganizationJsonLd()
    expect(j.logo).toBeDefined()
  })
  it('includes sameAs', () => {
    const j = buildOrganizationJsonLd()
    expect(Array.isArray(j.sameAs)).toBe(true)
    expect(j.sameAs.length).toBeGreaterThan(0)
  })
})

describe('buildLocalBusinessJsonLd', () => {
  it('has correct type and nested address', () => {
    const j = buildLocalBusinessJsonLd()
    expect(j['@type']).toBe('LocalBusiness')
    expect(j.address['@type']).toBe('PostalAddress')
    expect(j.address.addressCountry).toBe('CH')
  })
  it('declares areaServed for all 19 cantons', () => {
    const j = buildLocalBusinessJsonLd()
    expect(Array.isArray(j.areaServed)).toBe(true)
    expect(j.areaServed.length).toBe(19)
  })
  it('includes openingHoursSpecification', () => {
    const j = buildLocalBusinessJsonLd()
    expect(Array.isArray(j.openingHoursSpecification)).toBe(true)
    expect(j.openingHoursSpecification[0]['@type']).toBe('OpeningHoursSpecification')
  })
})

describe('buildWebSiteJsonLd', () => {
  it('includes SearchAction', () => {
    const j = buildWebSiteJsonLd()
    expect(j['@type']).toBe('WebSite')
    expect(j.potentialAction).toBeDefined()
    expect(j.potentialAction['@type']).toBe('SearchAction')
  })
})

describe('buildBreadcrumbListJsonLd', () => {
  it('maps items to ListItem with positions', () => {
    const j = buildBreadcrumbListJsonLd([
      { name: 'Home', url: 'https://freestate.ch/' },
      { name: 'Solaranlagen', url: 'https://freestate.ch/solaranlagen' },
    ])
    expect(j['@type']).toBe('BreadcrumbList')
    expect(j.itemListElement).toHaveLength(2)
    expect(j.itemListElement[0].position).toBe(1)
    expect(j.itemListElement[1].position).toBe(2)
    expect(j.itemListElement[0].item).toBe('https://freestate.ch/')
  })
})

describe('buildBreadcrumbsFromPath', () => {
  it('builds from segments', () => {
    const j = buildBreadcrumbsFromPath([
      { name: 'Home', href: '/' },
      { name: 'Solaranlagen', href: '/solar-systems' },
      { name: 'Einfamilienhaus', href: '/solar-systems/single-family' },
    ])
    expect(j.itemListElement).toHaveLength(3)
  })
})

describe('buildFAQPageJsonLd', () => {
  it('maps Q&A to Question items', () => {
    const j = buildFAQPageJsonLd([
      { question: 'Was kostet eine Solaranlage?', answer: "CHF 18'000 bis 35'000." },
    ])
    expect(j['@type']).toBe('FAQPage')
    expect(j.mainEntity[0]['@type']).toBe('Question')
    expect(j.mainEntity[0].acceptedAnswer['@type']).toBe('Answer')
    expect(j.mainEntity[0].acceptedAnswer.text).toBe("CHF 18'000 bis 35'000.")
  })
})

describe('buildArticleJsonLd', () => {
  it('includes headline, author, datePublished, image', () => {
    const j = buildArticleJsonLd({
      headline: 'Solaranlage Kosten 2026',
      url: 'https://freestate.ch/blog/solaranlage-kosten-2026',
      image: 'https://freestate.ch/images/cover.jpg',
      authorName: 'Max Muster',
      datePublished: '2026-04-20T10:00:00+02:00',
      dateModified: '2026-04-22T14:00:00+02:00',
      description: 'Was kostet eine Solaranlage 2026 in der Schweiz?',
    })
    expect(j['@type']).toBe('Article')
    expect(j.headline).toBe('Solaranlage Kosten 2026')
    expect(j.author['@type']).toBe('Person')
    expect(j.author.name).toBe('Max Muster')
    expect(j.publisher['@type']).toBe('Organization')
    expect(j.mainEntityOfPage).toBe('https://freestate.ch/blog/solaranlage-kosten-2026')
  })
})

describe('buildServiceJsonLd', () => {
  it('maps service name + areaServed + provider', () => {
    const j = buildServiceJsonLd({
      name: 'Solaranlagen Installation',
      description: 'Photovoltaik für Einfamilienhaus in der Deutschschweiz.',
      url: 'https://freestate.ch/solaranlagen',
      serviceType: 'Solar Energy Installation',
    })
    expect(j['@type']).toBe('Service')
    expect(j.provider['@type']).toBe('Organization')
    expect(j.areaServed).toHaveLength(19)
  })
})
