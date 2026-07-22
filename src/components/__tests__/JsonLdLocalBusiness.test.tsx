import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLdLocalBusiness } from '../seo/JsonLdLocalBusiness'

test('renders SolarEnergyContractor JSON-LD for all three locations', () => {
  const { container } = render(<JsonLdLocalBusiness />)
  const script = container.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  const json = JSON.parse(script!.innerHTML)
  expect(json).toHaveLength(3)
  const [hq, ...branches] = json
  expect(hq['@type']).toBe('SolarEnergyContractor')
  expect(hq.address.addressLocality).toBe('Schaffhausen')
  expect(hq.geo.latitude).toBeCloseTo(47.7224, 3)
  expect(hq.areaServed).toHaveLength(19)
  expect(hq.openingHoursSpecification[0].dayOfWeek).toContain('Monday')
  const localities = branches.map(
    (b: { address: { addressLocality: string } }) => b.address.addressLocality
  )
  expect(localities).toContain('Zürich')
  expect(localities).toContain('St. Gallen')
  for (const branch of branches) {
    expect(branch['@type']).toBe('SolarEnergyContractor')
    expect(branch.parentOrganization.name).toBe('Free State AG')
    expect(branch.geo.latitude).toBeGreaterThan(0)
  }
})
