import { consumeLastLeadEventId, postFunnelEvent } from './funnel-events'

export type LeadForm =
  | 'calculator'
  | 'commercial_calculator'
  | 'contact'
  | 'quote_request'

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

  if (typeof window.fbq === 'function') {
    const metaPayload: Record<string, unknown> = { currency }
    if (typeof value === 'number') metaPayload.value = value
    const eventId = consumeLastLeadEventId()
    if (eventId) {
      window.fbq('track', 'Lead', metaPayload, { eventID: eventId })
    } else {
      window.fbq('track', 'Lead', metaPayload)
    }
  }

  const funnelMeta: Record<string, unknown> = { form }
  if (source) funnelMeta.source = source
  if (typeof value === 'number') funnelMeta.value = value
  postFunnelEvent('generate_lead', { meta: funnelMeta })
}
