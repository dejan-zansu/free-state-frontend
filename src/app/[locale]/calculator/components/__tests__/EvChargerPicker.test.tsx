import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EvChargerPicker from '../EvChargerPicker'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import type { PublicEvCharger } from '@/services/residential-calculator.service'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, string | number>) => {
    if (!vars) return key
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      key,
    )
  },
  useLocale: () => 'de',
}))

const FAKE_CHARGER: PublicEvCharger = {
  id: 'c1',
  manufacturerCode: 'HUAWEI',
  manufacturerName: 'Huawei',
  modelNumber: 'FCP7-AC',
  series: null,
  imageUrl: null,
  type: 'AC',
  ratedPowerKw: 7.4,
  maxPowerKw: null,
  connectorTypes: 'Type 2',
  numberOfOutlets: 1,
  hasRfid: false,
  hasAppControl: true,
  hasLoadBalancing: false,
  warrantyYears: 3,
  priceChf: 1290,
  displayName: 'Huawei FCP 7kW',
  description: null,
  keyFeatures: null,
}

describe('EvChargerPicker', () => {
  beforeEach(() => {
    useSolarAboCalculatorStore.getState().reset()
  })

  it('renders the offered charger when prop is non-null', () => {
    render(<EvChargerPicker charger={FAKE_CHARGER} />)
    expect(screen.getByText('Huawei FCP 7kW')).toBeInTheDocument()
    expect(screen.getByText(/CHF/)).toBeInTheDocument()
  })

  it('renders nothing when no charger is offered', () => {
    const { container } = render(<EvChargerPicker charger={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('clicking the card adds the charger to store', async () => {
    render(<EvChargerPicker charger={FAKE_CHARGER} />)
    const button = screen.getByRole('button', { name: /Huawei FCP 7kW/i })
    await userEvent.click(button)
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBe('c1')
    expect(s.selectedEvChargerPriceChf).toBe(1290)
  })

  it('clicking again clears the selection', async () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 1290)
    render(<EvChargerPicker charger={FAKE_CHARGER} />)
    const button = screen.getByRole('button', { name: /Huawei FCP 7kW/i })
    await userEvent.click(button)
    expect(useSolarAboCalculatorStore.getState().selectedEvChargerId).toBeNull()
  })

  it('aria-pressed reflects store selection state', () => {
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 1290)
    render(<EvChargerPicker charger={FAKE_CHARGER} />)
    expect(screen.getByRole('button', { name: /Huawei FCP 7kW/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
