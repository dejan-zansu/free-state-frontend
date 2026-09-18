import type { CalculatorPackage } from '@/services/residential-calculator.service'

// Shared package figures for the catalogue card and the package page. Plain module so
// server components can use it too.

export const STROMPREIS_CHF_PER_KWH = 0.18
export const SWISS_AVG_YIELD_KWH_PER_KWP = 950

export function getSystemSpecs(pkg: CalculatorPackage) {
  if (pkg.minCapacityKwp != null && pkg.maxCapacityKwp != null) {
    return {
      minKwp: pkg.minCapacityKwp,
      maxKwp: pkg.maxCapacityKwp,
      minKwh: Math.round(pkg.minCapacityKwp * SWISS_AVG_YIELD_KWH_PER_KWP),
      maxKwh: Math.round(pkg.maxCapacityKwp * SWISS_AVG_YIELD_KWH_PER_KWP),
    }
  }
  const panel = pkg.equipment.find(e => e.equipmentType === 'SOLAR_PANEL')
  const peakKwp = ((panel?.quantity ?? 0) * (panel?.panelWattageW ?? 0)) / 1000
  const annualKwh = Math.round(peakKwp * SWISS_AVG_YIELD_KWH_PER_KWP)
  return {
    minKwp: peakKwp,
    maxKwp: peakKwp,
    minKwh: annualKwh,
    maxKwh: annualKwh,
  }
}

export function getFromPriceChf(pkg: CalculatorPackage): number | null {
  if (pkg.pricePerKwp != null && pkg.minCapacityKwp != null) {
    return Math.round(pkg.pricePerKwp * pkg.minCapacityKwp)
  }
  return pkg.purchasePriceChf ?? null
}
