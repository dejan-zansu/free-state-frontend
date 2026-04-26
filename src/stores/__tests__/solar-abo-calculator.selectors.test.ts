import { describe, it, expect, beforeEach } from 'vitest'
import { useSolarAboCalculatorStore } from '../solar-abo-calculator.store'

describe('Solar-Direct financial selectors', () => {
  beforeEach(() => {
    useSolarAboCalculatorStore.getState().reset()
  })

  it('getEstimatedNetPrice = gross − subsidy', () => {
    const s = useSolarAboCalculatorStore.getState()
    const net = s.getEstimatedNetPrice({ purchasePriceChf: 25000 } as any, 3500)
    expect(net).toBe(21500)
  })

  it('getEstimatedNetPrice clamps to 0 when subsidy exceeds gross', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.getEstimatedNetPrice({ purchasePriceChf: 1000 } as any, 5000)).toBe(0)
  })

  it('getEstimatedNetPrice returns 0 when purchasePriceChf is null', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.getEstimatedNetPrice({ purchasePriceChf: null } as any, 0)).toBe(0)
  })

  it('getPaybackYears = net / annualSavings', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.getPaybackYears(20000, 2000)).toBe(10)
  })

  it('getPaybackYears returns Infinity when annualSavings is 0', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.getPaybackYears(20000, 0)).toBe(Infinity)
  })

  it('getLifetimeSavings25y = annualSavings × 25 − net', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.getLifetimeSavings25y(2000, 20000)).toBe(30000)
  })
})
