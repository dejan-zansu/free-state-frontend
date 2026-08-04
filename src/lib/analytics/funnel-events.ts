import * as CookieConsent from 'vanilla-cookieconsent'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const SESSION_KEY_STORAGE = 'mkt_session_key'
const UTM_STORAGE = 'utm'

export type Attribution = {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmId?: string
  utmTerm?: string
  utmContent?: string
  referrer?: string
  landingPage?: string
  fbclid?: string
  gclid?: string
  sessionKey?: string
  fbp?: string
  fbc?: string
  marketingConsent?: boolean
  eventId?: string
}

const ATTRIBUTION_KEYS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmId',
  'utmTerm',
  'utmContent',
  'referrer',
  'landingPage',
  'fbclid',
  'gclid',
] as const

let lastLeadEventId: string | null = null

export function consumeLastLeadEventId(): string | null {
  const eventId = lastLeadEventId
  lastLeadEventId = null
  return eventId
}

function readCookie(name: string): string | undefined {
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
    const value = match?.slice(name.length + 1)
    return value ? decodeURIComponent(value) : undefined
  } catch {
    return undefined
  }
}

export function getOrCreateSessionKey(): string | null {
  if (typeof window === 'undefined') return null
  try {
    let key = window.sessionStorage.getItem(SESSION_KEY_STORAGE)
    if (!key) {
      key = crypto.randomUUID()
      window.sessionStorage.setItem(SESSION_KEY_STORAGE, key)
    }
    return key
  } catch {
    return null
  }
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE)
    const utm = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}
    const attribution: Attribution = {}
    for (const key of ATTRIBUTION_KEYS) {
      const value = utm[key]
      if (typeof value === 'string' && value) attribution[key] = value
    }
    const sessionKey = window.sessionStorage.getItem(SESSION_KEY_STORAGE)
    if (sessionKey) attribution.sessionKey = sessionKey

    const fbp = readCookie('_fbp')
    if (fbp) attribution.fbp = fbp
    const fbc = readCookie('_fbc')
    if (fbc) {
      attribution.fbc = fbc
    } else if (attribution.fbclid) {
      attribution.fbc = `fb.1.${Date.now()}.${attribution.fbclid}`
    }

    try {
      attribution.marketingConsent = CookieConsent.acceptedCategory('marketing')
    } catch {}

    try {
      const eventId = crypto.randomUUID()
      attribution.eventId = eventId
      lastLeadEventId = eventId
    } catch {}

    return attribution
  } catch {
    return {}
  }
}

type FunnelEventOptions = {
  step?: number
  meta?: Record<string, unknown>
}

function readUtmIdFromUrl(): string | undefined {
  try {
    const value = new URLSearchParams(window.location.search).get('utm_id')
    return value ? value.slice(0, 100) : undefined
  } catch {
    return undefined
  }
}

export function getStoredUtmId(): string | undefined {
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE)
    if (raw) {
      const utm = JSON.parse(raw) as Record<string, unknown>
      const value = utm.utmId
      if (typeof value === 'string' && value) return value.slice(0, 100)
    }
  } catch {}
  return readUtmIdFromUrl()
}

export function postFunnelEvent(
  name: string,
  options: FunnelEventOptions = {}
): void {
  if (typeof window === 'undefined') return
  try {
    const sessionKey = getOrCreateSessionKey()
    if (!sessionKey) return
    const body: Record<string, unknown> = {
      sessionKey,
      name,
      path: window.location.pathname,
    }
    if (typeof options.step === 'number') body.step = options.step
    if (options.meta) body.meta = options.meta
    const utmId = getStoredUtmId()
    if (utmId) body.utmId = utmId
    void fetch(`${API_URL}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export function trackFunnelEvent(
  name: string,
  options: FunnelEventOptions = {}
): void {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    const payload: Record<string, unknown> = { event: name }
    if (typeof options.step === 'number') payload.step = options.step
    if (options.meta) Object.assign(payload, options.meta)
    window.dataLayer.push(payload)
  } catch {}
  postFunnelEvent(name, options)
}
