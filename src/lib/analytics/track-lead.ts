export type LeadForm = 'calculator' | 'contact' | 'quote_request'

export type TrackLeadOptions = {
  form: LeadForm
  source?: string
  locale?: string
  value?: number
  currency?: string
}

export function trackLead({
  form,
  source,
  locale,
  value,
  currency = 'CHF',
}: TrackLeadOptions): void {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []

  const payload: Record<string, unknown> = {
    event: 'generate_lead',
    lead_form: form,
    currency,
  }

  if (source) payload.lead_source = source
  if (locale) payload.lead_locale = locale
  if (typeof value === 'number') payload.value = value

  window.dataLayer.push(payload)
}
