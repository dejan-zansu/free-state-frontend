import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound, permanentRedirect } from 'next/navigation'

import CheckSolarPotentialCTA from '@/components/CheckSolarPotentialCTA'
import PackageDetails from '@/components/packages/PackageDetails'
import PackageFaq from '@/components/packages/PackageFaq'
import PackageOverview from '@/components/packages/PackageOverview'
import { PACKAGE_FAQ_KEYS, type PackageComponentView } from '@/components/packages/types'
import { JsonLd } from '@/components/seo/JsonLd'
import { cameraFor, loadSpecs, slugForProduct, type SpecLocale } from '@/lib/products/catalog'
import { getFromPriceChf, getSystemSpecs } from '@/lib/products/package-math'
import { matchesPackageSlug, packageNameToSlug } from '@/lib/products/package-slug'
import { getPathname } from '@/i18n/navigation'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import { siteConfig, type SiteLocale } from '@/lib/seo/site-config'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'
import type { CalculatorPackage } from '@/services/residential-calculator.service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Params = Promise<{ locale: string; code: string }>

function specLocale(locale: string): SpecLocale {
  return (['de', 'en', 'fr', 'it'] as const).includes(locale as SpecLocale) ? (locale as SpecLocale) : 'de'
}

async function fetchPackages(lang: string): Promise<CalculatorPackage[]> {
  const res = await fetch(`${API_URL}/api/equipment/packages?lang=${encodeURIComponent(lang)}`, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const json = (await res.json()) as { data: CalculatorPackage[] }
  return json.data ?? []
}

function brandLabel(code: string): string | null {
  const c = code.toUpperCase()
  if (c.endsWith('_HUAWEI')) return 'Huawei'
  if (c.endsWith('_SIGENERGY')) return 'Sigenergy'
  if (c.endsWith('_SOFAR')) return 'SOFAR'
  return null
}

function modelsOf(pkg: CalculatorPackage): ('solar-free' | 'solar-direct' | 'solar-abo')[] {
  const supported = pkg.supportedSolarModels ?? []
  const out: ('solar-free' | 'solar-direct' | 'solar-abo')[] = []
  if (supported.includes('SOLAR_FREE')) out.push('solar-free')
  if (supported.includes('SOLAR_DIRECT')) out.push('solar-direct')
  if (supported.includes('SOLAR_ABO')) out.push('solar-abo')
  return out.length ? out : ['solar-direct']
}

async function loadPackage(locale: string, slug: string) {
  const lang = specLocale(locale)
  const [packages, specs] = await Promise.all([fetchPackages(lang), loadSpecs(lang)])
  const pkg = packages.find((p) => matchesPackageSlug(p, slug)) ?? null
  return { pkg, specs }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, code } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const { pkg } = await loadPackage(locale, code)
  if (!pkg) return generateSEOMetadata({ locale: locale as SiteLocale, pathname: '/products', title: t('products.title') || '', description: t('products.description') || '' })
  // The stored package description is one short line. Name and a closing
  // sentence bring it to the length a search snippet can show.
  const full = pkg.description
    ? `${pkg.name}: ${pkg.description} ${t('packages.descriptionSuffix')}`
    : t('packages.description')
  const description =
    full.length > 160 ? `${full.slice(0, 157).trimEnd()}...` : full
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/packages/${packageNameToSlug(pkg.name)}`,
    title: t('packages.title', { name: pkg.name }),
    description,
    ...(pkg.imageUrl && { ogImage: { url: pkg.imageUrl, width: 1200, height: 900, alt: pkg.name } }),
  })
}

export default async function PackagePage({ params }: { params: Params }) {
  const { locale, code } = await params
  const { pkg, specs } = await loadPackage(locale, code)
  if (!pkg) notFound()
  // The first version of the page used the internal code as the slug. Send those URLs to the
  // name based one, which is what the card and the sitemap link.
  const nameSlug = packageNameToSlug(pkg.name)
  if (code.toLowerCase() !== nameSlug) {
    permanentRedirect(getPathname({ locale: locale as SiteLocale, href: { pathname: '/packages/[code]', params: { code: nameSlug } } }))
  }
  const t = await getTranslations('packagePage')

  const components: PackageComponentView[] = pkg.equipment
    .filter((item) => item.name)
    .map((item) => {
      const slug = item.nameEn
        ? slugForProduct({ nameEn: item.nameEn, manufacturerCode: '', modelNumber: item.name } as Parameters<typeof slugForProduct>[0])
        : null
      const spec = slug ? (specs[slug] ?? null) : null
      return {
        key: `${item.equipmentType}:${item.equipmentId ?? item.name}`,
        equipmentType: item.equipmentType,
        name: item.name,
        quantity: item.quantity,
        isOptional: item.isOptional,
        imageUrl: item.imageUrl ?? null,
        modelUrl: item.modelUrl ?? null,
        modelPosterUrl: item.modelPosterUrl ?? null,
        slug: spec ? slug : null,
        spec,
        ...cameraFor(slug ?? ''),
      }
    })

  const c = pkg.availableEvCharger
  if (c) {
    const slug = c.nameEn
      ? slugForProduct({ nameEn: c.nameEn, manufacturerCode: c.manufacturerCode, modelNumber: c.modelNumber } as Parameters<typeof slugForProduct>[0])
      : null
    const spec = slug ? (specs[slug] ?? null) : null
    components.push({
      key: `EV_CHARGER:${c.id}`,
      equipmentType: 'EV_CHARGER',
      name: c.displayName,
      quantity: 1,
      isOptional: true,
      imageUrl: c.imageUrl ?? null,
      modelUrl: c.modelUrl ?? null,
      modelPosterUrl: c.modelPosterUrl ?? null,
      slug: spec ? slug : null,
      spec,
      ...cameraFor(slug ?? ''),
    })
  }
  const chargerPrice = c?.priceChf != null ? c.priceChf.toLocaleString(locale === 'en' ? 'de-CH' : `${locale}-CH`) : null

  const system = getSystemSpecs(pkg)
  const fromPrice = getFromPriceChf(pkg)
  const models = modelsOf(pkg)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pkg.name,
    description: pkg.description || undefined,
    ...(pkg.imageUrl && { image: pkg.imageUrl }),
    brand: { '@type': 'Brand', name: siteConfig.name },
    isRelatedTo: components.map((c) => ({ '@type': 'Product', name: c.spec?.displayName ?? c.name })),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd
        data={buildFAQPageJsonLd(
          PACKAGE_FAQ_KEYS.map((k) => ({ question: t(`faq.items.${k}.question`), answer: t(`faq.items.${k}.answer`) }))
        )}
      />
      <PackageOverview pkg={pkg} brand={brandLabel(pkg.code)} specs={system} fromPrice={fromPrice} models={models} locale={locale} components={components} />
      <PackageDetails components={components} chargerPrice={chargerPrice} />
      <section className="bg-[#F5F6F0]">
        <div className="container mx-auto max-w-[1290px] px-4 py-14 sm:py-20">
          <h2 className="text-3xl font-medium tracking-tight text-pine sm:text-[40px]">{t('included.title')}</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {(['quality', 'app', 'service'] as const).map((k) => (
              <li key={k} className="rounded-[20px] border border-pine/10 bg-white p-6">
                <p className="text-xl font-medium text-pine">{t(`included.${k}.title`)}</p>
                <p className="mt-2 text-base text-pine/75">{t(`included.${k}.desc`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <PackageFaq />
      <CheckSolarPotentialCTA />
    </>
  )
}
