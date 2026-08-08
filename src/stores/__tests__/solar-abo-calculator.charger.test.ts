import { describe, it, expect, beforeEach } from 'vitest'
import { useSolarAboCalculatorStore } from '../solar-abo-calculator.store'

describe('solar-abo-calculator store — EV charger', () => {
  beforeEach(() => {
    useSolarAboCalculatorStore.getState().reset()
  })

  it('starts with no charger selected', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBeNull()
    expect(s.selectedEvChargerPriceChf).toBeNull()
    expect(s.selectedEvChargerQuantity).toBe(1)
  })

  it('setSelectedEvCharger sets price and id', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('charger-1', 1500)
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBe('charger-1')
    expect(s.selectedEvChargerPriceChf).toBe(1500)
    expect(s.selectedEvChargerQuantity).toBe(1)
  })

  it('clearEvCharger removes the selection', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 800)
    useSolarAboCalculatorStore.getState().clearEvCharger()
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBeNull()
    expect(s.selectedEvChargerPriceChf).toBeNull()
  })

  it('reset clears charger state', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 1500)
    useSolarAboCalculatorStore.getState().reset()
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBeNull()
    expect(s.selectedEvChargerPriceChf).toBeNull()
  })
})
