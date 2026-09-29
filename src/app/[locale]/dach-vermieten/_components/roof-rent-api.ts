import type { Attribution } from '@/lib/analytics/funnel-events'

// Request and response shapes of the public roof-rent API
// (backend src/controllers/roof-rent.controller.ts and
// src/services/outbound/roof-rent.service.ts, M15). Both calls run in the
// visitor's browser, so the API's per-IP rate limit sees the visitor.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type RoofRentEstimate =
  | {
      status: 'ok'
      address: {
        label: string
        street: string | null
        number: string | null
        postalCode: string | null
        city: string | null
        canton: string | null
      }
      egid: string
      lv95E: number
      lv95N: number
      roofAreaM2: number | null
      kwhYear: number | null
      kwp: number | null
      // Null while the owner has not set the rate (the page then shows kWh only).
      yearlyRentChf: number | null
      tenantSavingChf: number | null
      assumptions: {
        chfPerKwp: number | null
        kwhPerKwp: number | null
        selfConsumption: number | null
        savingRappenPerKwh: number | null
      }
    }
  | { status: 'not_found' | 'has_pv' | 'unavailable' }

export type RoofRentRole = 'owner' | 'manager'

export type RoofRentInquiryBody = {
  company: string
  name: string
  email: string
  phone: string
  // "<Strasse Nr>, <PLZ> <Ort>"
  address: string
  role: RoofRentRole
  privacyConsent: true
  attribution?: Attribution
}

export type EstimateOutcome =
  | { kind: 'result'; estimate: RoofRentEstimate }
  | { kind: 'invalid' | 'rate_limited' | 'error' }

export type InquiryOutcome = 'done' | 'invalid' | 'rate_limited' | 'error'

// The form resolveBuildingEvidence reads on the API.
export const ADDRESS_PATTERN = /^[^,]*\d[^,]*,\s*\d{4}\s+\S.*$/

export async function fetchRoofRentEstimate(
  address: string
): Promise<EstimateOutcome> {
  try {
    const res = await fetch(`${API_URL}/api/public/roof-rent/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })
    if (res.status === 429) return { kind: 'rate_limited' }
    if (res.status === 400) return { kind: 'invalid' }
    if (!res.ok) return { kind: 'error' }
    const json = (await res.json()) as {
      success: boolean
      data?: RoofRentEstimate
    }
    return json.success && json.data
      ? { kind: 'result', estimate: json.data }
      : { kind: 'error' }
  } catch {
    return { kind: 'error' }
  }
}

// A repeat of the same email and address on the same day is accepted
// without a change (200, recorded false) and shows the same confirmation.
export async function postRoofRentInquiry(
  body: RoofRentInquiryBody
): Promise<InquiryOutcome> {
  try {
    const res = await fetch(`${API_URL}/api/public/roof-rent/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 429) return 'rate_limited'
    if (res.status === 400) return 'invalid'
    return res.ok ? 'done' : 'error'
  } catch {
    return 'error'
  }
}

// SearchServer label "Grabenstrasse 1a <b>8606 Nänikon</b>" to
// "Grabenstrasse 1a, 8606 Nänikon".
export function addressFromSearchLabel(label: string): string | null {
  const [streetPart, placePart = ''] = label.split('<b>')
  const street = streetPart.replace(/<\/?[^>]+>/g, '').trim()
  const place = placePart.replace(/<\/?[^>]+>/g, '').trim()
  const address = `${street}, ${place}`
  return ADDRESS_PATTERN.test(address) ? address : null
}

export function formatSwissNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}
