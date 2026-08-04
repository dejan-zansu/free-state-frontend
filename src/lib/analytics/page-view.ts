import { getOrCreateSessionKey, getStoredUtmId } from './funnel-events'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const pageViewTrackingEnabled =
  process.env.NEXT_PUBLIC_PAGEVIEW_TRACKING !== 'false'

export function postPageView(path: string): void {
  if (typeof window === 'undefined') return
  if (!pageViewTrackingEnabled) return
  try {
    const sessionKey = getOrCreateSessionKey()
    if (!sessionKey) return
    const body: Record<string, unknown> = {
      sessionKey,
      path: path.slice(0, 2000),
    }
    const referrer = document.referrer
    if (referrer) body.referrer = referrer.slice(0, 2000)
    const utmId = getStoredUtmId()
    if (utmId) body.utmId = utmId
    void fetch(`${API_URL}/api/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}
