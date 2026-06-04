import { describe, it, expect, beforeEach } from 'vitest'
import { useSolarAboCalculatorStore } from '../solar-abo-calculator.store'

describe('SolarAbo pricing selectors', () => {
  beforeEach(() => {
    useSolarAboCalculatorStore.getState().reset()
  })

  it('getAboTotalChf applies the 1.35 uplift to the package purchase price', () => {
    useSolarAboCalculatorStore.setState({
      solarModel: 'solar-abo',
      selectedPackagePurchasePriceChf: 41500,
    })
    expect(useSolarAboCalculatorStore.getState().getAboTotalChf()).toBe(56025)
  })

  it('getAboMonthlyChf divides the uplifted total by 300 months', () => {
    useSolarAboCalculatorStore.setState({
      solarModel: 'solar-abo',
      selectedPackagePurchasePriceChf: 41500,
    })
    expect(useSolarAboCalculatorStore.getState().getAboMonthlyChf()).toBe(187)
  })

  it('getAboTotalChf folds the EV charger into the financed base at the same uplift', () => {
    useSolarAboCalculatorStore.setState({
      solarModel: 'solar-abo',
      selectedPackagePurchasePriceChf: 40000,
      selectedEvChargerPriceChf: 2000,
      selectedEvChargerQuantity: 1,
    })
    expect(useSolarAboCalculatorStore.getState().getAboTotalChf()).toBe(56700)
  })

  it('returns 0 when no package is selected', () => {
    expect(useSolarAboCalculatorStore.getState().getAboTotalChf()).toBe(0)
    expect(useSolarAboCalculatorStore.getState().getAboMonthlyChf()).toBe(0)
  })
})
