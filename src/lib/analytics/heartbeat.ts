import { getOrCreateSessionKey } from './funnel-events'
import { pageViewTrackingEnabled } from './page-view'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const HEARTBEAT_MS = 30_000

let timer: ReturnType<typeof setInterval> | null = null
let visibilityBound = false

function ping(): void {
  if (document.visibilityState !== 'visible') return
  try {
    const sessionKey = getOrCreateSessionKey()
    if (!sessionKey) return
    void fetch(`${API_URL}/api/pageview/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    ping()
    return
  }
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export function startHeartbeat(): void {
  if (typeof window === 'undefined') return
  if (!pageViewTrackingEnabled) return
  if (!visibilityBound) {
    visibilityBound = true
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
  if (timer) return
  timer = setInterval(() => {
    if (document.visibilityState !== 'visible') {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      return
    }
    ping()
  }, HEARTBEAT_MS)
}

export function stopHeartbeat(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (visibilityBound) {
    visibilityBound = false
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
