import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import TelemiivaTimeline from '../TelemiivaTimeline'
import deMessages from '../../../messages/de.json'
import enMessages from '../../../messages/en.json'

test('renders four lineage milestones with DE content', () => {
  render(
    <NextIntlClientProvider locale="de" messages={deMessages as unknown as AbstractIntlMessages}>
      <TelemiivaTimeline />
    </NextIntlClientProvider>
  )
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('16 Jahre Erfahrung. Neuer Name.')
  expect(screen.getByText(/Telemiiva GmbH gegründet/)).toBeInTheDocument()
  expect(screen.getByText(/Über 16 Jahre/)).toBeInTheDocument()
  expect(screen.getByText(/gegründet in Schaffhausen/)).toBeInTheDocument()
  expect(screen.getByText(/19 Deutschschweizer Kantonen/)).toBeInTheDocument()
})

test('renders EN content when locale is en', () => {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages as unknown as AbstractIntlMessages}>
      <TelemiivaTimeline />
    </NextIntlClientProvider>
  )
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByText(/Telemiiva GmbH founded/i)).toBeInTheDocument()
  expect(screen.getByText(/Free State AG founded in Schaffhausen/i)).toBeInTheDocument()
  expect(screen.getByText(/19 German-speaking Swiss cantons/i)).toBeInTheDocument()
})
