import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLdLocalBusiness } from '../seo/JsonLdLocalBusiness'

test('renders SolarEnergyContractor JSON-LD with geo and area served', () => {
  const { container } = render(<JsonLdLocalBusiness />)
  const script = container.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  const json = JSON.parse(script!.innerHTML)
  expect(json['@type']).toBe('SolarEnergyContractor')
  expect(json.address.addressLocality).toBe('Schaffhausen')
  expect(json.geo.latitude).toBeCloseTo(47.6981, 3)
  expect(json.areaServed).toHaveLength(19)
  expect(json.openingHoursSpecification[0].dayOfWeek).toContain('Monday')
})
