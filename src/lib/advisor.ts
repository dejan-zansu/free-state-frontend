import { CONSULTATION_ADVISORS, type ConsultationAdvisor } from './company-contact'

const STORAGE_KEY = 'fs-consultation-advisor'
const ROTATE_MS = 24 * 60 * 60 * 1000

export function getStickyAdvisor(): ConsultationAdvisor {
  const fresh = CONSULTATION_ADVISORS[Math.floor(Math.random() * CONSULTATION_ADVISORS.length)]
  if (typeof window === 'undefined') return fresh
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as { key: string; ts: number }
      const match = CONSULTATION_ADVISORS.find(a => a.key === saved.key)
      if (match && Date.now() - saved.ts < ROTATE_MS) return match
    }
  } catch {}
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ key: fresh.key, ts: Date.now() }),
    )
  } catch {}
  return fresh
}
