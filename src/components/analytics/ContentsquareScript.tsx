'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'

import { contentsquareEnabled, contentsquareTagId } from '@/lib/analytics-env'
import { postReplayLink } from '@/lib/analytics/replay-link'

const RECORDED_PATH_SEGMENTS = [
  '/calculator',
  '/solar-calculator',
  '/dashboard',
]

type ReplayLinkContext = { isRecording?: boolean; replayLink?: string }

let loaded = false
let replayLinkSent = false
let lastTrackedPath = ''

function uxa(): unknown[] {
  window._uxa = window._uxa || []
  return window._uxa
}

function collectResourcesOnNextPageview() {
  uxa().push([
    'replay:resourceManager:enableForOnlineResource:nextPageviewOnly',
  ])
}

function requestReplayLink() {
  if (replayLinkSent) return
  uxa().push([
    'replay:link:generate',
    { withTimestamp: false },
    (context: ReplayLinkContext) => {
      if (replayLinkSent) return
      if (!context?.isRecording || !context.replayLink) return
      replayLinkSent = true
      postReplayLink(context.replayLink)
    },
  ])
}

function loadContentsquare(path: string) {
  if (loaded) return
  loaded = true
  lastTrackedPath = path
  collectResourcesOnNextPageview()
  uxa().push(['afterPageView', requestReplayLink])
  const script = document.createElement('script')
  script.async = true
  script.src = `https://t.contentsquare.net/uxa/${contentsquareTagId}.js`
  document.head.appendChild(script)
}

function trackPageview(path: string) {
  if (path === lastTrackedPath) return
  lastTrackedPath = path
  collectResourcesOnNextPageview()
  uxa().push(['trackPageview', path])
}

export default function ContentsquareScript() {
  const pathname = usePathname()

  useEffect(() => {
    if (!contentsquareEnabled) return

    const startOrTrack = () => {
      if (!CookieConsent.acceptedCategory('analytics')) return
      const path = `${window.location.pathname}${window.location.search}`
      if (loaded) {
        trackPageview(path)
        return
      }
      if (
        !RECORDED_PATH_SEGMENTS.some(segment => pathname?.includes(segment))
      ) {
        return
      }
      loadContentsquare(path)
    }

    startOrTrack()
    window.addEventListener('app:consent-changed', startOrTrack)
    return () => window.removeEventListener('app:consent-changed', startOrTrack)
  }, [pathname])

  return null
}
