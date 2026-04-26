import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { AbstractIntlMessages } from 'next-intl'
import enMessages from '@/../messages/en.json'
import { PurchaseFinancialSummary } from '../PurchaseFinancialSummary'

function renderWithIntl(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages as unknown as AbstractIntlMessages}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('PurchaseFinancialSummary', () => {
  it('renders gross / subsidy / net / annual / payback / 25y', () => {
    renderWithIntl(
      <PurchaseFinancialSummary
        grossPriceChf={25000}
        estimatedSubsidyChf={3500}
        estimatedNetPriceChf={21500}
        annualSavingsChf={2000}
        paybackYears={10.75}
        lifetimeSavings25y={28500}
      />,
    )
    expect(screen.getByText(/25,000|25'000|25.000/)).toBeInTheDocument()
    expect(screen.getByText(/3,500|3'500|3.500/)).toBeInTheDocument()
    expect(screen.getByText(/21,500|21'500|21.500/)).toBeInTheDocument()
    expect(screen.getByText(/2,000|2'000|2.000/)).toBeInTheDocument()
    expect(screen.getByText(/10\.[78]/)).toBeInTheDocument()
    expect(screen.getByText(/28,500|28'500|28.500/)).toBeInTheDocument()
  })

  it('hides subsidy line when estimatedSubsidyChf is null and shows fallback note', () => {
    renderWithIntl(
      <PurchaseFinancialSummary
        grossPriceChf={25000}
        estimatedSubsidyChf={null}
        estimatedNetPriceChf={25000}
        annualSavingsChf={2000}
        paybackYears={12.5}
        lifetimeSavings25y={25000}
      />,
    )
    expect(screen.queryByText(/Estimated subsidy/i)).not.toBeInTheDocument()
    expect(screen.getByText(/unavailable|onboarding/i)).toBeInTheDocument()
  })

  it('renders an em-dash placeholder for non-finite payback', () => {
    renderWithIntl(
      <PurchaseFinancialSummary
        grossPriceChf={25000}
        estimatedSubsidyChf={0}
        estimatedNetPriceChf={25000}
        annualSavingsChf={0}
        paybackYears={Infinity}
        lifetimeSavings25y={-25000}
      />,
    )
    expect(screen.getByText(/—|N\/A|∞/)).toBeInTheDocument()
  })
})
