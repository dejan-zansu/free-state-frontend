import { blogService } from '@/services/blog.service'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import type { AdminBlogPost } from '@/types/admin'

export const revalidate = 600

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function pickTranslation(post: AdminBlogPost, locale: string) {
  return (
    post.translations.find(t => t.language === locale) ||
    post.translations.find(t => t.language === 'de') ||
    post.translations[0]
  )
}

async function fetchAllPosts() {
  const PAGE_SIZE = 100
  const posts: AdminBlogPost[] = []
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
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const activeLocale = (siteConfig.locales as readonly string[]).includes(locale)
    ? (locale as SiteLocale)
    : (siteConfig.defaultLocale as SiteLocale)

  const posts = await fetchAllPosts()
  const channelTitle =
    activeLocale === 'de'
      ? 'Free State AG Blog'
      : `Free State AG Blog (${activeLocale.toUpperCase()})`
  const channelLink = `${siteConfig.url}/${activeLocale}/blog`
  const channelDescription =
    activeLocale === 'de'
      ? 'Aktuelles rund um Solaranlagen, Batteriespeicher, Wärmepumpen und Förderung in der Schweiz.'
      : 'News and analysis on solar, storage, heat pumps and subsidies in Switzerland.'
  const buildDate = new Date().toUTCString()

  const items = posts
    .map(post => {
      const tr = pickTranslation(post, activeLocale)
      if (!tr) return null
      const link = `${siteConfig.url}/${activeLocale}/blog/${post.slug}`
      const pubDate = new Date(
        post.publishedAt ?? post.updatedAt ?? Date.now()
      ).toUTCString()
      const description = tr.excerpt ?? tr.title
      const enclosure = post.coverImageUrl
        ? `<enclosure url="${escapeXml(post.coverImageUrl.startsWith('http') ? post.coverImageUrl : `${siteConfig.url}${post.coverImageUrl}`)}" type="image/jpeg" />`
        : ''
      return `    <item>
      <title>${escapeXml(tr.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${enclosure}
    </item>`
    })
    .filter(Boolean)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>${activeLocale}-CH</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteConfig.url}/${activeLocale}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  })
}
