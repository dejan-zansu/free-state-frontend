import type { ProductSpec } from '@/lib/products/catalog'

/** One item of a package as the package page shows it: gallery thumbnail, 3D model and specs. */
export interface PackageComponentView {
  key: string
  equipmentType: string
  name: string
  quantity: number
  isOptional: boolean
  imageUrl: string | null
  modelUrl: string | null
  modelPosterUrl: string | null
  slug: string | null
  spec: ProductSpec | null
  orbit: string
  fieldOfView: string
}

export function componentAnchor(key: string): string {
  return `komponente-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

/** FAQ entries of the package page (messages packagePage.faq.items). Lives here so server and client code share it. */
export const PACKAGE_FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const
