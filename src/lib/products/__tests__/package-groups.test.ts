import { describe, expect, it } from 'vitest'
import type { CalculatorPackage } from '@/services/residential-calculator.service'
import {
  groupPackages,
  packageBrand,
  packageDisplayName,
  packageSize,
  packageStorageLabel,
} from '../package-groups'

const pkg = (code: string): CalculatorPackage =>
  ({ id: `id-${code}`, code }) as CalculatorPackage

describe('package groups', () => {
  it('reads the size from live package codes', () => {
    expect(packageSize('SOLARFREE_S_SOFAR')).toBe('S')
    expect(packageSize('SOLARABO_XL_HUAWEI')).toBe('XL')
    expect(packageSize('SOLARABO_L_SIGENERGY')).toBe('L')
    expect(packageSize('DIRECT_STANDARD')).toBeNull()
    expect(packageSize('HOME')).toBeNull()
  })

  it('reads the brand that follows the size', () => {
    expect(packageBrand('SOLARABO_M_HUAWEI')).toBe('Huawei')
    expect(packageBrand('SOLARABO_M_SIGENERGY')).toBe('Sigenergy')
    expect(packageBrand('SOLARFREE_M_SOFAR')).toBe('Sofar')
    expect(packageBrand('SOLARABO_M_FOXESS')).toBe('Foxess')
    expect(packageBrand('SOLARABO_M')).toBeNull()
    expect(packageBrand('DIRECT_STANDARD')).toBeNull()
  })

  it('builds a display name and falls back to the code', () => {
    expect(packageDisplayName('SOLARABO_M_HUAWEI')).toBe('M Huawei')
    expect(packageDisplayName('SOLARABO_M')).toBe('M')
    expect(packageDisplayName('HOME')).toBe('HOME')
  })

  it('reads the storage size from the description', () => {
    expect(
      packageStorageLabel('9–15 kWp Haushalt mit 10 kWh Huawei Batteriespeicher.')
    ).toBe('10 kWh')
    expect(
      packageStorageLabel('16–20 kWp Haus mit 15-20 kWh Sofar Batteriespeicher.')
    ).toBe('15–20 kWh')
    expect(packageStorageLabel('4–8 kWp ohne Speicher')).toBeNull()
  })

  it('groups brand variants of one size and keeps the size order', () => {
    const groups = groupPackages([
      pkg('SOLARABO_M_HUAWEI'),
      pkg('SOLARABO_S_HUAWEI'),
      pkg('SOLARABO_M_SIGENERGY'),
      pkg('DIRECT_STANDARD'),
      pkg('SOLARABO_XL_HUAWEI'),
    ])
    expect(groups.map(group => group.size)).toEqual(['S', 'M', 'XL', null])
    expect(groups[1].variants.map(variant => variant.code)).toEqual([
      'SOLARABO_M_HUAWEI',
      'SOLARABO_M_SIGENERGY',
    ])
  })
})
