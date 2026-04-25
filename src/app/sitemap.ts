import type { MetadataRoute } from 'next'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildCanonicalUrl, buildHreflangAlternates } from '@/lib/seo/metadata'
import { blogService } from '@/services/blog.service'

const PUBLIC_PATHS = [
  '/',
  '/solar-systems',
  '/solar-free',
  '/solar-direct',
  '/battery-storage',
  '/heat-pumps',
  '/heat-pumps/products',
  '/heat-pumps/cost',
  '/heat-pumps/how-it-works',
  '/heat-pumps/heat-pumps-with-solar-system',
  '/heat-pumps/service',
  '/charging-stations',
  '/charging-stations/apartment-building',
  '/charging-stations/single-family-home',
  '/charging-stations/bidirectional-charging-station',
  '/commercial',
  '/commercial/solar-systems',
  '/commercial/solar-systems/how-large-plants-works',
  '/commercial/solar-systems/project-development',
  '/commercial/solar-systems/solar-carport',
  '/commercial/solar-systems/contracting',
  '/commercial/charging-stations',
  '/commercial/charging-stations/apartment-building',
  '/commercial/charging-stations/fast-charging-stations',
  '/commercial/charging-stations/bidirectional-charging-station',
  '/commercial/charging-stations/company',
  '/commercial/solar-free',
  '/commercial/solar-free/industry-commercial',
  '/commercial/solar-free/solar-free-multi-family',
  '/commercial/solar-free/farmhouses',
  '/commercial/solar-free/public-buildings',
  '/commercial/calculator',
  '/cost',
  '/amortization',
  '/solar-calculator',
  '/calculator',
  '/about-us',
  '/team',
  '/history',
  '/careers',
  '/faq',
  '/portfolio',
  '/service',
  '/blog',
  '/contact',
  '/energy-storage',
  '/repowering',
  '/solar-system-carport',
  '/how-it-works',
  '/media',
  '/investors',
  '/impressum',
  '/agb',
  '/privacy-policy',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const pathname of PUBLIC_PATHS) {
    const url = buildCanonicalUrl({
      pathname,
      locale: siteConfig.defaultLocale as SiteLocale,
    })
    entries.push({
      url,
      lastModified: now,
      changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
      priority: pathname === '/' ? 1 : 0.7,
      alternates: {
        languages: buildHreflangAlternates(pathname),
      },
    })
  }

  const blogPosts = await fetchAllBlogPosts()
  for (const post of blogPosts) {
    const url = `${siteConfig.url}/blog/${post.slug}`
    entries.push({
      url,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}

async function fetchAllBlogPosts() {
  try {
    const result = await blogService.listPublished(1, 1000)
    return result.data ?? []
  } catch {
    return []
  }
}
