import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import type { ReactNode } from 'react'
import type { CalculatorPackage } from '@/services/residential-calculator.service'
import { groupPackages } from '@/lib/products/package-groups'
import deMessages from '../../../messages/de.json'
import enMessages from '../../../messages/en.json'
import frMessages from '../../../messages/fr.json'
import itMessages from '../../../messages/it.json'

vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string | { pathname: string; params?: Record<string, string> }
    children: ReactNode
  }) => (
    <a
      href={
        typeof href === 'string'
          ? href
          : href.pathname.replace('[code]', href.params?.code ?? '')
      }
      {...rest}
    >
      {children}
    </a>
  ),
}))

import PackageCard from '../order/PackageCard'

const pkg = (overrides: Partial<CalculatorPackage>): CalculatorPackage => ({
  id: 'id-1',
  code: 'SOLARABO_M_HUAWEI',
  name: 'SolarDirect M Huawei',
  description: '9–15 kWp Haushalt mit 10 kWh Huawei Batteriespeicher.',
  features: [],
  highlightedFeature: 'Bestseller',
  imageUrl: null,
  pricePerKwp: 2800,
  currency: 'CHF',
  minCapacityKwp: 9,
  maxCapacityKwp: 15,
  contractTermYears: 25,
  electricitySavingsPercent: 30,
  purchasePriceChf: null,
  installerWarrantyYears: null,
  equipment: [
    {
      equipmentType: 'INVERTER',
      name: 'Huawei SUN2000 12K-MAP0',
      quantity: 1,
      isOptional: false,
    },
  ],
  availableEvCharger: null,
  ...overrides,
})

const group = groupPackages([
  pkg({}),
  pkg({
    id: 'id-2',
    code: 'SOLARABO_M_SIGENERGY',
    name: 'SolarDirect M Sigenergy',
    pricePerKwp: 2300,
    equipment: [
      {
        equipmentType: 'INVERTER',
        name: 'Sigenergy SigenStor EC 12.0 TP',
        quantity: 1,
        isOptional: false,
      },
    ],
  }),
])[0]

const renderCard = (model: 'solar-free' | 'solar-abo' | 'solar-direct') =>
  render(
    <NextIntlClientProvider
      locale="de"
      messages={deMessages as unknown as AbstractIntlMessages}
    >
      <PackageCard group={group} model={model} />
    </NextIntlClientProvider>
  )

describe('PackageCard', () => {
  it('shows the purchase price and carries model and package into the calculator', () => {
    renderCard('solar-direct')
    expect(screen.getByText(/CHF 25.200/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Mit diesem Paket rechnen/ })
    ).toHaveAttribute(
      'href',
      '/calculator?model=solar-direct&package=SOLARABO_M_HUAWEI'
    )
    expect(screen.getByText('10 kWh')).toBeInTheDocument()
    expect(screen.getByText('Bestseller')).toBeInTheDocument()
  })

  it('switches the brand and updates price, equipment and link', () => {
    renderCard('solar-direct')
    fireEvent.click(screen.getByRole('button', { name: 'Sigenergy' }))
    expect(screen.getByText(/CHF 20.700/)).toBeInTheDocument()
    expect(
      screen.getByText('Sigenergy SigenStor EC 12.0 TP')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Mit diesem Paket rechnen/ })
    ).toHaveAttribute(
      'href',
      '/calculator?model=solar-direct&package=SOLARABO_M_SIGENERGY'
    )
  })

  it('shows no investment and the qualified discount for SolarFree', () => {
    renderCard('solar-free')
    expect(screen.getByText('CHF 0')).toBeInTheDocument()
    expect(
      screen.getByText('Solarstrom bis zu 30 % unter dem Netztarif')
    ).toBeInTheDocument()
    expect(screen.queryByText(/0\.18/)).not.toBeInTheDocument()
    expect(screen.queryByText('Huawei SUN2000 12K-MAP0')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Paket im Detail ansehen/ })
    ).not.toBeInTheDocument()
  })

  it('shows no picture when the package has no photo', () => {
    const noPhoto = groupPackages([pkg({ imageUrl: null })])[0]
    render(
      <NextIntlClientProvider
        locale="de"
        messages={deMessages as unknown as AbstractIntlMessages}
      >
        <PackageCard group={noPhoto} model="solar-direct" />
      </NextIntlClientProvider>
    )
    expect(
      screen.queryByRole('img', { name: 'SolarDirect M Huawei' })
    ).not.toBeInTheDocument()
  })

  it('shows no monthly figure for SolarAbo', () => {
    renderCard('solar-abo')
    expect(screen.getByText('Feste Monatsrate')).toBeInTheDocument()
    expect(screen.queryByText(/CHF \d/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Mit diesem Paket rechnen/ })
    ).toHaveAttribute(
      'href',
      '/calculator?model=solar-abo&package=SOLARABO_M_HUAWEI'
    )
  })
})

const flatten = (value: unknown, path = ''): Record<string, string> => {
  if (typeof value === 'string') return { [path]: value }
  if (Array.isArray(value)) {
    return Object.assign(
      {},
      ...value.map((item, index) => flatten(item, `${path}[${index}]`))
    )
  }
  if (value && typeof value === 'object') {
    return Object.assign(
      {},
      ...Object.entries(value).map(([key, item]) =>
        flatten(item, path ? `${path}.${key}` : key)
      )
    )
  }
  return {}
}

describe('model and package copy', () => {
  const locales = { de: deMessages, en: enMessages, fr: frMessages, it: itMessages }
  const namespaces = [
    'solarModels',
    'solarModelPage',
    'commercialSolarFree',
  ] as const

  it('has the same keys in every language', () => {
    for (const namespace of namespaces) {
      const reference = Object.keys(flatten(deMessages[namespace])).sort()
      for (const [locale, messages] of Object.entries(locales)) {
        expect(
          Object.keys(
            flatten((messages as typeof deMessages)[namespace])
          ).sort(),
          `${locale} ${namespace}`
        ).toEqual(reference)
      }
    }
  })

  it('never claims service or insurance for SolarAbo and never the retracted price', () => {
    for (const [locale, messages] of Object.entries(locales)) {
      const typed = messages as typeof deMessages
      const text = JSON.stringify([
        typed.solarModels,
        typed.solarModelPage,
        typed.packageCatalog,
        typed.commercialSolarFree,
        typed.cost.models,
        typed.cost.faq,
      ])
      expect(text, locale).not.toMatch(/0[.,]18|18 Rp|18 ct|18 rappen/i)
      expect(text, locale).not.toMatch(/Rundum-Service inklusive/)
    }
    expect(deMessages.solarModels.abo.values.service).toMatch(
      /^Nicht inbegriffen/
    )
    expect(deMessages.solarModels.direct.values.service).toMatch(
      /^Nicht inbegriffen/
    )
  })
})
