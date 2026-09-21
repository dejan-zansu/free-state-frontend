import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'

type PathnameKey = keyof typeof routing.pathnames

// Posts store internal links as /de/<path>. German is served without a
// prefix, so every one of those links answers with a temporary redirect
// first. Resolve them to the final URL of the reader's locale at render time.
const GERMAN_TO_KEY = new Map<string, PathnameKey>()
for (const [key, value] of Object.entries(routing.pathnames)) {
  const german = typeof value === 'string' ? value : value.de
  if (!german.includes('[')) GERMAN_TO_KEY.set(german, key as PathnameKey)
}

export function localizedHref(path: string, locale: SiteLocale): string | null {
  const prefix = locale === siteConfig.defaultLocale ? '' : `/${locale}`
  if (path.startsWith('/blog/')) return `${prefix}${path}`
  const key =
    path in routing.pathnames
      ? (path as PathnameKey)
      : GERMAN_TO_KEY.get(path)
  if (!key || key.includes('[')) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getPathname({ locale, href: key } as any) as string
}

export function localizeArticleLinks(html: string, locale: SiteLocale): string {
  return html.replace(
    /href="\/de(\/[^"#?]*)([#?][^"]*)?"/g,
    (match, path: string, suffix: string | undefined) => {
      const resolved = localizedHref(path.replace(/\/$/, '') || '/', locale)
      return resolved ? `href="${resolved}${suffix ?? ''}"` : match
    }
  )
}
