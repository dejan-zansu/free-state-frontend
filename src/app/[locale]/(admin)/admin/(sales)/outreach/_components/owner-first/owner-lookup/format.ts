// Small helpers of the owner-lookup page (formatting, clipboard, API error
// codes). No React here.

import type { AxiosError } from 'axios'

import type {
  ExtractParty,
  ExtractPartyRole,
  LookupProspectSummary,
  TerravisExtract,
} from '@/types/outreach/owner-lookup'

export function chf(value: number | null | undefined): string {
  if (value == null) return '-'
  return `CHF ${value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function kwh(value: number | null | undefined): string {
  return value == null ? '-' : `${value.toLocaleString('de-CH')} kWh`
}

export function address(
  p: Pick<
    LookupProspectSummary,
    'addressStreet' | 'addressNumber' | 'addressPostalCode' | 'addressCity'
  > | null
): string {
  if (!p) return '-'
  const street = [p.addressStreet, p.addressNumber].filter(Boolean).join(' ')
  const place = [p.addressPostalCode, p.addressCity].filter(Boolean).join(' ')
  return [street, place].filter(Boolean).join(', ') || '-'
}

// mm:ss since a moment, for the claim timer.
export function elapsed(fromIso: string | null, now: number): string {
  if (!fromIso) return '-'
  const seconds = Math.max(
    0,
    Math.floor((now - new Date(fromIso).getTime()) / 1000)
  )
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function apiErrorCode(error: unknown): string | null {
  return (
    (error as AxiosError<{ error?: { code?: string } }>)?.response?.data?.error
      ?.code ?? null
  )
}

export function apiErrorData<T>(error: unknown): T | null {
  return (
    ((error as AxiosError<{ error?: { data?: T } }>)?.response?.data?.error
      ?.data as T | undefined) ?? null
  )
}

export function emptyParty(role: ExtractPartyRole): ExtractParty {
  return {
    role,
    rawLine: '',
    name: '',
    uid: null,
    egbpid: null,
    seat: null,
    share: null,
    ownershipForm: null,
    acquisitionType: null,
    acquisitionDate: null,
    documentNumber: null,
    street: null,
    houseNumber: null,
    postalCode: null,
    city: null,
    country: null,
  }
}

export function emptyExtract(egrid: string): TerravisExtract {
  return {
    egrid,
    parcelNumber: null,
    municipality: null,
    dataAsOf: null,
    parcelKind: null,
    parcelDescription: null,
    ownershipForm: null,
    stockwerkeigentum: false,
    parties: [emptyParty('OWNER'), emptyParty('CORRESPONDENCE')],
  }
}

// The form keeps only parties with a name, and street plus number in one
// field is split on the server.
export function cleanExtract(extract: TerravisExtract): TerravisExtract {
  return {
    ...extract,
    parties: extract.parties
      .filter(party => party.name.trim().length > 0)
      .map(party => ({ ...party, rawLine: party.rawLine || party.name })),
  }
}
