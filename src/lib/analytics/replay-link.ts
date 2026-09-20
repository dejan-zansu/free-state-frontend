import { getOrCreateSessionKey } from './funnel-events'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export function postReplayLink(replayLink: string): void {
  if (typeof window === 'undefined') return
  try {
    const sessionKey = getOrCreateSessionKey()
    if (!sessionKey) return
    void fetch(`${API_URL}/api/pageview/replay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionKey,
        replayLink: replayLink.slice(0, 2000),
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}
