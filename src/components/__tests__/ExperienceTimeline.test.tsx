import { test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.hoisted(() => {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList
  }
  if (typeof window.ResizeObserver !== 'function') {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  }
  if (typeof window.IntersectionObserver !== 'function') {
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    } as unknown as typeof IntersectionObserver
  }
})
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import ExperienceTimeline from '../ExperienceTimeline'
import deMessages from '../../../messages/de.json'
import enMessages from '../../../messages/en.json'

test('renders four experience milestones with DE content', () => {
  render(
    <NextIntlClientProvider locale="de" messages={deMessages as unknown as AbstractIntlMessages}>
      <ExperienceTimeline />
    </NextIntlClientProvider>
  )
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Erfahrung seit 2008.')
  expect(screen.getByText(/erste Solaranlage/)).toBeInTheDocument()
  expect(screen.getByText(/Erfahrung in Solar und Energie/)).toBeInTheDocument()
  expect(screen.getByText(/gründet die Free State AG in Schaffhausen/)).toBeInTheDocument()
  expect(screen.getByText(/19 Deutschschweizer Kantonen/)).toBeInTheDocument()
})

test('renders EN content when locale is en', () => {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages as unknown as AbstractIntlMessages}>
      <ExperienceTimeline />
    </NextIntlClientProvider>
  )
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
  expect(screen.getByText(/first solar system/i)).toBeInTheDocument()
  expect(screen.getByText(/founds Free State AG in Schaffhausen/i)).toBeInTheDocument()
  expect(screen.getByText(/19 German-speaking Swiss cantons/i)).toBeInTheDocument()
})
