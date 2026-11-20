import type { CalculatorPackage } from '@/services/residential-calculator.service'

export const PACKAGE_SIZES = ['S', 'M', 'L', 'XL'] as const

export type PackageSize = (typeof PACKAGE_SIZES)[number]

export interface PackageGroup {
  key: string
  size: PackageSize | null
  variants: CalculatorPackage[]
}

const SIZE_PATTERN = /(?:^|_)(XL|S|M|L)(?:_|$)/

const BRAND_NAMES: Record<string, string> = {
  HUAWEI: 'Huawei',
  SIGENERGY: 'Sigenergy',
  SOFAR: 'Sofar',
}

export function packageSize(code: string): PackageSize | null {
  const match = SIZE_PATTERN.exec(code.toUpperCase())
  return match ? (match[1] as PackageSize) : null
}

export function packageBrand(code: string): string | null {
  const upper = code.toUpperCase()
  const match = SIZE_PATTERN.exec(upper)
  if (!match) return null
  const rest = upper.slice(match.index + match[0].length)
  const segment = rest.split('_').filter(Boolean)[0]
  if (!segment) return null
  return (
    BRAND_NAMES[segment] ??
    segment.charAt(0) + segment.slice(1).toLowerCase()
  )
}

export function packageDisplayName(code: string): string {
  const size = packageSize(code)
  if (!size) return code
  const brand = packageBrand(code)
  return brand ? `${size} ${brand}` : size
}

const STORAGE_PATTERN =
  /(\d+(?:[.,]\d+)?)(?:\s?[-–]\s?(\d+(?:[.,]\d+)?))?\s?kWh/

export function packageStorageLabel(description: string): string | null {
  const match = STORAGE_PATTERN.exec(description)
  if (!match) return null
  return match[2] ? `${match[1]}–${match[2]} kWh` : `${match[1]} kWh`
}

export function groupPackages(packages: CalculatorPackage[]): PackageGroup[] {
  const groups = new Map<string, PackageGroup>()
  for (const pkg of packages) {
    const size = packageSize(pkg.code)
    const key = size ?? pkg.id
    const group = groups.get(key)
    if (group) group.variants.push(pkg)
    else groups.set(key, { key, size, variants: [pkg] })
  }
  const rank = (group: PackageGroup) =>
    group.size ? PACKAGE_SIZES.indexOf(group.size) : PACKAGE_SIZES.length
  return [...groups.values()].sort((a, b) => rank(a) - rank(b))
}
