import catalog from '@/data/products/catalog.json'
import type { PublicProduct } from '@/services/product.service'

// Static product knowledge generated from the research spec files by
// 3d-work/specs/export_frontend.py. The database carries the media URLs and the package
// membership, these files carry the sourced technical data in four languages.

export type ProductCategory = 'panel' | 'inverter' | 'battery' | 'ems' | 'meter' | 'ev_charger'
export type SpecLocale = 'de' | 'en' | 'fr' | 'it'

export interface SpecRow {
  key: string
  label: string
  value: string
}

export interface SpecGroup {
  key: string
  label: string
  rows: SpecRow[]
}

export interface ProductSpec {
  slug: string
  category: ProductCategory
  manufacturer: string
  model: string
  displayName: string
  dbName: string
  summary: string
  keyFacts: SpecRow[]
  groups: SpecGroup[]
  certifications: string[]
  datasheetUrl: string | null
  manualUrl: string | null
  dimensionsMm: [number, number, number] | null
  weightKg: number | null
  warrantyYears: number | null
  warrantyExtendableToYears: number | null
  unresolvedCount: number
}

export interface CatalogModel {
  id: string
  glbFile: string
  posterFile: string
  extentMm: [number, number, number]
  radiusM: number
  orbit: string
  skus: string[]
}

interface CatalogFile {
  camera: { theta: string; phi: string; fov: string }
  models: CatalogModel[]
  bySlug: Record<
    string,
    { modelId: string; dbName: string; table: string; category: ProductCategory; manufacturer: string; displayName: string; packages: string[] }
  >
  byDbName: Record<string, string>
  categories: Record<ProductCategory, Record<SpecLocale, string>>
}

const CATALOG = catalog as unknown as CatalogFile

/** Every product the page can show, merged from the API row and the static spec. */
export interface CatalogProduct {
  slug: string
  category: ProductCategory
  api: PublicProduct
  spec: ProductSpec | null
  orbit: string
  fieldOfView: string
}

export const CATEGORY_ORDER: ProductCategory[] = ['panel', 'inverter', 'battery', 'ems', 'meter', 'ev_charger']

export function categoryLabel(category: ProductCategory, locale: SpecLocale): string {
  return CATALOG.categories[category]?.[locale] ?? CATALOG.categories[category]?.de ?? category
}

const TYPE_TO_CATEGORY: Record<PublicProduct['equipmentType'], ProductCategory> = {
  SOLAR_PANEL: 'panel',
  INVERTER: 'inverter',
  BATTERY: 'battery',
  ENERGY_MANAGEMENT_SYSTEM: 'ems',
  EV_CHARGER: 'ev_charger',
}

export function slugForProduct(product: PublicProduct): string {
  const known = CATALOG.byDbName[product.nameEn]
  if (known) return known
  return `${product.manufacturerCode}-${product.modelNumber}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function loadSpecs(locale: SpecLocale): Promise<Record<string, ProductSpec>> {
  switch (locale) {
    case 'en':
      return (await import('@/data/products/specs.en.json')).default as unknown as Record<string, ProductSpec>
    case 'fr':
      return (await import('@/data/products/specs.fr.json')).default as unknown as Record<string, ProductSpec>
    case 'it':
      return (await import('@/data/products/specs.it.json')).default as unknown as Record<string, ProductSpec>
    default:
      return (await import('@/data/products/specs.de.json')).default as unknown as Record<string, ProductSpec>
  }
}

export function cameraFor(slug: string): { orbit: string; fieldOfView: string } {
  const entry = CATALOG.bySlug[slug]
  const model = entry ? CATALOG.models.find((m) => m.id === entry.modelId) : undefined
  return { orbit: model?.orbit ?? '-30deg 78deg auto', fieldOfView: CATALOG.camera.fov }
}

export function buildCatalog(products: PublicProduct[], specs: Record<string, ProductSpec>): CatalogProduct[] {
  const items: CatalogProduct[] = products.map((api) => {
    const slug = slugForProduct(api)
    const spec = specs[slug] ?? null
    const category = spec?.category ?? CATALOG.bySlug[slug]?.category ?? TYPE_TO_CATEGORY[api.equipmentType]
    return { slug, category, api, spec, ...cameraFor(slug) }
  })
  items.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.api.manufacturerName.localeCompare(b.api.manufacturerName) ||
      a.api.name.localeCompare(b.api.name)
  )
  return items
}
