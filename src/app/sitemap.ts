import type { MetadataRoute } from 'next'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildCanonicalUrl, buildHreflangAlternates } from '@/lib/seo/metadata'
import { blogService } from '@/services/blog.service'
import { FOERDERUNG_CANTONS } from '@/data/foerderung-cantons'

const REFRESH_2026_05_16 = new Date('2026-05-16')
const REFRESH_2026_04_12 = new Date('2026-04-12')
const REFRESH_2026_02_01 = new Date('2026-02-01')
const REFRESH_2025_11_01 = new Date('2025-11-01')

type StaticEntry = {
  pathname: string
  lastModified: Date
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
  priority?: number
}

const STATIC_ENTRIES: StaticEntry[] = [
  { pathname: '/', lastModified: REFRESH_2026_05_16, changeFrequency: 'weekly', priority: 1 },
  { pathname: '/solar-systems', lastModified: REFRESH_2026_04_12, priority: 0.9 },
  { pathname: '/solar-free', lastModified: REFRESH_2026_04_12, priority: 0.9 },
  { pathname: '/solar-direct', lastModified: REFRESH_2026_04_12, priority: 0.8 },
  { pathname: '/battery-storage', lastModified: REFRESH_2026_02_01, priority: 0.8 },
  { pathname: '/heat-pumps', lastModified: REFRESH_2026_02_01, priority: 0.8 },
  { pathname: '/heat-pumps/products', lastModified: REFRESH_2026_02_01 },
  { pathname: '/heat-pumps/cost', lastModified: REFRESH_2026_02_01 },
  { pathname: '/heat-pumps/how-it-works', lastModified: REFRESH_2026_02_01 },
  { pathname: '/heat-pumps/heat-pumps-with-solar-system', lastModified: REFRESH_2026_02_01 },
  { pathname: '/heat-pumps/service', lastModified: REFRESH_2026_02_01 },
  { pathname: '/charging-stations', lastModified: REFRESH_2026_02_01, priority: 0.8 },
  { pathname: '/charging-stations/apartment-building', lastModified: REFRESH_2026_02_01 },
  { pathname: '/charging-stations/single-family-home', lastModified: REFRESH_2026_02_01 },
  { pathname: '/charging-stations/bidirectional-charging-station', lastModified: REFRESH_2026_02_01 },
  { pathname: '/commercial', lastModified: REFRESH_2026_02_01, priority: 0.8 },
  { pathname: '/commercial/solar-systems', lastModified: REFRESH_2026_02_01 },
  { pathname: '/commercial/solar-systems/how-large-plants-works', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/solar-systems/project-development', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/solar-systems/solar-carport', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/solar-systems/contracting', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/charging-stations', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/charging-stations/apartment-building', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/charging-stations/fast-charging-stations', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/charging-stations/bidirectional-charging-station', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/charging-stations/company', lastModified: REFRESH_2025_11_01 },
  { pathname: '/commercial/solar-free', lastModified: REFRESH_2026_04_12 },
  { pathname: '/commercial/solar-free/industry-commercial', lastModified: REFRESH_2026_04_12 },
  { pathname: '/commercial/solar-free/solar-free-multi-family', lastModified: REFRESH_2026_04_12 },
  { pathname: '/commercial/solar-free/farmhouses', lastModified: REFRESH_2026_04_12 },
  { pathname: '/commercial/solar-free/public-buildings', lastModified: REFRESH_2026_04_12 },
  { pathname: '/commercial/calculator', lastModified: REFRESH_2026_04_12 },
  { pathname: '/cost', lastModified: REFRESH_2026_02_01 },
  { pathname: '/amortization', lastModified: REFRESH_2026_02_01 },
  { pathname: '/solar-calculator', lastModified: REFRESH_2026_04_12, priority: 0.9 },
  { pathname: '/calculator', lastModified: REFRESH_2026_04_12, priority: 0.9 },
  { pathname: '/about-us', lastModified: REFRESH_2025_11_01 },
  { pathname: '/team', lastModified: REFRESH_2026_04_12 },
  { pathname: '/history', lastModified: REFRESH_2026_04_12 },
  { pathname: '/careers', lastModified: REFRESH_2025_11_01 },
  { pathname: '/faq', lastModified: REFRESH_2026_02_01 },
  { pathname: '/portfolio', lastModified: REFRESH_2026_02_01 },
  { pathname: '/service', lastModified: REFRESH_2025_11_01 },
  { pathname: '/blog', lastModified: REFRESH_2026_05_16, changeFrequency: 'weekly', priority: 0.7 },
  { pathname: '/contact', lastModified: REFRESH_2026_02_01 },
  { pathname: '/energy-storage', lastModified: REFRESH_2025_11_01 },
  { pathname: '/repowering', lastModified: REFRESH_2025_11_01 },
  { pathname: '/solar-system-carport', lastModified: REFRESH_2025_11_01 },
  { pathname: '/how-it-works', lastModified: REFRESH_2026_02_01 },
  { pathname: '/media', lastModified: REFRESH_2025_11_01 },
  { pathname: '/investors', lastModified: REFRESH_2025_11_01 },
  { pathname: '/impressum', lastModified: REFRESH_2026_04_12 },
  { pathname: '/agb', lastModified: REFRESH_2026_04_12 },
  { pathname: '/privacy-policy', lastModified: REFRESH_2026_04_12 },
  { pathname: '/foerderung', lastModified: REFRESH_2026_05_16, changeFrequency: 'weekly', priority: 0.8 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const entry of STATIC_ENTRIES) {
    const url = buildCanonicalUrl({
      pathname: entry.pathname,
      locale: siteConfig.defaultLocale as SiteLocale,
    })
    entries.push({
      url,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency ?? 'monthly',
      priority: entry.priority ?? 0.7,
      alternates: {
        languages: buildHreflangAlternates(entry.pathname),
      },
    })
  }

  for (const canton of FOERDERUNG_CANTONS) {
    const pathname = `/foerderung/${canton.nameSlug}`
    const url = buildCanonicalUrl({
      pathname,
      locale: siteConfig.defaultLocale as SiteLocale,
    })
    entries.push({
      url,
      lastModified: new Date(canton.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: buildHreflangAlternates(pathname),
      },
    })
  }

  const blogPosts = await fetchAllBlogPosts()
  for (const post of blogPosts) {
    const url = `${siteConfig.url}/blog/${post.slug}`
    const lastModified = post.updatedAt
      ? new Date(post.updatedAt)
      : post.publishedAt
        ? new Date(post.publishedAt)
        : REFRESH_2026_05_16
    entries.push({
      url,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}

async function fetchAllBlogPosts() {
  const PAGE_SIZE = 100
  const posts: NonNullable<Awaited<ReturnType<typeof blogService.listPublished>>['data']> = []
  try {
    let page = 1
    while (true) {
      const result = await blogService.listPublished(page, PAGE_SIZE)
      const items = result.data ?? []
      posts.push(...items)
      const totalPages = result.meta?.totalPages ?? 1
      if (page >= totalPages || items.length === 0) break
      page += 1
    }
    return posts
  } catch {
    return posts
  }
}
