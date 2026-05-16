import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JsonLdOrganization } from '../seo/JsonLdOrganization'

test('renders valid Organization JSON-LD with company name and UID', () => {
  const { container } = render(<JsonLdOrganization />)
  const script = container.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  const json = JSON.parse(script!.innerHTML)
  expect(json['@type']).toBe('Organization')
  expect(json.name).toBe('Free State AG')
  expect(json.taxID).toBe('CHE-134.711.335')
  expect(json.address.postalCode).toBe('8207')
  expect(json.address.addressCountry).toBe('CH')
})
