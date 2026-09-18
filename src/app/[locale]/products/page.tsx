import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import ProductsExplorer, { type ProductListItem } from '@/components/products/ProductsExplorer'
import ProductsHero from '@/components/products/ProductsHero'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildCatalog, loadSpecs, type SpecLocale } from '@/lib/products/catalog'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { productService } from '@/services/product.service'
import { getPathname } from '@/i18n/navigation'

type SearchParams = Promise<{ p?: string | string[] }>

function specLocale(locale: string): SpecLocale {
  return (['de', 'en', 'fr', 'it'] as const).includes(locale as SpecLocale) ? (locale as SpecLocale) : 'de'
}

async function loadPage(locale: string, requested?: string) {
  const lang = specLocale(locale)
  const [products, specs] = await Promise.all([productService.getCatalog(lang), loadSpecs(lang)])
  const catalog = buildCatalog(products, specs)
  const selected = catalog.find((c) => c.slug === requested) ?? catalog[0] ?? null
  return { catalog, selected }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}): Promise<Metadata> {
  const { locale } = await params
  const { p } = await searchParams
  const t = await getTranslations({ locale, namespace: 'seo' })
  const requested = Array.isArray(p) ? p[0] : p
  let title = t('products.title') || ''
  let description = t('products.description') || ''
  let ogImage: { url: string; width: number; height: number; alt: string } | undefined
  if (requested) {
    const { selected } = await loadPage(locale, requested)
    if (selected && selected.slug === requested) {
      const name = selected.spec?.displayName ?? selected.api.name
      title = t('products.productTitle', { name })
      const summary = selected.spec?.summary
      if (summary) description = summary.length > 155 ? `${summary.slice(0, 152).trimEnd()}...` : summary
      if (selected.api.modelPosterUrl) {
        ogImage = { url: selected.api.modelPosterUrl, width: 1024, height: 1024, alt: name }
      }
    }
  }
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/products',
    title,
    description,
    ...(ogImage && { ogImage }),
  })
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: SearchParams
}) {
  const { locale } = await params
  const { p } = await searchParams
  const requested = Array.isArray(p) ? p[0] : p
  const { catalog, selected } = await loadPage(locale, requested)
  const t = await getTranslations('products')

  const list: ProductListItem[] = catalog.map((c) => ({
    slug: c.slug,
    category: c.category,
    name: c.spec?.displayName ?? c.api.name,
    manufacturerName: c.api.manufacturerName,
    posterUrl: c.api.modelPosterUrl,
    imageUrl: c.api.imageUrl,
    packageCount: c.api.packages.length,
    hasModel: Boolean(c.api.modelUrl),
  }))

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: t('hero.title'),
    itemListElement: catalog.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${siteConfig.url}${getPathname({ locale: locale as SiteLocale, href: { pathname: '/products', query: { p: c.slug } } })}`,
      item: {
        '@type': 'Product',
        name: c.spec?.displayName ?? c.api.name,
        brand: { '@type': 'Brand', name: c.api.manufacturerName },
        ...(c.api.modelPosterUrl && { image: c.api.modelPosterUrl }),
        ...(c.spec?.summary && { description: c.spec.summary }),
      },
    })),
  }

  return (
    <>
      <JsonLd data={itemList} />
      <ProductsHero productCount={catalog.length} />
      {selected ? (
        <ProductsExplorer products={list} selected={selected} />
      ) : (
        <section className="container mx-auto max-w-[1290px] px-4 py-20 text-center text-base text-pine/70">
          {t('explorer.empty')}
        </section>
      )}
      <CheckSolarPotentialCTA />
    </>
  )
}
