'use client'

import { useEffect } from 'react'

import { getOrCreateSessionKey } from '@/lib/analytics/funnel-events'

const UTM_STORAGE = 'utm'
const FIRST_TOUCH_STORAGE = 'utm_first'
const FIRST_TOUCH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

const PARAM_MAP = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_id: 'utmId',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
  fbclid: 'fbclid',
  gclid: 'gclid',
} as const

function readUnexpiredFirstTouch(): Record<string, string> | null {
  const raw = window.localStorage.getItem(FIRST_TOUCH_STORAGE)
  if (!raw) return null
  try {
    const first = JSON.parse(raw) as Record<string, string>
    const capturedAt = Date.parse(first.capturedAt || '')
    if (isNaN(capturedAt)) return null
    if (Date.now() - capturedAt >= FIRST_TOUCH_MAX_AGE_MS) return null
    return first
  } catch {
    return null
  }
}

export default function UtmCapture() {
  useEffect(() => {
    try {
      getOrCreateSessionKey()
      if (window.sessionStorage.getItem(UTM_STORAGE)) return

      const params = new URLSearchParams(window.location.search)
      const utm: Record<string, string> = {}
      let hasCampaignParams = false
      for (const [param, key] of Object.entries(PARAM_MAP)) {
        const value = params.get(param)
        if (value) {
          utm[key] = value
          hasCampaignParams = true
        }
      }

      if (!hasCampaignParams) {
        const first = readUnexpiredFirstTouch()
        if (first) {
          const hydrated = { ...first }
          delete hydrated.capturedAt
          window.sessionStorage.setItem(UTM_STORAGE, JSON.stringify(hydrated))
          return
        }
      }

      if (document.referrer) utm.referrer = document.referrer
      utm.landingPage = window.location.pathname
      window.sessionStorage.setItem(UTM_STORAGE, JSON.stringify(utm))

      if (!readUnexpiredFirstTouch()) {
        window.localStorage.setItem(
          FIRST_TOUCH_STORAGE,
          JSON.stringify({ ...utm, capturedAt: new Date().toISOString() })
        )
      }
    } catch {}
  }, [])

  return null
}
