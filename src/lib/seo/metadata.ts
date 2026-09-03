import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { siteConfig, type SiteLocale } from './site-config'

type PathnameKey = keyof typeof routing.pathnames

type BuildCanonicalArgs = {
  pathname: PathnameKey | string
  locale: SiteLocale
}

function isStaticPathnameKey(pathname: string): pathname is PathnameKey {
  return pathname in routing.pathnames
}

export function buildCanonicalUrl({ pathname, locale }: BuildCanonicalArgs): string {
  let localizedPath: string
  if (isStaticPathnameKey(pathname)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    localizedPath = getPathname({ locale, href: pathname } as any) as string
  } else {
    const prefix =
      locale === siteConfig.defaultLocale ? '' : `/${locale}`
    localizedPath = `${prefix}${pathname}`
  }
  if (localizedPath === '/' && locale === siteConfig.defaultLocale) {
    return `${siteConfig.url}/`
  }
  return `${siteConfig.url}${localizedPath}`
}

export function buildHreflangAlternates(
  pathname: PathnameKey | string,
  availableLocales?: readonly SiteLocale[]
): Record<string, string> {
  const locales =
    availableLocales && availableLocales.length > 0
      ? siteConfig.locales.filter(locale => availableLocales.includes(locale))
      : siteConfig.locales
  const entries: Record<string, string> = {}
  for (const locale of locales) {
    entries[locale] = buildCanonicalUrl({ pathname, locale })
  }
  entries['x-default'] =
    entries[siteConfig.defaultLocale] ?? entries[locales[0]] ?? ''
  return entries
}

type GenerateSEOMetadataArgs = {
  locale: SiteLocale
  pathname: PathnameKey | string
  title: string
  description: string
  ogImage?: { url: string; width?: number; height?: number; alt?: string }
  noIndex?: boolean
  availableLocales?: readonly SiteLocale[]
}

export async function generateSEOMetadata({
  locale,
  pathname,
  title,
  description,
  ogImage,
  noIndex,
  availableLocales,
}: GenerateSEOMetadataArgs): Promise<Metadata> {
  const translated =
    !availableLocales ||
    availableLocales.length === 0 ||
    availableLocales.includes(locale)
  const canonicalLocale = translated ? locale : siteConfig.defaultLocale
  const canonical = buildCanonicalUrl({ pathname, locale: canonicalLocale })
  const languages = buildHreflangAlternates(pathname, availableLocales)
  const resolvedTitle = title || siteConfig.name
  const resolvedDescription = description || siteConfig.description
  const image = ogImage ?? {
    url: `${siteConfig.url}${siteConfig.ogImage.url}`,
    width: siteConfig.ogImage.width,
    height: siteConfig.ogImage.height,
    alt: siteConfig.ogImage.alt,
  }
  const alternateLocale = (
    availableLocales && availableLocales.length > 0
      ? siteConfig.locales.filter(
          l => l !== canonicalLocale && availableLocales.includes(l)
        )
      : siteConfig.locales.filter(l => l !== locale)
  ) as string[]

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonical,
      locale: canonicalLocale,
      alternateLocale,
      siteName: siteConfig.name,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [image.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
