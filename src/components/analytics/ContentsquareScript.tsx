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

// Contentsquare collects stylesheets with a server-side scraper that fetches
// the asset URL out of band, up to six hours later. Next.js puts the build
// hash in the CSS filename, so the next deploy moves that URL and the scraper
// stores nothing, which is why every replay rendered as raw unstyled HTML.
// This command makes the visitor's own browser upload the resources instead,
// and their docs require it to be pushed before the pageview it applies to.
function collectResourcesOnNextPageview() {
  uxa().push([
    'replay:resourceManager:enableForOnlineResource:nextPageviewOnly',
  ])
}

// The replay link ties their recording to our own session row. isRecording is
// false until their sampling decision lands, so later pageviews ask again
// until one returns a link.
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

// Client-side navigation never reloads the tag, so without an artificial
// pageview every calculator step lands in Contentsquare under the page the
// visitor entered on, and the replay shows a single page for the whole session.
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
      // Once the tag runs, every route change is reported, including ones
      // that leave the recorded pages, so the session keeps a truthful path
      // history. Starting the tag stays limited to the recorded pages.
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
