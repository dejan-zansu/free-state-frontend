import { describe, expect, it } from 'vitest'
import {
  SOLAR_MODELS,
  SOLAR_MODEL_KEYS,
  calculatorHref,
  isPackageCode,
  isSolarModelKey,
} from '../solar-models'
import { lowestPackagePriceChf } from '../pricing/solar-direct-from-price'

describe('solar models', () => {
  it('lists SolarFree first and as the only featured model', () => {
    expect(SOLAR_MODEL_KEYS[0]).toBe('solar-free')
    expect(
      SOLAR_MODEL_KEYS.filter(model => SOLAR_MODELS[model].featured)
    ).toEqual(['solar-free'])
  })

  it('includes service and insurance only in SolarFree', () => {
    expect(SOLAR_MODELS['solar-free'].serviceIncluded).toBe(true)
    expect(SOLAR_MODELS['solar-abo'].serviceIncluded).toBe(false)
    expect(SOLAR_MODELS['solar-direct'].serviceIncluded).toBe(false)
  })

  it('gives every model its own lead source', () => {
    expect(SOLAR_MODELS['solar-abo'].quoteSource).toBe('SOLAR_ABO')
    expect(
      new Set(SOLAR_MODEL_KEYS.map(model => SOLAR_MODELS[model].quoteSource))
        .size
    ).toBe(3)
  })

  it('builds calculator links with the model and an optional package', () => {
    expect(calculatorHref('solar-free')).toBe('/calculator?model=solar-free')
    expect(calculatorHref('solar-direct', 'SOLARABO_M_HUAWEI')).toBe(
      '/calculator?model=solar-direct&package=SOLARABO_M_HUAWEI'
    )
    expect(calculatorHref('solar-abo', 'bad code <script>')).toBe(
      '/calculator?model=solar-abo'
    )
  })

  it('validates model keys and package codes', () => {
    expect(isSolarModelKey('solar-abo')).toBe(true)
    expect(isSolarModelKey('solar')).toBe(false)
    expect(isPackageCode('SOLARFREE_S_SOFAR')).toBe(true)
    expect(isPackageCode('a b')).toBe(false)
    expect(isPackageCode(null)).toBe(false)
  })

  it('finds the lowest package price', () => {
    expect(
      lowestPackagePriceChf([
        { pricePerKwp: 2800, minCapacityKwp: 4, purchasePriceChf: null },
        { pricePerKwp: 2500, minCapacityKwp: 4, purchasePriceChf: null },
        { pricePerKwp: null, minCapacityKwp: null, purchasePriceChf: 14500 },
      ])
    ).toBe(10000)
    expect(lowestPackagePriceChf([])).toBeNull()
  })
})
