import { describe, it, expect, beforeEach } from 'vitest'
import { useSolarAboCalculatorStore } from '../solar-abo-calculator.store'

describe('solar-abo-calculator store — EV charger', () => {
  beforeEach(() => {
    useSolarAboCalculatorStore.getState().reset()
  })

  it('starts with no charger selected and zero contribution', () => {
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBeNull()
    expect(s.selectedEvChargerPriceChf).toBeNull()
    expect(s.selectedEvChargerQuantity).toBe(1)
    expect(s.getEvChargerTotalChf()).toBe(0)
  })

  it('setSelectedEvCharger sets price and id', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('charger-1', 1500)
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBe('charger-1')
    expect(s.selectedEvChargerPriceChf).toBe(1500)
    expect(s.getEvChargerTotalChf()).toBe(1500)
  })

  it('clearEvCharger removes the selection', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 800)
    useSolarAboCalculatorStore.getState().clearEvCharger()
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBeNull()
    expect(s.getEvChargerTotalChf()).toBe(0)
  })

  it('getGrossAmount includes charger total when a purchase package is selected', () => {
    const store = useSolarAboCalculatorStore.getState()
    store.setSelectedPackage('pkg-1', 'HOME', null, 400, 1.95, 30, 35, 0.5, 0.4, 18000, 5)
    store.setSelectedEvCharger('c1', 1500)
    expect(useSolarAboCalculatorStore.getState().getGrossAmount()).toBe(18000 + 1500)
  })

  it('reset clears charger state', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 1500)
    useSolarAboCalculatorStore.getState().reset()
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBeNull()
    expect(s.getEvChargerTotalChf()).toBe(0)
  })
})
