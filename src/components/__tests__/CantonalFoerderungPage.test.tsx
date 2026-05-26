import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import { FOERDERUNG_CANTONS } from '../../data/foerderung-cantons'
import { CantonalFoerderungPage } from '../CantonalFoerderungPage'
import deMessages from '../../../messages/de.json'

test('renders an H1 with the canton name for each seeded canton', () => {
  for (const c of FOERDERUNG_CANTONS) {
    const { unmount } = render(
      <NextIntlClientProvider
        locale="de"
        messages={deMessages as unknown as AbstractIntlMessages}
      >
        <CantonalFoerderungPage canton={c} />
      </NextIntlClientProvider>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(c.name)
    unmount()
  }
})

test('emits FAQPage JSON-LD with 3 questions', () => {
  const ag = FOERDERUNG_CANTONS.find(c => c.code === 'AG')!
  render(
    <NextIntlClientProvider
      locale="de"
      messages={deMessages as unknown as AbstractIntlMessages}
    >
      <CantonalFoerderungPage canton={ag} />
    </NextIntlClientProvider>
  )
  const ldScript = document.querySelector('script[type="application/ld+json"]')
  expect(ldScript).not.toBeNull()
  const json = JSON.parse(ldScript!.innerHTML)
  expect(json['@type']).toBe('FAQPage')
  expect(json.mainEntity).toHaveLength(3)
})
