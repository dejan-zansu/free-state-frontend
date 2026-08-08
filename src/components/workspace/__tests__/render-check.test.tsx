import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import deMessages from '../../../../messages/de.json'
import enMessages from '../../../../messages/en.json'
import frMessages from '../../../../messages/fr.json'
import itMessages from '../../../../messages/it.json'
import { ModelPricePanel } from '../ModelPricePanel'
import { WorkspaceFacts } from '../WorkspaceFacts'
import { ModelComparison } from '../ModelComparison'
import type { WorkspacePayload } from '@/services/customer-portal.service'

const MESSAGES: Record<string, unknown> = {
  de: deMessages,
  en: enMessages,
  fr: frMessages,
  it: itMessages,
}

function payload(overrides: Record<string, unknown> = {}): WorkspacePayload {
  return {
    project: {
      id: 'p1',
      address: 'Musterstrasse 1, 8200 Schaffhausen',
      postalCode: '8200',
      status: 'ACTIVE',
      selectedPackage: 'PKG',
      createdAt: '2026-08-01T00:00:00.000Z',
      isPropertyOwner: true,
    },
    calculation: {
      solarModel: 'solar-direct',
      ppaDiscountPercent: null,
      systemSizeKwp: 10,
      panelCount: 24,
      annualProductionKwh: 9500,
      monthlyProductionKwh: [],
      selfConsumptionRate: 0.35,
      annualConsumptionKwh: 4400,
      consumptionOverrideKwh: null,
      roofImageUrl: null,
      householdSize: null,
      devices: null,
      hasHeatingHeatPump: null,
      carbonOffsetKg: 1200,
      electricityTariffRpKwh: null,
      feedInTariffRpKwh: null,
    },
    package: null,
    packageRetired: false,
    evCharger: null,
    rates: { subsidy: null, feedIn: null, electricityChfPerKwh: 0.277 },
    financials: {
      solarModel: 'solar-direct',
      evChargerTotalChf: 0,
      grossPriceChf: 31400,
      netPriceChf: 24800,
      subsidiesChf: 6600,
      annualSavingsChf: 1840,
      paybackYears: 13.478,
      lifetimeSavings25yChf: 21200,
      aboTermMonths: 300,
      aboUpliftFactor: 1.35,
    },
    contract: null,
    conversionStatus: 'calculation_complete',
    offerRequestedAt: null,
    offer: {
      requested: false,
      sentAt: null,
      configChanged: false,
      canReoffer: true,
      cooldownUntil: null,
    },
    milestones: [],
    ...overrides,
  } as WorkspacePayload
}

function mount(locale: string, node: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale] as never}>
      {node}
    </NextIntlClientProvider>,
  )
}

const LOCALES = ['de', 'en', 'fr', 'it']

describe('workspace money block', () => {
  it('leads with the net price on SolarDirect', () => {
    mount('de', <ModelPricePanel data={payload()} />)
    expect(screen.getByText("CHF 24'800")).toBeInTheDocument()
    expect(screen.getByText("CHF 31'400")).toBeInTheDocument()
    expect(screen.getByText("− CHF 6'600")).toBeInTheDocument()
    expect(screen.getByText('13.5 Jahre')).toBeInTheDocument()
  })

  it('falls back to the gross price when the subsidy is unavailable', () => {
    mount(
      'de',
      <ModelPricePanel
        data={payload({
          financials: { ...payload().financials, subsidiesChf: undefined, netPriceChf: 31400 },
        })}
      />,
    )
    expect(screen.getByText('Ihr Kaufpreis')).toBeInTheDocument()
    expect(screen.queryByText(/CHF 0/)).not.toBeInTheDocument()
  })

  it('shows CHF 0 and the discount on SolarFree', () => {
    mount(
      'de',
      <ModelPricePanel
        data={payload({
          financials: {
            ...payload().financials,
            solarModel: 'solar-free',
            grossPriceChf: 0,
            netPriceChf: 0,
            subsidiesChf: undefined,
            ppaDiscountPercent: 30,
            contractTermYears: 35,
            annualSavingsChf: 820,
          },
        })}
      />,
    )
    expect(screen.getByText('CHF 0')).toBeInTheDocument()
    expect(screen.getByText('bis zu 30 %')).toBeInTheDocument()
    expect(screen.getByText('27.7 Rp/kWh')).toBeInTheDocument()
    expect(screen.getByText('Nach 35 Jahren gehört die Anlage Ihnen.')).toBeInTheDocument()
  })

  it('renders no CHF figure at all on SolarAbo', () => {
    const { container } = mount(
      'de',
      <ModelPricePanel
        data={payload({ financials: { ...payload().financials, solarModel: 'solar-abo' } })}
      />,
    )
    expect(container.textContent).not.toMatch(/CHF/)
    expect(container.textContent).not.toMatch(/\d+\s*\/\s*(Mt|Monat)/)
    expect(screen.getAllByText(/Monatsraten über 25 Jahre/).length).toBeGreaterThan(0)
  })

  it.each(LOCALES)('renders every model in %s without a missing key', locale => {
    for (const model of ['solar-direct', 'solar-free', 'solar-abo'] as const) {
      const { container, unmount } = mount(
        locale,
        <ModelPricePanel
          data={payload({ financials: { ...payload().financials, solarModel: model } })}
        />,
      )
      expect(container.textContent).not.toMatch(/dashboard\.workspace/)
      unmount()
    }
  })
})

describe('workspace facts', () => {
  it('drops the module count when panelCount is null', () => {
    const { container } = mount(
      'de',
      <WorkspaceFacts data={payload({ calculation: { ...payload().calculation, panelCount: null } })} />,
    )
    expect(container.textContent).toMatch(/10 kWp/)
    expect(container.textContent).not.toMatch(/Modulen/)
  })

  it('renders nothing on a zero snapshot', () => {
    const { container } = mount(
      'de',
      <WorkspaceFacts
        data={payload({
          calculation: { ...payload().calculation, systemSizeKwp: 0, annualProductionKwh: 0 },
        })}
      />,
    )
    expect(container.textContent).toBe('')
  })
})

describe('model comparison', () => {
  it.each(LOCALES)('has a SolarAbo column in %s', locale => {
    const { container } = mount(locale, <ModelComparison />)
    expect(container.textContent).not.toMatch(/dashboard\.workspace/)
  })
})
