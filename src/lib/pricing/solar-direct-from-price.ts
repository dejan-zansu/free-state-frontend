const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const REVALIDATE_SECONDS = 3600

interface PackageRow {
  pricePerKwp: number | null
  minCapacityKwp: number | null
  purchasePriceChf: number | null
}

export function lowestPackagePriceChf(rows: PackageRow[]): number | null {
  const prices = rows
    .map(row =>
      row.pricePerKwp != null && row.minCapacityKwp != null
        ? Math.round(row.pricePerKwp * row.minCapacityKwp)
        : row.purchasePriceChf
    )
    .filter((value): value is number => typeof value === 'number' && value > 0)
  return prices.length > 0 ? Math.min(...prices) : null
}

export async function getSolarDirectFromPriceChf(): Promise<number | null> {
  try {
    const res = await fetch(
      `${API_URL}/api/equipment/packages?lang=de&solarModel=SOLAR_DIRECT`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    )
    if (!res.ok) return null
    const body = (await res.json()) as { data?: PackageRow[] }
    return lowestPackagePriceChf(body.data ?? [])
  } catch {
    return null
  }
}
