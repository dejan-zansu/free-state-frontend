import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EvChargerPicker from '../EvChargerPicker'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { evChargerService } from '@/services/ev-charger.service'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'de',
}))

vi.mock('@/services/ev-charger.service', () => ({
  evChargerService: {
    listPublic: vi.fn(),
  },
}))

const FAKE_CHARGERS = [
  {
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
    keyFeatures: ['App control'],
  },
  {
    id: 'c2',
    manufacturerCode: 'GOODWE',
    manufacturerName: 'GoodWe',
    modelNumber: 'HCA-22',
    series: null,
    imageUrl: null,
    type: 'AC',
    ratedPowerKw: 22,
    maxPowerKw: null,
    connectorTypes: 'Type 2',
    numberOfOutlets: 1,
    hasRfid: true,
    hasAppControl: true,
    hasLoadBalancing: true,
    warrantyYears: 5,
    priceChf: 1850,
    displayName: 'GoodWe HCA 22kW',
    description: null,
    keyFeatures: null,
  },
]

describe('EvChargerPicker', () => {
  beforeEach(() => {
    useSolarAboCalculatorStore.getState().reset()
    vi.clearAllMocks()
  })

  it('renders charger cards from API', async () => {
    vi.mocked(evChargerService.listPublic).mockResolvedValue(FAKE_CHARGERS)
    render(<EvChargerPicker />)
    expect(await screen.findByText('Huawei FCP 7kW')).toBeInTheDocument()
    expect(screen.getByText('GoodWe HCA 22kW')).toBeInTheDocument()
  })

  it('hides component when catalog is empty', async () => {
    vi.mocked(evChargerService.listPublic).mockResolvedValue([])
    const { container } = render(<EvChargerPicker />)
    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('selecting a card writes to store', async () => {
    vi.mocked(evChargerService.listPublic).mockResolvedValue(FAKE_CHARGERS)
    render(<EvChargerPicker />)
    const card = await screen.findByRole('button', { name: /Huawei FCP 7kW/i })
    await userEvent.click(card)
    const s = useSolarAboCalculatorStore.getState()
    expect(s.selectedEvChargerId).toBe('c1')
    expect(s.selectedEvChargerPriceChf).toBe(1290)
  })

  it('clicking the selected card again clears selection', async () => {
    vi.mocked(evChargerService.listPublic).mockResolvedValue(FAKE_CHARGERS)
    useSolarAboCalculatorStore.getState().setSelectedEvCharger('c1', 1290)
    render(<EvChargerPicker />)
    const card = await screen.findByRole('button', { name: /Huawei FCP 7kW/i })
    await userEvent.click(card)
    expect(useSolarAboCalculatorStore.getState().selectedEvChargerId).toBeNull()
  })
})
