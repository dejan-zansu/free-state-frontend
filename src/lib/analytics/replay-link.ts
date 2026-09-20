import { getOrCreateSessionKey } from './funnel-events'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Stores the Contentsquare replay link on our own session row so the admin can
// open the recording of a session straight from the funnel table, instead of
// searching for it in their session list.
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
