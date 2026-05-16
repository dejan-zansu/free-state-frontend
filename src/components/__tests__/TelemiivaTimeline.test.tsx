import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import { TelemiivaTimeline } from '../TelemiivaTimeline'
import messages from '../../../messages/de.json'

test('renders four lineage milestones', () => {
  render(
    <NextIntlClientProvider locale="de" messages={messages as unknown as AbstractIntlMessages}>
      <TelemiivaTimeline />
    </NextIntlClientProvider>
  )
  expect(screen.getAllByText(/2008/).length).toBeGreaterThan(0)
  expect(screen.getByText(/Telemiiva GmbH/)).toBeInTheDocument()
  expect(screen.getAllByText(/Free State AG/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/16 Jahre/).length).toBeGreaterThan(0)
  expect(screen.getByText(/19 Deutschschweizer Kantone/)).toBeInTheDocument()
})
